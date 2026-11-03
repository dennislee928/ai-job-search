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

Verify School Without Cost Stores Nothing
    [Documentation]    A school with no tuition or living cost is rejected and no snapshot is stored.
    ${token}=    Login As Robot
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}    Content-Type=application/json
    ${free}=    Create Dictionary
    ...    kind=school
    ...    name=Free School
    ...    level=bachelor
    ...    field=software
    ...    tuition=${0}
    ...    living_cost_per_year=${0}
    ...    annual_budget=${0}
    ...    expected_starting_salary=${10000}
    ...    forgone_annual_income=${0}
    ${created}=    POST On Session    api    /api/v1/programs    json=${free}    headers=${headers}    expected_status=200
    Should Be Equal As Numbers    ${created.json()['duration_years']}    4
    ${free_id}=    Set Variable    ${created.json()['id']}
    POST On Session    api    /api/v1/programs/${free_id}/scores    headers=${headers}    expected_status=400
    ${empty}=    GET On Session    api    /api/v1/programs/${free_id}/scores    headers=${headers}    expected_status=200
    Length Should Be    ${empty.json()}    0

Verify Program Score Is Stored
    [Documentation]    A priced program is calculated and one snapshot is stored.
    ${token}=    Login As Robot
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}    Content-Type=application/json
    ${priced}=    Create Dictionary
    ...    kind=program
    ...    name=Computer Science
    ...    institution=Example University
    ...    level=bachelor
    ...    field=software
    ...    duration_years=${4}
    ...    tuition=${10000}
    ...    living_cost_per_year=${8000}
    ...    annual_budget=${20000}
    ...    expected_starting_salary=${15000}
    ...    forgone_annual_income=${0}
    ${created}=    POST On Session    api    /api/v1/programs    json=${priced}    headers=${headers}    expected_status=200
    ${program_id}=    Set Variable    ${created.json()['id']}
    ${scored}=    POST On Session    api    /api/v1/programs/${program_id}/scores    headers=${headers}    expected_status=200
    Should Be Equal    ${scored.json()['fully_covered']}    ${False}
    Should Not Be Equal    ${scored.json()['cp_ratio']}    ${None}
    Dictionary Should Contain Key    ${scored.json()}    ai_replacement_10
    Dictionary Should Contain Key    ${scored.json()}    career_outlook_30
    ${stored}=    GET On Session    api    /api/v1/programs/${program_id}/scores    headers=${headers}    expected_status=200
    Length Should Be    ${stored.json()}    1

Verify Scholarship Can Be Fully Covered
    [Documentation]    A scholarship that covers tuition and living returns no CP ratio and payback of zero.
    ${token}=    Login As Robot
    ${headers}=    Create Dictionary    Authorization=Bearer ${token}    Content-Type=application/json
    ${award}=    Create Dictionary
    ...    kind=scholarship
    ...    name=Full Award
    ...    sponsor=Example Foundation
    ...    institution=Example University
    ...    level=master
    ...    field=medicine
    ...    duration_years=${2}
    ...    tuition=${10000}
    ...    living_cost_per_year=${8000}
    ...    scholarship_amount_per_year=${20000}
    ...    scholarship_covers=both
    ...    annual_budget=${5000}
    ...    expected_starting_salary=${20000}
    ...    forgone_annual_income=${0}
    ${created}=    POST On Session    api    /api/v1/programs    json=${award}    headers=${headers}    expected_status=200
    ${award_id}=    Set Variable    ${created.json()['id']}
    ${scored}=    POST On Session    api    /api/v1/programs/${award_id}/scores    headers=${headers}    expected_status=200
    Should Be Equal    ${scored.json()['fully_covered']}    ${True}
    Should Be Equal    ${scored.json()['cp_ratio']}    ${None}
    Should Be Equal As Numbers    ${scored.json()['payback_years']}    0
    ${stored}=    GET On Session    api    /api/v1/programs/${award_id}/scores    headers=${headers}    expected_status=200
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
