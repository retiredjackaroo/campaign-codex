import { readdir, readFile, writeFile } from "node:fs/promises"
import { join, resolve } from "node:path"
import { fileURLToPath } from "node:url"

const root = "content"
const normalize = (value) =>
  value
    .replace(/[*_`]/g, "")
    .replace(/[^\p{L}\p{N}]+/gu, " ")
    .replace(/\s+/g, " ")
    .trim()
    .toLowerCase()

export const removeDuplicateTitle = (source) => {
  const match = source.match(/^(---\n[\s\S]*?\n---\n)([\s\S]*)$/)
  if (!match) return null
  const title = match[1]
    .match(/^title:\s*(?:"([^"]+)"|'([^']+)'|(.+))\s*$/m)
    ?.slice(1)
    .find(Boolean)
  const heading = match[2].match(/^(?:\n)*#\s+(.+?)\s*\n/)
  if (!title || !heading || normalize(title) !== normalize(heading[1])) return null
  return `${match[1]}${match[2].replace(heading[0], "\n")}`
}

const walk = async (dir, write) => {
  let duplicates = 0
  for (const entry of await readdir(dir, { withFileTypes: true })) {
    const file = join(dir, entry.name)
    if (entry.isDirectory()) duplicates += await walk(file, write)
    else if (entry.name.endsWith(".md")) {
      const source = await readFile(file, "utf8")
      const updated = removeDuplicateTitle(source)
      if (updated !== null) {
        duplicates += 1
        if (write) await writeFile(file, updated)
        console.log(`${write ? "updated" : "would update"}: ${file}`)
      }
    }
  }
  return duplicates
}

export async function main(args = process.argv.slice(2)) {
  const write = args.includes("--write")
  const check = args.includes("--check")
  const target = args.find((arg) => !arg.startsWith("--")) ?? root
  const duplicates = await walk(target, write)
  console.log(`${duplicates} duplicate title heading${duplicates === 1 ? "" : "s"} found.`)
  if (check && duplicates > 0) process.exitCode = 1
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) await main()
