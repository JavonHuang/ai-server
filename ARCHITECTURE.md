# 项目架构

ai-server
├── 静态资源与配置层
│   ├── public/
│   │   └── ...
│   ├── prisma/
│   │   ├── migrations/
│   │   │   └── ...
│   │   └── schema.prisma
│   ├── package.json
│   ├── prisma.config.ts
│   ├── tsconfig.json
│   └── pnpm-lock.yaml
│
├── 文档层
│   ├── ARCHITECTURE.md
│   ├── CLAUDE.md
│   └── PRISMA-SETUP.md
│
└── 应用层 (src/)
├── 入口模块
│   └── app.ts
│
├── 控制层 (controller/)
│   ├── userController.ts
│   └── authController.ts
│
├── 业务逻辑层 (logic/)
│   ├── authLogic.ts
│   └── userLogic.ts
│
├── 令牌管理层 (token/)
│   ├── jwtUtils.ts
│   └── refreshToken.ts
│
├── 数据库接口层 (generated/)
│   └── prisma-client.ts
│
└── 工具层 (utils/)
├── bodyResult.ts
├── pageVOemail.ts
├── prisma.ts
└── tool.ts

## 项目架构
所有日期时间统一返回时间戳

## 各层详细说明

### 1. 静态资源与配置层

管理静态资源、数据库配置和项目依赖

- **public/**：静态资源文件
- **prisma/**：数据库管理
  - `schema.prisma`：数据模型定义
  - `migrations`：数据库迁移历史
- **package.json**：依赖管理
- **prisma.config.ts**：数据库连接配置
- **tsconfig.json**：TypeScript配置
- **pnpm-lock.yaml**：依赖锁定

### 2. 文档层

存放项目文档

- **ARCHITECTURE.md**：架构文档
- **CLAUDE.md**：Claude使用指南
- **PRISMA-SETUP.md**：Prisma设置指南

### 3. 应用层 (src/)

#### 入口模块

- **app.ts**：应用入口点

#### 控制层 (controller/)

处理HTTP请求，每个模块对应一个文件

- **userController.ts**：用户API
- **authController.ts**：认证API

#### 业务逻辑层 (logic/)

核心业务实现，每个模块对应一个文件

- **authLogic.ts**：认证逻辑
- **userLogic.ts**：用户逻辑

#### 令牌管理层 (token/)

令牌处理

- **jwtUtils.ts**：JWT令牌
- **refreshToken.ts**：刷新令牌

#### 数据库接口层 (generated/)

- **prisma-client.ts**：数据库操作接口

#### 工具层 (utils/)

通用工具

- **bodyResult.ts**：API控制层结果统一返回格式
- **pageVO.ts**：业务逻辑层，数据库分页，统一返回格式
- **prisma.ts**：prisma OMR连接
- **tool.ts**：公共工具函数
