FROM golang:1.22-alpine AS build

WORKDIR /src

COPY go.mod ./
COPY . .

RUN go build -o /bin/worker ./cmd/worker

FROM alpine:3.20

COPY --from=build /bin/worker /bin/worker

EXPOSE 8090

ENTRYPOINT ["/bin/worker"]
