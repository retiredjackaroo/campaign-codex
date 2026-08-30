import { existsSync, readdirSync, readFileSync } from "node:fs"
import { join } from "node:path"

const root = "public"
const files = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name)
    return entry.isDirectory() ? files(path) : entry.name.endsWith(".html") ? [path] : []
  })
const failures: string[] = []
for (const file of files(root)) {
  const html = readFileSync(file, "utf8")
  if (/href=["'][^"']*Transcript/i.test(html)) failures.push(`${file}: transcript link`)
  if (/(?:canonical|og:url|twitter:url)[^>]+\/index(?:["'])/i.test(html))
    failures.push(`${file}: /index canonical/social URL`)
  for (const match of html.matchAll(/(?:href|src)=["'](\/campaign-codex\/[^"'#?]+)["']/g)) {
    const target = match[1].replace(/^\/campaign-codex\//, "").replace(/\/$/, "/index.html")
    if (!existsSync(join(root, target)) && !existsSync(join(root, `${target}.html`)))
      failures.push(`${file}: missing ${match[1]}`)
  }
}
if (failures.length) throw new Error(failures.join("\n"))
console.log(`Validated ${files(root).length} public HTML files.`)
