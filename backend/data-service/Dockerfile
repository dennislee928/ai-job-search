FROM julia:1.10

WORKDIR /app

# Install dependencies dynamically to generate a valid Project.toml
RUN julia --project=. -e 'import Pkg; Pkg.add(["Oxygen", "HTTP", "JSON3"]); Pkg.precompile()'

COPY . .

# Expose port if running a web server (e.g. Genie.jl or Oxygen.jl)
EXPOSE 8001
CMD ["julia", "--project=.", "src/main.jl"]
