import { spawnSync } from "node:child_process";

function run(command, args) {
  const result = process.platform === "win32"
    ? spawnSync(process.env.ComSpec ?? "cmd.exe", ["/d", "/s", "/c", [command, ...args].join(" ")], { stdio: "inherit" })
    : spawnSync(command, args, { stdio: "inherit" });
  if (result.status !== 0) process.exit(result.status ?? 1);
}

if (process.env.VERCEL_ENV === "production") {
  if (!process.env.DIRECT_URL?.trim() && process.env.DATABASE_URL?.trim()) {
    process.env.DIRECT_URL = process.env.DATABASE_URL;
  }
  run("npm", ["run", "db:migrate:deploy"]);
}

run("npm", ["run", "build"]);
