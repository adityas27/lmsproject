# 🎓 Full-Stack LMS Platform (Django + React)

## 📚 Description

A full-featured Learning Management System (LMS) built using **Django (DRF)** and **React**, supporting **student progress tracking**, **certificates**, **assignments**, role-based access control, and a **Semi-Admin Panel** built on top of Django’s existing admin capabilities.

This platform supports both **students** and **teachers**, along with semi-admins who can moderate content, review teacher applications, and manage user access.

---

## 🚀 Features

### 👤 User Authentication & Profiles
- JWT-based login and registration
- Custom user model with fields:
  - `is_teacher`, `is_semi_admin`, `is_banned`, `is_verified`
  - Profile image, banner image
  - Phone number, date of birth, bio
- Profile page with avatar, bio, and role-based buttons

---

### 🧑‍🎓 Student Features
- Dashboard with:
  - Enrolled courses (in-progress, completed)
  - Certificates earned
- Course progress tracking
- Course detail pages with:
  - **Study material**: videos, PDFs, text
  - **Graded work**: assignments and submissions
- "Mark Complete" buttons for content tracking

---

### 🧠 Assignment System
- Instructors can upload:
  - Assignment file (PDF, doc, etc.)
  - Description & optional deadline
- Students can submit:
  - Answer file + comments
- Teachers can grade:
  - Upload corrected version
  - Leave feedback and assign marks
- Late submission flags and grading dashboard

---

### 🎓 Certificate System
- Automatically generated certificates on 100% completion
- Manual approval-based certificates (application + review flow)
- Certificate generation in PDF
- Student and instructor certificate dashboards

---

### 🛠️ Semi-Admin Panel (Built on Top of Django Admin)

#### 🔐 User Management
- View all platform users
- Toggle:
  - `is_banned` to restrict access
  - `is_semi_admin` to grant limited admin powers

#### 🧑‍🏫 Teacher Applications
- Application model includes:
  - Education, skills, expertise, past experience
- Semi-admins can:
  - View and filter applications
  - Approve, reject, or hold
  - (Optional) Auto-promote approved users to teachers

#### 👨‍🎓 Student Panel
- List of all students
- See enrolled courses and certificates earned
- Ban/unban functionality via interface

#### 📦 Course Takedown System
- Courses have an `is_visible` flag
- Semi-admins can:
  - Hide or restore any course
- Hidden courses are excluded from:
  - Listings
  - Enrollments
  - Student dashboards

---

## ⚙️ Tech Stack

### Backend
- Django
- Django REST Framework
- Simple JWT
- PostgreSQL
- ReportLab / WeasyPrint (for PDF certificates)

### Frontend
- React
- Axios
- TailwindCSS
- React Router

---

## 🧪 Development Setup

```bash
# Backend
cd backend
python -m venv env
source env/bin/activate
pip install -r requirements.txt
python manage.py migrate
python manage.py runserver

# Frontend
cd frontend
npm install
npm run dev
```

---

## 🛡️ Roles & Permissions

| Role         | Access                                        |
|--------------|-----------------------------------------------|
| Student      | Enroll in courses, track progress, earn certs |
| Teacher      | Create courses, upload content & assignments  |
| Semi-Admin   | Moderate users & content, review applications |
| Superuser    | Full access including Django Admin            |

---

## 🙌 Contributions

You are welcome to contribute! Just fork the repo, make your changes, and open a pull request.

---

## 📃 License

MIT License