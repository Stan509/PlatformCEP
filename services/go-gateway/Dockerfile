FROM golang:1.22-alpine AS build

WORKDIR /src

COPY go.mod ./
COPY . .

RUN go build -o /bin/gateway ./cmd/server

FROM alpine:3.20

COPY --from=build /bin/gateway /bin/gateway

EXPOSE 8080

ENTRYPOINT ["/bin/gateway"]
