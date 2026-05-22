"""
Unit tests for system endpoints.

Tests basic FastAPI application functionality and response schemas.
No database or external API calls required.
"""

from fastapi import status


class TestRootEndpoint:
    """Test suite for the root endpoint."""

    def test_root_endpoint_returns_success(self, client):
        """Test that GET / returns a successful response."""
        response = client.get("/")
        assert response.status_code == status.HTTP_200_OK

    def test_root_endpoint_returns_correct_message(self, client):
        """Test that GET / returns the correct message."""
        response = client.get("/")
        data = response.json()
        assert "message" in data

    def test_root_endpoint_response_format(self, client):
        """Test that GET / returns properly formatted JSON."""
        response = client.get("/")
        data = response.json()
        assert isinstance(data, dict)
        assert len(data) > 0


class TestHealthEndpoint:
    """Test suite for the health check endpoint."""

    def test_health_endpoint_returns_success(self, client):
        """Test that GET /health returns a successful response."""
        response = client.get("/health")
        assert response.status_code == status.HTTP_200_OK

    def test_health_endpoint_returns_status(self, client):
        """Test that GET /health returns status field."""
        response = client.get("/health")
        data = response.json()
        assert "status" in data

    def test_health_endpoint_response_structure(self, client):
        """Test that GET /health returns properly structured JSON."""
        response = client.get("/health")
        data = response.json()
        assert isinstance(data, dict)
        assert "status" in data

    def test_health_endpoint_content_type(self, client):
        """Test that GET /health returns JSON content type."""
        response = client.get("/health")
        assert response.headers["content-type"] == "application/json"


class TestTestEndpoint:
    """Test suite for the test endpoint."""

    def test_test_endpoint_returns_success(self, client):
        """Test that POST /api/test returns a successful response."""
        payload = {"test_key": "test_value"}
        response = client.post("/api/test", json=payload)
        assert response.status_code == status.HTTP_200_OK

    def test_test_endpoint_echoes_received_data(self, client):
        """Test that POST /api/test echoes back the received data."""
        payload = {"test_key": "test_value", "another_key": "another_value"}
        response = client.post("/api/test", json=payload)
        data = response.json()
        assert "received" in data
        assert data["received"] == payload

    def test_test_endpoint_returns_success_message(self, client):
        """Test that POST /api/test includes a success message."""
        payload = {"test_key": "test_value"}
        response = client.post("/api/test", json=payload)
        data = response.json()
        assert "message" in data

    def test_test_endpoint_with_empty_dict(self, client):
        """Test that POST /api/test handles empty dictionary."""
        response = client.post("/api/test", json={})
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["received"] == {}

    def test_test_endpoint_with_complex_data(self, client):
        """Test that POST /api/test handles complex nested data."""
        payload = {"nested": {"key": "value"}, "array": [1, 2, 3], "string": "test"}
        response = client.post("/api/test", json=payload)
        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert data["received"] == payload
