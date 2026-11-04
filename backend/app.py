

from flask import Flask, jsonify, request
import pandas as pd
import os
import time
from dotenv import load_dotenv
from google import genai
from google.genai import errors

app = Flask(__name__)

# Load environment variables
load_dotenv()

# Get Gemini API key
api_key = os.getenv("GEMINI_API_KEY")

if not api_key:
    raise ValueError("GEMINI_API_KEY is missing from .env file")

# Initialize Gemini client
client = genai.Client(api_key=api_key)


# HOME ROUTE
@app.route("/", methods=["GET"])
def home():
    return jsonify({
        "message": "AI Receipt Auditor Backend is running!"
    })


# HEALTH CHECK
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy"
    })


# ANALYZE WORK HOURS
@app.route("/api/analyze-hours", methods=["POST"])
def analyze_hours():
    if "file" not in request.files:
        return jsonify({"error": "Please upload a CSV file"}), 400

    try:
        df = pd.read_csv(request.files["file"])

        if "hours" not in df.columns or "task" not in df.columns:
            return jsonify({
                "error": "CSV must contain 'task' and 'hours' columns"
            }), 400

        df["hours"] = pd.to_numeric(df["hours"], errors="coerce")

        if df["hours"].isna().any() or (df["hours"] < 0).any():
            return jsonify({
                "error": "Hours must contain valid non-negative numbers"
            }), 400

        return jsonify({
            "total_hours": float(df["hours"].sum()),
            "work_entries": len(df),
            "tasks": df["task"].astype(str).tolist()
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# ANALYZE CONTRACT
@app.route("/api/analyze-contract", methods=["POST"])
def analyze_contract():
    if "file" not in request.files:
        return jsonify({"error": "Please upload a CSV file"}), 400

    try:
        df = pd.read_csv(request.files["file"])

        if "hours" not in df.columns:
            return jsonify({
                "error": "CSV must contain an 'hours' column"
            }), 400

        df["hours"] = pd.to_numeric(df["hours"], errors="coerce")

        if df["hours"].isna().any() or (df["hours"] < 0).any():
            return jsonify({
                "error": "Hours must contain valid non-negative numbers"
            }), 400

        estimated_hours = float(request.form.get("estimated_hours", 0))
        agreed_amount = float(request.form.get("agreed_amount", 0))

        if estimated_hours < 0 or agreed_amount < 0:
            return jsonify({
                "error": "Contract values cannot be negative"
            }), 400

        actual_hours = float(df["hours"].sum())
        difference = actual_hours - estimated_hours

        hourly_rate = (
            agreed_amount / estimated_hours
            if estimated_hours > 0 else None
        )

        if difference > 0:
            status = "Over estimate"
        elif difference < 0:
            status = "Under estimate"
        else:
            status = "As estimated"

        return jsonify({
            "actual_hours": actual_hours,
            "estimated_hours": estimated_hours,
            "agreed_amount": agreed_amount,
            "hours_difference": difference,
            "contract_hourly_rate": hourly_rate,
            "status": status,
            "work_entries": len(df),
            "note": "Hours comparison is advisory, not a final judgement of payment fairness."
        })

    except ValueError:
        return jsonify({
            "error": "Please enter valid numeric contract details"
        }), 400

    except Exception as e:
        return jsonify({"error": str(e)}), 400


# GEMINI AI ANALYSIS
@app.route("/api/ai-analyze", methods=["POST"])
def ai_analyze():
    if "file" not in request.files:
        return jsonify({"error": "Please upload a CSV file"}), 400

    try:
        df = pd.read_csv(request.files["file"])

        if "hours" not in df.columns or "task" not in df.columns:
            return jsonify({
                "error": "CSV must contain 'task' and 'hours' columns"
            }), 400

        df["hours"] = pd.to_numeric(df["hours"], errors="coerce")

        if df["hours"].isna().any() or (df["hours"] < 0).any():
            return jsonify({
                "error": "Hours must contain valid non-negative numbers"
            }), 400

        estimated_hours = float(request.form.get("estimated_hours", 0))
        agreed_amount = float(request.form.get("agreed_amount", 0))

        if estimated_hours < 0 or agreed_amount < 0:
            return jsonify({
                "error": "Contract values cannot be negative"
            }), 400

        actual_hours = float(df["hours"].sum())
        difference = actual_hours - estimated_hours

        hourly_rate = (
            agreed_amount / estimated_hours
            if estimated_hours > 0 else None
        )

        work_log = df[["task", "hours"]].to_dict(orient="records")

        prompt = f"""
You are an AI assistant for a freelancer invoice auditing application.

Analyze the freelancer's work log and contract information.

WORK LOG:
{work_log}

CONTRACT ESTIMATED HOURS: {estimated_hours}
ACTUAL HOURS: {actual_hours}
AGREED CONTRACT AMOUNT: {agreed_amount}
CONTRACT HOURLY RATE: {hourly_rate}

Provide the following:

1. A short summary of completed work.
2. Whether actual hours are above, below, or equal to estimated hours.
3. Tasks that may need clarification.
4. Whether the invoice amount is consistent with the agreed contract.
5. Suggestions for both freelancer and client.

IMPORTANT RULES:
- Treat the agreed contract as the primary reference.
- Do not invent market rates or contract terms.
- Extra hours do not automatically mean extra payment is owed.
- Be neutral and fair to both parties.
- Clearly state that your analysis is advisory and requires human review.
"""

        # GEMINI REQUEST WITH AUTOMATIC RETRIES
        response = None

        for attempt in range(3):
            try:
                response = client.models.generate_content(
                    model="gemini-3.8-flash",
                    contents=prompt
                )
                break

            except errors.ServerError as e:
                if attempt == 2:
                    raise

                print(
                    f"Gemini temporarily unavailable. "
                    f"Retry {attempt + 1}/3",
                    flush=True
                )

                time.sleep(5 * (attempt + 1))

        if response is None or not response.text:
            return jsonify({
                "error": "Gemini returned an empty response. Please try again."
            }), 502

        ai_analysis = response.text

        return jsonify({
            "actual_hours": actual_hours,
            "estimated_hours": estimated_hours,
            "agreed_amount": agreed_amount,
            "hours_difference": difference,
            "contract_hourly_rate": hourly_rate,
            "ai_analysis": ai_analysis,
            "note": "AI analysis is advisory. Review the contract and invoice before making payment decisions."
        })

    except ValueError:
        return jsonify({
            "error": "Please enter valid numeric contract details"
        }), 400

    except Exception as e:
        print("AI ANALYSIS ERROR:", repr(e), flush=True)

        return jsonify({
            "error": str(e)
        }), 500


# START FLASK SERVER
if __name__ == "__main__":
    app.run(debug=True, use_reloader=False)
