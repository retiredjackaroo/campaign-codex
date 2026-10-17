import fs from "node:fs"
import path from "node:path"
import crypto from "node:crypto"

const root = path.resolve(process.argv[2] || "content")
const walk = (d) =>
  fs
    .readdirSync(d, { withFileTypes: true })
    .flatMap((e) =>
      e.isDirectory() ? walk(path.join(d, e.name)) : e.isFile() ? [path.join(d, e.name)] : [],
    )
const files = walk(root)
const failures = []
const hashes = new Map()
const routes = new Map()
const manifests = []
for (const file of files) {
  const relative = path.relative(root, file)
  if (
    /(?:^|\/)(?:_Inbox|_Archive|_Discontinued|private|evidence|staging)(?:\/|$)|transcript/i.test(
      relative,
    )
  )
    failures.push(`Private/source material in public input: ${relative}`)
  const data = fs.readFileSync(file)
  const sha = crypto.createHash("sha256").update(data).digest("hex")
  const row = { path: relative, bytes: data.length, sha256: sha }
  manifests.push(row)
  if (!relative.endsWith(".md")) {
    const group = relative.startsWith("Campaigns/")
      ? relative.split("/").slice(0, 2).join("/")
      : "site"
    const key = group + ":" + sha
    hashes.set(key, [...(hashes.get(key) || []), relative])
  } else {
    const text = data.toString("utf8")
    if (/!?\[\[[^\]]*transcript[^\]]*\]\]|\]\([^)]*transcript[^)]*\)/i.test(text))
      failures.push(`Public transcript link: ${relative}`)
  }
  const route = relative.toLowerCase().replace(/ /g, "-")
  if (routes.has(route)) failures.push(`Case/slug collision: ${routes.get(route)} and ${relative}`)
  routes.set(route, relative)
}
fs.mkdirSync(".campaign-cache", { recursive: true })
const duplicates = [...hashes.values()].filter((g) => g.length > 1)
fs.writeFileSync(
  ".campaign-cache/content-manifest.json",
  JSON.stringify({ version: 1, files: manifests, duplicates }, null, 2) + "\n",
)
if (failures.length) {
  console.error(failures.join("\n"))
  process.exit(1)
}
console.log(
  `Checked ${files.length} content files; ${duplicates.length} duplicate asset groups recorded for reference-safe migration.`,
)
