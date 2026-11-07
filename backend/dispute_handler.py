
import os
from pathlib import Path
from urllib.parse import quote

import requests
from dotenv import load_dotenv

# Load credentials from backend/.env
load_dotenv(Path(__file__).with_name(".env"))

PAYPAL_BASE_URL = os.getenv(
    "PAYPAL_BASE_URL",
    "https://api-m.sandbox.paypal.com"
)

CLIENT_ID = os.getenv("PAYPAL_CLIENT_ID")
CLIENT_SECRET = os.getenv("PAYPAL_CLIENT_SECRET")


class PayPalAPIError(Exception):
    """Raised when a PayPal API request fails."""
    pass


def get_access_token():
    """Generate a PayPal OAuth access token."""

    if not CLIENT_ID or not CLIENT_SECRET:
        raise PayPalAPIError(
            "PayPal Sandbox credentials are missing from backend/.env"
        )

    try:
        response = requests.post(
            f"{PAYPAL_BASE_URL}/v1/oauth2/token",
            auth=(CLIENT_ID, CLIENT_SECRET),
            headers={"Accept": "application/json"},
            data={"grant_type": "client_credentials"},
            timeout=20
        )

        response.raise_for_status()
        return response.json()["access_token"]

    except requests.RequestException as error:
        raise PayPalAPIError(
            f"PayPal authentication failed: {error}"
        ) from error


def list_disputes():
    """Retrieve disputes associated with the PayPal account."""

    token = get_access_token()

    try:
        response = requests.get(
            f"{PAYPAL_BASE_URL}/v1/customer/disputes",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            params={"page_size": 20},
            timeout=20
        )

        response.raise_for_status()
        return response.json()

    except requests.RequestException as error:
        raise PayPalAPIError(
            f"Unable to retrieve disputes: {error}"
        ) from error


def get_dispute_details(dispute_id):
    """Retrieve details of one specific dispute."""

    if not dispute_id or not dispute_id.strip():
        raise ValueError("A valid dispute ID is required")

    token = get_access_token()
    safe_id = quote(dispute_id.strip(), safe="")

    try:
        response = requests.get(
            f"{PAYPAL_BASE_URL}/v1/customer/disputes/{safe_id}",
            headers={
                "Authorization": f"Bearer {token}",
                "Content-Type": "application/json"
            },
            timeout=20
        )

        response.raise_for_status()
        return response.json()

    except requests.RequestException as error:
        raise PayPalAPIError(
            f"Unable to retrieve dispute details: {error}"
        ) from error


def analyze_dispute(dispute):
    """Analyze PayPal dispute using Google Gemini AI."""

    import json

    dispute_data = {
        "dispute_id": dispute.get("dispute_id"),
        "status": dispute.get("status"),
        "reason": dispute.get("reason"),
        "amount": dispute.get("dispute_amount", {}),
        "stage": dispute.get("dispute_life_cycle_stage"),
        "created_at": dispute.get("create_time"),
        "seller_response_due": dispute.get("seller_response_due_date")
    }

    prompt = f"""
    You are an AI assistant helping freelancers understand PayPal disputes.

    Analyze this dispute:

    {json.dumps(dispute_data, indent=2)}

    Explain:
    1. Why the dispute may have occurred.
    2. What the freelancer should check.
    3. What documents or evidence may help.
    4. Recommended next steps.

    Give practical advice.
    Do not invent facts or guarantee a successful outcome.
    """

    load_dotenv(Path(__file__).with_name(".env"))

    api_key = os.getenv("GEMINI_API_KEY")
    model = os.getenv("GEMINI_MODEL", "gemini-3.5-flash-lite")

    if not api_key:
        raise ValueError("GEMINI_API_KEY is missing from backend/.env")

    url = (
        "https://generativelanguage.googleapis.com/"
        f"v1beta/models/{model}:generateContent"
    )

    response = requests.post(
        url,
        params={"key": api_key},
        json={"contents": [{"parts": [{"text": prompt}]}]},
        timeout=90
    )

    response.raise_for_status()

    result = response.json()
    ai_analysis = result["candidates"][0]["content"]["parts"][0]["text"]

    return {
        **dispute_data,
        "ai_analysis": ai_analysis
    }