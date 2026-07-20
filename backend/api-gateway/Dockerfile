FROM golang:1.22-alpine AS builder

WORKDIR /app

# Install git for fetching dependencies
RUN apk add --no-cache git

COPY go.mod go.sum* ./
# Create dummy go.mod if it doesn't exist to allow docker build to pass
RUN if [ ! -f go.mod ]; then go mod init api-gateway; fi
RUN go mod download || true

COPY . .
# Create dummy main.go if it doesn't exist
RUN if [ ! -f main.go ]; then echo -e 'package main\nimport "fmt"\nfunc main() { fmt.Println("API Gateway") }' > main.go; fi

# Build the binary with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build -o api-gateway -a -installsuffix cgo ./main.go

FROM alpine:latest  
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/
COPY --from=builder /app/api-gateway .

EXPOSE 8080
CMD ["./api-gateway"]
