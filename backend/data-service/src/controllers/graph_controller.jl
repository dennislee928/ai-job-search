module GraphController

using Oxygen
using JSON3
using HTTP
using Base64

export register_routes

function register_routes()
    @get "/graph/skills" function(req::HTTP.Request)
        # Hit Neo4j HTTP API directly
        uri = ENV["NEO4J_URI"] # typically bolt://neo4j:7687, we will rewrite to http://neo4j:7474/db/neo4j/tx/commit
        # Hardcoding the http endpoint for simplicity in docker
        url = "http://neo4j:7474/db/neo4j/tx/commit"
        
        user = get(ENV, "NEO4J_USER", "neo4j")
        pass = get(ENV, "NEO4J_PASSWORD", "admin1234")
        auth_str = Base64.base64encode("$user:$pass")
        
        headers = [
            "Content-Type" => "application/json",
            "Accept" => "application/json;charset=UTF-8",
            "Authorization" => "Basic $auth_str"
        ]
        
        body = JSON3.write(Dict("statements" => [Dict("statement" => "MATCH (s:Skill) RETURN s LIMIT 5")]))
        
        try
            resp = HTTP.post(url, headers, body)
            data = JSON3.read(String(resp.body))
            return Dict("status" => "success", "data" => data)
        catch e
            return Dict("status" => "error", "message" => string(e))
        end
    end
end

end
