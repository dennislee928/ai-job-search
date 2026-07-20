module GraphController

using Oxygen
using JSON3

export register_routes

function register_routes()
    @get "/graph/skills" function(req::HTTP.Request)
        return Dict("status" => "success", "data" => ["Python", "Julia", "Go"])
    end
end

end
