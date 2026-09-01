import fs from "node:fs/promises"
import process from "node:process"
import { fileURLToPath } from "node:url"
import YAML from "yaml"

export const homepage = new URL("../content/index.md", import.meta.url)
export const sources = [
  new URL("../content/Campaigns/Moonsea/index.md", import.meta.url),
  new URL("../content/Campaigns/Dark Sun/index.md", import.meta.url),
  new URL(
    "../content/Campaigns/Moonsea/Sessions/Chapter 11/Pugs Side Quest/index.md",
    import.meta.url,
  ),
]
export const start = "<!-- continue-story:start -->"
export const end = "<!-- continue-story:end -->"
const requiredFields = ["label", "title", "summary", "card", "href", "ariaLabel", "imageAlt"]

export const escapeHtml = (value) =>
  String(value)
    .replaceAll("&", "&amp;")
    .replaceAll('"', "&quot;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")

export function parseCard(text, source = "campaign landing page") {
  const match = text.match(/^---\r?\n([\s\S]*?)\r?\n---/)
  if (!match) throw new Error(`Missing YAML frontmatter: ${source}`)
  const frontmatter = YAML.parse(match[1])
  const card = frontmatter?.continueStory
  if (!card || typeof card !== "object") {
    throw new Error(`Missing continueStory frontmatter: ${source}`)
  }
  const missing = requiredFields.filter(
    (field) => typeof card[field] !== "string" || card[field].trim() === "",
  )
  if (missing.length > 0) {
    throw new Error(`Missing continueStory.${missing.join(", continueStory.")} in ${source}`)
  }
  return Object.fromEntries(requiredFields.map((field) => [field, card[field]]))
}

export async function readCard(url) {
  return parseCard(await fs.readFile(url, "utf8"), fileURLToPath(url))
}

export function render(card) {
  return `    <a class="resume-card resume-card--${escapeHtml(card.card)}" href="${escapeHtml(card.href)}" aria-label="${escapeHtml(card.ariaLabel)}">
      <span class="resume-card__art" role="img" aria-label="${escapeHtml(card.imageAlt)}"></span>
      <span class="resume-card__body">
        <span class="resume-grid__campaign">${escapeHtml(card.label)}</span>
        <strong>${escapeHtml(card.title)}</strong>
        <span>${escapeHtml(card.summary)}</span>
      </span>
    </a>`
}

export function replaceCards(current, cards) {
  const replacement = `${start}\n${cards.map(render).join("\n")}\n${end}`
  const pattern = new RegExp(`${start}[\\s\\S]*?${end}`)
  if (!pattern.test(current)) {
    throw new Error("Continue-the-story markers are missing from content/index.md")
  }
  return current.replace(pattern, replacement)
}

export async function main(args = process.argv.slice(2)) {
  const cards = await Promise.all(sources.map(readCard))
  const current = await fs.readFile(homepage, "utf8")
  const updated = replaceCards(current, cards)

  if (args.includes("--check")) {
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
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) await main()
