import type { AccountSnapshot, TellerTransaction, TransactionWithAccount } from "./types.js";

export function buildAiContext(snapshots: AccountSnapshot[], transactions: TransactionWithAccount[], days: number): string {
  const filtered = sortNewest(transactions);
  const spending = sum(filtered.filter(tx => amount(tx) < 0).map(tx => Math.abs(amount(tx))));
  const income = sum(filtered.filter(tx => amount(tx) > 0).map(amount));
  const net = income - spending;

  return [
    "# Financial context from Teller",
    "",
    `Generated: ${new Date().toISOString()}`,
    `Window: last ${days} days`,
    "",
    "## Account balances",
    accountTable(snapshots),
    "",
    "## Transaction summary",
    `- Income: ${money(income)}`,
    `- Spending: ${money(spending)}`,
    `- Net cash flow: ${money(net)}`,
    `- Transactions included: ${filtered.length}`,
    "",
    "## Top spending categories",
    groupTable(filtered, tx => tx.details?.category ?? "uncategorized", true),
    "",
    "## Top counterparties / merchants",
    groupTable(filtered, tx => tx.details?.counterparty?.name ?? tx.description ?? "unknown", true),
    "",
    "## Recent transactions",
    transactionTable(filtered.slice(0, 50)),
    "",
    "Use this as concrete context for financial coaching. Do not infer facts that are not present in the data."
  ].join("\n");
}

export function redactAccountIds(snapshots: AccountSnapshot[], transactions: TransactionWithAccount[]) {
  const accountLabels = new Map(snapshots.map((snapshot, index) => [snapshot.account.id, `account_${index + 1}`]));

  const redactedSnapshots = snapshots.map((snapshot, index) => ({
    ...snapshot,
    account: {
      ...snapshot.account,
      id: `account_${index + 1}`,
      enrollment_id: undefined
    }
  }));

  const redactedTransactions = transactions.map(tx => ({
    ...tx,
    account_id: accountLabels.get(tx.account_id) ?? "account_unknown"
  }));

  return { snapshots: redactedSnapshots, transactions: redactedTransactions };
}

export function filterTransactions(transactions: TransactionWithAccount[], days: number, limit: number): TransactionWithAccount[] {
  const cutoff = new Date();
  cutoff.setDate(cutoff.getDate() - days);

  return sortNewest(transactions)
    .filter(tx => new Date(tx.date) >= cutoff)
    .slice(0, limit);
}

export function normalizeTransactions(
  snapshots: AccountSnapshot[],
  transactionsByAccount: Array<{ accountId: string; transactions: TellerTransaction[] }>
): TransactionWithAccount[] {
  const accountById = new Map(snapshots.map(snapshot => [snapshot.account.id, snapshot.account]));

  return transactionsByAccount.flatMap(({ accountId, transactions }) => {
    const account = accountById.get(accountId);
    return transactions.map(tx => ({
      ...tx,
      account_name: account?.name,
      account_last_four: account?.last_four
    }));
  });
}

export function accountRows(snapshots: AccountSnapshot[]) {
  return snapshots.map(({ account, balance }) => ({
    name: account.name ?? "unknown",
    institution: account.institution?.name ?? "unknown",
    type: [account.type, account.subtype].filter(Boolean).join("/") || "unknown",
    last_four: account.last_four ?? "",
    available: balance?.available ?? "",
    ledger: balance?.ledger ?? "",
    currency: account.currency ?? ""
  }));
}

function accountTable(snapshots: AccountSnapshot[]): string {
  const rows = accountRows(snapshots).map(row => [
    row.name,
    row.institution,
    row.type,
    row.last_four,
    displayAmount(row.available),
    displayAmount(row.ledger),
    row.currency
  ]);

  return markdownTable(["Account", "Institution", "Type", "Last 4", "Available", "Ledger", "Currency"], rows);
}

function transactionTable(transactions: TransactionWithAccount[]): string {
  const rows = transactions.map(tx => [
    tx.date,
    tx.account_name ?? tx.account_id,
    tx.description,
    tx.details?.category ?? "",
    tx.details?.counterparty?.name ?? "",
    money(amount(tx)),
    tx.status ?? ""
  ]);

  return markdownTable(["Date", "Account", "Description", "Category", "Counterparty", "Amount", "Status"], rows);
}

function groupTable(transactions: TransactionWithAccount[], key: (tx: TransactionWithAccount) => string, spendingOnly = false): string {
  const totals = new Map<string, number>();

  for (const tx of transactions) {
    const value = amount(tx);
    if (spendingOnly && value >= 0) continue;
    totals.set(key(tx), (totals.get(key(tx)) ?? 0) + Math.abs(value));
  }

  const rows = [...totals.entries()]
    .sort((a, b) => b[1] - a[1])
    .slice(0, 10)
    .map(([name, total]) => [name, money(total)]);

  return markdownTable(["Name", "Total"], rows);
}

function markdownTable(headers: string[], rows: string[][]): string {
  if (rows.length === 0) return "_No data._";

  const escape = (value: unknown) => String(value ?? "").replaceAll("|", "\\|").replaceAll("\n", " ");
  return [
    `| ${headers.map(escape).join(" | ")} |`,
    `| ${headers.map(() => "---").join(" | ")} |`,
    ...rows.map(row => `| ${row.map(escape).join(" | ")} |`)
  ].join("\n");
}

function sortNewest<T extends { date: string }>(transactions: T[]): T[] {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date));
}

function amount(tx: { amount: string | number }): number {
  const value = Number(tx.amount);
  return Number.isFinite(value) ? value : 0;
}

function sum(values: number[]): number {
  return values.reduce((total, value) => total + value, 0);
}

function displayAmount(value: string | number | null | undefined): string {
  if (value === null || value === undefined || value === "") return "";
  return money(Number(value));
}

function money(value: number): string {
  return new Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(value);
}
