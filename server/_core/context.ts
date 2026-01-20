import type { CreateExpressContextOptions } from "@trpc/server/adapters/express";
import type { User } from "../../drizzle/schema";
import { ENV } from "./env";
import { localAuth } from "./localAuth";
import { emailAuth } from "./emailAuth";
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
    // Tenta diferentes métodos de autenticação em ordem
    // 1. OAuth (Manus) se estiver configurado
    if (ENV.oAuthServerUrl) {
      try {
        user = await sdk.authenticateRequest(opts.req);
        if (user) return { req: opts.req, res: opts.res, user };
      } catch (oauthError) {
        // Continua para outros métodos
      }
    }

    // 2. Autenticação por email/senha
    try {
      user = await emailAuth.authenticateRequest(opts.req);
      if (user) return { req: opts.req, res: opts.res, user };
    } catch (emailError) {
      // Continua para outros métodos
    }

    // 3. Autenticação local (fallback para desenvolvimento)
    try {
      user = await localAuth.authenticateRequest(opts.req);
      if (user) return { req: opts.req, res: opts.res, user };
    } catch (localError) {
      // Se todos falharem, user permanece null
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
