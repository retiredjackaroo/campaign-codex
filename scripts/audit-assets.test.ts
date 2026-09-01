import { mkdtempSync, mkdirSync, writeFileSync } from "node:fs"
import { tmpdir } from "node:os"
import { join } from "node:path"
import test from "node:test"
import assert from "node:assert/strict"
import { findDuplicateAssets } from "./audit-assets.ts"

test("groups identical images without modifying them", () => {
  const root = mkdtempSync(join(tmpdir(), "campaign-codex-assets-"))
  mkdirSync(join(root, "nested"))
  writeFileSync(join(root, "one.png"), "same image")
  writeFileSync(join(root, "nested", "two.webp"), "same image")
  writeFileSync(join(root, "different.jpg"), "different image")
  writeFileSync(join(root, "ignored.txt"), "same image")

  const groups = findDuplicateAssets(root)
  assert.equal(groups.length, 1)
  assert.deepEqual(groups[0].files, ["nested/two.webp", "one.png"])
})
