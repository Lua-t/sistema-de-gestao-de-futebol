import express from "express";
import { createServer } from "http";
import { createServer as createViteServer } from "vite";
import { request as httpRequest } from "http";
import path from "path";

async function startServer() {
  const app = express();
  const httpServer = createServer(app);
  const PORT = 3000;

  app.use(express.json());

  // Proxy all /api/* requests to Django backend at port 8000
  app.use("/api", (req, res) => {
    const hasBody = ["POST", "PUT", "PATCH"].includes(req.method ?? "");
    const body = hasBody ? JSON.stringify(req.body) : "";

    const headers: Record<string, string | string[]> = {};
    for (const [key, value] of Object.entries(req.headers)) {
      if (value !== undefined) headers[key] = value as string | string[];
    }
    headers["host"] = "localhost:8000";
    if (hasBody) {
      headers["content-type"] = "application/json";
      headers["content-length"] = String(Buffer.byteLength(body));
    }

    const options = {
      hostname: "localhost",
      port: 8000,
      path: `/api${req.url}`,
      method: req.method,
      headers,
    };

    const proxyReq = httpRequest(options, (proxyRes) => {
      res.writeHead(proxyRes.statusCode ?? 502, proxyRes.headers as Record<string, string>);
      proxyRes.pipe(res, { end: true });
    });

    proxyReq.on("error", () => {
      if (!res.headersSent) {
        res.status(502).json({
          detail: "Django backend indisponível. Inicie o servidor: cd Back-end && python manage.py runserver",
        });
      }
    });

    if (hasBody) proxyReq.write(body);
    proxyReq.end();
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  httpServer.listen(PORT, "0.0.0.0", () => {
    console.log(`Front-end rodando em http://localhost:${PORT}`);
    console.log(`Proxying /api -> http://localhost:8000/api`);
  });
}

startServer().catch((err) => {
  console.error("Erro ao iniciar servidor:", err);
});
