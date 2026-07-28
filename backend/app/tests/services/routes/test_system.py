"""
Unit tests for system endpoints.

Tests basic FastAPI application functionality and response schemas.
No database or external API calls required.
"""

import pytest
from fastapi import status


class TestRootEndpoint:
    """Test suite for the root endpoint."""

    def test_root_endpoint_returns_success_and_valid_schema(self, client):
        """Test that GET / returns a 200 status code and expected JSON payload."""
        response = client.get("/")

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert isinstance(data, dict)
        assert "message" in data


class TestHealthEndpoint:
    """Test suite for the health check endpoint."""

    def test_health_endpoint_returns_health_status(self, client):
        """Test that GET /health returns 200 OK and valid JSON content."""
        response = client.get("/health")

        assert response.status_code == status.HTTP_200_OK
        assert response.headers.get("content-type") == "application/json"

        data = response.json()
        assert isinstance(data, dict)
        assert "status" in data


class TestTestEndpoint:
    """Test suite for the test endpoint."""

    @pytest.mark.parametrize(
        "payload",
        [
            {"test_key": "test_value", "another_key": "another_value"},
            {},
            {"nested": {"key": "value"}, "array": [1, 2, 3], "string": "test"},
        ],
        ids=["standard_payload", "empty_dict", "complex_nested"],
    )
    def test_test_endpoint_echoes_payloads(self, client, payload):
        """Test that POST /api/test echoes back standard, empty, and complex payloads."""
        response = client.post("/api/test", json=payload)

        assert response.status_code == status.HTTP_200_OK
        data = response.json()
        assert "message" in data
        assert data.get("received") == payload


class TestErrorHandling:
    """Test suite for system exception and validation handling."""

    def test_validation_error_returns_400_json(self, client):
        """Test that invalid request body payloads return a formatted 400 response."""
        response = client.post("/api/test", json="invalid non-dict string")

        assert response.status_code == status.HTTP_400_BAD_REQUEST
        assert response.headers.get("content-type") == "application/json"

        data = response.json()
        assert "detail" in data or "status" in data

    @pytest.mark.parametrize("route", ["/api/nonexistent-route", "/api/does-not-exist"])
    def test_not_found_routes_return_404(self, client, route):
        """Test that non-existent routes return properly formatted 404 responses."""
        response = client.get(route)

        assert response.status_code == status.HTTP_404_NOT_FOUND
        assert response.headers.get("content-type") == "application/json"

        data = response.json()
        assert "detail" in data or len(data) > 0
