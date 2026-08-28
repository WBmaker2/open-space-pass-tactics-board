#!/usr/bin/env node
// src와 tests 아래의 TS·TSX·CSS 파일이 500줄 미만인지 검사한다.
// 500줄 이상인 파일이 있으면 경로와 줄 수를 출력하고 종료 코드 1로 실패한다.
import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, relative, sep } from "node:path";
import process from "node:process";

const ROOT = process.cwd();
const LIMIT = 500;
const EXTENSIONS = new Set([".ts", ".tsx", ".css"]);
const SCAN_DIRS = ["src", "tests"];

function listFiles(dir) {
  const found = [];
  let entries;
  try {
    entries = readdirSync(dir, { withFileTypes: true });
  } catch {
    return found;
  }
  for (const entry of entries) {
    const fullPath = join(dir, entry.name);
    if (entry.isDirectory()) {
      if (entry.name === "node_modules" || entry.name === "dist") continue;
      found.push(...listFiles(fullPath));
    } else if (entry.isFile() && EXTENSIONS.has(extname(entry.name))) {
      found.push(fullPath);
    }
  }
  return found;
}

function extname(name) {
  const dot = name.lastIndexOf(".");
  return dot === -1 ? "" : name.slice(dot);
}

const violations = [];
for (const dir of SCAN_DIRS) {
  for (const filePath of listFiles(join(ROOT, dir))) {
    const body = readFileSync(filePath, "utf8");
    const lines = body.split("\n").length - (body.endsWith("\n") || body.length === 0 ? 1 : 0);
    if (lines >= LIMIT) {
      violations.push({ path: relative(ROOT, filePath).split(sep).join("/"), lines });
    }
  }
}

if (violations.length > 0) {
  console.error("500줄 이상인 파일이 있습니다. 관련 화면·판정·보고서 단위로 분리하세요:");
  for (const violation of violations) {
    console.error(`  ${violation.path}: ${violation.lines}줄`);
  }
  process.exit(1);
}

console.log("모든 TS·TSX·CSS 파일이 500줄 미만입니다.");
