FROM julia:1.10

WORKDIR /app

# Copy Project.toml and Manifest.toml if they exist
COPY Project.toml Manifest.toml* ./

# Instantiate the environment
RUN julia --project=. -e 'import Pkg; Pkg.instantiate(); Pkg.precompile()'

COPY . .

# Expose port if running a web server (e.g. Genie.jl or Oxygen.jl)
EXPOSE 8001
CMD ["julia", "--project=.", "src/main.jl"]
