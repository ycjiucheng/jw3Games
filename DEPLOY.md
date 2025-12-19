# 部署指南 (GitHub Pages)

本项目是一个纯前端 React 应用，可以直接部署到 GitHub Pages。

## 1. 推送到 GitHub

首先，在 GitHub 上创建一个新的仓库（例如 `jx3-game`）。

然后在本地初始化 git 并推送到远程：

```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/jx3-game.git
git push -u origin main
```

## 2. 配置 GitHub Pages

1. 进入 GitHub 仓库页面。
2. 点击 **Settings** -> **Pages**。
3. 在 **Build and deployment** 下，选择 **Source** 为 `GitHub Actions`。
4. 或者选择 `Deploy from a branch`，然后选择 `gh-pages` 分支（如果你手动构建并推送到该分支）。

**推荐方式：使用 GitHub Actions 自动部署**

在项目根目录创建 `.github/workflows/deploy.yml` 文件：

```yaml
name: Deploy to GitHub Pages

on:
  push:
    branches: [main]

permissions:
  contents: read
  pages: write
  id-token: write

jobs:
  build:
    runs-on: ubuntu-latest
    steps:
      - name: Checkout
        uses: actions/checkout@v4
      - name: Setup Node
        uses: actions/setup-node@v4
        with:
          node-version: 20
          cache: 'npm'
      - name: Install dependencies
        run: npm ci
      - name: Build
        run: npm run build
      - name: Upload artifact
        uses: actions/upload-pages-artifact@v3
        with:
          path: ./dist

  deploy:
    environment:
      name: github-pages
      url: ${{ steps.deployment.outputs.page_url }}
    needs: build
    runs-on: ubuntu-latest
    steps:
      - name: Deploy to GitHub Pages
        id: deployment
        uses: actions/deploy-pages@v4
```

提交这个文件后，GitHub Actions 会自动构建并部署你的游戏。

## 3. 本地运行

```bash
npm install
npm run dev
```

打开浏览器访问显示的地址即可。
