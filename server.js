const path = require("path");
const http = require("http");
const { createServer } = require("vite");

const PORT = 8080;
const VITE_PORT = 1337;

async function startServer() {
  const vite = await createServer({
    logLevel: "error",
    root: path.join(__dirname, "src"),
    server: {
      port: VITE_PORT,
    },
  });
  vite.listen();

  async function handleRequest(req, res) {
    const viteReq = http.request(
      {
        host: "localhost",
        protocol: "http:",
        port: VITE_PORT,
        path: req.url.endsWith("/") ? req.url + "index.html" : req.url,
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

  http.createServer(handleRequest).listen(PORT);
  console.log(`Live at http://localhost:${PORT}`);

  return new Promise(() => {}); // never resolve
}

startServer();
