const http = require("http");
const fs = require("fs");
const path = require("path");

const baseDir = path.resolve(__dirname, "../references");

const server = http.createServer((req, res) => {
  const filePath = path.join(baseDir, decodeURIComponent(req.url.replace(/^\//, "")));
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath).toLowerCase();
    const ct = ext === ".html" ? "text/html" : ext === ".png" ? "image/png" : ext === ".svg" ? "image/svg+xml" : "text/plain";
    res.writeHead(200, { "Content-Type": ct });
    fs.createReadStream(filePath).pipe(res);
  } else {
    res.writeHead(404);
    res.end("Not Found");
  }
});

server.listen(3333, () => {
  console.log("Static preview server listening on http://localhost:3333");
});
