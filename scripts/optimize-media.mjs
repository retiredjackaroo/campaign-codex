import fs from "node:fs/promises"
import path from "node:path"
import crypto from "node:crypto"
import sharp from "sharp"

const root = path.resolve(process.argv[2] || "public")
if (!["public", "preview-moonsea", "preview-dark-sun"].includes(path.basename(root))) {
  throw new Error("Only generated public/preview output directories may be optimized")
}
const cache = path.resolve(".campaign-cache/media")
await fs.mkdir(cache, { recursive: true })
const walk = async (d) =>
  (
    await Promise.all(
      (await fs.readdir(d, { withFileTypes: true })).map(async (e) => {
        const f = path.join(d, e.name)
        return e.isDirectory() ? walk(f) : e.isFile() ? [f] : []
      }),
    )
  ).flat()
const files = await walk(root)
const textFiles = files.filter((f) => /\.(html|css|js|json|xml)$/.test(f))
const texts = new Map(
  await Promise.all(textFiles.map(async (f) => [f, await fs.readFile(f, "utf8")])),
)
const images = files.filter(
  (f) => /\.(png|jpe?g|webp)$/i.test(f) && !path.relative(root, f).startsWith("static/"),
)
const configs = await fs.readFile("quartz.config.default.yaml", "utf8")
const base =
  "/" +
  new URL("https://" + configs.match(/baseUrl:\s*(\S+)/)[1]).pathname.replace(/^\/+|\/+$/g, "") +
  "/"
const resolveURL = (url, file) => {
  let u = url.replace(/&amp;/g, "&")
  try {
    u = decodeURIComponent(u)
  } catch {
    return null
  }
  if (/^(data:|mailto:|javascript:|#)/i.test(u)) return null
  if (/^https?:\/\//i.test(u)) {
    const parsed = new URL(u)
    if (parsed.host !== new URL("https://" + configs.match(/baseUrl:\s*(\S+)/)[1]).host) return null
    u = parsed.pathname
  }
  u = u.split(/[?#]/)[0]
  if (u.startsWith(base)) return u.slice(base.length)
  if (u.startsWith("/")) return u.slice(1)
  return path.relative(root, path.resolve(path.dirname(file), u))
}
const collectImageReferences = (documents) => {
  const referenced = new Set()
  const remember = (url, file) => {
    const rel = resolveURL(url, file)
    if (rel && /\.(?:png|jpe?g|webp)$/i.test(rel)) referenced.add(rel)
  }
  for (const [file, output] of documents) {
    for (const match of output.matchAll(/\b(?:src|href|poster|content)=(["'])(.*?)\1/gis)) {
      remember(match[2], file)
    }
    for (const match of output.matchAll(/\bsrcset=(["'])(.*?)\1/gis)) {
      for (const item of match[2].split(",")) remember(item.trim().split(/\s+/)[0], file)
    }
    for (const match of output.matchAll(/url\((["']?)(.*?)\1\)/g)) remember(match[2], file)
    if (/\.(json|js|xml)$/.test(file)) {
      for (const match of output.matchAll(
        /(["'])([^"'\s<>]*\.(?:png|jpe?g|webp)(?:\?[^"']*)?)\1/gi,
      )) {
        remember(match[2], file)
      }
    }
  }
  return referenced
}
const sourceReferences = collectImageReferences(texts)
const changes = []
// Lossless PNG derivatives retain every pixel. JPEGs and existing WebP stay as-is.
for (const file of images.filter(
  (f) => /\.png$/i.test(f) && sourceReferences.has(path.relative(root, f)),
)) {
  const input = await fs.readFile(file)
  if (input.length < 128 * 1024 || /(?:social-|og-image|icon|sigil)/i.test(path.basename(file)))
    continue
  const hash = crypto.createHash("sha256").update(input).digest("hex")
  const cached = path.join(cache, hash + ".webp")
  let output
  try {
    output = await fs.readFile(cached)
  } catch {
    output = await sharp(input).webp({ lossless: true, effort: 4 }).toBuffer()
    await fs.writeFile(cached, output)
  }
  if (output.length >= input.length * 0.95) continue
  const newName = path.basename(file, path.extname(file)) + "." + hash.slice(0, 12) + ".webp"
  const dest = path.join(path.dirname(file), newName)
  await fs.writeFile(dest, output)
  changes.push({
    old: path.relative(root, file),
    next: path.relative(root, dest),
    originalBytes: input.length,
    bytes: output.length,
    sha256: hash,
  })
}

const mappings = new Map(changes.map((c) => [c.old, c.next]))
// Resolve URLs relative to each actual output page, not by ambiguous image basename.
function rewrite(url, file) {
  const rel = resolveURL(url, file)
  if (!rel) return url
  const next = mappings.get(rel)
  if (!next) return url
  // An absolute base-path URL works for nested pages, JSON indexes and CSS alike.
  return (
    base + next.split("/").map(encodeURIComponent).join("/") + (url.match(/[?#].*$/)?.[0] || "")
  )
}
const finalTexts = new Map()
for (const [file, input] of texts) {
  let output = input.replace(
    /\b(src|href|poster|content)=(['"])(.*?)\2/gi,
    (m, a, q, u) => `${a}=${q}${rewrite(u, file)}${q}`,
  )
  output = output.replace(
    /\bsrcset=(['"])(.*?)\1/gi,
    (m, q, v) =>
      `srcset=${q}${v
        .split(",")
        .map((item) => {
          const match = item.trim().match(/^(\S+)(.*)$/)
          return match ? rewrite(match[1], file) + match[2] : item
        })
        .join(", ")}${q}`,
  )
  output = output.replace(/url\((['"]?)(.*?)\1\)/g, (m, q, u) => `url(${q}${rewrite(u, file)}${q})`)
  if (/\.(json|js|xml)$/.test(file)) {
    // Structured index/media URLs, including same-origin absolute URLs.
    output = output.replace(
      /(["'])([^"'\s<>]*\.(?:png|jpe?g|webp)(?:\?[^"']*)?)\1/gi,
      (m, q, u) => q + rewrite(u, file) + q,
    )
  }
  if (output !== input) await fs.writeFile(file, output)
  finalTexts.set(file, output)
}

const referenced = collectImageReferences(finalTexts)

// Generated output contains only assets the emitted site references. Master
// copies remain intact in content/, and hashes/mappings below make every prune auditable.
const pruned = []
for (const file of images) {
  const rel = path.relative(root, file)
  if (referenced.has(rel)) continue
  const input = await fs.readFile(file)
  pruned.push({
    path: rel,
    bytes: input.length,
    sha256: crypto.createHash("sha256").update(input).digest("hex"),
  })
  await fs.unlink(file)
}
for (const change of changes) {
  if (!referenced.has(change.next)) await fs.unlink(path.join(root, change.next))
}
const active = changes.filter((c) => referenced.has(c.next))
const prunedBytes = pruned.reduce((s, item) => s + item.bytes, 0)
const derivativeBytes = active.reduce((s, item) => s + item.bytes, 0)
let prunedCacheBytes = 0
if (path.basename(root) === "public") {
  const retainedCache = new Set(active.map((item) => item.sha256 + ".webp"))
  for (const entry of await fs.readdir(cache, { withFileTypes: true })) {
    if (!entry.isFile() || retainedCache.has(entry.name)) continue
    const target = path.join(cache, entry.name)
    prunedCacheBytes += (await fs.stat(target)).size
    await fs.unlink(target)
  }
}
await fs.mkdir(".campaign-cache", { recursive: true })
await fs.writeFile(
  ".campaign-cache/media-report.json",
  JSON.stringify(
    {
      lossless: true,
      sourceMastersPreserved: true,
      preservedLegacyURLs: false,
      optimized: active,
      pruned,
      referencedImageBytesBefore: active.reduce((s, c) => s + c.originalBytes, 0),
      referencedImageBytesAfter: active.reduce((s, c) => s + c.bytes, 0),
      prunedGeneratedBytes: prunedBytes,
      generatedDerivativeBytes: derivativeBytes,
      netGeneratedBytesRemoved: prunedBytes - derivativeBytes,
      prunedCacheBytes,
    },
    null,
    2,
  ) + "\n",
)
console.log(
  `Optimized ${active.length} referenced PNGs losslessly and pruned ${pruned.length} unreferenced/original generated copies; removed ${((prunedBytes - derivativeBytes) / 1048576).toFixed(1)} MiB net from the deploy projection. Source masters preserved.`,
)
