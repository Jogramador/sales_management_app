import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { localAuth } from "./localAuth";
import { emailAuth } from "./emailAuth";
import { registerGoogleAuthRoutes } from "./googleAuth";
import { ENV } from "./env";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));

  // OAuth callback under /api/oauth/callback (apenas se OAuth estiver configurado)
  if (ENV.oAuthServerUrl) {
    registerOAuthRoutes(app);
  }

  // Google OAuth routes
  registerGoogleAuthRoutes(app);

  // Endpoint de login local sempre disponível (para desenvolvimento e fallback)
  app.post("/api/auth/local-login", (req, res) => {
    localAuth.handleLocalLogin(req, res);
  });
  console.log(
    "[LocalAuth] Endpoint de login local disponível em /api/auth/local-login"
  );

  // Endpoints de autenticação com email/senha
  app.post("/api/auth/register", (req, res) => {
    emailAuth.handleRegister(req, res);
  });
  app.post("/api/auth/login", (req, res) => {
    emailAuth.handleLogin(req, res);
  });
  console.log(
    "[EmailAuth] Endpoints disponíveis: /api/auth/register e /api/auth/login"
  );
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);

  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }

  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}

startServer().catch(console.error);
