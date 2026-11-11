# 🏥 Hospital Management System

A full-stack **Hospital Management System** designed to simplify and manage essential hospital operations through a modern web application.

The system provides separate modules for managing doctors, patients, appointments, admissions, pharmacy, laboratory, billing, inventory, staff, and more.

---

## 🚀 Live Project

### 🌐 Frontend
https://hospital-frontend-wmks.onrender.com

## 📌 Project Overview

The Hospital Management System is a full-stack web application developed using **React.js** for the frontend and **Django REST Framework** for the backend.

The application follows a client-server architecture where the React frontend communicates with Django REST APIs to perform operations such as creating, updating, viewing, and managing hospital-related data.

The project also includes authentication, database integration, API communication, and cloud deployment.

---

## ✨ Features

### 🔐 Authentication
- User login
- Token-based authentication
- Protected API endpoints
- Role-based access
- Secure communication between frontend and backend

### 👨‍⚕️ Doctor Management
- Add doctors
- View doctor details
- Update doctor information
- Manage doctor availability
- Associate doctors with departments

### 🧑‍🤝‍🧑 Patient Management
- Add patients
- View patient information
- Update patient details
- Manage patient records

### 📅 Appointment Management
- Schedule appointments
- View appointments
- Manage doctor-patient appointments
- Update appointment status
- Appointment slot management

### 🏥 Admission Management
- Manage patient admissions
- Track admission information
- Manage hospital stays
- Maintain admission records

### 💊 Pharmacy Management
- Medicine management
- View available medicines
- Manage medicine information
- Track pharmacy-related records

### 🧪 Laboratory Management
- Manage laboratory records
- Track test information
- Manage patient laboratory data

### 📦 Inventory Management
- Manage hospital inventory
- Track available items
- Maintain inventory records

### 💳 Billing Management
- Manage billing information
- Track hospital-related charges
- Maintain billing records

### 👥 Staff Management
- Manage hospital staff
- Store staff information
- Organize staff records

### 🤖 Chatbot
- Integrated chatbot functionality
- Provides an interactive interface for users
- Communicates with the backend chatbot API

---

## 🛠️ Tech Stack

### Frontend

- React.js
- Vite
- JavaScript
- HTML5
- CSS3
- Axios
- React Router

### Backend

- Python
- Django
- Django REST Framework
- Django REST Framework Token Authentication
- Django CORS Headers

### Database

- PostgreSQL
- SQLite for local development

### Deployment

- Render
- Aiven PostgreSQL

### Development Tools

- Git
- GitHub
- VS Code
- Postman

---

## 🏗️ Project Architecture

```text
Hospital Management System
│
├── frontend/
│   ├── public/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── package.json
│   └── vite.config.js
│
├── backend/
│   ├── accounts/
│   ├── doctors/
│   ├── patients/
│   ├── appointments/
│   ├── admissions/
│   ├── departments/
│   ├── pharmacy/
│   ├── laboratory/
│   ├── inventory/
│   ├── billing/
│   ├── reports/
│   ├── staff/
│   ├── chatbot/
│   ├── config/
│   ├── manage.py
│   └── requirements.txt
│
├── .gitignore
└── README.md
