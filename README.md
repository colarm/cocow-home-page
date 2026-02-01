# Cocow Home Page / Cocow 首页

**中文简介**

Cocow Home Page 是一个前后端分离的全栈 Web 项目，支持 CI/CD 部署。项目包含 React + Vite 的前端应用、Node.js + Express 的后端服务，并通过 Docker Compose 进行容器化编排，方便本地开发与生产部署。

**English Summary**

Cocow Home Page is a full‑stack web project with a decoupled architecture and CI/CD‑ready deployment. It includes a React + Vite frontend and a Node.js + Express backend, and is containerized with Docker Compose for both local development and production deployments.

## 技术栈 / Tech Stack

- **前端 / Frontend**: React 19 + TypeScript + Vite
- **后端 / Backend**: Node.js + Express + TypeScript
- **容器化 / Containerization**: Docker + Docker Compose

## 项目结构 / Project Structure

```
cocow-home-page/
├── cocow-web/              # React 前端应用 / React frontend app
├── cocow-api/              # Express 后端 API / Express backend API
└── docker-compose.yml      # 服务编排 / service orchestration
```

## 快速开始 / Quick Start

```bash
# 启动所有服务 / Start all services
docker-compose up -d --build

# 查看状态 / Check status
docker-compose ps

# 查看日志 / View logs
docker-compose logs -f
```

访问 / Access:

- **前端应用 / Web App**: http://localhost
- **API 健康检查 / API Health**: http://localhost/api/health
  停止服务 / Stop services:

```bash
docker-compose down
```

## 开发指南 / Development Guide

**前端 / Frontend**

```bash
cd cocow-web
npm install
npm run dev
npm run build
```

**后端 / Backend**

```bash
cd cocow-api
npm install
npm run dev
npm run build
npm start
```

## License

MIT
