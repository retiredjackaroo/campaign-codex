import test from "node:test"
import assert from "node:assert/strict"
import { removeDuplicateTitle } from "./remove-duplicate-titles.mjs"

test("removes only a heading that duplicates frontmatter title", () => {
  const source = '---\ntitle: "The Price of Memory"\n---\n# The Price of Memory\n\nStory.\n'
  assert.equal(removeDuplicateTitle(source), '---\ntitle: "The Price of Memory"\n---\n\nStory.\n')
})

test("leaves a distinct opening heading untouched", () => {
  const source = '---\ntitle: "Session Five"\n---\n# The Price of Memory\n'
  assert.equal(removeDuplicateTitle(source), null)
})
