import express, { type Express } from "express";
import fs from "fs";
import path from "path";

// Works in both ESM and CJS builds
const distPath = path.resolve(process.cwd(), "dist", "public");

export function serveStatic(app: Express) {
  if (!fs.existsSync(distPath)) {
    console.warn(
      `[Static] WARNING: Could not find the build directory: ${distPath}. ` +
      `If you are on a VPS, please run 'npm run build' to generate the client files.`
    );
    // Move on to catch-all which might serve a 404 or index.html error
  } else {
    app.use(express.static(distPath));
  }
 
  // catch-all route for SPA: serve index.html for non-API routes
  app.use((req, res, next) => {
    if (req.path.startsWith("/api")) {
      return res.status(404).json({ message: "API route not found" });
    }
    res.sendFile(path.resolve(distPath, "index.html"));
  });
}
