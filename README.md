# AI Receipt Auditor for Freelancers

An AI-powered invoice auditing and payment automation platform designed to help freelancers review work records, analyse contract hours, manage invoices, and monitor PayPal disputes.

## Key Features

- **Work Log Analysis:** Upload CSV work logs and calculate total working hours.
- **Contract Analysis:** Compare actual working hours with estimated contract hours.
- **AI-Powered Auditing:** Use Google Gemini to analyse work records and highlight discrepancies.
- **PayPal Integration:** Connect to PayPal Sandbox for dispute retrieval.
- **Dispute Analysis:** Extract important dispute information for review.

## Technology Stack

| Component | Technology |
|---|---|
| Frontend | React, Vite, CSS |
| Backend | Python, Flask |
| Data Processing | Pandas |
| AI Analysis | Google Gemini API |
| Payment Platform | PayPal REST API |
| Version Control | Git and GitHub |

## Project Structure

```text
ai-receipt-auditor0/
├── backend/
│   ├── app.py
│   ├── dispute_handler.py
│   ├── requirements.txt
│   └── test_worklog.csv
├── frontend/
├── BACKEND_API.md
└── README.md
```

## Backend Setup

### 1. Install dependencies

```bash
python -m pip install -r backend/requirements.txt
```

### 2. Configure environment variables

Create `backend/.env` and add:

```env
GEMINI_API_KEY=your_gemini_api_key
PAYPAL_CLIENT_ID=your_paypal_sandbox_client_id
PAYPAL_CLIENT_SECRET=your_paypal_sandbox_secret
PAYPAL_BASE_URL=https://api-m.sandbox.paypal.com
```

Never commit your `.env` file or expose API credentials.

### 3. Start the backend

```bash
cd backend
python app.py
```

Backend address: `http://127.0.0.1:5000`

## Backend API Documentation

For API endpoints, request formats, example responses, PayPal dispute functionality, and testing results, see:

[BACKEND_API.md](BACKEND_API.md)

## Testing

The following backend functionality has been tested locally:

- Flask health endpoint
- Contract analysis endpoint
- Google Gemini AI analysis endpoint
- PayPal Sandbox authentication
- PayPal dispute retrieval
- Dispute analysis using sample data

**Note:** PayPal Sandbox returned zero disputes during testing. The dispute handler currently supports retrieval and analysis only; it does not submit evidence or resolve disputes.

## Project Status

The frontend and backend have been developed as separate components. Full integration and end-to-end testing remain pending.
