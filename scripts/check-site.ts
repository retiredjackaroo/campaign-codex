import { existsSync, readdirSync, readFileSync } from "node:fs"
import { extname, join, relative, resolve, sep } from "node:path"
import { fileURLToPath } from "node:url"

const defaultBasePath = "/campaign-codex/"

const htmlFiles = (directory: string): string[] =>
  readdirSync(directory, { withFileTypes: true }).flatMap((entry) => {
    const target = join(directory, entry.name)
    return entry.isDirectory()
      ? htmlFiles(target)
      : entry.isFile() && entry.name.endsWith(".html")
        ? [target]
        : []
  })

const documentPath = (root: string, file: string, basePath: string) => {
  const local = relative(root, file).split(sep).join("/")
  if (local === "index.html") return basePath
  if (local.endsWith("/index.html")) return `${basePath}${local.slice(0, -"index.html".length)}`
  return `${basePath}${local}`
}

const candidatesFor = (root: string, pathname: string, basePath: string) => {
  let decoded: string
  try {
    decoded = decodeURIComponent(pathname).slice(basePath.length)
  } catch {
    return []
  }
  const target = resolve(root, decoded)
  if (!target.startsWith(`${resolve(root)}${sep}`) && target !== resolve(root)) return []
  if (decoded === "" || decoded.endsWith("/")) return [join(target, "index.html")]
  if (extname(decoded)) return [target]
  return [target, `${target}.html`, join(target, "index.html")]
}

const isExternal = (reference: string) =>
  /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference) || reference.trim() === ""

const attributes = (tag: string) => {
  const result = new Map<string, string>()
  for (const match of tag.matchAll(/([:\w-]+)\s*=\s*(["'])(.*?)\2/gs)) {
    result.set(match[1].toLowerCase(), match[3])
  }
  return result
}

export function validateSite(root = "public", basePath = defaultBasePath) {
  const failures = new Set<string>()
  const warnings = new Set<string>()

  for (const file of htmlFiles(root)) {
    const label = relative(root, file).split(sep).join("/")
    const html = readFileSync(file, "utf8")
    const pageUrl = new URL(documentPath(root, file, basePath), "https://example.invalid")

    for (const tag of html.matchAll(/<(?:meta|link)\b[^>]*>/gi)) {
      const attrs = attributes(tag[0])
      const isCanonical = attrs.get("rel")?.toLowerCase() === "canonical"
      const socialProperty = (attrs.get("property") ?? attrs.get("name"))?.toLowerCase()
      if (!isCanonical && socialProperty !== "og:url" && socialProperty !== "twitter:url") continue
      const reference = attrs.get("href") ?? attrs.get("content")
      if (!reference) continue
      try {
        if (/\/index(?:\.html)?\/?$/.test(new URL(reference, pageUrl).pathname)) {
          failures.add(`${label}: /index canonical/social URL`)
        }
      } catch {
        failures.add(`${label}: invalid metadata URL ${reference}`)
      }
    }

    for (const match of html.matchAll(/\b(href|src)\s*=\s*(["'])(.*?)\2/gis)) {
      const attribute = match[1].toLowerCase()
      const reference = match[3].trim()
      if (isExternal(reference)) continue

      let targetUrl: URL
      try {
        targetUrl = new URL(reference, pageUrl)
      } catch {
        failures.add(`${label}: invalid reference ${reference}`)
        continue
      }

      if (targetUrl.origin !== pageUrl.origin) continue
      let decodedPath: string
      try {
        decodedPath = decodeURIComponent(targetUrl.pathname)
      } catch {
        failures.add(`${label}: invalid encoded reference ${reference}`)
        continue
      }
      if (/transcript/i.test(decodedPath)) failures.add(`${label}: transcript link ${reference}`)

      const siteRoot = basePath.endsWith("/") ? basePath.slice(0, -1) : basePath
      if (targetUrl.pathname !== siteRoot && !targetUrl.pathname.startsWith(basePath)) {
        failures.add(`${label}: internal reference escapes ${basePath}: ${reference}`)
        continue
      }
      if (targetUrl.pathname === siteRoot) targetUrl.pathname = basePath

      const candidates = candidatesFor(root, targetUrl.pathname, basePath)
      if (candidates.length === 0 || !candidates.some(existsSync)) {
        const message = `${label}: missing ${reference}`
        if (attribute === "src") failures.add(message)
        else warnings.add(message)
      }
    }
  }

  return { failures: [...failures].sort(), warnings: [...warnings].sort() }
}

export function runSiteCheck(root = "public", basePath = defaultBasePath) {
  if (!existsSync(root)) throw new Error(`Generated site directory does not exist: ${root}`)
  const { failures, warnings } = validateSite(root, basePath)
  if (warnings.length > 0) {
    console.warn(`Found ${warnings.length} unresolved page links (non-blocking):`)
    for (const warning of warnings) console.warn(`  ${warning}`)
  }
  if (failures.length > 0) throw new Error(failures.join("\n"))
  console.log(`Validated ${htmlFiles(root).length} public HTML files.`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runSiteCheck(process.argv[2] ?? "public", process.env.SITE_BASE_PATH ?? defaultBasePath)
}
