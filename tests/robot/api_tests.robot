*** Settings ***
Library    RequestsLibrary
Library    OperatingSystem
Library    Collections

*** Variables ***
${BASE_URL}    http://localhost

*** Test Cases ***
Verify Postgres Role - User Creation
    [Documentation]    Login through nginx and confirm the Rust API stores a user.
    Create Session    api    ${BASE_URL}
    ${body}=    Create Dictionary    email=robot@example.com
    ${response}=    POST On Session    api    /api/v1/auth/login    json=${body}    expected_status=200
    Dictionary Should Contain Key    ${response.json()}    token
    Dictionary Should Contain Key    ${response.json()}    id

Verify Program Search Through Nginx
    [Documentation]    Program search is reached through nginx, then the AI service.
    ${token}=    Login As Robot
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    ${body}=    Create Dictionary    query=computer science    limit=${5}
    ${response}=    POST On Session    api    /api/v1/programs/search    json=${body}    headers=${headers}    expected_status=200
    Should Not Be Equal    ${response.json()}    ${None}

Verify Score Is Stored Only After A Successful Calculation
    [Documentation]    A zero-cost program is rejected and nothing is stored. A priced program is stored.
    ${token}=    Login As Robot
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}    Content-Type=application/json

    ${free}=    Create Dictionary
    ...    name=Free Sample
    ...    institution=Example College
    ...    level=other
    ...    duration_years=${1}
    ...    tuition=${0}
    ...    living_cost_per_year=${0}
    ...    opportunity_cost_per_year=${0}
    ...    expected_annual_premium=${1000}
    ${created}=    POST On Session    api    /api/v1/programs    json=${free}    headers=${headers}    expected_status=200
    ${free_id}=    Set Variable    ${created.json()['id']}
    ${score_body}=    Score Body
    POST On Session    api    /api/v1/programs/${free_id}/scores    json=${score_body}    headers=${headers}    expected_status=400
    ${empty}=    GET On Session    api    /api/v1/programs/${free_id}/scores    headers=${headers}    expected_status=200
    Length Should Be    ${empty.json()}    0

    ${priced}=    Create Dictionary
    ...    name=Computer Science
    ...    institution=Example University
    ...    level=bachelor
    ...    duration_years=${4}
    ...    tuition=${10000}
    ...    living_cost_per_year=${8000}
    ...    opportunity_cost_per_year=${20000}
    ...    expected_annual_premium=${15000}
    ${created}=    POST On Session    api    /api/v1/programs    json=${priced}    headers=${headers}    expected_status=200
    ${program_id}=    Set Variable    ${created.json()['id']}
    ${scored}=    POST On Session    api    /api/v1/programs/${program_id}/scores    json=${score_body}    headers=${headers}    expected_status=200
    Dictionary Should Contain Key    ${scored.json()}    cp_ratio
    Dictionary Should Contain Key    ${scored.json()}    ai_replacement_10
    Dictionary Should Contain Key    ${scored.json()}    career_outlook_30
    ${stored}=    GET On Session    api    /api/v1/programs/${program_id}/scores    headers=${headers}    expected_status=200
    Length Should Be    ${stored.json()}    1

Verify MinIO Role - File Upload
    [Documentation]    Resume upload goes through nginx to the AI service and MinIO.
    ${token}=    Login As Robot
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}
    Create File    dummy_resume.pdf    This is a dummy PDF file content.
    ${file_tuple}=    Evaluate    ('dummy_resume.pdf', open('dummy_resume.pdf', 'rb'), 'application/pdf')
    ${files}=    Create Dictionary    file=${file_tuple}
    ${response}=    POST On Session    api    /api/v1/files/resume    files=${files}    headers=${headers}    expected_status=200
    Dictionary Should Contain Key    ${response.json()}    url
    Should Contain    ${response.json()['url']}    resumes/dummy_resume.pdf
    [Teardown]    Remove File    dummy_resume.pdf

*** Keywords ***
Login As Robot
    Create Session    api    ${BASE_URL}
    ${body}=    Create Dictionary    email=robot@example.com
    ${response}=    POST On Session    api    /api/v1/auth/login    json=${body}    expected_status=200
    RETURN    ${response.json()['token']}

Score Body
    ${body}=    Create Dictionary
    ...    horizon_years=${10}
    ...    routine=${0.4}
    ...    social=${0.7}
    ...    physical=${0.2}
    ...    licensed=${True}
    ...    current_automation=${0.1}
    RETURN    ${body}
