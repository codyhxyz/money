#!/usr/bin/env node
import { Command } from "commander";
import { isAxiosError } from "axios";
import { loadConfig, loadEnv } from "./config.js";
import { TellerClient } from "./teller.js";
import {
  accountRows,
  buildAiContext,
  filterTransactions,
  normalizeTransactions,
  redactAccountIds
} from "./presenter.js";
import type { AccountSnapshot, TransactionWithAccount } from "./types.js";

const program = new Command();

program
  .name("teller-ai")
  .description("Minimal Teller API wrapper for AI-ready personal finance context")
  .version("0.1.0")
  .option("--env <path>", "path to .env file", ".env");

program
  .command("accounts")
  .description("List Teller accounts and balances")
  .option("--json", "print raw JSON")
  .action(async options => {
    await run(async client => {
      const snapshots = await client.accountSnapshots();
      print(options.json ? snapshots : accountRows(snapshots));
    });
  });

program
  .command("transactions")
  .description("List recent transactions")
  .option("-d, --days <days>", "days to include", parsePositiveInt, 90)
  .option("-l, --limit <limit>", "max transactions to print", parsePositiveInt, 200)
  .option("-a, --account <id>", "account id to include; repeatable", collect, [])
  .option("--json", "print JSON instead of a table")
  .action(async options => {
    await run(async client => {
      const { snapshots, transactions } = await loadTransactions(client, options.account, options.days, options.limit);
      const rows = transactions.map(tx => ({
        date: tx.date,
        account: tx.account_name ?? tx.account_id,
        description: tx.description,
        category: tx.details?.category ?? "",
        counterparty: tx.details?.counterparty?.name ?? "",
        amount: tx.amount,
        status: tx.status ?? ""
      }));

      print(options.json ? { accounts: snapshots, transactions } : rows);
    });
  });

program
  .command("context", { isDefault: true })
  .description("Print markdown financial context for an AI conversation")
  .option("-d, --days <days>", "days to include", parsePositiveInt, 90)
  .option("-l, --limit <limit>", "max transactions to include", parsePositiveInt, 200)
  .option("-a, --account <id>", "account id to include; repeatable", collect, [])
  .option("--json", "print the underlying JSON")
  .option("--redact-accounts", "replace Teller account/enrollment ids in output")
  .action(async options => {
    await run(async client => {
      const loaded = await loadTransactions(client, options.account, options.days, options.limit);
      const output = options.redactAccounts ? redactAccountIds(loaded.snapshots, loaded.transactions) : loaded;
      print(options.json ? output : buildAiContext(output.snapshots, output.transactions, options.days), true);
    });
  });

program.parseAsync(process.argv).catch(handleError);

async function run(action: (client: TellerClient) => Promise<void>) {
  const globalOptions = program.opts<{ env: string }>();
  loadEnv(globalOptions.env);
  await action(new TellerClient(loadConfig()));
}

async function loadTransactions(
  client: TellerClient,
  accountIds: string[],
  days: number,
  limit: number
): Promise<{ snapshots: AccountSnapshot[]; transactions: TransactionWithAccount[] }> {
  const snapshots = await client.accountSnapshots(accountIds);
  const transactionsByAccount = await Promise.all(
    snapshots.map(async ({ account }) => ({
      accountId: account.id,
      transactions: await client.transactions(account.id, limit)
    }))
  );

  const transactions = filterTransactions(normalizeTransactions(snapshots, transactionsByAccount), days, limit);
  return { snapshots, transactions };
}

function print(value: unknown, rawString = false) {
  if (rawString && typeof value === "string") {
    console.log(value);
    return;
  }

  if (typeof value === "string") console.log(value);
  else if (Array.isArray(value)) console.table(value);
  else console.log(JSON.stringify(value, null, 2));
}

function collect(value: string, previous: string[]) {
  return [...previous, value];
}

function parsePositiveInt(value: string): number {
  const parsed = Number.parseInt(value, 10);
  if (!Number.isFinite(parsed) || parsed < 1) throw new Error(`Expected a positive integer, got ${value}`);
  return parsed;
}

function handleError(error: unknown) {
  if (isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.statusText || error.message;
    console.error(`Teller request failed${status ? ` (${status})` : ""}: ${message}`);
    process.exit(1);
  }

  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
