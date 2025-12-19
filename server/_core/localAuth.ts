import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import { ForbiddenError } from "@shared/_core/errors";
import type { Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type LocalSessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

/**
 * Sistema de autenticação local para desenvolvimento/testes
 * Funciona sem OAuth quando OAUTH_SERVER_URL não está configurado
 */
export class LocalAuth {
  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    if (!secret) {
      throw new Error("JWT_SECRET is required for local authentication");
    }
    return new TextEncoder().encode(secret);
  }

  private parseCookies(cookieHeader: string | undefined): Map<string, string> {
    if (!cookieHeader) {
      return new Map<string, string>();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }

  async createSessionToken(
    openId: string,
    options: { expiresInMs?: number; name?: string } = {}
  ): Promise<string> {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1000);
    const secretKey = this.getSessionSecret();

    return new SignJWT({
      openId,
      appId: ENV.appId || "local-dev",
      name: options.name || "",
    })
      .setProtectedHeader({ alg: "HS256", typ: "JWT" })
      .setExpirationTime(expirationSeconds)
      .sign(secretKey);
  }

  async verifySession(
    cookieValue: string | undefined | null
  ): Promise<LocalSessionPayload | null> {
    if (!cookieValue) {
      return null;
    }

    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"],
      });
      const { openId, appId, name } = payload as Record<string, unknown>;

      if (
        !isNonEmptyString(openId) ||
        !isNonEmptyString(appId) ||
        !isNonEmptyString(name)
      ) {
        return null;
      }

      return { openId, appId, name };
    } catch (error) {
      return null;
    }
  }

  async authenticateRequest(req: Request): Promise<User> {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);

    console.log(
      "[LocalAuth] Verificando autenticação, cookie presente:",
      !!sessionCookie
    );

    const session = await this.verifySession(sessionCookie);

    if (!session) {
      console.log("[LocalAuth] Sessão inválida ou expirada");
      throw ForbiddenError("Invalid session cookie");
    }

    console.log("[LocalAuth] Sessão válida, openId:", session.openId);

    const sessionUserId = session.openId;
    const signedInAt = new Date();
    let user = await db.getUserByOpenId(sessionUserId);

    // Se o usuário não existe, cria um novo
    if (!user) {
      console.log(
        "[LocalAuth] Usuário não encontrado no banco, criando novo..."
      );
      await db.upsertUser({
        openId: sessionUserId,
        name: session.name || null,
        email: null,
        loginMethod: "local",
        lastSignedIn: signedInAt,
      });
      user = await db.getUserByOpenId(sessionUserId);
    }

    if (!user) {
      console.error("[LocalAuth] Falha ao criar/recuperar usuário");
      throw ForbiddenError("User not found");
    }

    console.log("[LocalAuth] Usuário autenticado:", user.name);

    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt,
    });

    return user;
  }

  /**
   * Endpoint de login local
   */
  async handleLocalLogin(req: Request, res: Response) {
    const { name } = req.body;

    if (!name || typeof name !== "string" || name.trim().length === 0) {
      res.status(400).json({ error: "Nome é obrigatório" });
      return;
    }

    try {
      // Cria um openId único baseado no nome (para desenvolvimento)
      // Usa hash do nome para manter consistência entre logins
      const nameHash = name.toLowerCase().replace(/\s+/g, "_");
      const openId = `local_${nameHash}`;

      console.log(
        "[LocalAuth] Tentando fazer login para:",
        name,
        "openId:",
        openId
      );

      // Cria ou atualiza o usuário
      await db.upsertUser({
        openId,
        name: name.trim(),
        email: null,
        loginMethod: "local",
        lastSignedIn: new Date(),
      });

      console.log("[LocalAuth] Usuário criado/atualizado no banco");

      // Cria o token de sessão
      const sessionToken = await this.createSessionToken(openId, {
        name: name.trim(),
      });

      console.log("[LocalAuth] Token de sessão criado");

      // Define o cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      console.log("[LocalAuth] Cookie definido, opções:", cookieOptions);

      res.json({ success: true, user: { openId, name: name.trim() } });
    } catch (error) {
      console.error("[LocalAuth] Login failed:", error);
      if (error instanceof Error) {
        console.error("[LocalAuth] Error details:", error.message, error.stack);
      }
      res.status(500).json({
        error: "Erro ao fazer login",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const localAuth = new LocalAuth();
