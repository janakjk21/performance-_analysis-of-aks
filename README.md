
# 📘 AI-Powered Cloud API – End-User and Developer Documentation

## 📌 1. Project Overview

**Title:** AI-Powered Cloud Service API  
**Module:** CMP9785M Cloud Development  
**Technology Stack:** FastAPI (Python), PostgreSQL, JWT, Docker, [Frontend: React/HTML+JS], Third-party AI API  
**Purpose:**  
To provide a secure, scalable, AI-enhanced backend API that enables users to submit jobs to an external AI service (e.g., image generation, summarization, translation, etc.), with account management, credit-based access, job queueing, and notifications.

## 🔐 2. Authentication & Authorization

### ➤ Sign Up
- **Endpoint:** `POST /signup`
- **Payload:**
  ```json
  {
    "username": "your_name",
    "password": "your_password"
  }
  ```
- **Returns:** JWT access token on success

### ➤ Login
- **Endpoint:** `POST /login`
- **Payload:**
  ```json
  {
    "username": "your_name",
    "password": "your_password"
  }
  ```
- **Returns:** JWT token to be used in `Authorization: Bearer <token>` header

### ➤ Token Usage
All protected endpoints require an `Authorization` header with the bearer token. Tokens expire in 30 minutes.

## 👤 3. User Profile & Credits

### ➤ View Account
- **Endpoint:** `GET /me`
- **Returns:** User details and current credit balance

### ➤ Check Credits
- **Endpoint:** `GET /me/credits`
- **Returns:**
  ```json
  {
    "credits": 10
  }
  ```

### ➤ Credit Policy
- 1 job = 1 credit  
- Users start with 10 credits  
- Submissions without sufficient credits are rejected

## 📝 4. Job Submission

### ➤ Submit a Job
- **Endpoint:** `POST /jobs/submit`
- **Payload (example for text summarization):**
  ```json
  {
    "task_type": "summarize",
    "input_data": "This is a long paragraph that needs to be summarized."
  }
  ```
- **Behavior:**  
  - Deducts 1 credit  
  - Queues job for background processing  
  - Returns job ID

### ➤ Check Job Status
- **Endpoint:** `GET /jobs/{job_id}/status`
- **Returns:**
  ```json
  {
    "status": "completed",
    "output": "Short summary."
  }
  ```

### ➤ Job Status Values
- `queued`
- `in_progress`
- `completed`
- `failed`

## 🤖 5. External AI Integration

### ➤ Example Service: OpenAI API (GPT or DALL·E)

- Secure connection via API key (`.env`)
- Input is processed through selected AI model
- Response is stored in the job record and returned on status check

## 🔔 6. Notification System

- **Polling-based updates:** Frontend checks for job status every few seconds
- **Planned extension:** Webhook/email notifications (for future expansion)

## 🧪 7. Testing Strategy

### ➤ Unit Testing
- All core functions (auth, credit logic, DB operations) tested with `pytest`

### ➤ API Testing
- Postman collection included
- Tested:
  - Auth flow
  - Job submission and edge cases
  - Invalid token handling

### ➤ Functional Testing
- Tested job queue with multiple users
- Checked AI API call error handling
- Monitored DB state after submissions

### ➤ CI/CD Pipeline
- **GitHub Actions** for:
  - Linting
  - Running tests
  - Docker image build (if included)

## 📦 8. Deployment Instructions

### ➤ Local (Dev)
```bash
# Create virtualenv
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r requirements.txt

# Start dev server
uvicorn app.main:app --reload
```

### ➤ Docker (Optional)
```bash
docker build -t ai-cloud-api .
docker run -p 8000:8000 ai-cloud-api
```

### ➤ Environment Variables (.env)
```
DATABASE_URL=postgresql://user:password@localhost/dbname
SECRET_KEY=supersecretkey
ALGORITHM=HS256
ACCESS_TOKEN_EXPIRE_MINUTES=30
AI_API_KEY=your_key_here
```

## 🧾 9. API Reference Summary

| Endpoint               | Method | Auth Required | Description                          |
|------------------------|--------|----------------|--------------------------------------|
| `/signup`              | POST   | ❌             | Register new user                    |
| `/login`               | POST   | ❌             | Get JWT token                        |
| `/me`                  | GET    | ✅             | Get user profile                     |
| `/me/credits`          | GET    | ✅             | View current credit balance          |
| `/jobs/submit`         | POST   | ✅             | Submit job for processing            |
| `/jobs/{id}/status`    | GET    | ✅             | Get status and result of a job       |
| `/docs`                | GET    | ❌             | Swagger UI documentation             |
| `/redoc`               | GET    | ❌             | ReDoc formatted documentation        |

## 📹 10. Demo Video

- **Link:** [YouTube or Panopto URL]
- **Overview:**
  - User registration/login
  - Submit AI job
  - Monitor job status
  - Show credits in action
  - Preview Swagger docs

## 📂 11. Repository & Source Links

- **GitHub Repository:** [GitHub URL]
- **Source Code Structure:**
  ```
  app/
    ├── main.py
    ├── models/
    ├── schemas/
    ├── api/
    ├── core/
    ├── services/
  client/
    ├── index.html / react app
  tests/
    ├── test_auth.py
    ├── test_jobs.py
  ```

## 🔁 12. Future Improvements

- Webhook notifications or email alerts
- Admin panel for credit management
- More AI task types (e.g., image generation, translation)
- Performance scaling with cloud deployment
