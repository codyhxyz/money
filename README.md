# teller-ai-wrapper

Minimal pnpm CLI/library wrapper around the Teller API that turns concrete account, balance, and transaction data into AI-ready financial context.

Use it inside any existing agent conversation by running:

```bash
pnpm teller context --days 90
```

Then paste the markdown output into the conversation.

## Entities

| Entity | Teller/API source | Purpose in this project |
| --- | --- | --- |
| User | person running the CLI | Owns credentials and decides what data to share. |
| Enrollment | Teller Connect enrollment/access token | Grants API access to linked institutions. Never printed. |
| Account | `GET /accounts` | Maps institution accounts and metadata. |
| Balance | `GET /accounts/:id/balances` | Adds current cash/debt position to context. |
| Transaction | `GET /accounts/:id/transactions` | Provides concrete income/spend history. |
| AI context | local markdown/JSON output | Portable summary for an agent/LLM conversation. |
| Secret material | access token, cert, private key | Loaded locally from `.env`; never committed or logged. |

## Approach

1. Load Teller credentials from `.env`.
2. Call Teller with mutual TLS plus Basic Auth.
3. Fetch accounts, balances, and recent transactions.
4. Locally filter/summarize by date window and limit.
5. Print either markdown context for an AI, tables for humans, or JSON for other tools.

No database, server, auth system, or background job is included. YAGNI.

## Structure

```text
.
├── src/
│   ├── cli.ts          # pnpm/CLI commands
│   ├── config.ts       # .env + certificate loading
│   ├── index.ts        # library exports
│   ├── presenter.ts    # markdown/tables/summaries
│   ├── teller.ts       # Teller API client
│   └── types.ts        # minimal Teller-shaped types
├── examples/
│   └── login.html      # Teller Connect token helper
├── .env.example        # safe config template
└── package.json
```

## Setup

```bash
pnpm install
cp .env.example .env
```

Fill in `.env`:

- `TELLER_ACCESS_TOKEN`
- either `TELLER_CERT_PATH` + `TELLER_KEY_PATH`
- or inline `TELLER_CERT` + `TELLER_KEY`

Teller certs/private keys should live outside git, for example in ignored `./certs/`.

## Commands

```bash
# AI-ready markdown context; default command
pnpm teller context --days 90 --limit 200

# Same as above because context is the default command
pnpm teller --days 90

# Tables
pnpm teller accounts
pnpm teller transactions --days 30

# JSON for another local tool/agent
pnpm teller context --json
pnpm teller transactions --json

# Include one or more accounts only
pnpm teller context --account acc_xxx --account acc_yyy

# Avoid printing Teller account/enrollment ids
pnpm teller context --redact-accounts
```

## Operations

Reviewable implementation tasks:

1. Package scaffold: `package.json`, TypeScript config, pnpm scripts.
2. Config loading: `.env`, cert/key path support, inline PEM support.
3. Teller client: accounts, balances, transactions.
4. Data shaping: attach account names to transactions, filter by days/limit.
5. AI output: markdown balances, cash-flow summary, top categories/merchants, recent transactions.
6. CLI UX: `accounts`, `transactions`, `context`, JSON/table modes.
7. Safeguards: ignored secret files, no credential logging, redaction option.

## Norms

- Minimalism first: no server, no persistence, no custom framework.
- YAGNI: only implement operations needed to fetch and summarize Teller data.
- DRY: one Teller client, one config loader, one formatter path.
- Prefer well-maintained one-liner libraries (`axios`, `commander`, `dotenv`) over handrolled equivalents.
- Keep output deterministic and easy to diff/review.
- Fail closed on missing credentials.

## Safeguards

- `.env`, `certs/`, and PEM/key/crt files are gitignored.
- Access tokens, certificates, and private keys are never printed.
- Axios errors are sanitized so request config/auth headers are not dumped.
- Use `--redact-accounts` before pasting output if you do not want Teller account ids shared.

## Development

```bash
pnpm typecheck
pnpm build
```

## License

MIT
