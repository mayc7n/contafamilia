# Conta Família — Design do MVP

## Objetivo

O Conta Família é um aplicativo mobile para Android e iOS, construído com React Native e Expo, que ajuda famílias a registrar despesas, contas e compromissos financeiros sem conectar bancos. O MVP prioriza clareza, privacidade por padrão e funcionamento offline: o grupo registra manualmente o que aconteceu e decide como dividir cada gasto.

## Escopo do MVP

O produto entrega uma experiência completa para uma família ou grupo doméstico:

- criação de uma família;
- autenticação do usuário;
- entrada e convite de membros;
- registro manual de despesas em reais;
- categorias e pessoa pagadora;
- divisão igual ou personalizada;
- lembretes de vencimento;
- resumo mensal e saldos individuais;
- compartilhamento de resumo pelo WhatsApp;
- persistência local offline e sincronização posterior;
- exclusão de todos os dados da família.

Ficam fora do MVP: conexão bancária, leitura automática de extrato, cartão, pagamentos, conciliação bancária, orçamento avançado, anexos de comprovantes, chat, exportação contábil, recorrência automática de despesas e múltiplas moedas.

## Princípios de produto

1. **Manual e transparente:** nenhum fluxo pede senha bancária, número de conta ou acesso a instituição financeira.
2. **Offline-first:** a ação local é a fonte imediata da experiência; Internet é necessária apenas para autenticar pela primeira vez, sincronizar e aceitar convites remotos.
3. **Privacidade por família:** cada registro pertence a uma família e só pode ser lido por seus membros autorizados.
4. **Valores exatos:** dinheiro é persistido em centavos inteiros, nunca em `float`.
5. **Pouca fricção:** uma ação principal por tela, botões objetivos e textos em português do Brasil.
6. **Retenção ética:** sem notificações promocionais; lembretes e avisos devem ser controláveis pelo usuário.

## Convenções de código

- TypeScript em modo estrito, sem `any` implícito ou casts desnecessários.
- `camelCase` para variáveis, constantes, propriedades, funções, hooks e parâmetros.
- `PascalCase` para componentes React, tipos, interfaces, enums e classes.
- `UPPER_SNAKE_CASE` somente para constantes globais imutáveis quando a leitura realmente se beneficiar disso.
- Nomes de arquivos em `kebab-case` para módulos e componentes, mantendo a convenção de rotas exigida pelo Expo Router.
- Cada módulo terá uma responsabilidade clara; cálculos financeiros ficarão fora das telas.
- Validações e transformações terão funções nomeadas, evitando lógica complexa inline em JSX.
- ESLint e TypeScript serão gates obrigatórios antes de considerar o MVP verificável.

## Arquitetura proposta

### Cliente

- React Native com Expo e TypeScript;
- Expo Router para navegação baseada em arquivos;
- Zustand para estado de sessão e estado de interface pequeno;
- SQLite via `expo-sqlite` para dados estruturados e fila offline;
- SecureStore via `expo-secure-store` para tokens e segredos de autenticação;
- `@react-native-community/netinfo` para detectar conectividade;
- `expo-sharing`/`Share` para compartilhar o resumo usando o sistema, com WhatsApp como destino disponível quando instalado.

O domínio financeiro não dependerá de componentes de tela. Cálculos de divisão e saldo serão funções puras, testadas separadamente. Repositórios locais e remotos terão interfaces iguais, permitindo que a tela opere sobre a base local e que o sincronizador processe a fila sem duplicar regras.

### Backend e sincronização

O MVP usará Supabase como serviço remoto por reduzir código operacional no primeiro ciclo:

- Supabase Auth para autenticação;
- Postgres para famílias, membros, despesas, divisões, lembretes e convites;
- Row Level Security para restringir cada família aos seus membros;
- cliente Supabase no app somente com URL e chave pública anon, nunca com chave de serviço;
- sincronização explícita por família usando `updated_at`, `deleted_at` e `client_operation_id` idempotente.

O app ainda funcionará em modo offline depois de possuir uma sessão válida e dados locais. Operações locais recebem `pending` e entram em `sync_operations`; o sincronizador envia alterações quando a rede volta, marca-as como `synced` e atualiza os registros locais. Conflitos do MVP são resolvidos por última alteração válida por registro, sem tentar mesclar campos de uma mesma entidade.

## Navegação e telas

### Fluxo de entrada

1. **Boas-vindas:** explica que o controle é manual e não acessa bancos.
2. **Entrar/Criar conta:** e-mail e senha ou link mágico, conforme a capacidade configurada no backend.
3. **Criar ou entrar em família:** criar grupo ou aceitar convite.

### Navegação autenticada

#### Início

Exibe seletor de mês, total gasto no período, três maiores categorias, contas próximas e uma lista curta de saldos. A ação primária é “Adicionar despesa”. Estado sem dados mostra uma orientação curta, sem gráficos vazios.

#### Despesas

Lista cronológica agrupada por data com valor, categoria, pagador e participantes. Filtros compactos para mês, categoria e pessoa. Cada item abre detalhes para editar ou excluir.

#### Nova despesa / Editar despesa

Campos: descrição, valor em reais, categoria, data, quem pagou, participantes e regra de divisão. A validação aparece junto ao campo. O resumo inferior mostra “Você está registrando R$ X,XX” e “Cada pessoa deve R$ Y,YY” antes de salvar.

#### Detalhe da despesa

Mostra os dados do lançamento, a divisão individual, quem pagou e ações de editar/excluir. Ações destrutivas pedem confirmação.

#### Contas

Lista de lembretes por vencimento, com estados “Pendente”, “Vence hoje”, “Vencida” e “Concluída”. Criar lembrete pede título, vencimento, valor opcional e observação opcional. O MVP usa lembretes locais e sincronizados, sem recorrência automática.

#### Família

Mostra nome do grupo, membros e status de sincronização. Administrador pode convidar, copiar código/link, remover membro e iniciar exclusão da família. Membro comum pode ver membros e sair da família.

#### Configurações

Permite editar nome próprio, controlar lembretes, consultar privacidade, sair da conta e excluir todos os dados da família quando autorizado.

## Modelo de dados

### Entidades locais e remotas

```text
User
- id: UUID
- email: string
- display_name: string
- created_at: ISODate

Family
- id: UUID
- name: string
- owner_id: UUID
- created_at: ISODate
- updated_at: ISODate
- deleted_at: ISODate | null

FamilyMember
- id: UUID
- family_id: UUID
- user_id: UUID
- display_name: string
- role: "owner" | "member"
- status: "active" | "invited"
- joined_at: ISODate | null

Expense
- id: UUID
- family_id: UUID
- description: string
- amount_cents: integer > 0
- category: ExpenseCategory
- paid_by_member_id: UUID
- occurred_on: YYYY-MM-DD
- note: string | null
- created_by: UUID
- created_at: ISODate
- updated_at: ISODate
- deleted_at: ISODate | null

ExpenseShare
- id: UUID
- expense_id: UUID
- member_id: UUID
- amount_due_cents: integer >= 0

Reminder
- id: UUID
- family_id: UUID
- title: string
- amount_cents: integer | null
- due_on: YYYY-MM-DD
- note: string | null
- status: "pending" | "completed"
- created_by: UUID
- updated_at: ISODate
- deleted_at: ISODate | null

Invite
- id: UUID
- family_id: UUID
- token_hash: string
- created_by: UUID
- expires_at: ISODate
- accepted_by: UUID | null
- status: "pending" | "accepted" | "revoked"

SyncOperation
- id: UUID
- family_id: UUID
- entity: "family" | "member" | "expense" | "share" | "reminder"
- entity_id: UUID
- action: "upsert" | "delete"
- payload_json: string
- client_operation_id: UUID
- created_at: ISODate
- attempts: integer
- last_error: string | null
```

Categorias iniciais: `Moradia`, `Mercado`, `Contas`, `Transporte`, `Saúde`, `Educação`, `Lazer`, `Assinaturas` e `Outros`. Elas são fixas no MVP para manter a entrada rápida.

## Regras financeiras

### Divisão igual

Para `amount_cents = T` e `n` participantes, cada participante recebe `floor(T / n)`. Os centavos restantes são distribuídos, um por vez, na ordem dos participantes selecionados. A soma sempre é exatamente `T`.

### Divisão personalizada

O usuário informa o valor devido de cada participante. O lançamento só pode ser salvo quando todos os valores forem inteiros não negativos e a soma for exatamente igual a `amount_cents`.

### Saldos

Para cada membro:

```text
saldo = total_devido_em_despesas - total_pago_em_despesas
```

Saldo positivo significa “deve receber”; saldo negativo significa “deve pagar”. O resumo apresenta ambos em linguagem natural, com valores absolutos e o contexto correto.

### Exclusão

Excluir uma despesa ou lembrete usa tombstone (`deleted_at`) para sincronizar a remoção. Excluir a família exige confirmação digitando o nome do grupo, apaga os dados remotos autorizados e limpa o SQLite e o SecureStore da sessão no dispositivo.

## Convites e compartilhamento

O convite é um token aleatório de uso único, armazenado remotamente apenas como hash e com validade de 7 dias. O link/código não contém dados financeiros. O servidor valida expiração, status e limite de associação antes de adicionar o usuário à família.

O compartilhamento gera texto sem dados sensíveis além do resumo escolhido pelo usuário:

```text
Conta Família — resumo de setembro/2026
Total registrado: R$ 0,00

Por pessoa:
- Nome: deve R$ 0,00

Contas próximas:
- Nenhuma conta pendente
```

O usuário escolhe “Compartilhar resumo”; o sistema operacional abre a folha de compartilhamento e o WhatsApp aparece quando disponível. O app não automatiza mensagens nem acessa a conta do WhatsApp.

## Tratamento de erros

- Sem Internet: mostrar estado “Offline”; salvar ações locais normalmente.
- Falha de sincronização: manter operação na fila, informar “Aguardando sincronização” e permitir tentar novamente.
- Sessão expirada: preservar dados locais criptograficamente protegidos, pedir autenticação e só então sincronizar.
- Convite inválido/expirado: explicar o problema sem revelar se o token existiu.
- Divisão inconsistente: bloquear o salvamento e indicar a diferença restante em centavos.
- Exclusão: exigir confirmação dupla, executar limpeza local mesmo que a rede falhe e sinalizar exclusão remota pendente quando necessário.

## Critérios de aceitação

1. Usuário cria conta e cria uma família sem fornecer nenhuma credencial bancária.
2. Usuário cria ou aceita convite e visualiza somente a família da qual é membro.
3. Usuário registra despesa com descrição, valor, categoria, data, pagador e participantes.
4. Divisão igual e personalizada sempre fecham exatamente o valor total em centavos.
5. Início calcula total mensal, categorias, próximas contas e saldo por pessoa corretamente.
6. Usuário cria, conclui e exclui lembretes de vencimento.
7. Usuário consegue criar e editar registros sem Internet após autenticação inicial.
8. Alterações pendentes são sincronizadas quando a conexão retorna sem duplicar registros.
9. Resumo pode ser enviado pela folha de compartilhamento do sistema e pode ser direcionado ao WhatsApp.
10. Tokens ficam no armazenamento seguro; a chave de serviço do backend nunca é incluída no app.
11. Usuário autorizado consegue excluir todos os dados da família e o dispositivo deixa de exibir esses dados.
12. App roda em Android e iOS com interface em português do Brasil, valores em reais, estados vazios claros, suporte a tamanho de texto e sem botões sem ação.

## Verificação do MVP

- Testes unitários do domínio para divisão, arredondamento, saldo e formatação monetária.
- Testes de repositório para criação, edição, tombstone e fila offline.
- Testes de fluxo para criar família, registrar despesa, convidar, sincronizar e excluir.
- `npm run lint`, `npm test` e `npx expo export` como gate automatizado.
- Validação manual posterior em Android e iOS; export automatizado não substitui teste físico nos dois sistemas.
