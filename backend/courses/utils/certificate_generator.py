from reportlab.pdfgen import canvas
from reportlab.lib.pagesizes import letter
import os
from django.conf import settings

def generate_certificate_pdf(student_name, course_title, certificate_id):
    file_path = os.path.join(settings.MEDIA_ROOT, 'certificates', f'certificate_{certificate_id}.pdf')
    os.makedirs(os.path.dirname(file_path), exist_ok=True)

    c = canvas.Canvas(file_path, pagesize=letter)
    width, height = letter

    # Add basic content
    c.setFont("Helvetica-Bold", 26)
    c.drawCentredString(width / 2, height - 100, "Certificate of Completion")

    c.setFont("Helvetica", 18)
    c.drawCentredString(width / 2, height - 150, f"This certifies that")

    c.setFont("Helvetica-Bold", 22)
    c.drawCentredString(width / 2, height - 200, student_name)

    c.setFont("Helvetica", 18)
    c.drawCentredString(width / 2, height - 250, f"has successfully completed the course:")

    c.setFont("Helvetica-Bold", 20)
    c.drawCentredString(width / 2, height - 300, f"{course_title}")

    c.setFont("Helvetica", 14)
    c.drawString(50, 100, "Signature: _____________________")

    c.setFont("Helvetica", 12)
    c.drawString(400, 100, "Instructor")

    c.save()
    return f'certificates/certificate_{certificate_id}.pdf'
