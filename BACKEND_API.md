# Backend API Documentation

## AI Receipt Auditor for Freelancers

The backend is built using Python and Flask. It provides contract-hours analysis, AI-powered work-log analysis using Google Gemini, and PayPal Sandbox dispute retrieval.

## 1. Technologies Used

- Python
- Flask
- Pandas
- Google Gemini API
- PayPal REST API
- Requests
- Python-dotenv

## 2. Backend Setup

### Install dependencies

From the project root:

```bash
& "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe" -m pip install -r backend/requirements.txt
```
### Configure environment variables

Create a `backend/.env` file:

```env
GEMINI_API_KEY=your_gemini_api_key
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
```

Do not commit `.env` or expose API credentials.

### Start the Flask server

```bash
cd backend
& "$env:LOCALAPPDATA\Programs\Python\Python313\python.exe" app.py
```

Server address: `http://127.0.0.1:5000`

## 3. API Endpoints

### GET /

Checks whether the backend is running.

Example response:

```json
{
  "message": "AI Receipt Auditor Backend is running!"
}
```

### GET /health

Checks backend health.

Example response:

```json
{
  "status": "healthy"
}
```

### POST /api/analyze-hours

Analyses a CSV work log and calculates the total number of hours worked.

**Request:** `multipart/form-data`

| Field | Type | Required |
|---|---|---|
| file | CSV file | Yes |

The CSV file must contain these columns:

| Column | Description |
|---|---|
| task | Description of the work performed |
| hours | Time spent on the task (non-negative number) |

**Example request (Windows PowerShell):**

```powershell
curl.exe -X POST `
  -F "file=@C:\Users\user\OneDrive\Desktop\ai-receipt-auditor0\backend\test_worklog.csv" `
  http://127.0.0.1:5000/api/analyze-hours
```
### POST /api/analyze-contract

Compares actual work hours with estimated contract hours.

Request: `multipart/form-data`

| Field | Type | Example |
|---|---|---|
| file | CSV file | test_worklog.csv |
| estimated_hours | Number | 10 |
| agreed_amount | Number | 5000 |

Example response:

```json
{
  "actual_hours": 38.0,
  "agreed_amount": 5000.0,
  "contract_hourly_rate": 500.0,
  "estimated_hours": 10.0,
  "hours_difference": 28.0,
  "note": "Hours comparison is advisory, not a final judgement of payment fairness.",
  "status": "Over estimate",
  "work_entries": 5
}
```

### POST /api/ai-analyze

Uses Google Gemini to analyse the work log and contract information.

Request: `multipart/form-data`

| Field | Type | Example |
|---|---|---|
| file | CSV file | test_worklog.csv |
| estimated_hours | Number | 10 |
| agreed_amount | Number | 5000 |

The response contains the contract calculations and an `ai_analysis` field with the generated analysis.

## 4. PayPal Dispute Handler

File: `backend/dispute_handler.py`

The dispute handler provides read-only PayPal Sandbox functionality.

Functions:

- get_access_token() - obtains a PayPal OAuth access token.
- `list_disputes()` - retrieves up to 20 disputes per request. Pagination is not implemented.
- `get_dispute_details(dispute_id)` – retrieves details for a specific dispute.
- `analyze_dispute(dispute)` – extracts important dispute information and produces a review summary.
- These functions are currently available as Python module functions and are not exposed as Flask API routes.

PayPal API operations:

| Method | Endpoint | Purpose |
|---|---|---|
| POST | `/v1/oauth2/token` | Obtain access token |
| GET | `/v1/customer/disputes` | Retrieve disputes |
| GET | `/v1/customer/disputes/{dispute_id}` | Retrieve individual dispute |

The current implementation retrieves and analyses disputes. It does not submit dispute evidence, respond to disputes, or resolve them.

## 5. Testing Results

The following tests were performed locally:

| Test | Result |
|---|---|
| Flask health endpoint | Passed |
| Contract analysis endpoint | Passed |
| Gemini AI analysis endpoint | Passed |
| PayPal Sandbox authentication | Passed |
| PayPal dispute retrieval | Passed — zero disputes returned |
| Dispute analysis function | Passed using sample test data |

## 6. Important Notes

- Gemini analysis is advisory and requires human review.
- Contract-hours comparison does not independently determine payment fairness.
- PayPal operations currently use Sandbox credentials.
- The Sandbox account returned zero disputes during testing.
- No real payments or dispute-resolution actions are performed by the dispute handler.