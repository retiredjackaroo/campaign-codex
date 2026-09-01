import test from "node:test"
import assert from "node:assert/strict"
import { parseCard, render, replaceCards, start, end } from "./sync-continue-story.mjs"

const frontmatter = `---
continueStory:
  label: "Moonsea: Chapter 11"
  title: "A Noble & Necessary Sacrifice"
  summary: "Morwyn asks: who smells worse?"
  card: moonsea
  href: /campaign-codex/story
  ariaLabel: "Continue: the story"
  imageAlt: "Stone <and> ivy"
---
`

test("parses quoted YAML containing colons", () => {
  const card = parseCard(frontmatter)
  assert.equal(card.label, "Moonsea: Chapter 11")
  assert.equal(card.summary, "Morwyn asks: who smells worse?")
})

test("escapes generated card HTML", () => {
  const html = render(parseCard(frontmatter))
  assert.match(html, /A Noble &amp; Necessary Sacrifice/)
  assert.match(html, /Stone &lt;and&gt; ivy/)
})

test("replaces only the marked block", () => {
  const updated = replaceCards(`before\n${start}\nstale\n${end}\nafter`, [parseCard(frontmatter)])
  assert.match(updated, /^before/)
  assert.match(updated, /resume-card--moonsea/)
  assert.match(updated, /after$/)
})

test("requires all card fields", () => {
  assert.throws(
    () => parseCard("---\ncontinueStory:\n  label: Moonsea\n---\n"),
    /Missing continueStory/,
  )
})
