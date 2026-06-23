export type TellerInstitution = {
  id?: string;
  name?: string;
};

export type TellerAccount = {
  id: string;
  enrollment_id?: string;
  institution?: TellerInstitution;
  name?: string;
  type?: string;
  subtype?: string;
  currency?: string;
  last_four?: string;
  status?: string;
};

export type TellerBalance = {
  account_id?: string;
  available?: string | number | null;
  ledger?: string | number | null;
  links?: unknown;
};

export type TellerTransaction = {
  id: string;
  account_id: string;
  amount: string | number;
  date: string;
  description: string;
  status?: string;
  type?: string;
  running_balance?: string | number | null;
  details?: {
    category?: string | null;
    counterparty?: {
      name?: string | null;
      type?: string | null;
    } | null;
    processing_status?: string | null;
  } | null;
};

export type AccountSnapshot = {
  account: TellerAccount;
  balance: TellerBalance | null;
};

export type TransactionWithAccount = TellerTransaction & {
  account_name?: string;
  account_last_four?: string;
};

export type ContextOptions = {
  days: number;
  limit: number;
  accountIds?: string[];
  redactAccounts?: boolean;
};
