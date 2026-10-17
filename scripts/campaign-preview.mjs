import fs from "node:fs/promises"
import os from "node:os"
import path from "node:path"
import { spawnSync } from "node:child_process"

const names = { moonsea: "Moonsea", "dark-sun": "Dark Sun" }
const name = process.argv[2]
if (!names[name]) throw new Error("Usage: npm run preview:campaign -- moonsea|dark-sun")
// Isolated preview retains original campaign URL paths. Never deploy this subset.
const input = await fs.mkdtemp(path.join(os.tmpdir(), `campaign-preview-${name}-`))
const output = path.resolve("preview-" + name)
await fs.rm(input, { recursive: true, force: true })
await fs.mkdir(path.join(input, "Campaigns"), { recursive: true })
await fs.cp(
  path.join("content", "Campaigns", names[name]),
  path.join(input, "Campaigns", names[name]),
  { recursive: true },
)
// Root media is legacy support: include it in previews until every reference has migrated.
for (const item of await fs.readdir("content", { withFileTypes: true })) {
  if (item.isFile() && !item.name.endsWith(".md"))
    await fs.copyFile(path.join("content", item.name), path.join(input, item.name))
}
await fs.writeFile(
  path.join(input, "index.md"),
  `---\ntitle: ${names[name]} preview\n---\n\n[[Campaigns/${names[name]}/index|Open campaign]]\n`,
)
const run = (...args) => {
  const result = spawnSync(process.execPath, args, { stdio: "inherit" })
  if (result.status !== 0) throw new Error(`Preview command failed with status ${result.status}`)
}
try {
  run("quartz/bootstrap-cli.mjs", "build", "-d", input, "-o", output)
  run("scripts/optimize-media.mjs", output)
} finally {
  await fs.rm(input, { recursive: true, force: true })
}
console.log(
  `Local-only preview: ${output}. Full npm run build remains mandatory before publication.`,
)
