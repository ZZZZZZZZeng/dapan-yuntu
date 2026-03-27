# 部署指南

## 快速部署到 Vercel（推荐）

### 步骤 1：推送到 GitHub

```bash
# 进入项目目录
cd ~/workspace/agent/workspace/projects/dapan-yuntu

# 初始化 Git 仓库
git init

# 添加所有文件
git add .

# 提交
git commit -m "Initial commit: Dapan Yuntu heatmap visualization"

# 添加远程仓库（替换 YOUR_USERNAME 和 REPO_NAME）
git remote add origin https://github.com/YOUR_USERNAME/REPO_NAME.git

# 推送到 GitHub
git push -u origin main
```

### 步骤 2：在 Vercel 部署

1. 访问 https://vercel.com/new
2. 点击 "Import Git Repository"
3. 选择你的 `dapan-yuntu` 仓库
4. 点击 "Deploy"

项目已配置 `vercel.json`，Vercel 会自动识别构建设置。

### 备选：使用 Vercel CLI

```bash
# 安装 Vercel CLI
npm install -g vercel

# 登录
vercel login

# 部署
vercel --prod
```

## 完成！

部署完成后，你将获得一个类似 `https://dapan-yuntu-xxx.vercel.app` 的域名。
