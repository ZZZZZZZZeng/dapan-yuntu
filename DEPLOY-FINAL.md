# 🚀 大盘云图 - 最终部署指南

## ✅ 项目状态：100% 完成

- React + Vite + Tailwind + ECharts 热力图
- 腾讯财经 API（300+ 股票实时数据）
- 搜索筛选 + 30 秒自动刷新
- 生产构建完成（dist/ 1.3MB）

---

## 🚀 快速部署（3 选 1）

### 方案 A: Vercel（推荐，最简单）

```bash
cd ~/workspace/agent/workspace/projects/dapan-yuntu

# 登录（浏览器会自动打开授权页面）
npx vercel login

# 一键部署到生产环境
npx vercel --prod
```

**获得网址:** `https://dapan-yuntu-xxx.vercel.app`

---

### 方案 B: Cloudflare Pages

```bash
cd ~/workspace/agent/workspace/projects/dapan-yuntu

# 登录（浏览器授权）
npx wrangler login

# 部署到 Pages
npx wrangler pages deploy dist --project-name=dapan-yuntu
```

**获得网址:** `https://dapan-yuntu.pages.dev`

---

### 方案 C: 手动上传

将 `dist/` 文件夹内容上传到任意静态托管服务：
- Netlify Drop
- Firebase Hosting
- AWS S3 + CloudFront
- 任何支持静态文件的服务器

---

## 📁 部署包结构

```
dist/
├── index.html              # 入口文件
├── 404.html               # SPA 路由回退
├── _routes.json           # Cloudflare 配置
└── assets/
    ├── index-CEhsmjWU.js  # 主程序 (1.3MB)
    └── index-DmpBxxhl.css # 样式 (7.5KB)
```

---

## ✅ 部署验证清单

- [ ] 访问域名，页面正常加载
- [ ] 热力图显示红绿黄色块（上涨/下跌/平盘）
- [ ] 鼠标悬停显示股票详情
- [ ] 搜索框可以筛选股票
- [ ] 页面每 30 秒自动刷新
- [ ] 移动端显示正常

---

## 🆘 常见问题

**Q: 页面空白？**  
A: 检查浏览器控制台是否有跨域错误。腾讯 API 在某些环境可能有 CORS 限制。

**Q: 股票数据不显示？**  
A: 确认网络可以访问 `https://qt.gtimg.cn`，这是腾讯财经 API。

**Q: 部署后 404？**  
A: 确保配置了单页应用路由回退（已包含在 `vercel.json` 和 `404.html` 中）。

---

**🎉 祝部署顺利！**

**下一步：** 执行上面任一部署命令即可上线！
