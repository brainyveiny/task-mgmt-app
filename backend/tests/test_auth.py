import pytest

@pytest.mark.asyncio
async def test_register_user(client):
    response = await client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@gmail.com",
        "password": "testpass123"
    })
    assert response.status_code == 201
    data = response.json()
    assert data["username"] == "testuser"
    assert data["email"] == "test@gmail.com"

@pytest.mark.asyncio
async def test_register_duplicate_username(client):
    await client.post("/auth/register", json={
        "username": "testuser",
        "email": "test1@gmail.com",
        "password": "testpass123"
    })
    response = await client.post("/auth/register", json={
        "username": "testuser",
        "email": "test2@gmail.com",
        "password": "testpass123"
    })
    assert response.status_code == 409
    assert "Username already exists" in response.json()["detail"]

@pytest.mark.asyncio
async def test_register_duplicate_email(client):
    await client.post("/auth/register", json={
        "username": "user1",
        "email": "same@gmail.com",
        "password": "testpass123"
    })
    response = await client.post("/auth/register", json={
        "username": "user2",
        "email": "same@gmail.com",
        "password": "testpass123"
    })
    assert response.status_code == 409
    assert "Email already exists" in response.json()["detail"]

@pytest.mark.asyncio
async def test_login_user(client):
    await client.post("/auth/register", json={
        "username": "testuser",
        "email": "test@gmail.com",
        "password": "testpass123"
    })
    response = await client.post("/auth/login", data={
        "username": "test@gmail.com",
        "password": "testpass123"
    })
    assert response.status_code == 200
    data = response.json()
    assert "access_token" in data
    assert data["token_type"] == "bearer"

@pytest.mark.asyncio
async def test_invalid_login(client):
    response = await client.post("/auth/login", data={
        "username": "wrong@gmail.com",
        "password": "wrongpassword"
    })
    assert response.status_code == 401
