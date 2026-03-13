// ActiveCampaign API Client v3

export class ActiveCampaignClient {
  private apiUrl: string;
  private apiKey: string;

  constructor(apiUrl?: string, apiKey?: string) {
    this.apiUrl = (apiUrl ?? process.env['AC_API_URL'] ?? '').replace(/\/$/, '');
    this.apiKey = apiKey ?? process.env['AC_API_KEY'] ?? '';

    if (!this.apiUrl) {
      throw new Error('AC_API_URL environment variable is required (e.g. https://youraccountname.api-us1.com/api/3)');
    }
    if (!this.apiKey) {
      throw new Error('AC_API_KEY environment variable is required');
    }
  }

  private get headers(): Record<string, string> {
    return {
      'Api-Token': this.apiKey,
      'Content-Type': 'application/json',
      'Accept': 'application/json',
    };
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(`${this.apiUrl}/${path}`);
    if (params) {
      for (const [key, value] of Object.entries(params)) {
        if (value !== undefined && value !== null && value !== '') {
          url.searchParams.set(key, String(value));
        }
      }
    }
    return url.toString();
  }

  async get<T = unknown>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<T> {
    const url = this.buildUrl(path, params);
    const res = await fetch(url, {
      method: 'GET',
      headers: this.headers,
    });
    return this.handleResponse<T>(res);
  }

  async post<T = unknown>(path: string, body: unknown): Promise<T> {
    const url = this.buildUrl(path);
    const res = await fetch(url, {
      method: 'POST',
      headers: this.headers,
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(res);
  }

  async put<T = unknown>(path: string, body: unknown): Promise<T> {
    const url = this.buildUrl(path);
    const res = await fetch(url, {
      method: 'PUT',
      headers: this.headers,
      body: JSON.stringify(body),
    });
    return this.handleResponse<T>(res);
  }

  async delete(path: string): Promise<void> {
    const url = this.buildUrl(path);
    const res = await fetch(url, {
      method: 'DELETE',
      headers: this.headers,
    });
    if (!res.ok && res.status !== 204) {
      const text = await res.text();
      let errorData: unknown;
      try { errorData = JSON.parse(text); } catch { errorData = text; }
      throw new Error(`ActiveCampaign API Error ${res.status}: ${JSON.stringify(errorData)}`);
    }
  }

  private async handleResponse<T>(res: Response): Promise<T> {
    const text = await res.text();
    let data: unknown;
    try {
      data = text ? JSON.parse(text) : null;
    } catch {
      data = text;
    }
    if (!res.ok) {
      throw new Error(`ActiveCampaign API Error ${res.status}: ${JSON.stringify(data)}`);
    }
    return data as T;
  }
}

let _client: ActiveCampaignClient | null = null;
export function getClient(): ActiveCampaignClient {
  if (!_client) {
    _client = new ActiveCampaignClient();
  }
  return _client;
}
