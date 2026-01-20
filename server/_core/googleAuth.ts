import { COOKIE_NAME, ONE_YEAR_MS } from "@shared/const";
import type { Express, Request, Response } from "express";
import { OAuth2Client } from "google-auth-library";
import * as db from "../db";
import { ENV } from "./env";
import { getSessionCookieOptions } from "./cookies";
import { emailAuth } from "./emailAuth";

/**
 * Sistema de autenticação com Google OAuth
 */
export class GoogleAuth {
  private client: OAuth2Client | null = null;

  constructor() {
    if (ENV.googleClientId && ENV.googleClientSecret) {
      const redirectUri = ENV.googleRedirectUri || 
        `${process.env.BASE_URL || (ENV.isProduction ? "https://your-domain.com" : "http://localhost:3000")}/api/auth/google/callback`;
      
      this.client = new OAuth2Client(
        ENV.googleClientId,
        ENV.googleClientSecret,
        redirectUri
      );
      console.log("[GoogleAuth] Inicializado com sucesso");
      console.log("[GoogleAuth] Redirect URI:", redirectUri);
    } else {
      console.warn("[GoogleAuth] Google OAuth não configurado. Defina GOOGLE_CLIENT_ID e GOOGLE_CLIENT_SECRET");
    }
  }

  /**
   * Gera URL de autorização do Google
   */
  getAuthUrl(): string {
    if (!this.client) {
      throw new Error("Google OAuth não está configurado");
    }

    const scopes = [
      "https://www.googleapis.com/auth/userinfo.email",
      "https://www.googleapis.com/auth/userinfo.profile",
    ];

    return this.client.generateAuthUrl({
      access_type: "offline",
      scope: scopes,
      prompt: "consent",
    });
  }

  /**
   * Gera um openId único baseado no Google ID
   */
  private generateOpenIdFromGoogleId(googleId: string): string {
    return `google_${googleId}`;
  }

  /**
   * Processa o callback do Google OAuth
   */
  async handleCallback(req: Request, res: Response) {
    const code = req.query.code as string;

    if (!code) {
      res.status(400).json({ error: "Código de autorização não fornecido" });
      return;
    }

    if (!this.client) {
      res.status(500).json({ error: "Google OAuth não está configurado" });
      return;
    }

    try {
      // Troca o código por tokens
      const { tokens } = await this.client.getToken(code);
      if (!tokens.id_token) {
        throw new Error("ID token não recebido do Google");
      }

      // Verifica e decodifica o ID token
      const ticket = await this.client.verifyIdToken({
        idToken: tokens.id_token,
        audience: ENV.googleClientId,
      });

      const payload = ticket.getPayload();
      if (!payload) {
        throw new Error("Payload do token inválido");
      }

      const googleId = payload.sub;
      const email = payload.email;
      const name = payload.name || payload.given_name || "";
      const picture = payload.picture;

      if (!googleId || !email) {
        throw new Error("Google ID ou email não disponíveis");
      }

      const openId = this.generateOpenIdFromGoogleId(googleId);

      // Verifica se o usuário já existe
      let user = await db.getUserByOpenId(openId);

      if (!user) {
        // Verifica se já existe um usuário com este email
        const existingUserByEmail = await db.getUserByEmail(email);
        if (existingUserByEmail) {
          // Se existe, atualiza o openId para vincular ao Google
          await db.upsertUser({
            openId,
            email: email.toLowerCase(),
            name: name || existingUserByEmail.name,
            loginMethod: "google",
            lastSignedIn: new Date(),
          });
        } else {
          // Cria novo usuário
          await db.upsertUser({
            openId,
            email: email.toLowerCase(),
            name: name,
            loginMethod: "google",
            lastSignedIn: new Date(),
          });
        }
        user = await db.getUserByOpenId(openId);
      } else {
        // Atualiza informações do usuário existente
        await db.upsertUser({
          openId,
          email: email.toLowerCase(),
          name: name || user.name,
          loginMethod: "google",
          lastSignedIn: new Date(),
        });
        user = await db.getUserByOpenId(openId);
      }

      if (!user) {
        throw new Error("Falha ao criar/recuperar usuário");
      }

      // Cria o token de sessão usando o emailAuth (mesmo sistema de sessão)
      const sessionToken = await emailAuth.createSessionToken(openId, {
        name: user.name || "",
      });

      // Define o cookie
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, {
        ...cookieOptions,
        maxAge: ONE_YEAR_MS,
      });

      // Redireciona para a página inicial
      res.redirect(302, "/");
    } catch (error) {
      console.error("[GoogleAuth] Callback failed:", error);
      res.status(500).json({
        error: "Erro ao autenticar com Google",
        details: error instanceof Error ? error.message : String(error),
      });
    }
  }

  /**
   * Verifica se o Google OAuth está configurado
   */
  isConfigured(): boolean {
    return this.client !== null;
  }
}

export const googleAuth = new GoogleAuth();

/**
 * Registra as rotas do Google OAuth
 */
export function registerGoogleAuthRoutes(app: Express) {
  if (!googleAuth.isConfigured()) {
    console.warn("[GoogleAuth] Rotas não registradas - Google OAuth não configurado");
    return;
  }

  // Rota para iniciar o fluxo OAuth
  app.get("/api/auth/google", (req: Request, res: Response) => {
    try {
      const authUrl = googleAuth.getAuthUrl();
      res.redirect(302, authUrl);
    } catch (error) {
      console.error("[GoogleAuth] Failed to generate auth URL:", error);
      res.status(500).json({ error: "Erro ao iniciar autenticação Google" });
    }
  });

  // Rota de callback
  app.get("/api/auth/google/callback", (req: Request, res: Response) => {
    googleAuth.handleCallback(req, res);
  });

  console.log("[GoogleAuth] Rotas registradas: /api/auth/google e /api/auth/google/callback");
}
