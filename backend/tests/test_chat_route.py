import os

os.environ["DATABASE_URL"] = "sqlite:///:memory:"   # force BEFORE import app
os.environ["OPENROUTER_API_KEY"] = ""

from fastapi.testclient import TestClient

import app as app_module


def test_chat_build_failure_returns_500_json_detail():
    client = TestClient(app_module.app)
    resp = client.post("/api/chat", json={"message": "hello"})
    assert resp.status_code == 500
    detail = resp.json()["detail"]
    assert "OPENROUTER_API_KEY" in detail
