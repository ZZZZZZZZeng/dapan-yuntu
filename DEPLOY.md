# 大盘云图 - 部署指南

## 方案 A：GitHub + Vercel 自动部署（推荐）

### 步骤 1：推送到 GitHub

```bash
# 1. 创建 GitHub 仓库
# 访问 https://github.com/new
# 输入仓库名：dapan-yuntu
# 选择 Public，点击 Create repository

# 2. 推送到 GitHub（在项目目录执行）
cd ~/workspace/agent/workspace/projects/dapan-yuntu

# 添加远程仓库（替换 YOUR_USERNAME 为你的 GitHub 用户名）
git remote add origin https://github.com/YOUR_USERNAME/dapan-yuntu.git

# 推送代码
git push -u origin master
```

### 步骤 2：在 Vercel 部署

```bash
# 1. 安装 Vercel CLI
npm install -g vercel

# 2. 登录 Vercel
vercel login

# 3. 部署项目
cd ~/workspace/agent/workspace/projects/dapan-yuntu
vercel --prod

# 4. 按照提示操作：
# - 选择 "Link to existing project" 或创建新项目
# - 确认项目设置
# - 等待部署完成
```

### 步骤 3：获取域名

部署完成后，Vercel 会提供一个域名：
- 类似 `https://dapan-yuntu-xxx.vercel.app`
- 你也可以在 Vercel Dashboard 中绑定自定义域名

---

## 方案 B：Vercel Dashboard 手动部署（最简单）

1. **推送代码到 GitHub**（按方案 A 步骤 1）

2. **登录 Vercel Dashboard**
   - 访问 https://vercel.com/dashboard
   - 点击 "Add New..." → "Project"

3. **导入 GitHub 仓库**
   - 选择你的 `dapan-yuntu` 仓库
   - 点击 "Import"

4. **配置并部署**
   - Framework Preset: 选择 "Vite"
   - Build Command: `npm run build`（默认）
   - Output Directory: `dist`（默认）
   - 点击 "Deploy"

5. **完成！** 🎉
   - 等待部署完成
   - 访问提供的域名即可查看

---

## 项目结构说明

```
dapan-yuntu/
├── src/
│   ├── App.jsx              # 主应用组件
│   ├── components/          # 组件目录
│   │   ├── HeatMap.jsx      # 热力图组件
│   │   ├── Header.jsx       # 顶部栏
│   │   ├── FilterBar.jsx    # 筛选栏
│   │   └── StatusBar.jsx    # 状态栏
│   ├── api/
│   │   └── stockApi.js      # 股票数据 API
│   ├── data/
│   │   └── stockCodes.js    # 股票代码数据
│   ├── styles/
│   │   └── index.css        # 全局样式
│   └── main.jsx             # 入口文件
├── dist/                    # 构建输出目录
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
├── vercel.json              # Vercel 配置
└── DEPLOY.md                # 本文件
```

---

## 常见问题

### Q: 部署后页面空白？
A: 检查 `vite.config.js` 中的 `base` 配置，确保设置为 `/` 或你的子路径。

### Q: 股票数据不显示？
A: 腾讯财经 API 可能有跨域限制，确保在浏览器开发者工具中检查网络请求。

### Q: 如何更新已部署的项目？
A: 推送新代码到 GitHub，Vercel 会自动重新部署（如果是通过 Git 导入的项目）。

---

## 需要帮助？

如果遇到问题，可以：
1. 查看 Vercel 文档：https://vercel.com/docs
2. 查看 Vite 部署指南：https://vitejs.dev/guide/static-deploy.html
