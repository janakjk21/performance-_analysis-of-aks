# tests/test_auth.py

def test_register_user(client):
    response = client.post("/auth/register", json={
        "username": "testuser",
        "email": "testuser@example.com",
        "password": "testpass123"
    })
    assert response.status_code == 200
    assert response.json() == {"message": "User registered successfully"}


def test_register_existing_user(client):
    # Register first user
    client.post("/auth/register", json={
        "username": "user1",
        "email": "duplicate@example.com",
        "password": "testpass123"
    })

    # Attempt to register with same email but different username
    response = client.post("/auth/register", json={
        "username": "user2",  # ✅ different username
        "email": "duplicate@example.com",  # ❌ same email (will trigger expected error)
        "password": "anotherpass"
    })

    assert response.status_code == 400
    assert response.json()["detail"] == "Email already registered"



def test_login_user_success(client):
    # Register a user
    client.post("/auth/register", json={
        "username": "loginuser",
        "email": "login@example.com",
        "password": "loginpass"
    })

    # Login with correct credentials
    response = client.post("/auth/login", json={
        "email": "login@example.com",
        "password": "loginpass"
    })
    assert response.status_code == 200
    json_data = response.json()
    assert "access_token" in json_data
    assert json_data["token_type"] == "bearer"


def test_login_user_failure(client):
    # Try to login with an invalid user
    response = client.post("/auth/login", json={
        "email": "nonexistent@example.com",
        "password": "wrongpass"
    })
    assert response.status_code == 401
    assert response.json()["detail"] == "Invalid email or password"
