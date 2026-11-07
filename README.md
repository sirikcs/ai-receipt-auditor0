# AI Receipt Auditor for Freelancers

An AI-powered invoice auditing and payment management platform designed to help freelancers compare contract terms with actual work records, identify discrepancies, manage invoices, and review PayPal payment disputes.

The project combines Google Gemini AI with PayPal Sandbox APIs to make freelance invoice management more transparent and efficient.

## Problem Statement

Freelancers often manage contracts, working hours, invoices, and payments manually. This can lead to:
- Differences between agreed contract hours and actual working hours.
- Difficulty identifying incorrect or missing work-log entries.
- Manual invoice creation and payment tracking.
- Difficulty understanding payment disputes.

AI Receipt Auditor aims to simplify these tasks through AI-powered analysis and payment automation.

## Key Features

### 1. Work Log Analysis
- Upload CSV files containing work-log entries.
- Calculate and review recorded working hours.
- Organize work records for contract comparison.

### 2. AI-Powered Contract Auditing
- Upload a contract in PDF format.
- Extract relevant contract information.
- Compare contract expectations with actual work-log data.
- Use Google Gemini AI to identify discrepancies and generate an analysis.

### 3. PayPal Invoice Management
- Connect to PayPal Sandbox.
- Create draft invoices.
- Send invoices through PayPal.
- Retrieve invoice information.
- Store invoice records in an SQLite database.
- Require explicit human approval before invoice creation and sending.

### 4. PayPal Webhook Integration
- Verify incoming PayPal webhook signatures.
- Process invoice-related webhook events.
- Update invoice and payment statuses automatically.
- Prevent duplicate event processing using SQLite event tracking and unique event IDs.

Supported invoice event mappings include:
- `INVOICING.INVOICE.CREATED`
- `INVOICING.INVOICE.SENT`
- `INVOICING.INVOICE.PAID`
- `INVOICING.INVOICE.CANCELLED`
- `INVOICING.INVOICE.REFUNDED`

### 5. AI-Powered PayPal Dispute Analysis
- Retrieve available PayPal disputes.
- Fetch individual dispute details.
- Use Google Gemini AI to analyse dispute information.
- Generate useful information for human review.

**Note:** Dispute analysis is advisory. The current implementation does not submit dispute evidence or resolve disputes automatically.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Python, Flask |
| AI Analysis | Google Gemini API |
| Payment Platform | PayPal REST API |
| Database | SQLite |
| PDF Processing | pypdf |
| CSV Processing | Python |
| Version Control | Git and GitHub |

## Project Structure

```text
ai-receipt-auditor0/
|-- backend/
|   |-- app.py
|   |-- dispute_handler.py
|   `-- requirements.txt
|-- frontend/
|-- BACKEND_API.md
`-- README.md
```

## Backend Setup

### Prerequisites

- Python installed on your computer.
- Git installed.
- A Google Gemini API key.
- PayPal Developer Sandbox credentials.

### 1. Clone the repository

```bash
git clone https://github.com/sirikcs/ai-receipt-auditor0.git
cd ai-receipt-auditor0
```

### 2. Create a virtual environment

```bash
cd backend
python -m venv venv
```

### 3. Activate the virtual environment

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

### 4. Install dependencies

```bash
python -m pip install -r requirements.txt
```

### 5. Configure environment variables

Create a `.env` file inside the `backend` folder.

Add your own credentials:

```env
GEMINI_API_KEY=your_gemini_api_key
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
```

Keep your `.env` file private. Never upload API keys or PayPal credentials to GitHub.

### 6. Start the Flask backend

From the `backend` folder, run:

```bash
python app.py
```

The backend will start on the local Flask development server.

## API Endpoints

| Method | Endpoint | Purpose |
|---|---|---|
| GET | `/health` | Check backend health |
| POST | `/api/analyze-contract-pdf` | Analyse a contract PDF |
| POST | `/api/analyze-contract-worklog` | Compare contract and work-log data |
| GET | `/api/paypal/test` | Test PayPal Sandbox connection |
| POST | `/api/paypal/create-invoice` | Create a PayPal draft invoice |
| GET | `/api/paypal/invoice/<invoice_id>` | Retrieve an invoice |
| POST | `/api/paypal/send-invoice/<invoice_id>` | Send an invoice |
| POST | `/api/paypal/webhook` | Receive and verify PayPal webhooks |
| GET | `/api/paypal/invoices` | Retrieve stored invoice records |
| GET | `/api/paypal/disputes` | Retrieve PayPal disputes |
| GET | `/api/paypal/disputes/<dispute_id>` | Retrieve individual dispute details |
| GET | `/api/paypal/disputes/<dispute_id>/analyze` | Analyse a dispute using Gemini AI |

For request formats and additional endpoint details, refer to [BACKEND_API.md](BACKEND_API.md).

## Database and Security

The backend uses SQLite to store invoice records and processed webhook events.

Important implementation safeguards include:
- Human approval before invoice creation and sending.
- PayPal webhook signature verification.
- Duplicate webhook protection using unique event IDs.
- Database transaction handling for webhook processing.
- Environment variables for API credentials.

## Testing and Verification

The backend has been tested for the following:

- Flask server startup and health check.
- PayPal Sandbox connection.
- Invoice creation and retrieval.
- Invoice sending.
- SQLite invoice storage.
- PayPal webhook signature verification.
- Webhook event processing and duplicate-event protection.
- Invoice status updates, including a successful Sandbox payment webhook.
- PDF contract analysis.
- CSV work-log analysis.
- Gemini-powered dispute analysis using sample dispute data.

**Testing limitation:** The PayPal Sandbox account used during testing returned zero real disputes. Dispute retrieval is implemented, but live dispute testing requires available Sandbox dispute records.

## Project Status

The backend features have been implemented and tested in the PayPal Sandbox and local development environment.

The React frontend has been developed separately. Frontend-backend integration and complete end-to-end testing are still in progress.

## Future Improvements

- Complete frontend-backend integration.
- Improve the user dashboard and invoice tracking experience.
- Add more comprehensive automated tests.
- Test dispute analysis with real Sandbox dispute records.
- Improve error handling and validation.
- Prepare the application for secure production deployment.

## Disclaimer

This project currently uses PayPal Sandbox for development and testing. It is a hackathon project and is not yet a production-ready payment platform.

AI-generated contract and dispute analyses are intended to assist users and should be reviewed by a human before making financial or contractual decisions.

## Contributors

Developed collaboratively as a hackathon project.

