import math

import pytest

from services.scoring import (
    MODEL_NOTE,
    ScoreError,
    ai_replacement_at,
    annual_spend,
    current_exposure,
    score_offer,
)


def test_school_uses_level_duration_and_ten_year_benefit():
    result = score_offer(
        kind="school",
        level="bachelor",
        field="software",
        annual_budget=20_000,
        expected_starting_salary=5_000,
        forgone_annual_income=0,
        tuition=10_000,
        living_cost_per_year=0,
        duration_years=None,
    )
    assert result["duration_years"] == 4
    assert result["cp_ratio"] == pytest.approx(1.25)
    assert result["payback_years"] == pytest.approx(8)
    assert result["fully_covered"] is False
    assert result["over_budget"] is False


def test_school_without_costs_is_an_error():
    with pytest.raises(ScoreError, match="cost must be greater than 0"):
        score_offer(
            kind="school",
            level="bachelor",
            field="other",
            annual_budget=0,
            expected_starting_salary=5_000,
            forgone_annual_income=0,
            tuition=0,
            living_cost_per_year=0,
        )


def test_payback_is_empty_when_salary_does_not_exceed_forgone_income():
    result = score_offer(
        kind="program",
        level="master",
        field="business",
        annual_budget=50_000,
        expected_starting_salary=10_000,
        forgone_annual_income=10_000,
        tuition=20_000,
        living_cost_per_year=0,
        duration_years=2,
    )
    assert result["payback_years"] is None
    assert result["cp_ratio"] == pytest.approx(100_000 / 60_000)


def test_scholarship_that_covers_the_year_skips_division():
    result = score_offer(
        kind="scholarship",
        level="master",
        field="medicine",
        annual_budget=1_000,
        expected_starting_salary=30_000,
        forgone_annual_income=12_000,
        tuition=10_000,
        living_cost_per_year=8_000,
        duration_years=2,
        scholarship_amount_per_year=20_000,
        scholarship_covers="both",
    )
    assert result["fully_covered"] is True
    assert result["cp_ratio"] is None
    assert result["payback_years"] == 0
    assert result["over_budget"] is False
    assert result["model_note"] == MODEL_NOTE


def test_partial_scholarship_can_exceed_the_budget():
    spend, covered = annual_spend(
        "scholarship", 10_000, 0, scholarship_amount_per_year=4_000, scholarship_covers="both"
    )
    assert spend == 6_000
    assert covered is False
    result = score_offer(
        kind="scholarship",
        level="bachelor",
        field="education",
        annual_budget=3_000,
        expected_starting_salary=20_000,
        forgone_annual_income=0,
        tuition=10_000,
        living_cost_per_year=0,
        duration_years=1,
        scholarship_amount_per_year=4_000,
        scholarship_covers="both",
    )
    assert result["over_budget"] is True
    assert result["cp_ratio"] == pytest.approx(200_000 / 6_000)


def test_field_profile_outlook_does_not_rise_over_time():
    result = score_offer(
        kind="program",
        level="phd",
        field="research",
        annual_budget=40_000,
        expected_starting_salary=25_000,
        forgone_annual_income=0,
        tuition=5_000,
        living_cost_per_year=15_000,
        duration_years=4,
    )
    assert result["career_outlook"]["years_10"] >= result["career_outlook"]["years_30"]
    assert set(result["ai_replacement"]) == {"years_10", "years_20", "years_30"}


def test_exposure_and_replacement_curve_stay_bounded():
    exposed = current_exposure(1, 0, 0, False, 0)
    assert exposed == pytest.approx(0.55)
    values = [ai_replacement_at(exposed, routine=1, years=years) for years in (10, 20, 30)]
    assert values[0] < values[1] < values[2]
    assert values[-1] <= 0.95
    expected_10 = exposed + (0.95 - exposed) * (1 - math.exp(-10 / 15))
    assert values[0] == pytest.approx(expected_10)


def test_unknown_field_is_rejected():
    with pytest.raises(ScoreError, match="field"):
        score_offer(
            kind="program",
            level="bachelor",
            field="design",
            annual_budget=1,
            expected_starting_salary=1,
            forgone_annual_income=0,
            tuition=1,
            living_cost_per_year=0,
            duration_years=1,
        )
