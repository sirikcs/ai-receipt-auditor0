from dispute_handler import (
    list_disputes,
    get_dispute_details,
    analyze_dispute
)
import os
import re
import csv
import json
import sqlite3
import requests

from decimal import Decimal, InvalidOperation
from urllib.parse import urlparse
from flask import Flask, request, jsonify
from dotenv import load_dotenv


def parse_numeric_value(value):
    """Safely extract a finite numeric value from Gemini output."""

    if value is None or isinstance(value, bool):
        return None

    try:
        if isinstance(value, (int, float, Decimal)):
            number = Decimal(str(value))
        else:
            match = re.search(
                r"[-+]?(?:\d{1,3}(?:,\d{3})+|\d+)(?:\.\d+)?",
                str(value)
            )

            if not match:
                return None

            number = Decimal(match.group(0).replace(",", ""))

        if not number.is_finite():
            return None

        return float(number)

    except (ValueError, InvalidOperation, TypeError):
        return None

# =========================================================
# CONFIGURATION
# =========================================================

BASE_DIR = os.path.dirname(os.path.abspath(__file__))

load_dotenv(os.path.join(BASE_DIR, ".env"))

app = Flask(__name__)
@app.after_request
def add_cors_headers(response):
    response.headers["Access-Control-Allow-Origin"] = "http://localhost:5173"
    response.headers["Access-Control-Allow-Headers"] = "Content-Type, Authorization"
    response.headers["Access-Control-Allow-Methods"] = "GET, POST, OPTIONS"
    return response

app.config["MAX_CONTENT_LENGTH"] = 15 * 1024 * 1024

PAYPAL_CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
PAYPAL_CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")
PAYPAL_WEBHOOK_ID = os.getenv("PAYPAL_WEBHOOK_ID")

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")
GEMINI_MODEL = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

PAYPAL_BASE_URL = "https://api-m.sandbox.paypal.com"

DATABASE_PATH = os.path.join(BASE_DIR, "receipt_auditor.db")


# =========================================================
# DATABASE INITIALIZATION
# =========================================================

def get_db_connection():
    conn = sqlite3.connect(DATABASE_PATH, timeout=30)
    conn.row_factory = sqlite3.Row
    return conn


def init_db():

    conn = get_db_connection()

    try:
        conn.execute("""
            CREATE TABLE IF NOT EXISTS invoices (
                invoice_id TEXT PRIMARY KEY,
                client_email TEXT,
                freelancer_name TEXT,
                amount REAL,
                currency TEXT,
                invoice_status TEXT DEFAULT 'DRAFT',
                payment_status TEXT DEFAULT 'UNPAID',
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.execute("""
            CREATE TABLE IF NOT EXISTS processed_webhooks (
                event_id TEXT PRIMARY KEY,
                event_type TEXT,
                processed_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)

        conn.commit()

        print("DATABASE INITIALIZED SUCCESSFULLY", flush=True)

    finally:
        conn.close()


def save_invoice_to_db(
    invoice_id,
    client_email,
    freelancer_name,
    amount,
    currency,
    status="DRAFT"
):

    conn = get_db_connection()

    try:
        conn.execute("""
            INSERT INTO invoices (
                invoice_id,
                client_email,
                freelancer_name,
                amount,
                currency,
                invoice_status,
                payment_status
            )
            VALUES (?, ?, ?, ?, ?, ?, 'UNPAID')
            ON CONFLICT(invoice_id) DO UPDATE SET
                client_email = COALESCE(excluded.client_email, invoices.client_email),
                freelancer_name = COALESCE(excluded.freelancer_name, invoices.freelancer_name),
                amount = COALESCE(excluded.amount, invoices.amount),
                currency = COALESCE(excluded.currency, invoices.currency),
                invoice_status = CASE
                    WHEN invoices.invoice_status IN ('PAID', 'SENT', 'CANCELLED', 'REFUNDED')
                    THEN invoices.invoice_status
                    ELSE excluded.invoice_status
                END
                               """, (
            invoice_id,
            client_email,
            freelancer_name,
            amount,
            currency,
            status
        ))

        conn.commit()

    finally:
        conn.close()


def update_invoice_status(invoice_id, invoice_status=None, payment_status=None):

    conn = get_db_connection()

    try:
        if invoice_status is not None:
            conn.execute("""
                UPDATE invoices
                SET invoice_status = ?
                WHERE invoice_id = ?
            """, (invoice_status, invoice_id))

        if payment_status is not None:
            conn.execute("""
                UPDATE invoices
                SET payment_status = ?
                WHERE invoice_id = ?
            """, (payment_status, invoice_id))

        conn.commit()

    finally:
        conn.close()


# =========================================================
# PAYPAL ACCESS TOKEN
# =========================================================

def get_paypal_access_token():

    if not PAYPAL_CLIENT_ID or not PAYPAL_CLIENT_SECRET:
        raise ValueError("PayPal credentials are missing from .env")

    response = requests.post(
        f"{PAYPAL_BASE_URL}/v1/oauth2/token",
        auth=(PAYPAL_CLIENT_ID, PAYPAL_CLIENT_SECRET),
        data={"grant_type": "client_credentials"},
        headers={
            "Accept": "application/json",
            "Accept-Language": "en_US"
        },
        timeout=30
    )

    response.raise_for_status()

    return response.json()["access_token"]


def paypal_headers(access_token):

    return {
        "Authorization": f"Bearer {access_token}",
        "Content-Type": "application/json",
        "Accept": "application/json"
    }


# =========================================================
# GEMINI API
# =========================================================

def analyze_with_gemini(prompt):

    if not GEMINI_API_KEY:
        raise ValueError("GEMINI_API_KEY is missing from .env")

    url = (
        "https://generativelanguage.googleapis.com/"
        f"v1beta/models/{GEMINI_MODEL}:generateContent"
    )

    response = requests.post(
        url,
        params={"key": GEMINI_API_KEY},
        json={
            "contents": [{
                "parts": [{"text": prompt}]
            }]
        },
        timeout=90
    )

    response.raise_for_status()

    result = response.json()

    return result["candidates"][0]["content"]["parts"][0]["text"]


# =========================================================
# CONTRACT PDF ANALYSIS
# =========================================================

@app.route("/api/analyze-contract-pdf", methods=["POST"])
def analyze_contract_pdf():

    uploaded_file = request.files.get("file")

    if uploaded_file is None:
        uploaded_file = request.files.get("pdf")

    if uploaded_file is None:
        return jsonify({"error": "Please upload a PDF file"}), 400

    if not uploaded_file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Only PDF files are supported"}), 400

    try:
        from pypdf import PdfReader
        import io

        pdf = PdfReader(io.BytesIO(uploaded_file.read()))

        contract_text = "\n".join(
            page.extract_text() or ""
            for page in pdf.pages
        )

        if not contract_text.strip():
            return jsonify({
                "error": "Could not extract readable text from PDF"
            }), 400

        prompt = f"""
        You are an AI contract auditor for freelancers.

        Analyze this contract and identify:

        1. Payment amount and currency.
        2. Payment deadlines.
        3. Late payment penalties.
        4. Missing payment terms.
        5. Unfair or risky clauses.
        6. Important obligations.
        7. Recommendations for the freelancer.

        Clearly distinguish facts from possible risks.

        CONTRACT:
        {contract_text[:30000]}
        """

        analysis = analyze_with_gemini(prompt)

        return jsonify({
            "status": "success",
            "analysis": analysis
        }), 200

    except ImportError:
        return jsonify({
            "error": "Install pypdf using: pip install pypdf"
        }), 500

    except requests.exceptions.RequestException as e:
        return jsonify({
            "error": "Gemini API request failed",
            "details": str(e)
        }), 502

    except Exception as e:
        print("CONTRACT ANALYSIS ERROR:", repr(e), flush=True)

        return jsonify({
            "error": "Contract analysis failed",
            "details": str(e)
        }), 500


# =========================================================
# CONTRACT + WORKLOG CSV ANALYSIS
# =========================================================

@app.route("/api/analyze-contract-worklog", methods=["POST"])
def analyze_contract_worklog():

    contract_file = (
        request.files.get("contract")
        or request.files.get("pdf")
    )

    worklog_file = (
        request.files.get("worklog")
        or request.files.get("csv")
    )

    if contract_file is None or worklog_file is None:
        return jsonify({
            "error": "Please upload both a contract PDF and worklog CSV"
        }), 400

    if not contract_file.filename.lower().endswith(".pdf"):
        return jsonify({"error": "Contract must be a PDF"}), 400

    if not worklog_file.filename.lower().endswith(".csv"):
        return jsonify({"error": "Worklog must be a CSV"}), 400

    try:
        from pypdf import PdfReader
        import io
        import re

        pdf = PdfReader(io.BytesIO(contract_file.read()))

        contract_text = "\n".join(
            page.extract_text() or ""
            for page in pdf.pages
        )

        if not contract_text.strip():
            return jsonify({
                "error": "Could not extract readable text from PDF"
            }), 400

        csv_text = worklog_file.read().decode("utf-8-sig")
        rows = list(csv.DictReader(csv_text.splitlines()))

        if not rows:
            return jsonify({
                "error": "Worklog CSV is empty or has no header"
            }), 400

        required_columns = {"task", "hours"}

        if not required_columns.issubset(set(rows[0].keys())):
            return jsonify({
                "error": "CSV must contain task and hours columns"
            }), 400

        actual_hours = sum(
            float(row.get("hours") or 0)
            for row in rows
        )

        prompt = f"""
        You are an AI receipt and freelancer invoice auditor.

        Compare the contract with the worklog.

        Check:
        1. Contract payment terms.
        2. Hours or work completed.
        3. Whether the worklog matches the contract.
        4. Possible billing discrepancies.
        5. Missing or suspicious entries.
        6. Payment risks and recommendations.

        Do not invent missing information.

        CONTRACT:
        {contract_text[:20000]}

        WORKLOG:
        {json.dumps(rows[:500], ensure_ascii=False)}
        """

        analysis = analyze_with_gemini(prompt)

        extraction_prompt = f"""
        Extract these details from the contract.
        Return ONLY valid JSON with these four fields:
        estimated_hours, agreed_amount, currency, payment_type.

        Use null when information is not explicitly stated.
        Do not guess.

        CONTRACT:
        {contract_text[:20000]}
        """

        structured_text = analyze_with_gemini(extraction_prompt)

        structured_text = re.sub(
            r"```(?:json)?|```",
            "",
            structured_text
        ).strip()

        try:
            match = re.search(r"\{.*\}", structured_text, re.DOTALL)
            if not match:
                raise ValueError("No JSON object returned")

            contract_details = json.loads(match.group(0))

        except (json.JSONDecodeError, ValueError):
            contract_details = {
                "estimated_hours": None,
                "agreed_amount": None,
                "currency": None,
                "payment_type": None
            }

        

        estimated_hours = parse_numeric_value(
            contract_details.get("estimated_hours")
        )

        agreed_amount = parse_numeric_value(
            contract_details.get("agreed_amount")
        )

        # Store normalized values in the contract details.
        contract_details["estimated_hours"] = estimated_hours
        contract_details["agreed_amount"] = agreed_amount

        hours_difference = (
            actual_hours - estimated_hours
            if estimated_hours is not None
            else None
        )



        worklog_summary = {
            "actual_hours": actual_hours,
            "estimated_hours": estimated_hours,
            "hours_difference": hours_difference,
            "tasks": rows
        }

        payment_summary = {
            "agreed_amount": contract_details.get("agreed_amount"),
            "currency": contract_details.get("currency"),
            "payment_type": contract_details.get("payment_type")
        }

        return jsonify({
            "status": "success",
            "contract_details": contract_details,
            "worklog_summary": worklog_summary,
            "payment_summary": payment_summary,
            "ai_analysis": analysis,
            "analysis": analysis,
            "worklog_entries": len(rows),
            "note": "Advisory only. Human approval required before invoicing."
        }), 200

    except ImportError:
        return jsonify({
            "error": "Install pypdf using: pip install pypdf"
        }), 500

    except requests.exceptions.RequestException as e:
        return jsonify({
            "error": "Gemini API request failed",
            "details": str(e)
        }), 502

    except Exception as e:
        print("WORKLOG ANALYSIS ERROR:", repr(e), flush=True)

        return jsonify({
            "error": "Contract and worklog analysis failed",
            "details": str(e)
        }), 500


# =========================================================
# PAYPAL CONNECTION TEST
# =========================================================

@app.route("/api/paypal/test", methods=["GET"])
def paypal_test():

    try:
        token = get_paypal_access_token()

        return jsonify({
            "status": "success",
            "message": "PayPal Sandbox connection successful"
        }), 200

    except Exception as e:
        print("PAYPAL TEST ERROR:", repr(e), flush=True)

        return jsonify({
            "status": "error",
            "message": "PayPal connection failed",
            "details": str(e)
        }), 502


# =========================================================
# CREATE PAYPAL DRAFT INVOICE
# =========================================================

@app.route("/api/paypal/create-invoice", methods=["POST"])
def create_paypal_invoice():

    data = request.get_json(silent=True) or {}

    # HUMAN APPROVAL REQUIRED
    if data.get("approved") is not True:
        return jsonify({
            "error": "Human approval is required before creating an invoice"
        }), 400

    client_email = str(data.get("client_email", "")).strip()
    freelancer_name = str(data.get("freelancer_name", "")).strip()
    description = str(data.get("description", "")).strip()
    currency = str(data.get("currency", "USD")).upper()

    try:
        amount = Decimal(str(data.get("amount", "")))

        if not amount.is_finite() or amount <= 0:
            raise ValueError("Amount must be greater than zero")

        if amount.as_tuple().exponent < -2:
            raise ValueError("Amount cannot have more than two decimal places")

    except (InvalidOperation, ValueError, TypeError):
        return jsonify({
            "error": "Enter a valid positive invoice amount"
        }), 400

    if not client_email or not re.fullmatch(
        r"[^@\s]+@[^@\s]+\.[^@\s]+",
        client_email
    ):
        return jsonify({"error": "Enter a valid client email"}), 400

    if not freelancer_name or not description:
        return jsonify({
            "error": "Freelancer name and description are required"
        }), 400

    if currency != "USD":
        return jsonify({
            "error": "This version supports USD invoices only"
        }), 400

    try:
        access_token = get_paypal_access_token()

        name_parts = freelancer_name.split(maxsplit=1)

        given_name = name_parts[0]
        surname = name_parts[1] if len(name_parts) > 1 else ""

        payload = {
            "detail": {
                "currency_code": currency,
                "note": "Thank you for your business.",
                "invoicer": {
                    "name": {
                        "given_name": given_name,
                        "surname": surname
                    }
                }
            },
            "primary_recipients": [
                {
                    "billing_info": {
                        "email_address": client_email
                    }
                }
            ],
            "items": [
                {
                    "name": description,
                    "quantity": "1",
                    "unit_amount": {
                        "currency_code": currency,
                        "value": format(amount, ".2f")
                    }
                }
            ]
        }

        response = requests.post(
            f"{PAYPAL_BASE_URL}/v2/invoicing/invoices",
            headers=paypal_headers(access_token),
            json=payload,
            timeout=30
        )

        response.raise_for_status()

        print("PAYPAL CREATE HTTP STATUS:", response.status_code, flush=True)
        print("PAYPAL CREATE LOCATION:", response.headers.get("Location"), flush=True)
        print("PAYPAL CREATE RAW RESPONSE:", response.text[:3000], flush=True)

        paypal_data = response.json()
        print("PAYPAL RESPONSE STATUS:", response.status_code, flush=True)
        print("PAYPAL RESPONSE HEADERS:", dict(response.headers), flush=True)
        print("PAYPAL RESPONSE BODY:", repr(response.text), flush=True)
        invoice_id = paypal_data.get("id")
        paypal_data = response.json()

        paypal_data = response.json()

        invoice_id = paypal_data.get("id")

        if not invoice_id:
            invoice_url = paypal_data.get("href", "")
            invoice_id = invoice_url.rstrip("/").split("/")[-1]

        if not invoice_id:
            raise ValueError("PayPal did not return an invoice ID")

        save_invoice_to_db(
            invoice_id=invoice_id,
            client_email=client_email,
            freelancer_name=freelancer_name,
            amount=float(amount),
            currency=currency,
            status="DRAFT"
        )

        return jsonify({
            "status": "success",
            "message": "Draft invoice created successfully",
            "invoice_id": invoice_id,
            "invoice_status": "DRAFT",
            "currency": currency,
            "amount": format(amount, ".2f"),
            "paypal_response": paypal_data
        }), 201

    except requests.exceptions.RequestException as e:
        print("PAYPAL CREATE INVOICE ERROR:", repr(e), flush=True)

        return jsonify({
            "error": "Could not create PayPal invoice",
            "details": (
                e.response.text[:1000]
                if e.response is not None else str(e)
            )
        }), 502

    except Exception as e:
        print("CREATE INVOICE ERROR:", repr(e), flush=True)

        return jsonify({
            "error": "Invoice creation failed",
            "details": str(e)
        }), 500


# =========================================================
# GET PAYPAL INVOICE
# =========================================================

@app.route("/api/paypal/invoice/<invoice_id>", methods=["GET"])
def get_paypal_invoice(invoice_id):

    try:
        access_token = get_paypal_access_token()

        response = requests.get(
            f"{PAYPAL_BASE_URL}/v2/invoicing/invoices/{invoice_id}",
            headers=paypal_headers(access_token),
            timeout=30
        )

        response.raise_for_status()

        invoice = response.json()

        status = invoice.get("status")

        if status in [
            "DRAFT", "SENT", "PAID", "CANCELLED", "REFUNDED"
        ]:
            update_invoice_status(
                invoice_id,
                invoice_status=status,
                payment_status=(
                    "PAID" if status == "PAID"
                    else "REFUNDED" if status == "REFUNDED"
                    else None
                )
            )

        return jsonify({
            "status": "success",
            "invoice": invoice
        }), 200

    except requests.exceptions.RequestException as e:
        print("GET PAYPAL INVOICE ERROR:", repr(e), flush=True)

        status_code = 502

        if e.response is not None:
            if e.response.status_code == 404:
                status_code = 404

        return jsonify({
            "error": "PayPal invoice not found" if status_code == 404 else "Could not retrieve PayPal invoice",
            "details": (
                e.response.text[:1000]
                if e.response is not None else str(e)
            )
        }), status_code

    except Exception as e:
        print("GET INVOICE ERROR:", repr(e), flush=True)

        return jsonify({
            "error": "Invoice retrieval failed",
            "details": str(e)
        }), 500


# =========================================================
# SEND PAYPAL INVOICE
# =========================================================

@app.route("/api/paypal/send-invoice/<invoice_id>", methods=["POST"])
def send_paypal_invoice(invoice_id):

    data = request.get_json(silent=True) or {}

    # HUMAN APPROVAL REQUIRED
    if data.get("approved") is not True:
        return jsonify({
            "error": "Human approval is required before sending the invoice"
        }), 400

    try:
        access_token = get_paypal_access_token()

        headers = paypal_headers(access_token)

        check_response = requests.get(
            f"{PAYPAL_BASE_URL}/v2/invoicing/invoices/{invoice_id}",
            headers=headers,
            timeout=30
        )

        check_response.raise_for_status()

        invoice = check_response.json()

        if invoice.get("status") != "DRAFT":
            return jsonify({
                "error": "Only draft invoices can be sent",
                "current_status": invoice.get("status")
            }), 400

        response = requests.post(
            f"{PAYPAL_BASE_URL}/v2/invoicing/invoices/{invoice_id}/send",
            headers=headers,
            json={
                "send_to_invoicer": True
            },
            timeout=30
        )

        response.raise_for_status()

        update_invoice_status(
            invoice_id,
            invoice_status="SENT"
        )

        return jsonify({
            "status": "success",
            "message": "Invoice sent successfully through PayPal",
            "invoice_id": invoice_id,
            "invoice_status": "SENT",
            "paypal_response": (
                response.json() if response.content else {}
            )
        }), 200

    except requests.exceptions.RequestException as e:
        print("PAYPAL SEND INVOICE ERROR:", repr(e), flush=True)

        return jsonify({
            "error": "Could not send PayPal invoice",
            "details": (
                e.response.text[:1000]
                if e.response is not None else str(e)
            )
        }), 502

    except Exception as e:
        print("SEND INVOICE ERROR:", repr(e), flush=True)

        return jsonify({
            "error": "Invoice sending failed",
            "details": str(e)
        }), 500


# =========================================================
# PAYPAL WEBHOOK SIGNATURE VERIFICATION
# =========================================================

@app.route("/api/paypal/webhook", methods=["POST"])
def paypal_webhook():

    print("STEP 1: WEBHOOK ROUTE HIT", flush=True)

    raw_body = request.get_data(as_text=True)
    event = request.get_json(silent=True)

    if not event:
        return jsonify({"error": "Invalid webhook event"}), 400

    print("STEP 2: EVENT RECEIVED", bool(event), flush=True)

    event_id = event.get("id")
    event_type = event.get("event_type")

    print("STEP 3: EVENT TYPE:", event_type, flush=True)

    if not PAYPAL_WEBHOOK_ID:
        return jsonify({
            "error": "PayPal webhook ID is missing from .env"
        }), 500

    # READ PAYPAL SIGNATURE HEADERS
    auth_algo = request.headers.get("PAYPAL-AUTH-ALGO")
    cert_url = request.headers.get("PAYPAL-CERT-URL")
    transmission_id = request.headers.get("PAYPAL-TRANSMISSION-ID")
    transmission_sig = request.headers.get("PAYPAL-TRANSMISSION-SIG")
    transmission_time = request.headers.get("PAYPAL-TRANSMISSION-TIME")

    required_headers = [
        auth_algo,
        cert_url,
        transmission_id,
        transmission_sig,
        transmission_time
    ]

    print(
        "STEP 4: REQUIRED HEADERS:",
        [bool(value) for value in required_headers],
        flush=True
    )

    if not all(required_headers):
        return jsonify({
            "error": "Missing PayPal signature headers"
        }), 400

    # ONLY ACCEPT HTTPS PAYPAL CERTIFICATE HOSTS
    parsed_url = urlparse(cert_url)

    allowed_hosts = {
        "api.sandbox.paypal.com",
        "api-m.sandbox.paypal.com",
        "api-m.paypal.com",
        "api.paypal.com"
    }

    if (
        parsed_url.scheme != "https"
        or parsed_url.hostname not in allowed_hosts
    ):
        return jsonify({
            "error": "Untrusted PayPal certificate URL"
        }), 400

    try:
        print("STARTING PAYPAL SIGNATURE VERIFICATION", flush=True)

        verification_payload = {
            "auth_algo": auth_algo,
            "cert_url": cert_url,
            "transmission_id": transmission_id,
            "transmission_sig": transmission_sig,
            "transmission_time": transmission_time,
            "webhook_id": PAYPAL_WEBHOOK_ID
        }

        # PRESERVE RAW EVENT BODY FOR PAYPAL VERIFICATION
        verification_body = (
            json.dumps(
                verification_payload,
                separators=(",", ":")
            )[:-1]
            + ',"webhook_event":'
            + raw_body
            + '}'
        )

        verification_response = requests.post(
            f"{PAYPAL_BASE_URL}/v1/notifications/verify-webhook-signature",
            data=verification_body,
            headers={
                "Content-Type": "application/json",
                "Authorization": (
                    f"Bearer {get_paypal_access_token()}"
                )
            },
            timeout=30
        )

        print(
            "PAYPAL VERIFICATION HTTP STATUS:",
            verification_response.status_code,
            flush=True
        )

        verification_response.raise_for_status()

        verification_result = verification_response.json()

        print(
            "PAYPAL VERIFICATION RESPONSE:",
            verification_result,
            flush=True
        )

        if verification_result.get("verification_status") != "SUCCESS":
            return jsonify({
                "error": "PayPal webhook signature verification failed"
            }), 400

        print(
            "VERIFIED REAL PAYPAL WEBHOOK:",
            event_type,
            flush=True
        )

        if not event_id or not event_type:
            return jsonify({
                "error": "Webhook event ID or type is missing"
            }), 400

        # EXTRACT INVOICE ID
        resource = event.get("resource", {})

        invoice_id = (
            resource.get("invoice", {}).get("id")
            or resource.get("id")
            or event.get("resource_id")
        )

        if not invoice_id:
            return jsonify({
                "error": "Invoice ID not found in webhook event"
            }), 400

        # EVENT STATUS MAPPING
        status_map = {
            "INVOICING.INVOICE.CREATED": ("DRAFT", None),
            "INVOICING.INVOICE.SENT": ("SENT", None),
            "INVOICING.INVOICE.PAID": ("PAID", "PAID"),
            "INVOICING.INVOICE.CANCELLED": ("CANCELLED", None),
            "INVOICING.INVOICE.REFUNDED": ("REFUNDED", "REFUNDED")
        }

        if event_type not in status_map:
            return jsonify({
                "status": "success",
                "message": "Verified event; no invoice update required",
                "event_type": event_type
            }), 200

        invoice_status, payment_status = status_map[event_type]

        # ATOMIC DUPLICATE PROTECTION + STATUS UPDATE
        conn = get_db_connection()

        try:
            cursor = conn.execute("""
                INSERT OR IGNORE INTO processed_webhooks (
                    event_id,
                    event_type
                )
                VALUES (?, ?)
            """, (event_id, event_type))

            if cursor.rowcount == 0:
                conn.rollback()

                print("DUPLICATE WEBHOOK IGNORED:", event_id, flush=True)

                return jsonify({
                    "status": "success",
                    "message": "Duplicate webhook ignored",
                    "event_id": event_id
                }), 200
                                    # CHECK THAT THE INVOICE EXISTS BEFORE PROCESSING
            invoice_exists = conn.execute("""
                SELECT 1
                FROM invoices
                WHERE invoice_id = ?
            """, (invoice_id,)).fetchone()

            if invoice_exists is None:
                conn.rollback()

                print(
                    "WEBHOOK INVOICE NOT FOUND:",
                    invoice_id,
                    flush=True
                )

                return jsonify({
                    "error": "Invoice not found; PayPal may retry this webhook"
                }), 503


            if invoice_status is not None:
                conn.execute("""
                    UPDATE invoices
                    SET invoice_status = ?
                    WHERE invoice_id = ?
                """, (invoice_status, invoice_id))

            if payment_status is not None:
                conn.execute("""
                    UPDATE invoices
                    SET payment_status = ?
                    WHERE invoice_id = ?
                """, (payment_status, invoice_id))

            conn.commit()

        except Exception:
            conn.rollback()
            raise

        finally:
            conn.close()

        print(
            "WEBHOOK PROCESSED SUCCESSFULLY:",
            event_id,
            event_type,
            invoice_id,
            flush=True
        )

        return jsonify({
            "status": "success",
            "message": "PayPal webhook verified and processed",
            "event_id": event_id,
            "event_type": event_type,
            "invoice_id": invoice_id
        }), 200

    except requests.exceptions.RequestException as e:
        print("PAYPAL WEBHOOK REQUEST ERROR:", repr(e), flush=True)

        return jsonify({
            "error": "Could not verify PayPal webhook"
        }), 502

    except Exception as e:
        print("PAYPAL WEBHOOK ERROR:", repr(e), flush=True)

        return jsonify({
            "error": "Webhook processing failed"
        }), 500


# =========================================================
# DATABASE INVOICE LIST (FOR TESTING)
# =========================================================

@app.route("/api/paypal/invoices", methods=["GET"])
def list_invoices():

    conn = get_db_connection()

    try:
        rows = conn.execute("""
            SELECT *
            FROM invoices
            ORDER BY created_at DESC
        """).fetchall()

        return jsonify({
            "status": "success",
            "invoices": [dict(row) for row in rows]
        }), 200

    finally:
        conn.close()

# =========================================================
# PAYPAL DISPUTE APIs
# =========================================================

@app.route("/api/paypal/disputes", methods=["GET"])
def get_paypal_disputes():

    try:
        disputes = list_disputes()

        return jsonify({
            "status": "success",
            "disputes": disputes
        }), 200

    except Exception as e:
        print("DISPUTE LIST ERROR:", repr(e), flush=True)

        return jsonify({
            "error": "Unable to retrieve PayPal disputes"
        }), 500


@app.route("/api/paypal/disputes/<dispute_id>", methods=["GET"])
def get_paypal_dispute(dispute_id):

    try:
        dispute = get_dispute_details(dispute_id)

        return jsonify({
            "status": "success",
            "dispute": dispute
        }), 200

    except Exception as e:
        print("DISPUTE DETAILS ERROR:", repr(e), flush=True)

        return jsonify({
            "error": "Unable to retrieve dispute details"
        }), 500


@app.route("/api/paypal/disputes/<dispute_id>/analyze", methods=["GET"])
def analyze_paypal_dispute(dispute_id):

    try:
        dispute = get_dispute_details(dispute_id)
        analysis = analyze_dispute(dispute)

        return jsonify({
            "status": "success",
            "analysis": analysis
        }), 200

    except Exception as e:
        print("DISPUTE ANALYSIS ERROR:", repr(e), flush=True)

        return jsonify({
            "error": "Unable to analyze PayPal dispute"
        }), 500
# =========================================================
# HEALTH CHECK
# =========================================================

@app.route("/health", methods=["GET"])
def health():

    return jsonify({
        "status": "healthy"
    }), 200


# =========================================================
# START FLASK
# =========================================================

if __name__ == "__main__":

    init_db()

    app.run(
        debug=True,
        port=5000
    )
