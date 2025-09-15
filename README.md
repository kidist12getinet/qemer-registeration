# Training Registration API

Node.js/Express backend for course registration system with JWT auth and MongoDB.

# Features
-  JWT Authentication (Student/Admin roles)
-  Course CRUD operations
-  Registration workflow with approvals
-  Time-based registration windows
-  Dashboard analytics
-  Email notifications

# Quick Start
1. Clone repo & install:
   bash
   git clone https://github.com/Hanah29/RegistrationSystem_backend.git   && cd training-register-backend
   npm install
   

2. Add `.env`:


3. Run:
    bash
   npm run dev  

# Key Endpoints
| Type       | Endpoint                     | Access     |
|------------|------------------------------|------------|
| `POST`     | `/api/users/login`           | Public     |
| `GET`      | `/api/courses`               | Public     |
| `POST`     | `/api/registrations`         | Student    |
| `PUT`      | `/api/registrations/:id/status` | Admin |

# Data Models
- User: { email, password(hashed), role }
- Course: { title, instructor, maxEnrollment }
- Registration: { student, course, status }

#License: MIT  
