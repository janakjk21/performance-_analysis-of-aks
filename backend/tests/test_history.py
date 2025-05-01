from fastapi.testclient import TestClient
from main import app

client = TestClient(app)

def test_create_history():
    # First, log in to get a token
    login_response = client.post(
        "/auth/login",
        json={"email": "testuser@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]

    # Use the token to create a history entry
    response = client.post(
        "/history",
        headers={"Authorization": f"Bearer {token}"},
        json={"text": "Test history entry"}
    )
    assert response.status_code == 201
    assert response.json()["message"] == "History created successfully"

def test_get_history():
    # First, log in to get a token
    login_response = client.post(
        "/auth/login",
        json={"email": "testuser@example.com", "password": "password123"}
    )
    token = login_response.json()["access_token"]

    # Use the token to fetch history entries
    response = client.get(
        "/history",
        headers={"Authorization": f"Bearer {token}"}
    )
    assert response.status_code == 200
    assert isinstance(response.json()["history"], list)