FROM golang:alpine AS builder

WORKDIR /app

# Install git for fetching dependencies
RUN apk add --no-cache git

COPY go.mod go.sum* ./
RUN go mod download

COPY . .

# Build the binary with optimizations
RUN CGO_ENABLED=0 GOOS=linux go build -o api-gateway -a -installsuffix cgo ./cmd/server/main.go

FROM alpine:latest  
RUN apk --no-cache add ca-certificates tzdata

WORKDIR /root/
COPY --from=builder /app/api-gateway .

EXPOSE 8080
CMD ["./api-gateway"]
