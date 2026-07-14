"""testHik.py — smoke-test the C++ MVS binding from Python.

This exercises the pybind11 extension built from
``newswitch/uc2_devices/bindings/hikcam_py.cpp``. In particular it calls the
``initialize()`` entry point, which is bound directly to
``bool hik::MvsCamera::initSdk()`` in
``newswitch/uc2_devices/core/src/MvsCamera.cpp`` (it runs ``MV_CC_Initialize``
and returns True on success / False on SDK failure).

Run it with the project's interpreter, e.g.::

    .venv/bin/python newswitch/uc2_devices/testHik.py

Requires the HikRobot MVS SDK runtime (the compiled ``_hikcam`` module links
against libMvCameraControl; its directory is baked into the module rpath).
"""

from __future__ import annotations

import sys

from newswitchSources.uc2_devices import _hikcam;

def main() -> int:
    """Initialise the MVS SDK via the C++ binding and report the result."""
    print(f"Using extension: {_hikcam.__file__}")


    # -> bool hik::MvsCamera::initSdk()  (MV_CC_Initialize under the hood)
    ok = _hikcam.initialize()
    print(f"MvsCamera::initSdk() -> {ok}")
    if not ok:
        print("SDK initialisation failed (see stderr for the MVS error).")
        return 1

    try:
        # Bonus: prove the SDK is live by enumerating any connected cameras.
        devices = _hikcam.list_devices()
        print(f"Found {len(devices)} camera(s):")
        for i, dev in enumerate(devices):
            print(f"  [{i}] {dev!r}")
    finally:
        # -> void hik::MvsCamera::finalizeSdk()  (MV_CC_Finalize)
        _hikcam.finalize()
        print("MvsCamera::finalizeSdk() done.")

    return 0


if __name__ == "__main__":
    sys.exit(main())
