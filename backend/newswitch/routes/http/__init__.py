"""
HTTP routes for the microscope API.
"""

from .files import router as files_router
from .cache import router as cache_router

__all__ = [
    "files_router",
    "cache_router",
]
