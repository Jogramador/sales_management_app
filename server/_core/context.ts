import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { ENV } from "./env";
import { localAuth } from "./localAuth";
import { sdk } from "./sdk";

export type TrpcContext = {
  req: CreateExpressContextOptions["req"];
  res: CreateExpressContextOptions["res"];
  user: User | null;
};

export async function createContext(
  opts: CreateExpressContextOptions
): Promise<TrpcContext> {
  let user: User | null = null;

  try {
    // Tenta OAuth primeiro se estiver configurado
    if (ENV.oAuthServerUrl) {
      try {
        user = await sdk.authenticateRequest(opts.req);
      } catch (oauthError) {
        // Se OAuth falhar, tenta autenticação local como fallback
        try {
          user = await localAuth.authenticateRequest(opts.req);
        } catch (localError) {
          // Se ambos falharem, user permanece null
          user = null;
        }
      }
    } else {
      // Se OAuth não estiver configurado, usa apenas autenticação local
      user = await localAuth.authenticateRequest(opts.req);
    }
  } catch (error) {
    // Authentication is optional for public procedures.
    user = null;
  }

  return {
    req: opts.req,
    res: opts.res,
    user,
  };
}
