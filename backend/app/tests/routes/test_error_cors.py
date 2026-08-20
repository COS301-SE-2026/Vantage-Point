"""
Unit tests for the error path that a browser can actually read.

An unhandled exception used to reach Starlette's ServerErrorMiddleware, which wraps the
whole stack including CORS. Its 500 never passed back through the CORS layer, so it
carried no Access-Control-Allow-Origin header and the browser reported "CORS header
missing" instead of the failure that really happened. These tests pin the ordering that
keeps the real status and body visible to the client.
"""

from fastapi import status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.testclient import TestClient

from app.main import app

ORIGIN = "http://localhost:5173"


class TestUnhandledErrorIsReadable:
    """A 500 has to reach the browser as a 500, not as a CORS failure."""

    def test_cors_wraps_the_catch_all_middleware(self):
        """CORS must stay outermost, or its headers never reach an error response."""
        names = [getattr(m.cls, "__name__", str(m.cls)) for m in app.user_middleware]
        assert names, "no user middleware registered"
        # user_middleware is ordered outermost first.
        assert names[0] == CORSMiddleware.__name__, (
            "CORS is no longer outermost: an error response raised inside the stack "
            f"will not carry CORS headers. Order is {names}."
        )

    def test_unhandled_exception_answers_with_cors_headers(self):
        """The failing case: a route that raises still answers the browser."""

        @app.get("/__test_unhandled_error")
        async def _raise() -> None:
            raise RuntimeError("simulated failure")

        try:
            with TestClient(app, raise_server_exceptions=False) as client:
                response = client.get(
                    "/__test_unhandled_error", headers={"Origin": ORIGIN}
                )

            assert response.status_code == status.HTTP_500_INTERNAL_SERVER_ERROR
            assert response.headers.get("access-control-allow-origin") == ORIGIN

            body = response.json()
            assert body["error_number"] == status.HTTP_500_INTERNAL_SERVER_ERROR
            # The cause belongs in the logs, not in a response to the caller.
            assert "simulated failure" not in response.text
        finally:
            app.router.routes = [
                route
                for route in app.router.routes
                if getattr(route, "path", None) != "/__test_unhandled_error"
            ]

    def test_successful_response_still_carries_cors_headers(self):
        """The reordering must not cost the ordinary path its headers."""
        with TestClient(app) as client:
            response = client.get("/health", headers={"Origin": ORIGIN})

        assert response.status_code == status.HTTP_200_OK
        assert response.headers.get("access-control-allow-origin") == ORIGIN
