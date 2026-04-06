import pytest

async def get_auth_token(client):
    await client.post("/auth/register", json={
        "username": "taskuser",
        "email": "taskuser@gmail.com",
        "password": "testpass123"
    })
    response = await client.post("/auth/login", data={
        "username": "taskuser@gmail.com",
        "password": "testpass123"
    })
    return response.json()["access_token"]

@pytest.mark.asyncio
async def test_create_task(client):
    token = await get_auth_token(client)
    response = await client.post("/tasks", json={
        "title": "Test Task",
        "description": "Test description",
        "status": "TODO",
        "priority": "MEDIUM"
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 201
    data = response.json()
    assert data["title"] == "Test Task"
    assert data["status"] == "TODO"

@pytest.mark.asyncio
async def test_get_tasks(client):
    token = await get_auth_token(client)
    await client.post("/tasks", json={
        "title": "Task 1"
    }, headers={"Authorization": f"Bearer {token}"})
    await client.post("/tasks", json={
        "title": "Task 2"
    }, headers={"Authorization": f"Bearer {token}"})
    response = await client.get("/tasks", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    data = response.json()
    assert len(data) == 2

@pytest.mark.asyncio
async def test_update_task(client):
    token = await get_auth_token(client)
    create_response = await client.post("/tasks", json={
        "title": "Original Title"
    }, headers={"Authorization": f"Bearer {token}"})
    task_id = create_response.json()["id"]
    response = await client.put(f"/tasks/{task_id}", json={
        "title": "Updated Title",
        "status": "IN_PROGRESS"
    }, headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 200
    assert response.json()["title"] == "Updated Title"
    assert response.json()["status"] == "IN_PROGRESS"

@pytest.mark.asyncio
async def test_delete_task(client):
    token = await get_auth_token(client)
    create_response = await client.post("/tasks", json={
        "title": "To Delete"
    }, headers={"Authorization": f"Bearer {token}"})
    task_id = create_response.json()["id"]
    response = await client.delete(f"/tasks/{task_id}", headers={"Authorization": f"Bearer {token}"})
    assert response.status_code == 204
    get_response = await client.get("/tasks", headers={"Authorization": f"Bearer {token}"})
    assert len(get_response.json()) == 0

@pytest.mark.asyncio
async def test_unauthorized_access(client):
    response = await client.get("/tasks")
    assert response.status_code == 401
