# AI-Powered Full-Stack FastAPI + React Web App

This is a full-stack web application combining **FastAPI** as the backend and **React** as the frontend. It supports user registration/login, job submission to an AI model, credit tracking, and a searchable chat and image history. The application is containerized with Docker and deployed on **Azure App Service** using **GitHub Actions**.

🔗 **Live App**: [my-fastapi-app-3389.azurewebsites.net](https://my-fastapi-app-3389.azurewebsites.net)

---

## 🚀 Features

- User authentication with JWT (Login/Register)
- Secure history creation and retrieval
- AI job submission and status checking
- User credit tracking
- Protected routes on frontend
- React dashboard, chat, image search, and contact list features
- Fully Dockerized and CI/CD enabled for Azure

---

## 🛠 Tech Stack

**Frontend**
- React
- Bootstrap
- React Router

**Backend**
- FastAPI
- Pydantic
- JWT Authentication
- PostgreSQL / SQLite
- Docker

**DevOps**
- Docker Compose
- GitHub Actions
- Azure App Service (via Azure Container Registry)

---

## 🧱 Project Structure

```
📦project-root
 ┣ 📁backend
 ┃ ┣ 📄main.py
 ┃ ┣ 📁routers
 ┃ ┣ 📁models
 ┃ ┣ 📁schemas
 ┃ ┣ 📄Dockerfile
 ┣ 📁frontend
 ┃ ┣ 📄App.js
 ┃ ┣ 📁components
 ┃ ┣ 📁auth
 ┃ ┣ 📁chatgpt
 ┃ ┣ 📁searchfeatures
 ┃ ┣ 📄Dockerfile
 ┣ 📄docker-compose.yml
 ┣ 📄README.md
 ┣ 📄.github/workflows/deploy.yml
```

---

## ⚙️ Running Locally with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/yourproject.git
   cd yourproject
   ```

2. **Build and start the containers**
   ```bash
   docker-compose up --build
   ```

3. **Access the app**
   - Frontend: `http://localhost:3000`
   - Backend: `http://localhost:8000`

---

## 🧪 API Endpoints (FastAPI)

| Endpoint              | Method | Description                     |
|----------------------|--------|---------------------------------|
| `/auth/register`     | POST   | Register new user               |
| `/auth/login`        | POST   | Login and get access token      |
| `/history/`          | GET    | Get user's history              |
| `/history/`          | POST   | Create a new history item       |
| `/history/{id}`      | PUT    | Update a specific history item  |
| `/history/{id}`      | DELETE | Delete a specific history item  |
| `/jobs/submit`       | POST   | Submit a new AI job             |
| `/jobs/{id}/status`  | GET    | Check job processing status     |
| `/jobs/credits`      | GET    | Get remaining user credits      |
| `/user/me`           | GET    | Get profile of authenticated user |
| `/`                  | GET    | Root (health check)             |

---

## 🧪 Example Test Cases

Example tests using FastAPI’s `TestClient`:

```python
def test_create_history():
    login_response = client.post(
        "/auth/login",
        json={"email": "testuser@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    response = client.post(
        "/history",
        headers={"Authorization": f"Bearer {token}"},
        json={"text": "Test history entry"}
    )
    assert response.status_code == 201
    assert response.json()["message"] == "History created successfully"

def test_get_history():
    login_response = client.post(
        "/auth/login",
        json={"email": "testuser@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]
    
    response = client.get(
        "/history",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json()["history"], list)
```

Run tests using:

```bash
pytest tests/
```

---

## 🔐 Authentication (JWT)

- Tokens are stored in `localStorage` under `session_data`.
- On each request, the token is sent via the `Authorization` header:
  ```
  Authorization: Bearer <access_token>
  ```

---

## 🌐 Deployment

Deployed using GitHub Actions:

- On push to `main`, the app builds Docker images and pushes to Azure Container Registry.
- Azure App Service pulls the latest image and redeploys the app.

---

## 📌 Frontend Routes

| Route            | Auth | Component         |
|------------------|------|-------------------|
| `/login`         | ❌   | Login             |
| `/register`      | ❌   | Register          |
| `/`              | ✅   | MainDashboard     |
| `/create`        | ✅   | ContactForm       |
| `/chatgpt`       | ✅   | ChatGPT Dashboard |
| `/search-images` | ✅   | Image Search      |

---

## 📧 Contact

Maintainer: **Janak sapkota**  
Email: janakjk21@gmail.com  
GitHub: [@yourusername](https://github.com/janakjk21)

---

## ✅ License

This project is licensed under the MIT License.

