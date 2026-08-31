import { readdir, readFile, writeFile } from "node:fs/promises"
import { join } from "node:path"

const root = "content"
const normalize = (value) =>
  value
    .replace(/[*_`]/g, "")
    .replace(/[’‘]/g, "'")
    .replace(/[–—]/g, "-")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()

const walk = async (dir) => {
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name)
    if (entry.isDirectory()) await walk(file)
    else if (entry.name.endsWith(".md")) {
      const source = await readFile(file, "utf8")
      const match = source.match(/^(---\n[\s\S]*?\n---\n)([\s\S]*)$/)
      if (!match) continue
      const title = match[1]
        .match(/^title:\s*(?:"([^"]+)"|'([^']+)'|(.+))\s*$/m)
        ?.slice(1)
        .find(Boolean)
      const heading = match[2].match(/^(?:\n)*#\s+(.+?)\s*\n/)
      if (title && heading && normalize(title) === normalize(heading[1])) {
        await writeFile(file, `${match[1]}${match[2].replace(heading[0], "\n")}`)
        console.log(file)
      }
    }
  }
}

await walk(root)
