module ApiRoutes

using Oxygen
using HTTP
include("../controllers/graph_controller.jl")
using .GraphController

export setup_routes

function setup_routes()
    @get "/health" function(req::HTTP.Request)
        return Dict("status" => "UP", "service" => "data-service")
    end

    # Register controller routes
    GraphController.register_routes()
end

end
