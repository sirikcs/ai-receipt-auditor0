# API Contract

Base URL (local): `http://127.0.0.1:5000`
All responses are JSON. Errors look like `{ "error": "message" }`.

## 1. Analyze contract and work log
`POST /api/analyze-contract-worklog`

Request: `multipart/form-data`
- `contract`: PDF file (must contain readable text)
- `worklog`: CSV file with columns `task` and `hours`

Success (200):
{
  "status": "success",
  "contract_details": { "estimated_hours": 40, "agreed_amount": 500, "currency": "USD", "payment_type": "fixed-price" },
  "worklog_summary": { "actual_hours": 38.0, "estimated_hours": 40.0, "hours_difference": -2.0 },
  "payment_summary": { "agreed_amount": 500, "currency": "USD", "payment_type": "fixed-price" },
  "actual_hours": 38.0,
  "estimated_hours": 40.0,
  "agreed_amount": 500,
  "currency": "USD",
  "ai_analysis": "Gemini analysis text (markdown)"
}

Errors: 400 (missing or invalid file/columns), 500 (AI failure).

## 2. PayPal connection test
`GET /api/paypal/test`

Success (200): `{ "status": "success", "message": "PayPal Sandbox connection successful" }`

## 3. Create draft invoice
`POST /api/paypal/create-invoice`

Request (JSON):
```json
{
  "approved": true,
  "client_email": "client@example.com",
  "freelancer_name": "First Last",
  "amount": 500,
  "description": "Website project",
  "currency": "USD"
}
```
Rules: `approved` must be `true`; name needs first and last; currency is USD only.

Success (201): `{ "status": "success", "invoice_id": "INV2-...", "invoice_status": "DRAFT" }`
Errors: 400 (validation), 502 (PayPal error).

## 4. Send invoice
`POST /api/paypal/send-invoice/<invoice_id>`

Request (JSON): `{ "approved": true }`
Only DRAFT invoices can be sent.

Success (200): `{ "status": "success", "message": "Invoice sent successfully through PayPal" }`
Errors: 400, 502.

## 5. List stored invoices
`GET /api/paypal/invoices`

Success (200):
```json
{
  "status": "success",
  "invoices": [
    {
      "invoice_id": "INV2-...",
      "client_email": "client@example.com",
      "freelancer_name": "First Last",
      "amount": 500.0,
      "currency": "USD",
      "invoice_status": "SENT",
      "payment_status": "UNPAID",
      "created_at": "2026-11-08 10:11:05"
    }
  ]
}
```
`invoice_status`: DRAFT, SENT, PAID, CANCELLED, REFUNDED. Updated by the PayPal webhook.

## 6. Get one invoice from PayPal
`GET /api/paypal/invoice/<invoice_id>`

## 7. PayPal webhook (backend only)
`POST /api/paypal/webhook`. Called by PayPal, not by the frontend.

## 8. Disputes (connected: the page reads the list)
- `GET /api/paypal/disputes`
- `GET /api/paypal/disputes/<dispute_id>`
- `GET /api/paypal/disputes/<dispute_id>/analyze`

## 9. Health check
`GET /health` returns `{ "status": "healthy" }`
