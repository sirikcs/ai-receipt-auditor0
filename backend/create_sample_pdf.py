
from reportlab.lib.pagesizes import A4
from reportlab.pdfgen import canvas

filename = "sample_contract.pdf"

pdf = canvas.Canvas(filename, pagesize=A4)

text = pdf.beginText(50, 800)
text.setFont("Helvetica", 12)

contract = [
    "FREELANCER WEB DEVELOPMENT AGREEMENT",
    "",
    "Client: ABC Technologies",
    "Freelancer: John",
    "",
    "Project: Website Development",
    "",
    "Scope of Work:",
    "1. Website design",
    "2. Frontend development",
    "3. Responsive layout",
    "4. Testing and debugging",
    "5. Deployment",
    "",
    "Estimated Working Hours: 40 hours",
    "",
    "Agreed Contract Amount: USD 500",
    "",
    "Payment Type: Fixed-price",
    "",
    "Payment Terms:",
    "Payment will be made after successful project",
    "completion and client approval.",
    "",
    "Both parties agree to the above terms."
]

for line in contract:
    text.textLine(line)

pdf.drawText(text)
pdf.save()

print("Sample PDF created successfully!")
