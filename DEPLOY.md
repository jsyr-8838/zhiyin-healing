# 知音疗愈 (ZhiYin) - 部署说明

## 快速启动

1. **首次运行**：双击 `start.bat`，等待编译完成后访问 `http://localhost:3456`
2. **同步更新**：当原项目（E盘）有代码更新后，双击 `upgrade.bat` 自动同步

## 自动升级机制

`upgrade.bat` 使用 robocopy 将原项目（`E:\TeleClaw的工作空间\heytcm-pro`）的代码和数据单向同步到 `F:\zyly`，自动排除：
- `node_modules/`（依赖包，无需重复复制）
- `.next/`（构建缓存，启动时自动生成）
- `.temp/`（临时文件）
- `*.log`（日志文件）

## 环境要求

- Node.js v20+ 
- npm/pnpm（依赖已包含在 node_modules 中）
- 磁盘空间：~5GB

## 关键文件

| 文件 | 说明 |
|------|------|
| `.env.local` | 环境变量配置（API密钥、数据库路径等） |
| `prisma/dev.db` | SQLite 数据库（知音进化引擎数据） |
| `src/data/tcm/acupoints_database.json` | 571穴位主数据 |
| `src/lib/meridian-data.ts` | 306正经穴经络数据 |
| `public/models/tcm-3d/human.obj` | 3D人体模型 |
| `public/assets/acupoint/` | 穴位定位图（356张） |
| `public/videos/acupoints/` | 穴位定位视频（400个） |

## 跨电脑迁移

将整个 `F:\zyly` 文件夹复制到新电脑，然后：
1. 安装 Node.js v20+
2. 运行 `npm install` 安装依赖
3. 运行 `npx prisma generate` 初始化 Prisma
4. 修改 `.env.local` 中的 API 密钥和端口
5. 运行 `npx next dev -p 3456` 启动

## 注意事项

- 如需独立于原项目运行，删除 `upgrade.bat` 即可
- 数据库 `prisma/dev.db` 同步时会被覆盖；如需保留独立进化数据，升级前请备份
- 端口默认 3456，可在 `start.bat` 和 `.env.local` 中修改
