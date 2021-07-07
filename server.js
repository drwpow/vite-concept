const fs = require("fs");
const path = require("path");
const http = require("http");
const { createServer } = require("vite");

const PORT = 8080;
const VITE_PORT = 1337;

async function startServer() {
  const vite = await createServer({
    logLevel: "error",
    root: path.join(__dirname, "src"),
    server: { port: VITE_PORT },
  });
  vite.listen();
  const viteSSR = await createServer({
    logLevel: "error",
    root: path.join(__dirname, "src"),
    server: { middlewareMode: "ssr" },
  });

  async function handleRequest(req, res) {
    // serve HTML
    if (req.url.endsWith("/")) {
      const html = await fs.promises.readFile(
        path.join(__dirname, "src", "index.html"),
        "utf8"
      );
      const { render } = await viteSSR.ssrLoadModule("/server.jsx");
      const ctx = {};
      const appHTML = render(req.url, ctx);
      if (ctx.url) return res.redirect(301, context.url); // handle redirect
      const body = html.replace(
        `<div id="app"></div>`,
        `<div id="app">${appHTML}</div>`
      );
      res.writeHead(200, { "Content-Type": "text/html" });
      res.end(body);
    }
    // everything else
    else {
      const viteReq = http.request(
        {
          host: "localhost",
          protocol: "http:",
          port: VITE_PORT,
          path: req.url,
          method: req.method,
          headers: req.headers,
        },
        (viteRes) => {
          if (viteRes.statusCode === 404) {
            res.writeHead(404, { "Content-Type": "text/html" });
            res.end(`Not found: "${req.url}"`);
            return;
          }
          res.writeHead(viteRes.statusCode || 200, viteRes.headers);
          viteRes.pipe(res, { end: true });
        }
      );
      req.pipe(viteReq, { end: true });
    }
  }

  http.createServer(handleRequest).listen(PORT);
  console.log(`Live at http://localhost:${PORT}`);

  return new Promise(() => {}); // never resolve
}

startServer();
