---
AIGC:
  ContentProducer: '001191110102MAD55U9H0F10002'
  ContentPropagator: '001191110102MAD55U9H0F10002'
  Label: '1'
  ProduceID: '052b0da5-3983-44a9-aa30-051dc4358792'
  PropagateID: '052b0da5-3983-44a9-aa30-051dc4358792'
  ReservedCode1: 'b5d296db-434b-4ee6-9539-33d2ecf4a1e3'
  ReservedCode2: 'b5d296db-434b-4ee6-9539-33d2ecf4a1e3'
---

# 知音（ZhiYin）安全部署方案

## 一、安全防护总览

```
┌─────────────────────────────────────────────────────┐
│                    互联网用户                         │
│                        │                              │
│                   HTTPS 加密传输                       │
│                        │                              │
│  ┌─────────────────────▼──────────────────────┐      │
│  │           Nginx 反向代理 (443)              │      │
│  │  · SSL证书 (Let's Encrypt, 免费)           │      │
│  │  · 安全响应头 (HSTS/CSP/XSS防护)           │      │
│  │  · 请求限流 (API 10r/s, 页面 30r/s)        │      │
│  │  · 敏感路径拦截 (.env/.git)                │      │
│  └─────────────────────┬──────────────────────┘      │
│                        │                              │
│  ┌─────────────────────▼──────────────────────┐      │
│  │         Docker 容器 (端口 3456)             │      │
│  │  · 非 root 用户运行 (nextjs:1001)          │      │
│  │  · 只读文件系统 (read_only: true)         │      │
│  │  · 无新权限提升 (no-new-privileges)        │      │
│  │  · 资源限制 (2GB内存, 2核CPU)             │      │
│  │  · 编译产物运行 (无源代码)                 │      │
│  └─────────────────────┬──────────────────────┘      │
│                        │                              │
│  ┌─────────────────────▼──────────────────────┐      │
│  │      加密数据卷 (zhiyin-data)              │      │
│  │  · SQLite 数据库 (权限 0600)              │      │
│  │  · 用户数据/诊断记录/舌诊图片              │      │
│  └────────────────────────────────────────────┘      │
└─────────────────────────────────────────────────────┘
```

## 二、三层安全防护详解

### 第一层：源代码保护

| 措施 | 说明 |
|------|------|
| **Standalone 编译输出** | `next.config.js` 启用 `output: "standalone"`，构建后只产出编译后的 `server.js` + 静态资源，**不含 .ts/.tsx 源文件** |
| **Docker 多阶段构建** | 源代码只存在于 builder 阶段，最终镜像只有编译产物。即使 `docker exec` 进入容器也看不到源码 |
| **.dockerignore 排除** | `.env*`、`.git`、`node_modules`、测试文件等全部排除，不会进入 Docker 镜像 |
| **前端代码混淆** | Next.js 生产构建自动对 JS 做 tree-shaking + 压缩 + 混淆（变量名 mangle）|

### 第二层：API密钥与配置保护

| 措施 | 说明 |
|------|------|
| **.env.production 不入镜像** | 被 `.dockerignore` 排除，通过 `docker compose env_file` 注入运行环境 |
| **强随机 NEXTAUTH_SECRET** | 部署时自动生成 32 位随机密钥，替代默认弱密码 |
| **环境变量注入** | 密钥通过 `docker-compose.yml` 的 `env_file` 注入，不写入文件系统 |
| **.gitignore 排除** | 所有 `.env*` 文件不会被提交到 Git 仓库 |

### 第三层：数据库与用户数据保护

| 措施 | 说明 |
|------|------|
| **Docker 加密数据卷** | 数据库文件存储在 Docker 管理的加密卷中，宿主机上不可直接读取 |
| **文件权限 0600** | 数据库文件仅文件所有者可读写，其他用户无权访问 |
| **非 root 运行** | 容器以 `nextjs:1001` 用户运行，无法提权 |
| **只读文件系统** | 容器根文件系统只读，只有 `/app/data` 和 `/tmp` 可写 |
| **Nginx 传输加密** | 所有数据传输走 HTTPS，防止中间人攻击 |

## 三、免费部署方案对比

| 方案 | 费用 | 源码保护 | 难度 | 适合场景 |
|------|------|----------|------|----------|
| **Docker + Nginx** (推荐) | 免费 (云服务器费用) | 最高 | 中等 | 长期稳定上线 |
| Docker 单容器 | 免费 | 高 | 简单 | 快速上线 |
| PM2 + Nginx | 免费 | 中 | 中等 | 无 Docker 环境 |
| Cloudflare Tunnel | 免费 | 中 | 简单 | 本地服务器免公网IP |
| Vercel/Netlify | 免费额度 | 高 | 最简单 | 但3GB音频资源超限 |

## 四、部署步骤

### 方案A：Docker 部署（推荐）

```bash
# 1. 在服务器上安装 Docker
#    Ubuntu: curl -fsSL https://get.docker.com | sh
#    CentOS: yum install -y docker-ce docker-compose-plugin

# 2. 上传项目代码到服务器
scp -r E:\zyly user@your-server:/opt/zhiyin
# 或用 git clone (推荐，配合 .gitignore 保护密钥)

# 3. 创建生产环境配置
cd /opt/zhiyin
cp .env.production.example .env.production
# 编辑 .env.production，填入真实 API Key 和强密码
vi .env.production

# 4. 一键部署
chmod +x deploy.sh
./deploy.sh docker
# 或: docker compose build && docker compose up -d

# 5. 配置 HTTPS (免费 Let's Encrypt)
sudo apt install certbot python3-certbot-nginx
sudo certbot --nginx -d your-domain.com

# 6. 配置 Nginx 反向代理
sudo cp nginx/zhiyin.conf /etc/nginx/sites-available/
sudo ln -s /etc/nginx/sites-available/zhiyin.conf /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
```

### 方案B：本地 Standalone 部署（无 Docker）

```bash
# 1. 构建 standalone 产物 (不含源码)
cd E:\zyly
deploy.bat local
# 或: npx next build --webpack

# 2. 部署产物 (只需3个目录)
#    .next/standalone/   ← 编译后的服务器
#    .next/static/       ← 前端静态资源
#    public/             ← 图片音频等
#    prisma/             ← 数据库 schema
#    .env.production     ← 配置 (不打包进镜像)

# 3. 在服务器上启动
export NODE_ENV=production
node .next/standalone/server.js
```

### 方案C：Cloudflare Tunnel（免费内网穿透）

适合本地 Windows 服务器，无需公网 IP：
```bash
# 1. 下载 cloudflared
#    https://github.com/cloudflare/cloudflared/releases

# 2. 创建隧道
cloudflared tunnel create zhiyin

# 3. 配置隧道指向本地服务
cloudflared tunnel route dns zhiyin zhiyin.your-domain.com

# 4. 启动
cloudflared tunnel run zhiyin
```

## 五、已创建的安全文件

| 文件 | 用途 |
|------|------|
| `next.config.js` | 启用 `output: "standalone"` 编译输出 |
| `Dockerfile` | 多阶段构建，源码不进最终镜像 |
| `docker-compose.yml` | 生产编排：非root、只读FS、资源限制、健康检查 |
| `.dockerignore` | 排除.env/.git/node_modules/测试文件 |
| `.env.production` | 生产密钥配置（不入镜像不入Git） |
| `.env.production.example` | 配置模板（可提交Git） |
| `scripts/init-db.js` | 数据库初始化+权限设置+完整性校验 |
| `deploy.sh` / `deploy.bat` | 一键部署脚本 |
| `nginx/zhiyin.conf` | Nginx 反向代理配置（HTTPS+限流+安全头） |

## 六、日常运维

```bash
# 查看日志
docker compose logs -f

# 重启服务
docker compose restart

# 更新部署
git pull && docker compose build && docker compose up -d

# 备份数据
docker compose exec zhiyin cp /app/data/prod.db /app/data/backup-$(date +%Y%m%d).db
docker cp zhiyin-app:/app/data/backup-$(date +%Y%m%d).db ./backups/

# 恢复数据
docker cp ./backups/prod.db zhiyin-app:/app/data/prod.db
docker compose restart
```

> AI生成