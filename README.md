
# teller-cli

I built `teller-cli` as the simplest-possible CLI tool to fetch my bank balances and transaction data so that my AI agents can give me meaningful financial advice.

<p>
  <a href="https://github.com/codyhxyz/money/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/codyhxyz/money/ci.yml?branch=main&label=CI&logo=github&style=flat-square"></a>
  <img alt="node" src="https://img.shields.io/badge/node-%E2%89%A5%2020-339933?logo=node.js&logoColor=white&style=flat-square">
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/github/license/codyhxyz/money.svg?style=flat-square"></a>
  <a href="https://github.com/codyhxyz/money"><img alt="last commit" src="https://img.shields.io/github/last-commit/codyhxyz/money?style=flat-square"></a>
</p>


## What this isn't

`teller-cli` is not a budgeting app. It is not a YNAB or Rocket Money replacement. It just prints transaction and balance data to the console. It could, however, be used in such an application.

## Getting Started

### Quickstart

If you are using an AI coding agent, point it at this README and say:

> Set up `github.com/codyhxyz/money` and give me my financial context for the last 90 days.

Your agent can install dependencies and run commands, but only you should provide banking credentials:

1. Download your **Teller certificate + private key** from the Teller Dashboard.
2. Get an **access token** by linking your bank with Teller Connect. You can serve [`examples/login.html`](./examples/login.html) locally, connect in the browser, and copy the token into `.env`.

Redaction does **not** remove transaction amounts, dates, merchants, or categories. Review output before sharing it anywhere public.

### Prerequisites

You need:

- Node.js 20 or newer
- a [Teller](https://teller.io) account
- a Teller application certificate and private key
- a Teller access token for your linked bank account

### Installation

`money` is currently installed from source:

```sh
git clone https://github.com/codyhxyz/money.git
cd money
npm install
cp .env.example .env
```

Then fill in `.env` with your Teller credentials.

Keep `.env`, certificates, private keys, and tokens out of git. This repo already gitignores common credential paths and PEM/key/cert files.

## Usage

| Command | Output |
| --- | --- |
| `npm run money -- context` | AI-ready markdown summary of balances and recent transactions |
| `npm run money -- accounts` | Account and balance table |
| `npm run money -- transactions` | Recent transaction table |


## How It Works

```mermaid
flowchart LR
  A[".env credentials"] --> B["Teller API\nmTLS + Basic Auth"]
  B --> C["accounts / balances / transactions"]
  C --> D["local filtering + summaries"]
  D --> E["markdown · tables · JSON"]
  E --> F["AI conversation"]
```


## Security & Privacy

This is a minimal, local wrapper around Teller. I don't touch your data, that's between you and Teller.


## Limitations

Current scope:

- Teller is the only data source.
- There is no scheduled sync or database

## Extensions

Two obvious directions:

1. Extend the tool for specific financial uses:
   - budget creation
   - cash-flow review
   - spending analysis
   - subscription cleanup
   - financial planning

2. Add support for other banking data providers:
   - [Plaid](https://plaid.com/)
   - [Quiltt](https://www.quiltt.io/)
   - [MX](https://www.mx.com/)

Any of these providers could make sense. Teller is the default here because it works well for a minimalist developer tool: it is straightforward to set up, does not require waiting for approval before experimenting, and is friendly to someone building against their own financial data.


## License

[AGPL-3.0-only](./LICENSE) © 2026
