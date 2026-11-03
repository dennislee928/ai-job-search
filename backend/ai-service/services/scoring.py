"""Scenario scores for a school, program, or scholarship.

The AI-replacement and career-outlook figures come from a fixed field profile.
They are not an empirical forecast of employment or of any person's life.
"""

from __future__ import annotations

import math

HORIZONS = (10, 20, 30)
BENEFIT_YEARS = 10
EXPOSURE_TIME_CONSTANT_YEARS = 15.0
MODEL_NOTE = (
    "Scenario model, not an empirical forecast. "
    "AI replacement and career outlook use a fixed field profile."
)
LEVEL_YEARS = {
    "high_school": 3,
    "bachelor": 4,
    "master": 2,
    "phd": 4,
    "other": 1,
}
FIELD_PROFILES = {
    "software": {
        "routine": 0.55,
        "social": 0.25,
        "physical": 0.05,
        "licensed": False,
        "current_automation": 0.40,
    },
    "medicine": {
        "routine": 0.25,
        "social": 0.70,
        "physical": 0.35,
        "licensed": True,
        "current_automation": 0.15,
    },
    "education": {
        "routine": 0.30,
        "social": 0.80,
        "physical": 0.15,
        "licensed": True,
        "current_automation": 0.20,
    },
    "business": {
        "routine": 0.45,
        "social": 0.55,
        "physical": 0.05,
        "licensed": False,
        "current_automation": 0.30,
    },
    "research": {
        "routine": 0.20,
        "social": 0.35,
        "physical": 0.10,
        "licensed": False,
        "current_automation": 0.25,
    },
    "trades": {
        "routine": 0.40,
        "social": 0.30,
        "physical": 0.80,
        "licensed": True,
        "current_automation": 0.15,
    },
    "other": {
        "routine": 0.40,
        "social": 0.40,
        "physical": 0.20,
        "licensed": False,
        "current_automation": 0.25,
    },
}


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


def resolve_years(kind: str, level: str, duration_years: float | None) -> float:
    if level not in LEVEL_YEARS:
        raise ScoreError("level must be high_school, bachelor, master, phd, or other")
    if kind == "school" and duration_years is None:
        return float(LEVEL_YEARS[level])
    if duration_years is None:
        raise ScoreError("duration_years must be greater than 0")
    years = _finite("duration_years", duration_years)
    if years <= 0:
        raise ScoreError("duration_years must be greater than 0")
    return years


def annual_spend(
    kind: str,
    tuition: float,
    living_cost_per_year: float,
    scholarship_amount_per_year: float = 0,
    scholarship_covers: str = "both",
) -> tuple[float, bool]:
    tuition = _non_negative("tuition", tuition)
    living = _non_negative("living_cost_per_year", living_cost_per_year)
    if kind in ("school", "program"):
        if tuition == 0 and living == 0:
            raise ScoreError("cost must be greater than 0")
        return tuition + living, False
    if kind != "scholarship":
        raise ScoreError("kind must be school, program, or scholarship")
    amount = _non_negative("scholarship_amount_per_year", scholarship_amount_per_year)
    if scholarship_covers == "tuition":
        spend = (tuition - min(amount, tuition)) + living
    elif scholarship_covers == "living":
        spend = tuition + (living - min(amount, living))
    elif scholarship_covers == "both":
        spend = max(0.0, tuition + living - amount)
    else:
        raise ScoreError("scholarship_covers must be tuition, living, or both")
    return spend, spend == 0


def score_offer(
    kind: str,
    level: str,
    field: str,
    annual_budget: float,
    expected_starting_salary: float,
    forgone_annual_income: float,
    tuition: float,
    living_cost_per_year: float,
    duration_years: float | None = None,
    scholarship_amount_per_year: float = 0,
    scholarship_covers: str = "both",
) -> dict:
    years = resolve_years(kind, level, duration_years)
    spend, fully_covered = annual_spend(
        kind,
        tuition,
        living_cost_per_year,
        scholarship_amount_per_year,
        scholarship_covers,
    )
    forgone = _non_negative("forgone_annual_income", forgone_annual_income)
    salary = _non_negative("expected_starting_salary", expected_starting_salary)
    budget = _non_negative("annual_budget", annual_budget)
    profile = FIELD_PROFILES.get(field)
    if profile is None:
        raise ScoreError(
            "field must be software, medicine, education, business, research, trades, or other"
        )
    total_cost = (spend + forgone) * years
    if fully_covered:
        cp_ratio = None
        payback = 0.0
    elif total_cost == 0:
        raise ScoreError("cost must be greater than 0")
    else:
        cp_ratio = (salary * BENEFIT_YEARS) / total_cost
        payback = total_cost / (salary - forgone) if salary > forgone else None
    exposure = current_exposure(
        profile["routine"],
        profile["social"],
        profile["physical"],
        profile["licensed"],
        profile["current_automation"],
    )
    replacement = {
        f"years_{horizon}": ai_replacement_at(exposure, profile["routine"], horizon)
        for horizon in HORIZONS
    }
    outlook = {
        f"years_{horizon}": career_outlook_at(
            replacement[f"years_{horizon}"],
            profile["social"],
            profile["physical"],
            profile["licensed"],
        )
        for horizon in HORIZONS
    }
    return {
        "cp_ratio": cp_ratio,
        "payback_years": payback,
        "fully_covered": fully_covered,
        "over_budget": spend > budget,
        "duration_years": years,
        "ai_replacement": replacement,
        "career_outlook": outlook,
        "model_note": MODEL_NOTE,
    }
