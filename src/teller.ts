import https from "node:https";
import axios, { type AxiosInstance } from "axios";
import type { TellerConfig } from "./config.js";
import type { AccountSnapshot, TellerAccount, TellerBalance, TellerTransaction } from "./types.js";

export class TellerClient {
  private readonly http: AxiosInstance;

  constructor(config: TellerConfig) {
    this.http = axios.create({
      baseURL: config.baseUrl,
      auth: { username: config.accessToken, password: "" },
      httpsAgent: new https.Agent({ cert: config.cert, key: config.key }),
      headers: { "User-Agent": "money/0.1" },
      timeout: 30_000
    });
  }

  async accounts(): Promise<TellerAccount[]> {
    return this.get<TellerAccount[]>("/accounts");
  }

  async balances(accountId: string): Promise<TellerBalance> {
    return this.get<TellerBalance>(`/accounts/${encodeURIComponent(accountId)}/balances`);
  }

  async transactions(accountId: string, limit?: number): Promise<TellerTransaction[]> {
    const params = limit ? { count: limit } : undefined;
    return this.get<TellerTransaction[]>(`/accounts/${encodeURIComponent(accountId)}/transactions`, params);
  }

  async accountSnapshots(accountIds?: string[]): Promise<AccountSnapshot[]> {
    const accounts = (await this.accounts()).filter(account => !accountIds?.length || accountIds.includes(account.id));
    return Promise.all(
      accounts.map(async account => ({
        account,
        balance: await this.balances(account.id).catch(() => null)
      }))
    );
  }

  private async get<T>(url: string, params?: Record<string, unknown>): Promise<T> {
    const response = await this.http.get<T>(url, { params });
    return response.data;
  }
}
