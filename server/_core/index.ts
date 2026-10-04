import "dotenv/config";
import express from "express";
import { createServer } from "http";
import { sql } from "drizzle-orm";
import { getDb } from "../db";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { registerStorageProxy } from "./storageProxy";
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
  app.get("/api/health", async (_req, res) => {
    try {
      const db = await getDb();
      if (!db) throw new Error("Database unavailable");
      await db.execute(sql`SELECT 1`);
      res.status(200).json({ status: "ok", database: "ok", service: "moallem-api", timestamp: new Date().toISOString() });
    } catch {
      res.status(503).json({ status: "degraded", database: "unavailable", service: "moallem-api", timestamp: new Date().toISOString() });
    }
  });
  app.get("/manus-routes.json", (_req, res) => {
    res.setHeader("Cache-Control", "public, max-age=300");
    res.json({ version: 1, routes: [
      { path: "/", visibility: "public" },
      { path: "/teachers", visibility: "public" },
      { path: "/teachers/:id", visibility: "public" },
      { path: "/auth", visibility: "public" },
      { path: "/onboarding", visibility: "private", roles: ["user", "student"] },
      { path: "/dashboard/:role", visibility: "private" },
      { path: "/student/profile", visibility: "private", roles: ["user", "student"] },
      { path: "/student/bookings", visibility: "private", roles: ["student"] },
      { path: "/student/favorites", visibility: "private", roles: ["student"] },
      { path: "/parent/children", visibility: "private", roles: ["parent"] },
      { path: "/parent/children/:studentId", visibility: "private", roles: ["parent"] },
      { path: "/teacher/register", visibility: "private", roles: ["user", "student", "teacher"] },
      { path: "/teacher/dashboard", visibility: "private", roles: ["teacher"] },
      { path: "/teacher/availability", visibility: "private", roles: ["teacher"] },
      { path: "/teacher/bookings", visibility: "private", roles: ["teacher"] },
      { path: "/admin", visibility: "private", roles: ["admin", "super_admin"] },
      { path: "/admin/students", visibility: "private", roles: ["admin", "super_admin"] },
      { path: "/admin/teachers", visibility: "private", roles: ["admin", "super_admin"] },
      { path: "/admin/parents", visibility: "private", roles: ["admin", "super_admin"] },
      { path: "/admin/bookings", visibility: "private", roles: ["admin", "super_admin"] },
    ] });
  });
  app.get("/robots.txt", (_req, res) => {
    res.type("text/plain").send("User-agent: *\nAllow: /\nDisallow: /dashboard/\nDisallow: /student/\nDisallow: /parent/\nDisallow: /teacher/\nDisallow: /admin/\nDisallow: /api/\nSitemap: https://moallemkt-bqminrab.manus.space/sitemap.xml\n");
  });
  app.get("/sitemap.xml", (_req, res) => {
    res.type("application/xml").send("<?xml version=\"1.0\" encoding=\"UTF-8\"?><urlset xmlns=\"http://www.sitemaps.org/schemas/sitemap/0.9\"><url><loc>https://moallemkt-bqminrab.manus.space/</loc></url><url><loc>https://moallemkt-bqminrab.manus.space/teachers</loc></url></urlset>");
  });
  // Upload bytes belong in object storage; API JSON/form payloads stay small.
  app.use(express.json({ limit: "1mb" }));
  app.use(express.urlencoded({ limit: "32kb", extended: false }));
  registerStorageProxy(app);
  registerOAuthRoutes(app);
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
