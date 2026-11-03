from services.qdrant_service import qdrant_service

def generate_cover_letter(job_description: str, user_id: str) -> str:
    # 1. Retrieve the most relevant resume segments from Qdrant
    matches = qdrant_service.match_job_to_resumes(job_description, limit=3)
    
    # 2. Extract the text of the best matching experiences
    matched_experiences = "\n".join([match["payload"].get("text", "") for match in matches])
    
    if not matched_experiences:
        matched_experiences = "[No specific matching experiences found in your profile.]"
        
    # 3. Use an LLM to generate the cover letter (Mocked here, but easily swapped to LangChain OpenAI)
    prompt = f"""
    You are an expert career coach. Write a cover letter for the following job description.
    
    Job Description:
    {job_description}
    
    Candidate's Relevant Experience:
    {matched_experiences}
    """
    
    # In a real setup, we would do:
    # llm = ChatOpenAI(model="gpt-4")
    # response = llm.predict(prompt)
    
    response = f"Dear Hiring Manager,\n\nI am thrilled to apply for this role. Based on my experience:\n\n{matched_experiences}\n\nI am confident I would be a great fit.\n\nSincerely,\nCandidate"
    
    return response

def generate_text(prompt: str, model: str) -> str:
    return f"Generated text from {model} for prompt: {prompt}"
