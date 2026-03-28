#!/bin/bash
# 部署到 GitHub Pages

set -e

echo "🚀 部署到 GitHub Pages"

# 检查是否有 GitHub 远程仓库
REMOTE=$(git remote get-url origin 2>/dev/null || echo "")

if [ -z "$REMOTE" ]; then
    echo "❌ 请先添加 GitHub 远程仓库"
    echo "   git remote add origin https://github.com/用户名/dapan-yuntu.git"
    exit 1
fi

echo "📦 确保 dist 目录存在..."
if [ ! -d "dist" ]; then
    npm run build
fi

# 创建 gh-pages 分支并推送 dist
echo "🌿 创建 gh-pages 分支..."
git checkout --orphan gh-pages-temp 2>/dev/null || git checkout -b gh-pages-temp
git rm -rf .
cp -r dist/* .
touch .nojekyll
git add .
git commit -m "Deploy to GitHub Pages"

echo "📤 推送到 GitHub..."
git push origin gh-pages-temp:gh-pages --force

echo "🧹 清理..."
git checkout master 2>/dev/null || git checkout main 2>/dev/null || true
git branch -D gh-pages-temp 2>/dev/null || true

echo ""
echo "✅ 部署完成！"
echo ""
echo "🌐 访问地址:"
echo "   https://$(git remote get-url origin | sed 's/.*github.com[:/]\([^/]*\)\/\([^/.]*\).*/\1.github.io\/\2/')"
echo ""
