import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import cookieParser from "cookie-parser";
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cookieParser());

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

async function initializeApp() {
  const server = await registerRoutes(app);

  app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
    const status = err.status || err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    res.status(status).json({ message });
    throw err;
  });

  // Serve static files (built by esbuild)
  const { serveStatic } = await import("./static");
  serveStatic(app);

  return { app, server };
}

// Initialize the app
const initPromise = initializeApp();

// For local development
if (!process.env.VERCEL) {
  (async () => {
    const { server } = await initPromise;
    
    // Use environment variable for port, defaulting to 5001 for development
    const port = process.env.PORT ? parseInt(process.env.PORT) : 5001;
    server.listen({
      port,
      host: "0.0.0.0",
    }, () => {
      console.log(`serving on port ${port}`);
    });
  })();
}

// For Vercel deployment
let appPromise: Promise<any> | null = null;

export default async function handler(req: Request, res: Response) {
  try {
    if (!appPromise) {
      appPromise = initializeApp();
    }
    
    const { app } = await appPromise;
    
    // Use the Express app as middleware (it expects 3 parameters: req, res, next)
    app.handle(req, res, (err: any) => {
      if (err) {
        console.error('Express error:', err);
        res.status(500).json({ error: 'Request handling failed' });
      }
    });
  } catch (error) {
    console.error('Server handler error:', error);
    res.status(500).json({ error: 'Server initialization failed' });
  }
}
