# Notes Management Application

## Overview

The Notes Management Application is a full-stack web application that enables users to securely create, manage, and organize their personal notes. The application provides user authentication, rich text note editing, logging, testing, code quality analysis, and a responsive user interface built with React.js.

## Technology Stack

### Frontend

* React.js
* Axios
* React Router
* Jest (Unit Testing)

### Backend

* Node.js
* Express.js
* Pino Logger
* JWT Authentication
* Mocha & Chai (Unit Testing)

### Database

* MySQL or PostgreSQL

### DevOps & Quality Tools

* Git Version Control
* SonarQube
* ESLint
* Prettier

### Optional Features

* Socket.IO for Real-Time Updates
* File Import/Export Functionality

---

## Features

### User Authentication & Authorization

* User Registration
* User Login
* User Logout
* JWT-based Authentication
* Protected Routes
* User-specific Notes Access

### Note Management

* Create Notes
* View Notes
* Edit Notes
* Delete Notes
* Rich Text Editor Support
* Note Ownership Validation

### Application Logging

Implemented using Pino Logger:

* HTTP Request Logging
* HTTP Response Logging
* Error Logging
* User Activity Tracking
* Application Event Logging

### Database Management

* User Management
* Notes Management
* Relational Database Design
* Secure Data Storage

### Exception Handling

* Global Error Handling Middleware
* Structured Error Responses
* Centralized Exception Logging
* Validation Error Handling

### Unit Testing

Backend Testing:

* Mocha
* Chai

Frontend Testing:

* Jest

Coverage Includes:

* Controllers
* Services
* Repository/Data Access Layer
* React Components
* Utility Functions

### SonarQube Integration

* Static Code Analysis
* Code Smell Detection
* Security Vulnerability Detection
* Maintainability Reports
* Quality Gate Enforcement

### Dashboard

The React dashboard provides:

* User Profile Information
* Notes Overview
* Note Creation Interface
* Search and Filter Functionality
* Responsive Design

### Git Version Control

* Feature Branch Workflow
* Pull Requests
* Version Tracking
* Collaborative Development

---

## Optional Features

### Real-Time Updates

Using Socket.IO:

* Live Note Updates
* Instant Synchronization
* Real-Time Notifications

### Export & Import

* Export Notes to File
* Import Notes from File
* Backup and Restore Support

### Search & Filter

* Search Notes by Title
* Search Notes by Content
* Filter Notes by Date
* Filter Notes by Category

---

## Project Structure

```text
project-root/
│
├── backend/
│   ├── controllers/
│   ├── services/
│   ├── repositories/
│   ├── middleware/
│   ├── routes/
│   ├── config/
│   ├── tests/
│   └── logs/
│
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   ├── pages/
│   │   ├── services/
│   │   ├── hooks/
│   │   └── tests/
│
├── database/
│   └── schema.sql
│
├── sonar-project.properties
├── package.json
└── README.md
```

---

## Installation

### Clone Repository

```bash
git clone <repository-url>
cd notes-management-app
```

### Backend Setup

```bash
cd backend
npm install
npm start
```

### Frontend Setup

```bash
cd frontend
npm install
npm start
```

---

## Environment Variables

Create a `.env` file in the backend directory:

```env
PORT=5000
DB_HOST=localhost
DB_PORT=5432
DB_NAME=notesdb
DB_USER=root
DB_PASSWORD=password

JWT_SECRET=your_secret_key

LOG_LEVEL=info
```

---

## API Endpoints

### Authentication

| Method | Endpoint           | Description   |
| ------ | ------------------ | ------------- |
| POST   | /api/auth/register | Register User |
| POST   | /api/auth/login    | Login User    |
| POST   | /api/auth/logout   | Logout User   |

### Notes

| Method | Endpoint       | Description    |
| ------ | -------------- | -------------- |
| GET    | /api/notes     | Get All Notes  |
| GET    | /api/notes/:id | Get Note By ID |
| POST   | /api/notes     | Create Note    |
| PUT    | /api/notes/:id | Update Note    |
| DELETE | /api/notes/:id | Delete Note    |

---

## Running Tests

### Backend

```bash
npm test
```

### Frontend

```bash
npm run test
```

---

## SonarQube Analysis

```bash
sonar-scanner
```

Ensure SonarQube Server is running before executing analysis.

---

## Future Enhancements

* Note Categories
* File Attachments
* Dark Mode
* Collaborative Notes
* Email Notifications
* Mobile Application

---

## Author

Developed as a Full Stack Notes Management System using React.js, Node.js, Express.js, MySQL/PostgreSQL, Pino Logger, Mocha/Chai, Jest, SonarQube, and Git.
