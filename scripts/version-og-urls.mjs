import fs from "node:fs/promises"
import path from "node:path"
import process from "node:process"
import { execFile } from "node:child_process"
import { promisify } from "node:util"
import { fileURLToPath } from "node:url"

const execFileAsync = promisify(execFile)
const metaPattern =
  /(<meta\s+(?:property|name)="(?:og:image|og:image:url|twitter:image)"\s+content=")([^"]+)("\s*\/?>)/g

export async function resolveVersion(environment = process.env) {
  if (environment.OG_IMAGE_VERSION?.trim()) return environment.OG_IMAGE_VERSION.trim()
  if (environment.GITHUB_SHA?.trim()) return environment.GITHUB_SHA.trim().slice(0, 12)
  const { stdout } = await execFileAsync("git", ["rev-parse", "--short=12", "HEAD"])
  return stdout.trim()
}

export async function walk(directory) {
  const entries = await fs.readdir(directory, { withFileTypes: true })
  const files = []
  for (const entry of entries) {
    const target = path.join(directory, entry.name)
    if (entry.isDirectory()) files.push(...(await walk(target)))
    else if (entry.isFile() && entry.name.endsWith(".html")) files.push(target)
  }
  return files
}

export function versionMetaTags(source, version) {
  let updatedTags = 0
  const updated = source.replace(metaPattern, (match, before, url, after) => {
    const cleanUrl = url.replace(/(?:\?|&amp;)v=[^&"]+/, "")
    const separator = cleanUrl.includes("?") ? "&amp;" : "?"
    updatedTags += 1
    return `${before}${cleanUrl}${separator}v=${encodeURIComponent(version)}${after}`
  })
  return { updated, updatedTags }
}

export async function main(args = process.argv.slice(2)) {
  const outputDir = path.resolve(args[0] ?? "public")
  const version = await resolveVersion()
  let updatedFiles = 0
  let updatedTags = 0

  for (const file of await walk(outputDir)) {
    const source = await fs.readFile(file, "utf8")
    const result = versionMetaTags(source, version)
    updatedTags += result.updatedTags
    if (result.updated !== source) {
      await fs.writeFile(file, result.updated)
      updatedFiles += 1
    }
  }

  console.log(
    `Versioned ${updatedTags} Open Graph image tags across ${updatedFiles} HTML files with ${version}.`,
  )
}

if (process.argv[1] && path.resolve(process.argv[1]) === fileURLToPath(import.meta.url))
  await main()
