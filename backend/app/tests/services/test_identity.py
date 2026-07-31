"""Unit cover for the credential-store-agnostic pieces of sign-in."""

from app.schemas.auth_schemas import LoginRequest, RegisterRequest
from app.services.identity import cognito_username


def test_cognito_username_strips_the_email_domain():
    # A pool with the email alias enabled rejects email-shaped usernames.
    assert cognito_username("ada.lovelace@example.com") == "ada_lovelace"


def test_cognito_username_keeps_an_explicit_non_email_username():
    assert cognito_username("ada@example.com", "Sn1per1") == "Sn1per1"


def test_cognito_username_falls_back_when_the_local_part_is_unusable():
    assert cognito_username("...@example.com") == "player"


def test_login_request_accepts_either_field_name():
    # The web client sends the email in `username`; the API docs use `email`.
    assert LoginRequest(username="a@b.com", password="x").identifier() == "a@b.com"
    assert LoginRequest(email="a@b.com", password="x").identifier() == "a@b.com"


def test_register_request_matches_the_web_client_payload():
    body = RegisterRequest(
        email="player@example.com",
        display_name="Player One",
        password="a-long-enough-password",
    )
    assert body.username is None
    assert body.confirm_password is None
    assert str(body.email) == "player@example.com"
