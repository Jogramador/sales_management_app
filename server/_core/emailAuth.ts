import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Request, Response } from "express";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
import bcrypt from "bcrypt";
import type { User } from "../../drizzle/schema";
import * as db from "../db";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";
import { ForbiddenError } from "@shared/_core/errors";

const isNonEmptyString = (value: unknown): value is string =>
  typeof value === "string" && value.length > 0;

export type EmailSessionPayload = {
  openId: string;
  appId: string;
  name: string;
};

/**
 * Sistema de autenticação com email e senha
 */
export class EmailAuth {
  private getSessionSecret() {
    const secret = ENV.cookieSecret;
    if (!secret) {
      throw new Error("JWT_SECRET is required for email authentication");
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
  ): Promise<EmailSessionPayload | null> {
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

    const session = await this.verifySession(sessionCookie);

    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }

    const sessionUserId = session.openId;
    const signedInAt = new Date();
    let user = await db.getUserByOpenId(sessionUserId);

    if (!user) {
      throw ForbiddenError("User not found");
    }

    await db.upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt,
    });

    return user;
  }

  /**
   * Gera um openId único baseado no email
   */
  private generateOpenIdFromEmail(email: string): string {
    // Usa o email como base para o openId, garantindo unicidade
    return `email_${email.toLowerCase().trim()}`;
  }

  /**
   * Hash de senha
   */
  async hashPassword(password: string): Promise<string> {
    const saltRounds = 10;
    return bcrypt.hash(password, saltRounds);
  }

  /**
   * Verifica senha
   */
  async verifyPassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Endpoint de registro
   */
  async handleRegister(req: Request, res: Response) {
    const { email, password, name } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      res.status(400).json({ error: "Email é obrigatório" });
      return;
    }

    if (!password || typeof password !== "string" || password.length < 6) {
      res.status(400).json({ error: "Senha deve ter no mínimo 6 caracteres" });
      return;
    }

    if (!name || typeof name !== "string" || !name.trim()) {
      res.status(400).json({ error: "Nome é obrigatório" });
      return;
    }

    // Valida formato de email básico
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email.trim())) {
      res.status(400).json({ error: "Email inválido" });
      return;
    }

    try {
      const emailLower = email.toLowerCase().trim();
      const openId = this.generateOpenIdFromEmail(emailLower);

      // Verifica se o usuário já existe
      const existingUser = await db.getUserByEmail(emailLower);
      if (existingUser) {
        res.status(400).json({ error: "Email já cadastrado" });
        return;
      }

      // Hash da senha
      const passwordHash = await this.hashPassword(password);

      // Cria o usuário
      await db.upsertUser({
        openId,
        name: name.trim(),
        email: emailLower,
        passwordHash,
        loginMethod: "email",
        lastSignedIn: new Date(),
      });

      // Cria o token de sessão
      const sessionToken = await this.createSessionToken(openId, {
        name: name.trim(),
      });

      // Define o cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.json({ success: true, user: { openId, name: name.trim(), email: emailLower } });
    } catch (error) {
      console.error("[EmailAuth] Register failed:", error);
      res.status(500).json({
        error: "Erro ao criar conta",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Endpoint de login com email e senha
   */
  async handleLogin(req: Request, res: Response) {
    const { email, password } = req.body;

    if (!email || typeof email !== "string" || !email.trim()) {
      res.status(400).json({ error: "Email é obrigatório" });
      return;
    }

    if (!password || typeof password !== "string") {
      res.status(400).json({ error: "Senha é obrigatória" });
      return;
    }

    try {
      const emailLower = email.toLowerCase().trim();
      const user = await db.getUserByEmail(emailLower);

      if (!user) {
        res.status(401).json({ error: "Email ou senha incorretos" });
        return;
      }

      // Verifica se o usuário tem senha (login por email)
      if (!user.passwordHash) {
        res.status(401).json({ error: "Este email não possui senha cadastrada. Use outro método de login." });
        return;
      }

      // Verifica a senha
      const passwordValid = await this.verifyPassword(password, user.passwordHash);
      if (!passwordValid) {
        res.status(401).json({ error: "Email ou senha incorretos" });
        return;
      }

      // Atualiza último login
      await db.upsertUser({
        openId: user.openId,
        lastSignedIn: new Date(),
      });

      // Cria o token de sessão
      const sessionToken = await this.createSessionToken(user.openId, {
        name: user.name || "",
      });

      // Define o cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      res.json({
        success: true,
        user: {
          openId: user.openId,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("[EmailAuth] Login failed:", error);
      res.status(500).json({
        error: "Erro ao fazer login",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }
}

export const emailAuth = new EmailAuth();
