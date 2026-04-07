FROM golang:1.26.1-alpine AS builder

# 设置代理加速Go模块下载
ENV GOPROXY=https://goproxy.cn,direct

WORKDIR /app
COPY go.mod go.sum ./
RUN go mod download

COPY . .
RUN CGO_ENABLED=0 GOOS=linux go build -o api_bin ./cmd/api

FROM alpine:latest
WORKDIR /app
COPY --from=builder /app/api_bin .

# 我们需要配置文件和 sql 脚本以便进行数据库初始化或映射
# 假设它们通过 volume 挂载或者直接复制。这里我们选择直接打包。
COPY --from=builder /app/config ./config
COPY --from=builder /app/sql ./sql

EXPOSE 8080
ENTRYPOINT ["./api_bin"]
