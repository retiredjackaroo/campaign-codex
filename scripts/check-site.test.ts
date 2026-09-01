import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import assert from "node:assert/strict"
import { validateSite } from "./check-site.ts"

const fixture = (html: string, assets: string[] = []) => {
  const root = mkdtempSync(join(tmpdir(), "campaign-codex-check-site-"))
  const page = join(root, "sessions", "memory")
  mkdirSync(page, { recursive: true })
  writeFileSync(join(page, "index.html"), html)
  for (const asset of assets) {
    const target = join(root, asset)
    mkdirSync(join(target, ".."), { recursive: true })
    writeFileSync(target, "fixture")
  }
  return root
}

test("accepts valid relative links and images", () => {
  const root = fixture('<a href="../../index.html">Home</a><img src="memorial.webp">', [
    "sessions/memory/memorial.webp",
    "index.html",
  ])
  assert.deepEqual(validateSite(root), [])
})

test("reports a missing relative image", () => {
  const failures = validateSite(fixture('<img src="missing.webp">'))
  assert.match(failures.join("\n"), /missing missing\.webp/)
})

test("reports internal links that escape the configured base path", () => {
  const failures = validateSite(fixture('<a href="/Campaigns/Moonsea/">Broken</a>'))
  assert.match(failures.join("\n"), /internal reference escapes/)
})

test("reports transcript links", () => {
  const failures = validateSite(fixture('<a href="notes/Session Transcript.txt">Private</a>'))
  assert.match(failures.join("\n"), /transcript link/)
})

test("reports canonical and social URLs ending in index", () => {
  const root = fixture(
    '<link rel="canonical" href="https://example.com/campaign-codex/sessions/memory/index">',
  )
  assert.match(validateSite(root).join("\n"), /\/index canonical\/social URL/)
})
