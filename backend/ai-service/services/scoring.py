"""Scenario scores for an education program.

The AI-replacement and career-outlook figures are a fixed scenario curve.
They are not an empirical forecast of employment or of any person's life.
"""

from __future__ import annotations

import math

HORIZONS = (10, 20, 30)
EXPOSURE_TIME_CONSTANT_YEARS = 15.0
MODEL_NOTE = (
    "Scenario model, not an empirical forecast. "
    "AI replacement and career outlook use a fixed exposure curve."
)


class ScoreError(ValueError):
    """The inputs cannot produce a finite scenario score."""


def _finite(name: str, value: float) -> float:
    if not isinstance(value, (int, float)) or isinstance(value, bool) or not math.isfinite(value):
        raise ScoreError(f"{name} must be a finite number")
    return float(value)


def _unit(name: str, value: float) -> float:
    number = _finite(name, value)
    if number < 0 or number > 1:
        raise ScoreError(f"{name} must be between 0 and 1")
    return number


def _non_negative(name: str, value: float) -> float:
    number = _finite(name, value)
    if number < 0:
        raise ScoreError(f"{name} must be zero or greater")
    return number


def program_cost(
    tuition: float,
    living_cost_per_year: float,
    duration_years: float,
    opportunity_cost_per_year: float,
) -> float:
    years = _finite("duration_years", duration_years)
    if years <= 0:
        raise ScoreError("duration_years must be greater than 0")
    tuition = _non_negative("tuition", tuition)
    living = _non_negative("living_cost_per_year", living_cost_per_year)
    opportunity = _non_negative("opportunity_cost_per_year", opportunity_cost_per_year)
    return tuition + (living + opportunity) * years


def cost_performance(
    tuition: float,
    living_cost_per_year: float,
    duration_years: float,
    opportunity_cost_per_year: float,
    expected_annual_premium: float,
    horizon_years: float,
) -> tuple[float, float | None]:
    """Return (benefit / cost, payback years).

    Payback is None when the annual premium is not positive.
    A zero total cost is an error rather than an infinite ratio.
    """
    cost = program_cost(
        tuition, living_cost_per_year, duration_years, opportunity_cost_per_year
    )
    if cost == 0:
        raise ScoreError("cost must be greater than 0")
    horizon = _finite("horizon_years", horizon_years)
    if horizon <= 0:
        raise ScoreError("horizon_years must be greater than 0")
    premium = _finite("expected_annual_premium", expected_annual_premium)
    cp_ratio = (premium * horizon) / cost
    payback = cost / premium if premium > 0 else None
    return cp_ratio, payback


def current_exposure(
    routine: float,
    social: float,
    physical: float,
    licensed: bool,
    current_automation: float,
) -> float:
    """Share of the work that is exposed today, clamped to [0, 1]."""
    routine = _unit("routine", routine)
    social = _unit("social", social)
    physical = _unit("physical", physical)
    current_automation = _unit("current_automation", current_automation)
    if not isinstance(licensed, bool):
        raise ScoreError("licensed must be a boolean")
    raw = (
        0.55 * routine
        + 0.25 * current_automation
        - 0.20 * social
        - 0.15 * physical
        - (0.15 if licensed else 0.0)
    )
    return min(1.0, max(0.0, raw))


def ai_replacement_at(exposure: float, routine: float, years: int) -> float:
    """Exposure grows toward a cap and never exceeds 0.95.

    cap = min(0.95, exposure + 0.50 * routine)
    p(t) = exposure + (cap - exposure) * (1 - exp(-t / 15))
    """
    cap = min(0.95, exposure + 0.50 * routine)
    grown = exposure + (cap - exposure) * (
        1 - math.exp(-years / EXPOSURE_TIME_CONSTANT_YEARS)
    )
    return min(0.95, max(0.0, grown))


def career_outlook_at(replacement: float, social: float, physical: float, licensed: bool) -> float:
    """Remaining-demand index in [0, 1]. Higher means the path stays more viable."""
    boost = 0.10 * social + 0.05 * physical + (0.05 if licensed else 0.0)
    outlook = (1.0 - replacement) * (1.0 + boost)
    return min(1.0, max(0.0, outlook))


def score_program(
    tuition: float,
    living_cost_per_year: float,
    duration_years: float,
    opportunity_cost_per_year: float,
    expected_annual_premium: float,
    horizon_years: float,
    routine: float,
    social: float,
    physical: float,
    licensed: bool,
    current_automation: float,
) -> dict:
    cp_ratio, payback = cost_performance(
        tuition,
        living_cost_per_year,
        duration_years,
        opportunity_cost_per_year,
        expected_annual_premium,
        horizon_years,
    )
    exposure = current_exposure(routine, social, physical, licensed, current_automation)
    routine_value = _unit("routine", routine)
    replacement = {
        f"years_{years}": ai_replacement_at(exposure, routine_value, years) for years in HORIZONS
    }
    outlook = {
        f"years_{years}": career_outlook_at(
            replacement[f"years_{years}"], social, physical, licensed
        )
        for years in HORIZONS
    }
    return {
        "cp_ratio": cp_ratio,
        "payback_years": payback,
        "ai_replacement": replacement,
        "career_outlook": outlook,
        "model_note": MODEL_NOTE,
    }
