# 🚀 大盘云图 - 快速部署

## 方式一：Vercel（推荐，2分钟）

```bash
cd ~/workspace/agent/workspace/projects/dapan-yuntu

# 登录（浏览器授权）
npx vercel login

# 部署
npx vercel --prod
```

获得网址：`https://dapan-yuntu-xxx.vercel.app`

---

## 方式二：Cloudflare Pages

```bash
npx wrangler login
npx wrangler pages deploy dist --project-name=dapan-yuntu
```

---

## 方式三：静态服务器

把 `dist/` 文件夹内容上传到任意静态服务器即可。

---

## 项目文件

- 项目：`~/workspace/agent/workspace/projects/dapan-yuntu/`
- 构建输出：`dist/`
- 部署包：`dist-deploy.tar.gz`
