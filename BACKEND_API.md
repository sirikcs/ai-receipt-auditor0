# Backend API Documentation

# AI Receipt Auditor for Freelancers

The backend is built using Python and Flask. It provides AI-powered contract analysis, work-log analysis using Google Gemini, PayPal Sandbox invoice management, webhook processing, and dispute retrieval and analysis.

## 1. Technologies Used

- Python
- Flask
- Google Gemini API
- PayPal REST API
- Requests
- Python-dotenv
- SQLite
- pypdf

## 2. Backend Setup

### Activate the virtual environment

From the project root:

```powershell
cd backend
.\venv\Scripts\Activate.ps1
```

### Configure environment variables

Create a `backend/.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
GEMINI_MODEL=gemini-3.5-flash-lite
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
```

Never commit `.env` or expose API credentials.

### Start the Flask server

```powershell
python app.py
```

Server address: `http://127.0.0.1:5000`

## 3. Contract and Work-Log APIs

### POST `/api/analyze-contract-pdf`

Analyzes an uploaded contract PDF using Google Gemini.

### POST `/api/analyze-contract-worklog`

Analyzes a CSV work log alongside contract information using Google Gemini.

Both endpoints are part of the contract-analysis functionality. Refer to the Flask route definitions for the exact request fields and validation requirements.

## 4. PayPal Invoice APIs

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/paypal/test` | Test PayPal Sandbox connection |
| POST | `/api/paypal/create-invoice` | Create an invoice |
| GET | `/api/paypal/invoice/<invoice_id>` | Retrieve invoice details |
| POST | `/api/paypal/send-invoice/<invoice_id>` | Send an invoice |
| GET | `/api/paypal/invoices` | Retrieve locally stored invoices |

### Human approval

Invoice creation and sending require explicit human approval.

### Invoice status tracking

The backend processes verified PayPal webhooks and updates invoice statuses in SQLite.

Supported invoice statuses include:

- DRAFT
- SENT
- PAID
- CANCELLED
- REFUNDED

Duplicate webhook events are protected against repeated processing.

## 5. PayPal Dispute APIs

File: `backend/dispute_handler.py`

The dispute handler provides PayPal Sandbox dispute retrieval and Gemini-powered analysis.

### Available Python functions

- `get_access_token()` – obtains a PayPal OAuth access token.
- `list_disputes()` – retrieves disputes from the PayPal account.
- `get_dispute_details(dispute_id)` – retrieves an individual dispute.
- `analyze_dispute(dispute)` – extracts dispute information and generates AI-powered advice using Google Gemini.

### Flask API endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/api/paypal/disputes` | Retrieve PayPal disputes |
| GET | `/api/paypal/disputes/<dispute_id>` | Retrieve individual dispute details |
| GET | `/api/paypal/disputes/<dispute_id>/analyze` | Retrieve and analyze a dispute using Gemini |

### Gemini dispute analysis

The AI analysis provides:

1. Possible reasons for the dispute.
2. Important information the freelancer should check.
3. Documents and evidence that may help.
4. Recommended next steps.

The AI provides advisory information only. It does not guarantee a successful dispute outcome.

**Important:** The current implementation retrieves and analyzes disputes. It does not submit evidence, respond to disputes, or resolve disputes automatically.

## 6. Health Check

### GET `/health`

Checks whether the Flask backend is running.

Example response:

```json
{
  "status": "healthy"
}
```

## 7. Testing Results

The following functionality has been tested locally:

| Test | Result |
|---|---|
| Flask startup | Passed |
| Health endpoint | Passed |
| Contract PDF analysis | Passed |
| Contract and work-log AI analysis | Passed |
| PayPal Sandbox authentication | Passed |
| PayPal invoice creation | Passed |
| PayPal invoice sending | Passed |
| PayPal payment webhook verification | Passed |
| Duplicate webhook protection | Passed |
| SQLite invoice status updates | Passed |
| PayPal dispute authentication | Passed |
| PayPal dispute retrieval | Passed — zero disputes returned |
| Gemini dispute analysis | Passed using sample data |
| Flask dispute-list endpoint | Passed |
| Invalid dispute ID handling | Returned expected PayPal 404, handled by Flask |

## 8. Important Notes

- Gemini analysis is advisory and requires human review.
- PayPal operations currently use Sandbox credentials.
- The Sandbox account returned zero disputes during testing.
- Gemini dispute analysis was tested using sample dispute data, not a live dispute.
- PayPal makes the final decisions on disputes.
- No automatic dispute resolution or evidence submission is implemented.
- API credentials must remain private and must never be pushed to GitHub.