*** Settings ***
Library    RequestsLibrary
Library    OperatingSystem
Library    Collections

*** Variables ***
${API_GATEWAY_URL}    http://localhost:8080
${AI_SERVICE_URL}     http://localhost:8000
${DATA_SERVICE_URL}   http://localhost:8001

*** Test Cases ***
Verify Postgres Role - User Creation
    [Documentation]    Verify the Go API Gateway correctly interfaces with Postgres.
    Create Session    api_gateway    ${API_GATEWAY_URL}
    
    ${body}=    Create Dictionary    email=robot@example.com
    ${response}=    POST On Session    api_gateway    /api/v1/auth/login    json=${body}    expected_status=200
    
    Log    ${response.json()}
    Dictionary Should Contain Key    ${response.json()}    token
    Dictionary Should Contain Key    ${response.json()}    id

Verify Qdrant Role - Semantic Job Search
    [Documentation]    Verify the FastAPI AI Service queries Qdrant for semantic search.
    Create Session    ai_service    ${AI_SERVICE_URL}
    
    ${body}=    Create Dictionary    query=Python software engineer remote    limit=5
    ${response}=    POST On Session    ai_service    /jobs/search    json=${body}    expected_status=200
    
    Log    ${response.json()}
    # The response is a list of results
    Should Be True    ${response.json()} != None

Verify MinIO Role - File Upload
    [Documentation]    Verify the FastAPI AI Service can upload a resume to MinIO.
    Create Session    ai_service    ${AI_SERVICE_URL}
    
    # Create a dummy file to upload
    Create File    dummy_resume.pdf    This is a dummy PDF file content.
    ${file_data}=    Get Binary File    dummy_resume.pdf
    
    ${files}=    Create Dictionary    file=${file_data}
    # RequestsLibrary doesn't natively handle multipart file streams gracefully without the `files` dict correctly configured.
    # We use a tuple for the file field: ('filename', file_content, 'content_type')
    ${file_tuple}=    Evaluate    ('dummy_resume.pdf', open('dummy_resume.pdf', 'rb'), 'application/pdf')
    ${files_dict}=    Create Dictionary    file=${file_tuple}
    
    ${response}=    POST On Session    ai_service    /upload/resume    files=${files_dict}    expected_status=200
    
    Log    ${response.json()}
    Dictionary Should Contain Key    ${response.json()}    url
    Should Contain    ${response.json()['url']}    resumes/dummy_resume.pdf
    
    Remove File    dummy_resume.pdf

Verify Neo4j Role - Graph Traversal
    [Documentation]    Verify the Julia Data Service can hit the Neo4j API.
    Create Session    data_service    ${DATA_SERVICE_URL}
    
    ${response}=    GET On Session    data_service    /graph/skills    expected_status=200
    
    Log    ${response.json()}
    Dictionary Should Contain Key    ${response.json()}    status
