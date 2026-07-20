module DataService

using Oxygen
using HTTP
using JSON3

@get "/health" function(req::HTTP.Request)
    return Dict("status" => "UP", "service" => "data-service")
end

@post "/process" function(req::HTTP.Request)
    # Heavy data processing logic here
    return Dict("result" => "Mock data processing complete")
end

function main()
    println("Starting Julia Data Service on port 8001")
    serve(host="0.0.0.0", port=8001)
end

if abspath(PROGRAM_FILE) == @__FILE__
    main()
end

end # module
