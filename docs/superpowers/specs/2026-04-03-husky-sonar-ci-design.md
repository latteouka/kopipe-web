# Husky + SonarQube + CI 設定

**Created**: 2026-04-03

## Overview

參考 erp 專案，為 kopipe 加入 Husky pre-push hook、SonarQube 程式碼品質掃描、以及 GitHub Actions CI workflow。現有的 deploy workflow（`main.yml`）維持不動。

## 變更項目

### 1. package.json

新增 scripts：

- `"check": "eslint . && tsc --noEmit"` — Husky pre-push 用
- `"typecheck": "tsc --noEmit"` — CI 用
- `"prepare": "husky"` — install 後自動設定 git hooks

新增 devDependency：

- `husky: ^9.1.7`

### 2. Husky

建立 `.husky/pre-push`：

```bash
pnpm check
```

只有 pre-push hook，不加 pre-commit、lint-staged、commitlint。

### 3. SonarQube

建立 `sonar-project.properties`：

```properties
sonar.projectKey=kopipe
sonar.projectName=Kopipe
sonar.host.url=https://sonar.chundev.com
sonar.sources=src
sonar.tests=src
sonar.test.inclusions=**/*.test.ts,**/*.test.tsx,**/*.spec.ts,**/*.spec.tsx
sonar.exclusions=**/node_modules/**,**/.next/**,**/dist/**,**/coverage/**,**/*.config.*,**/scripts/**
sonar.language=ts
sonar.typescript.tsconfigPaths=tsconfig.json
sonar.sourceEncoding=UTF-8
```

### 4. GitHub Actions CI

新增 `.github/workflows/ci.yml`，不修改現有 `main.yml`（deploy）。

**Jobs：**

#### quality（每次 push/PR 到 main）

1. `actions/checkout@v4`
2. `actions/setup-node@v4` (node 20)
3. `pnpm/action-setup@v4` (version 10)
4. `pnpm install --frozen-lockfile`
5. `pnpm prisma generate`（使用 `SKIP_ENV_VALIDATION=1`）
6. Type Check: `pnpm typecheck`
7. Lint: `pnpm lint`
8. Build: `pnpm build`（使用 `SKIP_ENV_VALIDATION=1`）

#### sonarqube（needs: quality, if: always()）

1. `actions/checkout@v4` (fetch-depth: 0)
2. `SonarSource/sonarqube-scan-action@v6`
3. 需要 `SONAR_TOKEN` secret

#### dependency-review（僅 PR）

1. `actions/checkout@v4`
2. `actions/dependency-review-action@v4` (fail-on-severity: high)

## 不包含的項目

- 測試步驟（kopipe 目前無測試框架）
- lint-staged / commitlint
- deploy 流程變更
- Makefile sonar targets
