
# teller-cli

I built `teller-cli` as the simplest-possible CLI tool to fetch my bank balances and transaction data so that my AI agents can give me meaningful financial advice.

<p>
  <a href="https://github.com/codyhxyz/money/actions/workflows/ci.yml"><img alt="CI" src="https://img.shields.io/github/actions/workflow/status/codyhxyz/money/ci.yml?branch=main&label=CI&logo=github&style=flat-square"></a>
  <img alt="node" src="https://img.shields.io/badge/node-%E2%89%A5%2020-339933?logo=node.js&logoColor=white&style=flat-square">
  <a href="./LICENSE"><img alt="license" src="https://img.shields.io/github/license/codyhxyz/money.svg?style=flat-square"></a>
  <a href="https://github.com/codyhxyz/money"><img alt="last commit" src="https://img.shields.io/github/last-commit/codyhxyz/money?style=flat-square"></a>
</p>


## What this isn't

`teller-cli` is not a budgeting app. It is not a YNAB or Rocket Money replacement. It just prints transaction and balance data to the console. 
The design philosophy for this tool: keep the system as minimal as possible, with an eye for making it modular and extensible. AI agents can use this to do awesome stuff. 

## How you should use this
Send this repo's link to your AI! Empower them with your transaction data so they can give you accurate financial advice.

Better yet, remix this project for your own needs. Build your own financial assistant that does what YOU need it to. This is just a minimally-opinionated jumping off point. 

You could tell your AI:
- I want an app that tells me how much I have left to spend this month
- I want an app that builds me a budget
- Identify top ways I could be saving money
- Find subscriptions we can cut

## Why you should use this
You *could* just use the Teller API directly to fetch your bank data, I won't stop you. But this open-source repo handles all the following basics for you, making it much easier to set up your own personal financial advisor:
### Fewer papercuts
 - credential/env setup in one place
 - mTLS handled
 - safer error handling/redaction defaults
### Quality-of-life features
 - fetch account + balance + transactions in one call
 - date/window filtering
 - spending/income/net summaries
 - category/merchant rollups
 - human & AI-readable markdown output
 - optional JSON for scripts

## Getting Started

### Quickstart

If you are using an AI coding agent, point it at this README and say:

> Set up `github.com/codyhxyz/teller-cli` and give me my financial context for the last 90 days.

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

`teller-cli` is currently installed from source:

```sh
git clone https://github.com/codyhxyz/teller-cli.git
cd teller-cli
npm install
cp .env.example .env
```

Then fill in `.env` with your Teller credentials.

Keep `.env`, certificates, private keys, and tokens out of git. This repo already gitignores common credential paths and PEM/key/cert files.

## Usage

| Command | Output |
| --- | --- |
| `npm run teller-cli -- context` | AI-ready markdown summary of balances and recent transactions |
| `npm run teller-cli -- accounts` | Account and balance table |
| `npm run teller-cli -- transactions` | Recent transaction table |


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

This is a minimal, local wrapper around Teller. This doesn't touch your data—that's between you and Teller. 🤫


## Limitations

Current scope:

- Teller is the only data source.
- There is no scheduled sync or database.
- There is no frontend that would make all of this look pretty.
- There are no convenience features for transaction clustering.

## Extending this project

Two obvious directions you can take this project if you want to remix it:

1. Customize the tool with a nice frontend, and backend convenience features tailored for specific financial workflows:
   - budget creation
   - cash-flow review
   - spending analysis
   - subscription cleanup
   - financial planning

2. Add support for other banking data providers:
   - [Plaid](https://plaid.com/)
   - [Quiltt](https://www.quiltt.io/)
   - [MX](https://www.mx.com/)

Bonne chance!

## License

[AGPL-3.0-only](./LICENSE) © 2026 - meaning I've committed this work to the Public Domain. If you want to remix this work, this license stipulates you must commit that remix to the public domain, too. Sharing is caring!
