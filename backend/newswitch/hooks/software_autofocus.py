"""Example software autofocus hook, sweeping z and stopping at the best focus metric."""

from newswitch import protocols


def fake_metric() -> float:
    """Fake metric function for autofocus."""
    import random

    return random.random()


def software_autofocus_hook(hook: protocols.Hook, context: protocols.HookContext) -> None:
    """Example hook implementation for software autofocus."""
    # Simple autofocus routine: move z up and down by a small amount

    for step in range(-5, 6):
        context.stage_manager.move(z=step * 0.1, is_absolute=False)
        metric_value = fake_metric()  # Replace with actual focus metric calculation
        print(f"Autofocus step {step}: metric={metric_value:.4f}")
        if metric_value > 0.8:  # Arbitrary threshold for "good focus"
            print("Focus achieved!")
            break
