# GitHub 仓库设置指南

## 步骤 1：创建 GitHub 仓库

1. 访问 https://github.com/new
2. 仓库名称：`dapan-yuntu`
3. 选择 `Public`（或 Private）
4. 不要勾选 "Add a README file"
5. 点击 **Create repository**

## 步骤 2：推送代码

运行以下命令（替换 YOUR_USERNAME 为你的 GitHub 用户名）：

```bash
cd ~/workspace/agent/workspace/projects/dapan-yuntu

# 添加远程仓库
git remote add origin https://github.com/YOUR_USERNAME/dapan-yuntu.git

# 推送代码
git push -u origin master
```

## 步骤 3：启用 GitHub Pages（可选）

1. 访问 `https://github.com/YOUR_USERNAME/dapan-yuntu/settings/pages`
2. Source 选择 "Deploy from a branch"
3. Branch 选择 "master"，文件夹选择 "/ (root)"
4. 点击 Save

## 完成！

- 代码仓库：`https://github.com/YOUR_USERNAME/dapan-yuntu`
- 网站访问：`https://YOUR_USERNAME.github.io/dapan-yuntu`
