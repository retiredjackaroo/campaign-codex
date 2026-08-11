import fs from "node:fs/promises"
import process from "node:process"

const homepage = new URL("../content/index.md", import.meta.url)
const sources = [
  new URL("../content/Campaigns/Moonsea/index.md", import.meta.url),
  new URL("../content/Campaigns/Dark Sun/index.md", import.meta.url),
  new URL("../content/Campaigns/Moonsea/Sessions/Chapter 11/Pugs Side Quest/index.md", import.meta.url),
]
const start = "<!-- continue-story:start -->"
const end = "<!-- continue-story:end -->"

const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")

async function readCard(url) {
  const text = await fs.readFile(url, "utf8")
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) throw new Error(`Missing YAML frontmatter: ${url.pathname}`)
  const section = match[1].match(/^continueStory:\r?\n((?: {2}.+(?:\r?\n|$))+)/m)
  if (!section) throw new Error(`Missing continueStory frontmatter: ${url.pathname}`)
  const card = Object.fromEntries(
    section[1]
      .trimEnd()
      .split(/\r?\n/)
      .map((line) => {
        const field = line.trim().match(/^([^:]+):\s*(.*)$/)
        if (!field) throw new Error(`Invalid continueStory field in ${url.pathname}: ${line}`)
        return [field[1], field[2].replace(/^(["'])(.*)\1$/, "$2")]
      }),
  )
  const required = ["label", "title", "summary", "card", "href", "ariaLabel", "imageAlt"]
  const missing = required.filter((field) => !card?.[field])
  if (missing.length) throw new Error(`Missing continueStory.${missing.join(", continueStory.")} in ${url.pathname}`)
  return card
}

function render(card) {
  return `    <a class="resume-card resume-card--${escapeHtml(card.card)}" href="${escapeHtml(card.href)}" aria-label="${escapeHtml(card.ariaLabel)}">
      <span class="resume-card__art" role="img" aria-label="${escapeHtml(card.imageAlt)}"></span>
      <span class="resume-card__body">
        <span class="resume-grid__campaign">${escapeHtml(card.label)}</span>
        <strong>${escapeHtml(card.title)}</strong>
        <span>${escapeHtml(card.summary)}</span>
      </span>
    </a>`
}

const cards = await Promise.all(sources.map(readCard))
const current = await fs.readFile(homepage, "utf8")
const replacement = `${start}\n${cards.map(render).join("\n")}\n${end}`
const pattern = new RegExp(`${start}[\\s\\S]*?${end}`)
if (!pattern.test(current)) throw new Error("Continue-the-story markers are missing from content/index.md")
const updated = current.replace(pattern, replacement)

if (process.argv.includes("--check")) {
  if (updated !== current) {
    console.error("Continue the story is stale. Run: npm run sync:continue")
    process.exitCode = 1
  } else {
    console.log("Continue the story matches its campaign landing pages.")
  }
} else {
  await fs.writeFile(homepage, updated)
  console.log("Updated Continue the story from campaign landing pages.")
}
