import math

import pytest

from services.scoring import (
    MODEL_NOTE,
    ScoreError,
    ai_replacement_at,
    cost_performance,
    current_exposure,
    score_program,
)


def test_cost_performance_ratio_and_payback():
    ratio, payback = cost_performance(
        tuition=10_000,
        living_cost_per_year=0,
        duration_years=1,
        opportunity_cost_per_year=0,
        expected_annual_premium=5_000,
        horizon_years=4,
    )
    assert ratio == pytest.approx(2.0)
    assert payback == pytest.approx(2.0)


def test_zero_cost_is_an_error():
    with pytest.raises(ScoreError, match="cost must be greater than 0"):
        cost_performance(0, 0, 1, 0, 5_000, 10)


def test_non_positive_premium_has_no_payback():
    ratio, payback = cost_performance(20_000, 0, 1, 0, 0, 10)
    assert ratio == 0
    assert payback is None


def test_exposure_weights_are_clamped():
    exposed = current_exposure(
        routine=1, social=0, physical=0, licensed=False, current_automation=0
    )
    assert exposed == pytest.approx(0.55)
    protected = current_exposure(
        routine=0, social=1, physical=1, licensed=True, current_automation=0
    )
    assert protected == 0


def test_replacement_grows_across_horizons_and_stays_below_cap():
    exposure = 0.55
    values = [ai_replacement_at(exposure, routine=1, years=years) for years in (10, 20, 30)]
    assert values[0] < values[1] < values[2]
    assert values[-1] <= 0.95
    expected_10 = exposure + (0.95 - exposure) * (1 - math.exp(-10 / 15))
    assert values[0] == pytest.approx(expected_10)


def test_score_program_includes_the_scenario_note():
    result = score_program(
        tuition=40_000,
        living_cost_per_year=12_000,
        duration_years=2,
        opportunity_cost_per_year=30_000,
        expected_annual_premium=18_000,
        horizon_years=10,
        routine=0.4,
        social=0.7,
        physical=0.2,
        licensed=True,
        current_automation=0.1,
    )
    assert result["model_note"] == MODEL_NOTE
    assert set(result["ai_replacement"]) == {"years_10", "years_20", "years_30"}
    assert set(result["career_outlook"]) == {"years_10", "years_20", "years_30"}
    assert result["career_outlook"]["years_10"] >= result["career_outlook"]["years_30"]


def test_unit_inputs_outside_zero_and_one_are_rejected():
    with pytest.raises(ScoreError, match="routine"):
        current_exposure(1.2, 0, 0, False, 0)
