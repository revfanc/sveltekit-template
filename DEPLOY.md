# 阿里云 ECS 部署指南

## 项目配置

项目已配置 `@sveltejs/adapter-node` 适配器，支持 SSR 部署到 Node.js 服务器。

## 部署文件说明

- `Dockerfile` - Docker 镜像构建配置
- `docker-compose.yml` - Docker Compose 编排配置
- `.dockerignore` - Docker 构建忽略文件
- `src/hooks.server.ts` - 健康检查端点 (/health)
- `.github/workflows/deploy.yml` - GitHub Actions 自动部署工作流
- `.github/workflows/ci.yml` - GitHub Actions CI 检查工作流

## 部署步骤

### 方法一：使用 Docker Compose（推荐）

1. **连接到你的阿里云 ECS 服务器**

   ```bash
   ssh root@<你的ECS公网IP>
   ```

2. **安装 Docker 和 Docker Compose**（如未安装）

   ```bash
   # 安装 Docker
   curl -fsSL https://get.docker.com | sh
   systemctl enable docker
   systemctl start docker

   # 安装 Docker Compose
   curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
   chmod +x /usr/local/bin/docker-compose
   ```

3. **克隆 GitHub 仓库到服务器**

   ```bash
   git clone <你的GitHub仓库地址> /opt/sveltekit-app
   cd /opt/sveltekit-app
   ```

4. **启动服务**

   ```bash
   docker-compose up -d --build
   ```

5. **查看日志**
   ```bash
   docker-compose logs -f
   ```

### 方法三：GitHub Actions 自动部署（推荐）

配置 GitHub Actions 实现推送代码后自动部署到阿里云 ECS。

#### 1. 配置阿里云容器镜像服务 (ACR)

登录阿里云控制台，创建个人版实例：

- 访问 [容器镜像服务](https://cr.console.aliyun.com/)
- 创建命名空间（如 `my-namespace`）
- 记录镜像仓库地址（如 `registry.cn-hangzhou.aliyuncs.com`）

#### 2. 配置 GitHub Secrets

在 GitHub 仓库 Settings → Secrets and variables → Actions 中添加以下 secrets：

| Secret 名称        | 说明             | 获取方式                        |
| ------------------ | ---------------- | ------------------------------- |
| `ALIYUN_USERNAME`  | 阿里云登录用户名 | 阿里云账号或 RAM 子账号用户名   |
| `ALIYUN_PASSWORD`  | 阿里云登录密码   | 阿里云登录密码或 ACR 固定密码   |
| `ALIYUN_NAMESPACE` | ACR 命名空间     | 在 ACR 控制台创建的命名空间名称 |
| `ECS_HOST`         | ECS 公网 IP      | 你的阿里云 ECS 服务器公网 IP    |
| `ECS_USERNAME`     | ECS 登录用户名   | 通常是 `root`                   |
| `ECS_SSH_KEY`      | SSH 私钥         | 本地 `~/.ssh/id_rsa` 文件内容   |

#### 3. 在 ECS 服务器上配置 SSH 公钥

```bash
# 在本地生成密钥（如果还没有）
ssh-keygen -t rsa -b 4096 -C "github-actions"

# 将公钥复制到 ECS
cat ~/.ssh/id_rsa.pub | ssh root@<ECS_IP> "mkdir -p ~/.ssh && cat >> ~/.ssh/authorized_keys"

# 将私钥添加到 GitHub Secrets（名称：ECS_SSH_KEY）
cat ~/.ssh/id_rsa
```

#### 4. 在 ECS 上安装 Docker

```bash
curl -fsSL https://get.docker.com | sh
systemctl enable docker
systemctl start docker
```

#### 5. 推送代码触发部署

```bash
git add .
git commit -m "feat: add deployment workflow"
git push origin main
```

GitHub Actions 会自动执行：

1. 构建并推送 Docker 镜像到阿里云 ACR
2. SSH 连接到 ECS 服务器
3. 拉取最新镜像并重启容器

### 方法二：直接部署构建产物

1. **本地构建项目**

   ```bash
   npm ci
   npm run build
   ```

2. **上传到服务器**

   ```bash
   scp -r build package.json package-lock.json root@<你的ECS公网IP>:/opt/sveltekit-app/
   ```

3. **在服务器上安装依赖并启动**
   ```bash
   cd /opt/sveltekit-app
   npm ci --omit=dev
   node build
   ```

## 配置 Nginx 反向代理

在阿里云 ECS 上安装 Nginx 并配置反向代理：

```bash
# 安装 Nginx
apt-get update
apt-get install nginx -y
```

创建配置文件 `/etc/nginx/sites-available/sveltekit`：

```nginx
server {
    listen 80;
    server_name <你的域名或ECS公网IP>;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
        proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
        proxy_set_header X-Forwarded-Proto $scheme;
        proxy_cache_bypass $http_upgrade;
    }
}
```

启用配置：

```bash
ln -s /etc/nginx/sites-available/sveltekit /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

## 使用 PM2 管理进程（方法二时推荐）

```bash
npm install -g pm2
pm2 start build --name sveltekit-app
pm2 startup
pm2 save
```

## 安全组配置

在阿里云控制台配置安全组规则：

- 允许 80 端口（HTTP）
- 允许 443 端口（HTTPS）
- 允许 3000 端口（应用端口，如果使用 Nginx 代理可不开放）
- 允许 22 端口（SSH）

## 常用命令

```bash
# 查看容器状态
docker-compose ps

# 重启服务
docker-compose restart

# 停止服务
docker-compose down

# 查看日志
docker-compose logs -f

# 更新部署（拉取最新代码后）
docker-compose up -d --build
```
