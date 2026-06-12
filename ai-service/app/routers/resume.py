from fastapi import APIRouter
from pydantic import BaseModel
from app.gemini_client import generate_text
import io
from reportlab.lib.pagesizes import A4
from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
from reportlab.lib.units import mm
from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, HRFlowable
from reportlab.lib import colors
import base64

router = APIRouter()


class Project(BaseModel):
    title: str
    description: str
    tech_stack: list[str]
    github_url: str = ""
    live_url: str = ""


class Experience(BaseModel):
    company: str
    role: str
    duration: str
    description: str


class ResumeRequest(BaseModel):
    full_name: str
    email: str
    phone: str = ""
    linkedin: str = ""
    github: str = ""
    summary: str = ""
    skills: list[str]
    courses_completed: list[str]
    internships: list[Experience]
    projects: list[Project]
    certifications: list[str]
    education: str = ""


class ResumeResponse(BaseModel):
    ats_content: str          # Gemini-generated ATS-optimised plain text
    pdf_base64: str           # Base64-encoded PDF


@router.post("", response_model=ResumeResponse)
def build_resume(req: ResumeRequest):
    """
    Generate an ATS-friendly resume using student profile data.
    Returns both plain-text ATS content and a PDF (base64).
    """
    # 1. Ask Gemini to generate an ATS-optimised professional summary
    profile_blob = f"""
Name: {req.full_name}
Skills: {', '.join(req.skills)}
Courses: {', '.join(req.courses_completed)}
Internships: {'; '.join([f"{e.role} at {e.company} ({e.duration})" for e in req.internships])}
Projects: {'; '.join([p.title for p in req.projects])}
Certifications: {', '.join(req.certifications)}
Education: {req.education}
"""
    summary_prompt = (
        "You are a professional resume writer. "
        "Write a 3-sentence ATS-optimised professional summary for the following student profile. "
        "Use strong action verbs and relevant keywords.\n\n"
        f"Profile:\n{profile_blob}\n\nProfessional Summary:"
    )
    ai_summary = req.summary if req.summary else generate_text(summary_prompt).strip()

    # 2. Build plain-text ATS content
    ats_lines = [
        req.full_name.upper(),
        f"Email: {req.email}" + (f" | Phone: {req.phone}" if req.phone else ""),
        (f"LinkedIn: {req.linkedin}" if req.linkedin else "") + (f" | GitHub: {req.github}" if req.github else ""),
        "",
        "PROFESSIONAL SUMMARY",
        ai_summary,
        "",
        "SKILLS",
        ", ".join(req.skills),
        "",
        "EDUCATION",
        req.education,
        "",
        "INTERNSHIP EXPERIENCE",
    ]
    for exp in req.internships:
        ats_lines += [f"{exp.role} — {exp.company} ({exp.duration})", exp.description, ""]

    ats_lines.append("PROJECTS")
    for proj in req.projects:
        ats_lines += [
            f"{proj.title} | {', '.join(proj.tech_stack)}",
            proj.description,
            (f"GitHub: {proj.github_url}" if proj.github_url else "") +
            (f" | Live: {proj.live_url}" if proj.live_url else ""),
            "",
        ]

    ats_lines += ["CERTIFICATIONS", ", ".join(req.certifications)]
    ats_content = "\n".join(ats_lines)

    # 3. Generate PDF with ReportLab
    buffer = io.BytesIO()
    doc = SimpleDocTemplate(buffer, pagesize=A4,
                            leftMargin=15*mm, rightMargin=15*mm,
                            topMargin=15*mm, bottomMargin=15*mm)
    styles = getSampleStyleSheet()
    heading_style = ParagraphStyle("heading", fontSize=11, spaceAfter=2,
                                   textColor=colors.HexColor("#1a1a2e"), bold=True)
    normal_style = ParagraphStyle("normal", fontSize=9, spaceAfter=4,
                                  textColor=colors.HexColor("#333333"), leading=14)
    name_style = ParagraphStyle("name", fontSize=18, bold=True,
                                textColor=colors.HexColor("#1a1a2e"), spaceAfter=4)

    story = [
        Paragraph(req.full_name.upper(), name_style),
        Paragraph(f"{req.email} | {req.phone} | {req.linkedin} | {req.github}", normal_style),
        HRFlowable(width="100%", thickness=1, color=colors.HexColor("#6c63ff"), spaceAfter=6),

        Paragraph("PROFESSIONAL SUMMARY", heading_style),
        Paragraph(ai_summary, normal_style),
        Spacer(1, 4),

        Paragraph("SKILLS", heading_style),
        Paragraph(" • ".join(req.skills), normal_style),
        Spacer(1, 4),

        Paragraph("EDUCATION", heading_style),
        Paragraph(req.education, normal_style),
        Spacer(1, 4),
    ]

    if req.internships:
        story.append(Paragraph("INTERNSHIP EXPERIENCE", heading_style))
        for exp in req.internships:
            story += [
                Paragraph(f"<b>{exp.role}</b> — {exp.company} ({exp.duration})", normal_style),
                Paragraph(exp.description, normal_style),
                Spacer(1, 2),
            ]

    if req.projects:
        story.append(Paragraph("PROJECTS", heading_style))
        for proj in req.projects:
            tech = ", ".join(proj.tech_stack)
            links = " | ".join(filter(None, [proj.github_url, proj.live_url]))
            story += [
                Paragraph(f"<b>{proj.title}</b> | {tech}", normal_style),
                Paragraph(proj.description, normal_style),
                Paragraph(links, normal_style),
                Spacer(1, 2),
            ]

    if req.certifications:
        story.append(Paragraph("CERTIFICATIONS", heading_style))
        story.append(Paragraph(" | ".join(req.certifications), normal_style))

    doc.build(story)
    pdf_bytes = buffer.getvalue()
    pdf_base64 = base64.b64encode(pdf_bytes).decode("utf-8")

    return ResumeResponse(ats_content=ats_content, pdf_base64=pdf_base64)
