import test from "node:test"
import assert from "node:assert/strict"
import { resolveVersion, versionMetaTags } from "./version-og-urls.mjs"

test("prefers the explicit image version", async () => {
  assert.equal(
    await resolveVersion({ OG_IMAGE_VERSION: "release-7", GITHUB_SHA: "abcdef" }),
    "release-7",
  )
})

test("falls back to a short GitHub commit", async () => {
  assert.equal(await resolveVersion({ GITHUB_SHA: "1234567890abcdef" }), "1234567890ab")
})

test("replaces an existing cache version instead of accumulating parameters", () => {
  const source = '<meta property="og:image" content="https://example.test/image.webp?v=old">'
  const result = versionMetaTags(source, "new version")
  assert.equal(result.updatedTags, 1)
  assert.match(result.updated, /image\.webp\?v=new%20version/)
  assert.doesNotMatch(result.updated, /v=old/)
})
