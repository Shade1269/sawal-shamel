import { readFile, mkdir, writeFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

async function main() {
  const manifestPath = resolve(__dirname, "../assets/models.manifest.json");
  const manifest = JSON.parse(await readFile(manifestPath, "utf8"));
  const outDir = resolve(__dirname, "..", manifest.outputsDir);
  await mkdir(outDir, { recursive: true });

  for (const item of manifest.files) {
    const b64Path = resolve(__dirname, "..", item.b64);
    const b64 = (await readFile(b64Path, "utf8")).trim();
    const buf = Buffer.from(b64, "base64");
    const outPath = resolve(outDir, item.out);
    await writeFile(outPath, buf);
    console.log("Wrote", outPath, "(", buf.length, "bytes )");
  }
}

main().catch((e) => {
  console.error("[decode_models] failed:", e);
  process.exit(1);
});
