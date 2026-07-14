# Prisma 全新项目配置指南

## 1. 安装依赖

```bash
npm install prisma --save-dev
npm install @prisma/client
```

## 2. 初始化 Prisma

```bash
npx prisma init
```

这会生成：
- `prisma/schema.prisma` — 数据库 schema 文件
- `.env` — 环境变量文件（包含 `DATABASE_URL`）

## 3. 配置 prisma.config.ts（可选，项目根目录）

```typescript
import "dotenv/config";
import { defineConfig } from "prisma/config";

export default defineConfig({
  schema: "prisma/schema",     // 指向 schema 目录
  migrations: {
    path: "prisma/migrations",
  },
  datasource: {
    url: process.env.DATABASE_URL,
  },
});
```

## 4. 编写 schema.prisma

```prisma
generator client {
  provider = "prisma-client-js"
}

datasource db {
  provider = "mysql"   // 或 postgresql, sqlite
  url      = env("DATABASE_URL")
}

model UserAccount {
  id          String   @id @default(uuid())
  userName    String?
  userAccount String?  @unique
  password    String?
  email       String?
  phone       String?
  avatar      String?
  status      Int      @default(1)
  createdTime DateTime @default(now())
  updatedTime DateTime @updatedAt
}
```

## 5. 配置 .env

```env
DATABASE_URL="mysql://user:password@localhost:3306/dbname"
```

## 6. 生成 Prisma Client

```bash
npx prisma generate
```

这会在 `node_modules/@prisma/client` 生成类型安全的客户端。项目中是通过 `src/generated/prisma/client` 自定义输出路径。

## 7. 执行迁移（创建数据库表）

```bash
npx prisma migrate dev
```

## 8. 在代码中使用

```typescript
// utils/prisma.ts
import { PrismaClient } from '@/generated/prisma/client'

export const prisma = new PrismaClient()

// 业务代码
const user = await prisma.userAccount.findFirst({
  where: { userAccount: 'admin', password: '123' }
})
```

## 常用命令

| 命令 | 作用 |
|------|------|
| `npx prisma generate` | 生成 Client 代码 |
| `npx prisma migrate dev` | 创建并执行迁移 |
| `npx prisma studio` | 打开数据库可视化工具 |
| `npx prisma db push` | 直接推送 schema 变更（无需迁移文件） |
