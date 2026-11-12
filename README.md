# AI Receipt Auditor for Freelancers

An AI-powered invoice auditing and payment management platform designed for freelancers to compare contract terms with actual work records, identify discrepancies, manage invoices, and review PayPal payment disputes.

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
│
├── backend/
│   ├── app.py
│   ├── dispute_handler.py
│   ├── requirements.txt
│   └── .env                 # Create locally
│
├── frontend/
│   ├── src/
│   ├── package.json
│   └── ...
│
├── BACKEND_API.md
├── API_CONTRACT.md
└── README.md
```

## Prerequisites

Before running the application, install:

- Python 3.10 or later.
- Node.js and npm.
- Git.
- A Google Gemini API key.
- PayPal Developer Sandbox credentials.

## Application Setup and Launch Guide

Follow these steps to run the complete application locally.

### Step 1: Clone the Repository

Open a terminal and execute:

```bash
git clone https://github.com/sirikcs/ai-receipt-auditor0.git
cd ai-receipt-auditor0
```

### Step 2: Configure the Backend

Navigate to the backend directory:

```bash
cd backend
```

Create a Python virtual environment:

```bash
python -m venv venv
```

Activate the virtual environment.

**Windows PowerShell:**

```powershell
.\venv\Scripts\Activate.ps1
```

**macOS / Linux:**

```bash
source venv/bin/activate
```

Install the backend dependencies:

```bash
python -m pip install -r requirements.txt
```

### Step 3: Configure Environment Variables

Create a file named `.env` inside the `backend` directory.

Add your own API credentials:

```env
GEMINI_API_KEY=your_gemini_api_key
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_secret
PAYPAL_WEBHOOK_ID=your_paypal_webhook_id
```

**Important:**

- Replace the placeholder values with your own credentials.
- Use PayPal Sandbox credentials for testing.
- Never upload your `.env` file or expose API secrets on GitHub.
- Do not share your private credentials publicly.

### Step 4: Start the Backend Server

Make sure you are inside the `backend` directory and your virtual environment is activated.

Run:

```bash
python app.py
```

The Flask backend should start on:

```text
http://127.0.0.1:5000
```

To verify that the backend is running, open:

```text
http://127.0.0.1:5000/health
```

A successful response should indicate that the backend is healthy.

**Keep this terminal running.**

### Step 5: Configure the Frontend

Open a **new terminal window**.

Navigate to the project directory and then the frontend directory:

```bash
cd ai-receipt-auditor0/frontend
```

Install the frontend dependencies:

```bash
npm install
```

### Step 6: Start the Frontend Application

Run:

```bash
npm run dev
```

Vite will display a local development URL in the terminal, usually:

```text
http://localhost:5173/
```

Open this URL in your browser to access AI Receipt Auditor.

**Keep both the frontend and backend terminals running while using the application.**

### Step 7: Use the Application

Once both servers are running:

1. Open the frontend application in your browser.
2. Upload a contract PDF for AI-powered contract analysis.
3. Upload a work-log CSV file for working-hours analysis.
4. Review the analysis and identified discrepancies.
5. Use the PayPal Sandbox integration to create and send invoices after providing the required human approval.
6. Track invoice and payment statuses.
7. Review available PayPal disputes and their AI-generated analysis.

**Note:** PayPal payment and webhook functionality requires correctly configured Sandbox credentials and webhook settings. For webhook testing, the backend must also be reachable by PayPal through a publicly accessible HTTPS endpoint.

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

For backend request formats and endpoint details, refer to [BACKEND_API.md](BACKEND_API.md).

For frontend-backend integration details, refer to [API_CONTRACT.md](API_CONTRACT.md).

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

The backend and React frontend have been implemented and integrated.

The application supports contract and work-log uploads, Gemini-powered analysis, PayPal invoice creation and sending, invoice tracking, and PayPal dispute retrieval and analysis.

The backend includes PayPal webhook signature verification, duplicate-event protection, and SQLite-based invoice status tracking.

The end-to-end PayPal Sandbox payment test was successfully completed. A Sandbox Personal buyer paid the invoice, the `INVOICING.INVOICE.PAID` webhook was successfully verified and processed by the backend, and the local SQLite database was updated to reflect the `PAID` status.

The project uses PayPal Sandbox and is intended for hackathon demonstration.

## Future Improvements

- Expand automated testing across frontend and backend workflows.
- Test dispute analysis with additional PayPal Sandbox dispute records.
- Improve error handling and input validation.
- Enhance invoice tracking and reporting.
- Prepare the application for secure production deployment.

## Disclaimer

This project currently uses PayPal Sandbox for development and testing. It is a hackathon project and is not yet a production-ready payment platform.

AI-generated contract and dispute analyses are intended to assist users and should be reviewed by a human before making financial or contractual decisions.

## Contributors

Developed collaboratively as a hackathon project.