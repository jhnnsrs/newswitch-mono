"""
WebSocket routes for the microscope API.
"""

from .liveview import router as liveview_router

__all__ = [
    "liveview_router",
]
