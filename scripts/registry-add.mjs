#!/usr/bin/env node
/**
 * Installe des composants du registre shadcn-cssinjs (StyleX + Base UI) dans src/,
 * avec leurs dépendances de registre, sans passer par le CLI shadcn.
 *
 * Usage : node scripts/registry-add.mjs button input label
 * Les dépendances npm listées sont affichées à la fin (à installer avec pnpm add).
 */
import { mkdir, readFile, writeFile } from "node:fs/promises";
import { existsSync } from "node:fs";
import path from "node:path";

const REGISTRY = "https://www.shadcn-cssinjs.com/r";
const ROOT = path.resolve(new URL(".", import.meta.url).pathname, "..");

/** Cible du registre → chemin projet (aliases de components.json : src/). */
function targetPath(file) {
  const target = file.target ?? file.path.replace(/^registry\/bases\/stylex\//, "");
  return path.join(ROOT, "src", target);
}

async function fetchItem(name) {
  const res = await fetch(`${REGISTRY}/${name}.json`);
  if (!res.ok) throw new Error(`${name} : HTTP ${res.status}`);
  return res.json();
}

const wanted = process.argv.slice(2).filter((a) => !a.startsWith("--"));
if (wanted.length === 0) {
  console.error("Usage : node scripts/registry-add.mjs <composant> [...]");
  process.exit(1);
}

const installed = new Set();
const npmDeps = new Set();
const queue = [...wanted];

while (queue.length > 0) {
  const name = queue.shift();
  if (installed.has(name)) continue;
  installed.add(name);
  const item = await fetchItem(name);
  for (const dep of item.registryDependencies ?? []) queue.push(dep);
  for (const dep of item.dependencies ?? []) npmDeps.add(dep);
  for (const file of item.files ?? []) {
    const out = targetPath(file);
    if (existsSync(out) && !process.argv.includes("--force")) {
      const current = await readFile(out, "utf8");
      if (current === file.content) {
        console.log(`= ${path.relative(ROOT, out)} (identique)`);
        continue;
      }
      console.log(`! ${path.relative(ROOT, out)} existe et diffère — ignoré (utilisez --force)`);
      continue;
    }
    await mkdir(path.dirname(out), { recursive: true });
    await writeFile(out, file.content, "utf8");
    console.log(`+ ${path.relative(ROOT, out)}`);
  }
}

console.log(`\nComposants : ${[...installed].join(", ")}`);
console.log(`Dépendances npm requises : ${[...npmDeps].join(", ") || "aucune"}`);
