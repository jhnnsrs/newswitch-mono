"""Pytest configuration and shared fixtures for newswitch tests.

This module provides common fixtures used across multiple test modules,
including the virtual microscope FastAPI application.
"""

import pytest
from fastapi import FastAPI

from newswitch.app import ImswitchConfig, create_app


@pytest.fixture
def virtual_microscope_app() -> FastAPI:
    """Create the Newswitch FastAPI app for testing.

    Creates a virtual microscope application with default configuration,
    suitable for integration testing of the FastAPI endpoints.

    Returns:
        FastAPI: The configured FastAPI application instance.
    """
    app = create_app(ImswitchConfig())
    return app
