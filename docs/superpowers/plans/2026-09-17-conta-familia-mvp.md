# Conta Família MVP Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Entregar um aplicativo Expo/React Native executável com fluxo local-first para registrar despesas, dividir contas, acompanhar vencimentos, visualizar saldos e compartilhar o resumo familiar.

**Architecture:** O cliente será TypeScript estrito com navegação leve por estado, telas separadas por responsabilidade e um repositório local assíncrono. O domínio financeiro será puro e independente da UI; o armazenamento local manterá a família e uma fila de sincronização, enquanto autenticação remota e sincronização futura serão opcionais por configuração.

**Tech Stack:** React Native, Expo, TypeScript, expo-sqlite, SecureStore, NetInfo, Jest/ts-jest, ESLint.

**Spec:** `docs/superpowers/specs/2026-09-17-conta-familia-mvp-design.md`

## Global Constraints

- Variáveis, propriedades, funções, hooks e parâmetros em `camelCase`.
- Componentes, tipos, interfaces e classes em `PascalCase`.
- Valores monetários persistidos em centavos inteiros.
- Nenhuma senha ou acesso bancário será solicitado.
- O app deve funcionar offline após o primeiro uso local.
- Tokens de autenticação, quando configurados, ficam no SecureStore.
- `docs/` permanece no `.gitignore`; planos e especificações deste processo são adicionados explicitamente ao Git.
- Não incluir backend keys, `.env` real ou dados pessoais no repositório.

---

### Task 1: Scaffold Expo e qualidade de código

**Files:**
- Create: `package.json`, `app.json`, `babel.config.js`, `tsconfig.json`, `App.tsx`
- Modify: `.gitignore`
- Create: `.env.example`, `.eslintrc.js`

**Interfaces:**
- Produces: scripts `start`, `android`, `ios`, `lint`, `test` e `export`.

- [ ] **Step 1: Scaffold the blank TypeScript Expo project**

Run: `npx create-expo-app@4.0.0 . --template blank-typescript --no-install`

Expected: Expo files are created without overwriting `.gitignore` or `docs/`.

- [ ] **Step 2: Install runtime and test dependencies**

Run: `npx expo install @react-native-async-storage/async-storage expo-secure-store @react-native-community/netinfo`

Run: `npm install --save-dev jest jest-expo @types/jest eslint eslint-config-expo`

- [ ] **Step 3: Configure strict TypeScript, ESLint and Jest**

Set the test script to `jest --runInBand`, the lint script to `eslint .`, and the export script to `expo export`.

- [ ] **Step 4: Verify the scaffold**

Run: `npm run lint`

Expected: exit 0 with no lint errors.

Run: `npm test -- --passWithNoTests`

Expected: exit 0.

- [ ] **Step 5: Commit the runnable scaffold**

Run: `git add package.json package-lock.json app.json babel.config.js tsconfig.json App.tsx .env.example .eslintrc.js && git commit -m "chore: preparar app Expo do Conta Familia"`

### Task 2: Domínio financeiro orientado por testes

**Files:**
- Create: `src/domain/types.ts`
- Create: `src/domain/expense-calculations.ts`
- Create: `src/domain/formatters.ts`
- Test: `src/domain/expense-calculations.test.ts`

**Interfaces:**
- Produces: `splitEqually(amountCents: number, memberIds: string[]): ExpenseShare[]`, `validateCustomSplit(amountCents: number, shares: ExpenseShare[]): string | null`, `calculateBalances(expenses: Expense[], members: FamilyMember[]): Balance[]`, `formatCurrency(amountCents: number): string`.

- [ ] **Step 1: Write failing tests for equal division, remainder, custom validation and balances**

Cover `1000 / 3 = 334,333,333`, rejection when custom shares do not sum to the total, and one payer/member balance.

- [ ] **Step 2: Run the focused tests and confirm the expected failure**

Run: `npm test -- src/domain/expense-calculations.test.ts`

Expected: FAIL because the domain functions do not exist.

- [ ] **Step 3: Implement the minimal pure domain functions**

Use integer cents only. Distribute remainder cents in participant order and return actionable validation messages.

- [ ] **Step 4: Run focused tests and then the full test suite**

Run: `npm test -- src/domain/expense-calculations.test.ts` and `npm test`

Expected: all tests pass.

- [ ] **Step 5: Commit the domain**

Run: `git add src/domain && git commit -m "feat: adicionar regras de divisao e saldos"`

### Task 3: Persistência local, autenticação segura e sincronização pendente

**Files:**
- Create: `src/data/local-store.ts`
- Create: `src/data/seed-data.ts`
- Create: `src/data/sync-queue.ts`
- Create: `src/auth/auth-store.ts`
- Test: `src/data/sync-queue.test.ts`

**Interfaces:**
- Produces: `loadFamilyData()`, `saveFamilyData(data: FamilyData): Promise<void>`, `enqueueOperation(operation: SyncOperation): Promise<void>`, `getPendingOperations(): Promise<SyncOperation[]>`, `clearFamilyData(): Promise<void>`, `saveSessionToken(token: string): Promise<void>` and `getSessionToken(): Promise<string | null>`.

- [ ] **Step 1: Write failing tests for queued operations and idempotent replacement**

Verify a local operation is retained offline, repeated `clientOperationId` does not duplicate, and `clearFamilyData` removes the stored snapshot.

- [ ] **Step 2: Run the test and confirm failure**

Run: `npm test -- src/data/sync-queue.test.ts`

Expected: FAIL because the local store does not exist.

- [ ] **Step 3: Implement local persistence**

Use `expo-sqlite` for the structured local snapshot and queue, SecureStore only for session tokens, and a seeded family for first launch. The store must never persist banking credentials.

- [ ] **Step 4: Implement connectivity-aware sync status**

Use NetInfo to expose `online`, `offline` and `pending` states. When remote configuration is absent, keep operations pending with a clear local-only status rather than pretending they were uploaded.

- [ ] **Step 5: Run tests and commit**

Run: `npm test -- src/data/sync-queue.test.ts && npm test`

Run: `git add src/data src/auth && git commit -m "feat: adicionar armazenamento offline seguro"`

### Task 4: App shell and reusable visual system

**Files:**
- Create: `src/theme/colors.ts`, `src/theme/spacing.ts`
- Create: `src/components/AppText.tsx`, `src/components/Screen.tsx`, `src/components/PrimaryButton.tsx`, `src/components/StatCard.tsx`, `src/components/SectionHeader.tsx`, `src/components/EmptyState.tsx`, `src/components/BottomTabs.tsx`
- Modify: `App.tsx`

**Interfaces:**
- Consumes: `FamilyData`, `formatCurrency`, and store actions.
- Produces: typed `TabKey` navigation with `home`, `expenses`, `reminders`, `family`.

- [ ] **Step 1: Create the typed shell and shared components**

Use safe-area padding, accessible labels, a high-contrast navy/green palette, 44pt minimum controls, and consistent Brazilian Portuguese copy.

- [ ] **Step 2: Connect App to the local store**

Load seed data on mount, show a subtle offline/sync badge, and expose the primary “Adicionar despesa” action.

- [ ] **Step 3: Run lint and export**

Run: `npm run lint && npm run export`

Expected: exit 0 and a generated export directory ignored by Git.

- [ ] **Step 4: Commit the shell**

Run: `git add App.tsx src/theme src/components && git commit -m "feat: criar shell visual do aplicativo"`

### Task 5: Início, despesas e divisão de contas

**Files:**
- Create: `src/screens/HomeScreen.tsx`, `src/screens/ExpensesScreen.tsx`, `src/screens/ExpenseFormScreen.tsx`, `src/screens/ExpenseDetailScreen.tsx`
- Create: `src/components/ExpenseRow.tsx`, `src/components/MemberBalanceRow.tsx`, `src/components/CategoryChip.tsx`

**Interfaces:**
- Consumes: domain calculations and local store.
- Produces: create/edit/delete expense flows that update the local snapshot and enqueue operations.

- [ ] **Step 1: Add the expense list and monthly summary**

Render total monthly spending, category breakdown, recent expenses and member balances. Use empty states when there are no records.

- [ ] **Step 2: Add the expense form**

Validate description, positive BRL amount, category, payer, participants and division. Support equal and custom modes, with the custom difference displayed before save.

- [ ] **Step 3: Add detail, edit and delete actions**

Use confirmation for deletion and tombstone the record in the local store.

- [ ] **Step 4: Add system sharing for the monthly summary**

Generate a Portuguese text summary and call React Native `Share.share`. Do not access WhatsApp APIs or credentials.

- [ ] **Step 5: Run tests, lint and export**

Run: `npm test && npm run lint && npm run export`

- [ ] **Step 6: Commit expense flows**

Run: `git add src/screens src/components src/domain src/data App.tsx && git commit -m "feat: registrar e dividir despesas"`

### Task 6: Lembretes, família, convites e exclusão

**Files:**
- Create: `src/screens/RemindersScreen.tsx`, `src/screens/FamilyScreen.tsx`, `src/screens/SettingsScreen.tsx`
- Create: `src/components/ReminderRow.tsx`, `src/components/MemberRow.tsx`, `src/components/ModalSheet.tsx`

**Interfaces:**
- Consumes: local store, secure auth store and sharing helper.
- Produces: reminder create/complete/delete, invite code sharing, member listing and guarded family deletion.

- [ ] **Step 1: Add reminder list and form**

Show pending, due today, overdue and completed states. Store date as `YYYY-MM-DD` and amount as cents.

- [ ] **Step 2: Add family and invite flow**

Display members, generate a local invite preview with expiration, and share a code/link through `Share.share` without embedding financial data.

- [ ] **Step 3: Add guarded delete-all flow**

Require the family name confirmation, clear local records and secure session token, then return to the welcome state. If offline, show that remote deletion remains pending.

- [ ] **Step 4: Run full verification and commit**

Run: `npm test && npm run lint && npm run export && git diff --check`

Run: `git add src/screens src/components src/data src/auth App.tsx && git commit -m "feat: adicionar contas familia e exclusao segura"`

### Task 7: Documentation, acceptance checklist and final gate

**Files:**
- Create: `README.md`
- Create: `.env.example` entries for optional remote URL and public key
- Modify: `docs/superpowers/plans/2026-09-17-conta-familia-mvp.md`

- [ ] **Step 1: Document setup, offline behavior and limitations**

Explain `npm install`, `npm start`, Android/iOS commands, local-only mode, optional sync configuration, and the fact that automated export is not physical device QA.

- [ ] **Step 2: Check every acceptance criterion against the implementation**

Use a checklist in the README and record any material omission instead of implying a remote backend is active without credentials.

- [ ] **Step 3: Run the complete gate**

Run: `npm test && npm run lint && npm run export && git diff --check && git status --short --branch`

Expected: tests, lint, export and diff check exit 0; only intended tracked files remain.

- [ ] **Step 4: Commit documentation and final state**

Run: `git add -f docs/superpowers/plans/2026-09-17-conta-familia-mvp.md && git add README.md .env.example && git commit -m "docs: documentar uso e limites do MVP"`
