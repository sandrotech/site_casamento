import { readdir, rm } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const dir = ".next";
if (!existsSync(dir)) process.exit(0);

const keep = new Set(["cache"]);

for (const entry of await readdir(dir)) {
    if (keep.has(entry)) continue;
    await rm(path.join(dir, entry), { recursive: true, force: true });
}
