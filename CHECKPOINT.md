# Checkpoint de retomada — Conta Família

Data: 17/09/2026

## Estado versionado

- Branch: `feat/mvp-conta-familia`
- Commit: `9822dcb` (`feat: conectar fluxos locais do aplicativo`)
- Remoto: `origin/feat/mvp-conta-familia`
- Working tree: limpo após o commit deste checkpoint

## O que já está pronto

- Scaffold Expo SDK 57 com TypeScript estrito.
- Regras de divisão em centavos, validação de divisão personalizada e cálculo de saldos.
- Testes Jest para domínio e fila offline: 5 testes.
- SQLite local com família inicial demonstrativa e fila de operações pendentes.
- SecureStore para token de sessão local.
- Detecção de conectividade com NetInfo.
- Tela de boas-vindas e início com resumo mensal, categorias, saldos e vencimentos.
- Fluxo de nova despesa, divisão igual/personalizada, detalhe e exclusão.
- Lembretes com criação, conclusão e exclusão.
- Família com membros, convite por folha de compartilhamento e exclusão protegida por confirmação do nome.
- Compartilhamento do resumo pelo sistema, compatível com WhatsApp quando instalado.
- `docs/` ignorada no `.gitignore`; especificação e plano foram adicionados explicitamente ao Git.

## Evidências do último gate

```text
npm run lint       PASS
npm test           PASS — 2 suítes, 5 testes
npx tsc --noEmit   PASS
npm run export     PASS — bundles Android e iOS gerados em dist/
git diff --check   PASS
```

## Próxima fatia recomendada

1. Criar `README.md` com setup, limitações e checklist de aceitação.
2. Implementar autenticação remota real e aceite de convites com backend configurável.
3. Implementar consumidor da fila para sincronizar apenas quando houver Internet, com idempotência por `clientOperationId`.
4. Revisar conflito de dados, tombstones remotos e exclusão remota da família.
5. Rodar validação manual em Android e iOS; o export acima não substitui teste físico.

## Retomada

```bash
cd /home/mike/dev/Projetos/ContaFamilia
git switch feat/mvp-conta-familia
git status --short --branch
npm install
npm start
```

Não conectar bancos, solicitar senhas bancárias ou adicionar dados reais ao seed.
