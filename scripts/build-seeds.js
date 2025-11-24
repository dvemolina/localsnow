#!/usr/bin/env node
import { build } from "esbuild";
import path from "path";
import fs from "fs";

const inputDir = "src/lib/server/db/seeds/data";
const outDir = "build/seed-data";

// ensure output directory exists
fs.mkdirSync(outDir, { recursive: true });

// find all .ts files
const files = fs.readdirSync(inputDir).filter(f => f.endsWith(".ts"));

for (const file of files) {
  const inputFile = path.join(inputDir, file);
  const outFile = path.join(outDir, file.replace(".ts", ".js"));

  await build({
    entryPoints: [inputFile],
    outfile: outFile,
    bundle: true,
    format: "esm",
    platform: "node",
    target: "node18",
  });

  console.log(`✔️ built seed file: ${outFile}`);
}
