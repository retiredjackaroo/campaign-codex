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

test("treats punctuation-only title differences as duplicates", () => {
  const source =
    '---\ntitle: "Session 5: The Price of Memory"\n---\n# Session 5 - The Price of Memory\n\nStory.\n'
  assert.equal(
    removeDuplicateTitle(source),
    '---\ntitle: "Session 5: The Price of Memory"\n---\n\nStory.\n',
  )
})
