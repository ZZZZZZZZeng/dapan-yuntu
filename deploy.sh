#!/bin/bash
# 大盘云图部署脚本

echo "🚀 开始构建..."
npm run build

if [ ! -d "dist" ]; then
    echo "❌ 构建失败，dist 目录不存在"
    exit 1
fi

echo "✅ 构建完成"
echo ""
echo "📦 部署选项："
echo ""
echo "1. Vercel (推荐):"
echo "   vercel --prod"
echo ""
echo "2. 静态服务器:"
echo "   将 dist/ 目录部署到任意静态服务器"
echo ""
echo "3. Cloudflare Pages:"
echo "   npx wrangler pages deploy dist"
echo ""
