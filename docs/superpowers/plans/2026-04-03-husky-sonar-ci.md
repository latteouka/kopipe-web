# Husky + SonarQube + CI Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** 為 kopipe 加入 Husky pre-push hook、SonarQube 設定、以及 GitHub Actions CI workflow。

**Architecture:** 新增 4 個設定檔 + 修改 package.json。CI workflow 與現有 deploy workflow 互不干擾。

**Tech Stack:** Husky 9, SonarQube (sonarqube-scan-action v6), GitHub Actions, pnpm

---

### Task 1: 更新 package.json — 加入 scripts 和 husky devDependency

**Files:**
- Modify: `package.json:6-17` (scripts section)
- Modify: `package.json:52-68` (devDependencies section)

- [ ] **Step 1: 在 package.json 加入 scripts**

在 `scripts` 區塊加入 `check`、`typecheck`、`prepare`：

```json
"scripts": {
    "build": "next build",
    "check": "eslint . && tsc --noEmit",
    "db:generate": "prisma migrate dev",
    "db:migrate": "prisma migrate deploy",
    "db:push": "prisma db push",
    "db:studio": "prisma studio",
    "dev": "next dev",
    "postinstall": "prisma generate",
    "lint": "eslint .",
    "prepare": "husky",
    "start": "next start -p 3006",
    "typecheck": "tsc --noEmit",
    "deleteDuePosts": "npx tsx ./src/scripts/deleteDuePosts.ts"
}
```

- [ ] **Step 2: 加入 husky devDependency**

```bash
pnpm add -D husky@^9.1.7
```

- [ ] **Step 3: 驗證 scripts 可執行**

```bash
pnpm typecheck
pnpm check
```

Expected: 兩個指令都正常結束（exit 0）

- [ ] **Step 4: Commit**

```bash
git add package.json pnpm-lock.yaml
git commit -m "feat: add check/typecheck scripts and husky devDependency"
```

---

### Task 2: 設定 Husky pre-push hook

**Files:**
- Create: `.husky/pre-push`

- [ ] **Step 1: 初始化 Husky**

```bash
pnpm exec husky init
```

這會建立 `.husky/` 目錄和預設的 pre-commit hook。

- [ ] **Step 2: 刪除預設 pre-commit，建立 pre-push**

```bash
rm .husky/pre-commit
echo "pnpm check" > .husky/pre-push
```

- [ ] **Step 3: 驗證 hook 檔案內容**

```bash
cat .husky/pre-push
```

Expected: `pnpm check`

- [ ] **Step 4: Commit**

```bash
git add .husky/
git commit -m "feat: add husky pre-push hook running pnpm check"
```

---

### Task 3: 建立 SonarQube 設定

**Files:**
- Create: `sonar-project.properties`

- [ ] **Step 1: 建立 sonar-project.properties**

```properties
sonar.projectKey=kopipe
sonar.projectName=Kopipe
sonar.host.url=https://sonar.chundev.com

# Source
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx

sonar.exclusions=**/node_modules/**,**/.next/**,**/dist/**,**/coverage/**,**/*.config.*,**/scripts/**

# Language
sonar.language=ts
sonar.typescript.tsconfigPaths=tsconfig.json

# Encoding
sonar.sourceEncoding=UTF-8
```

- [ ] **Step 2: Commit**

```bash
git add sonar-project.properties
git commit -m "feat: add SonarQube project configuration"
```

---

### Task 4: 建立 GitHub Actions CI workflow

**Files:**
- Create: `.github/workflows/ci.yml`

- [ ] **Step 1: 建立 ci.yml**

```yaml
name: CI

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  quality:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: "20"
      - uses: pnpm/action-setup@v4
        with:
          version: 10
      - name: Install dependencies
        run: pnpm install --frozen-lockfile
      - name: Generate Prisma Client
        run: pnpm prisma generate
        env:
          SKIP_ENV_VALIDATION: "1"
      - name: Type Check
        run: pnpm typecheck
      - name: Lint
        run: pnpm lint
      - name: Build
        run: pnpm build
        env:
          SKIP_ENV_VALIDATION: "1"

  sonarqube:
    runs-on: ubuntu-latest
    needs: quality
    if: always()
    steps:
      - uses: actions/checkout@v4
        with:
          fetch-depth: 0
      - name: SonarQube Scan
        uses: SonarSource/sonarqube-scan-action@v6
        env:
          SONAR_TOKEN: ${{ secrets.SONAR_TOKEN }}

  dependency-review:
    if: github.event_name == 'pull_request'
    runs-on: ubuntu-latest
    permissions:
      contents: read
    steps:
      - uses: actions/checkout@v4
      - uses: actions/dependency-review-action@v4
        with:
          fail-on-severity: high
```

- [ ] **Step 2: 驗證 YAML 語法**

```bash
python3 -c "import yaml; yaml.safe_load(open('.github/workflows/ci.yml'))"
```

Expected: 無 error output

- [ ] **Step 3: Commit**

```bash
git add .github/workflows/ci.yml
git commit -m "feat: add CI workflow with quality checks, SonarQube, and dependency review"
```

---

### Task 5: 最終驗證

- [ ] **Step 1: 確認所有檔案到位**

```bash
ls -la .husky/pre-push sonar-project.properties .github/workflows/ci.yml
```

Expected: 三個檔案都存在

- [ ] **Step 2: 再跑一次 pnpm check 確認正常**

```bash
pnpm check
```

Expected: exit 0

- [ ] **Step 3: 確認 git status 乾淨**

```bash
git status
```

Expected: nothing to commit, working tree clean
