"""Base protocols shared by every microscope manager."""

from typing import Protocol, runtime_checkable


@runtime_checkable
class Manager(Protocol):
    """
    Base protocol for all microscope control managers.

    Defines the common interface and state management for all managers.
    """


@runtime_checkable
class BackgroundManager(Manager, Protocol):
    """Protocol for managers that require a background task."""

    async def abackground(self) -> None:
        """Run the manager in the background. This is a placeholder for the actual implementation."""
        ...
