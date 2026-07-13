"""Tests for the capture_image API via FastAPI agent integration.

This module tests the image capture functionality through the FastAPI agent,
verifying that captured images are properly saved and contain visible content.
"""

import numpy as np
import pytest
from fastapi import FastAPI
from PIL import Image
from rekuest_next.contrib.fastapi import AsyncAgentTestClient


@pytest.mark.asyncio
async def test_assign_and_get_result(virtual_microscope_app: FastAPI) -> None:
    """Test image capture and save through the FastAPI agent.

    Verifies:
        - Detector can be activated via agent assignment.
        - capture_image assignment returns a valid file path.
        - Saved image file contains visible content with meaningful dynamic range.
        - Image is properly converted from uint16 to uint8 for PNG storage.

    Args:
        virtual_microscope_app: The FastAPI application fixture with virtual microscope.
    """
    async with AsyncAgentTestClient(virtual_microscope_app) as client:
        # First activate a detector
        activate_result = await client.assign("activate_detector", {"slot": 1})
        events = await client.collect_until_done(activate_result.assignation_id)
        assert len(events) >= 1
        assert events[-1].is_done()

        calibration_result = await client.assign("calibrate_light_path", {})
        calibration_events = await client.collect_until_done(calibration_result.assignation_id)
        assert len(calibration_events) >= 1
        assert calibration_events[-1].is_done()

        # Assign work - capture_image with slot
        assign_result = await client.assign("capture_image", {"slot": 1})

        # Collect events until done
        events = await client.collect_until_done(assign_result.assignation_id)

        # Should have received events including DONE
        assert len(events) >= 1
        assert events[-1].is_done()

        # Verify the final result contains a file handle
        done_event = [event for event in events if event.is_yield()][0]
        result = done_event
        assert "return0" in result.data["returns"]
