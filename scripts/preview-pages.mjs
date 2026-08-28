// GitHub Pages와 같은 하위 경로(/open-space-pass-tactics-board/)로 dist를 서빙하는
// 미니 정적 서버. E2E와 로컬 확인에 사용한다. 외부 의존성이 없다.
import { createServer } from "node:http";
import { readFile } from "node:fs/promises";
import { extname, join, normalize, sep } from "node:path";

const BASE = "/open-space-pass-tactics-board/";
const DIST = "dist";
const PORT = Number(process.argv[2] ?? 4173);

const TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".svg": "image/svg+xml",
  ".webp": "image/webp",
  ".png": "image/png",
  ".ico": "image/x-icon",
  ".json": "application/json; charset=utf-8",
};

function send(res, status, body, type) {
  res.writeHead(status, { "Content-Type": type ?? TYPES[".html"] ?? "text/html" });
  res.end(body);
}

async function sendFile(res, relativePath) {
  const cleaned = normalize(relativePath).split(sep).join("/");
  if (cleaned.startsWith("..")) return false;
  try {
    const body = await readFile(join(DIST, cleaned));
    send(res, 200, body, TYPES[extname(cleaned)] ?? "application/octet-stream");
    return true;
  } catch {
    return false;
  }
}

const server = createServer(async (req, res) => {
  const url = new URL(req.url ?? "/", `http://localhost:${PORT}`);
  const pathname = decodeURIComponent(url.pathname);

  if (pathname === "/" || pathname === BASE) {
    await sendFile(res, "index.html") || send(res, 404, "index.html 없음");
    return;
  }
  if (pathname.startsWith(BASE)) {
    const served = await sendFile(res, pathname.slice(BASE.length));
    if (served) return;
    if (extname(pathname) !== "") {
      send(res, 404, "자산을 찾을 수 없음");
      return;
    }
  }
  // SPA 폴백
  await sendFile(res, "index.html") || send(res, 404, "index.html 없음");
});

server.listen(PORT, "127.0.0.1", () => {
  console.log(`preview: http://127.0.0.1:${PORT}${BASE}`);
});
