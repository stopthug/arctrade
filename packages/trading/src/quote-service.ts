import { QuoteExpiredError, TradingUnavailableError, type Quote, type QuoteRequest } from "@arctrade/types";
import type { TradingProvider } from "./providers/provider-interface.js";
import { feeService } from "./fees.js";

const QUOTE_PREFIX = "quote:";

interface QuoteCache {
  set(key: string, value: string, ...args: unknown[]): Promise<unknown>;
  get(key: string): Promise<string | null>;
}

export class QuoteService {
  constructor(
    private readonly provider: TradingProvider,
    private readonly redis: QuoteCache,
  ) {}

  async getQuote(request: QuoteRequest): Promise<Quote> {
    let quote: Quote;
    try {
      quote = await this.provider.getQuote(request);
    } catch (err) {
      if (err instanceof TradingUnavailableError) throw err;
      throw new TradingUnavailableError();
    }
    const bps = await feeService.getTradingFeeBps();
    quote = feeService.applyToQuote(quote, bps);
    const ttl = Math.max(5, Math.floor((Date.parse(quote.expiresAt) - Date.now()) / 1000));
    await this.redis.set(QUOTE_PREFIX + quote.quoteId, JSON.stringify(quote), "EX", ttl);
    return quote;
  }

  async getStored(quoteId: string): Promise<Quote> {
    const raw = await this.redis.get(QUOTE_PREFIX + quoteId);
    if (!raw) throw new QuoteExpiredError();
    const quote = JSON.parse(raw) as Quote;
    if (Date.parse(quote.expiresAt) <= Date.now()) {
      throw new QuoteExpiredError();
    }
    return quote;
  }
}
