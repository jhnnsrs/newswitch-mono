"""Tests for the FastAPI agent integration.

This module tests the FastAPI agent using AsyncAgentTestClient
for full async integration testing with proper event handling.
Verifies that the agent correctly processes assignments and returns results.
"""

import pytest
from fastapi import FastAPI
from rekuest_next.contrib.fastapi import AsyncAgentTestClient
from typing import ParamSpec

P = ParamSpec("P")


@pytest.mark.asyncio
async def test_assign_and_get_result(virtual_microscope_app: FastAPI) -> None:
    """Test that the agent correctly processes detector activation and update assignments.

    Verifies:
        - Detector can be activated via agent assignment.
        - Detector settings can be updated via agent assignment.
        - Events are properly emitted and collected.
        - Assignment completes with DONE status.

    Args:
        virtual_microscope_app: The FastAPI application fixture with virtual microscope.
    """
    async with AsyncAgentTestClient(virtual_microscope_app) as client:
        # First activate a detector
        activate_result = await client.assign("activate_detector", {"slot": 1})
        events = await client.collect_until_done(activate_result.assignation_id)
        assert len(events) >= 1
        assert events[-1].is_done()

        # Now update the detector exposure
        assign_result = await client.assign("update_detector", {"slot": 1, "exposure_time": 0.5})
        assert assign_result.status == "submitted"

        # Collect events until done
        events = await client.collect_until_done(assign_result.assignation_id)

        # Should have received events including DONE
        assert len(events) >= 1
        assert events[-1].is_done()
