import { createHash } from "node:crypto"
import { readFileSync, readdirSync, statSync } from "node:fs"
import { extname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const imageExtensions = new Set([".avif", ".gif", ".jpeg", ".jpg", ".png", ".svg", ".webp"])

export interface DuplicateAssetGroup {
  hash: string
  size: number
  files: string[]
}

const imageFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = join(directory, entry.name)
    if (entry.isDirectory()) return imageFiles(target)
    return entry.isFile() && imageExtensions.has(extname(entry.name).toLowerCase()) ? [target] : []
  })

export function findDuplicateAssets(root = "content"): DuplicateAssetGroup[] {
  const groups = new Map<string, DuplicateAssetGroup>()
  for (const file of imageFiles(root)) {
    const contents = readFileSync(file)
    const hash = createHash("sha256").update(contents).digest("hex")
    const size = statSync(file).size
    const key = `${size}:${hash}`
    const group = groups.get(key) ?? { hash, size, files: [] }
    group.files.push(relative(root, file).split(sep).join("/"))
    groups.set(key, group)
  }
  return [...groups.values()]
    .filter((group) => group.files.length > 1)
    .map((group) => ({ ...group, files: group.files.sort() }))
    .sort(
      (left, right) => right.size * (right.files.length - 1) - left.size * (left.files.length - 1),
    )
}

const formatBytes = (bytes: number) => {
  if (bytes < 1024) return `${bytes} B`
  const units = ["KiB", "MiB", "GiB"]
  let value = bytes
  let unit = -1
  do {
    value /= 1024
    unit += 1
  } while (value >= 1024 && unit < units.length - 1)
  return `${value.toFixed(1)} ${units[unit]}`
}

export function main(args = process.argv.slice(2)) {
  const root = resolve(args.find((arg) => !arg.startsWith("--")) ?? "content")
  const groups = findDuplicateAssets(root)
  const wastedBytes = groups.reduce((sum, group) => sum + group.size * (group.files.length - 1), 0)

  if (args.includes("--json")) {
    console.log(
      JSON.stringify({ root, duplicateGroups: groups.length, wastedBytes, groups }, null, 2),
    )
    return
  }

  console.log(
    `${groups.length} duplicate image groups; ${formatBytes(wastedBytes)} potentially recoverable.`,
  )
  for (const group of groups) {
    console.log(`\n${formatBytes(group.size)} × ${group.files.length}`)
    for (const file of group.files) console.log(`  ${file}`)
  }
  console.log("\nAudit only: no files were changed or deleted.")
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) main()
