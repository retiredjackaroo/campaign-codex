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
  const decoded = decodeURIComponent(pathname).slice(basePath.length)
  const target = resolve(root, decoded)
  if (!target.startsWith(`${resolve(root)}${sep}`) && target !== resolve(root)) return []
  if (decoded === "" || decoded.endsWith("/")) return [join(target, "index.html")]
  if (extname(decoded)) return [target]
  return [target, `${target}.html`, join(target, "index.html")]
}

const isExternal = (reference: string) =>
  /^(?:[a-z][a-z\d+.-]*:|\/\/|#)/i.test(reference) || reference.trim() === ""

export function validateSite(root = "public", basePath = defaultBasePath): string[] {
  return validateSiteDetailed(root, basePath).failures
}

export function validateSiteDetailed(root = "public", basePath = defaultBasePath) {
  const failures = new Set<string>()
  const warnings = new Set<string>()
  const files = htmlFiles(root)

  for (const file of files) {
    const label = relative(root, file).split(sep).join("/")
    const html = readFileSync(file, "utf8")
    const pageUrl = new URL(documentPath(root, file, basePath), "https://example.invalid")

    if (
      /(?:rel=["']canonical["']|property=["']og:url["']|name=["']twitter:url["'])[^>]+(?:\/index)(?:[?#"'])/i.test(
        html,
      )
    ) {
      failures.add(`${label}: /index canonical/social URL`)
    }

    for (const match of html.matchAll(/\b(href|src)\s*=\s*["']([^"']+)["']/gi)) {
      const attribute = match[1].toLowerCase()
      const reference = match[2].trim()
      if (isExternal(reference)) continue

      let targetUrl: URL
      try {
        targetUrl = new URL(reference, pageUrl)
      } catch {
        failures.add(`${label}: invalid reference ${reference}`)
        continue
      }

      if (targetUrl.origin !== pageUrl.origin) continue
      if (/transcript/i.test(decodeURIComponent(targetUrl.pathname))) {
        failures.add(`${label}: transcript link ${reference}`)
      }
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
  const { failures, warnings } = validateSiteDetailed(root, basePath)
  const baselinePath = fileURLToPath(new URL("site-validation-baseline.json", import.meta.url))
  const baseline = new Set<string>(JSON.parse(readFileSync(baselinePath, "utf8")))
  const newFailures = failures.filter((failure) => !baseline.has(failure))
  const knownFailures = failures.length - newFailures.length
  if (warnings.length > 0) {
    console.warn(`Found ${warnings.length} unresolved legacy page links (non-blocking):`)
    for (const warning of warnings) console.warn(`  ${warning}`)
  }
  if (knownFailures > 0) {
    console.warn(`Allowed ${knownFailures} exact legacy image failures from the reviewed baseline.`)
  }
  if (newFailures.length > 0) throw new Error(newFailures.join("\n"))
  console.log(`Validated ${htmlFiles(root).length} public HTML files.`)
}

if (process.argv[1] && resolve(process.argv[1]) === fileURLToPath(import.meta.url)) {
  runSiteCheck(process.argv[2] ?? "public", process.env.SITE_BASE_PATH ?? defaultBasePath)
}
