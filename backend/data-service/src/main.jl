module DataService

using Oxygen
using HTTP

include("routes/api.jl")
using .ApiRoutes

function main()
    println("Initializing Data Service...")
    
    # Setup routes
    ApiRoutes.setup_routes()

    println("Starting Julia Data Service on port 8001")
    serve(host="0.0.0.0", port=8001)
end

if abspath(PROGRAM_FILE) == @__FILE__
    main()
end

end # module
