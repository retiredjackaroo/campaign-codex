# Campaign Codex

The published companion site for **The Team You've Definitely Heard Of**. It turns the Moonsea and Dark Sun Obsidian campaign vaults into a Quartz site while keeping raw transcripts private.

## Session publishing workflow

1. Put the raw transcript, Roll20 chat/export, notes, and optional journal in that campaign's `_Inbox`.
2. Run the campaign's `_Inbox/Build Prompt.md`. Its speaker map, canonical-name registry, current situation, and campaign-specific naming rules remain authoritative.
3. Review the generated session and entity notes. A transcript must have `publish: false` and `dg-publish: false` and must never be linked from published notes.
4. Update the campaign landing page and its matching `Archive.md` using the current-versus-append-only rules in the prompt.
5. Update the landing page's `continueStory` frontmatter and run `npm run sync:continue` from this repository.
6. Run the complete local verification sequence below before committing. A generated-site check is required because a successful Quartz build alone does not prove that linked images and pages exist.
7. Delete or archive the raw Inbox files only after the generated notes, assets, and rendered site have been checked.

Pug's Side Quest is an independent story stream for steps 4 and 5. Its landing page and Archive are under `Sessions/Chapter 11/Pugs Side Quest/`; a side-quest build must also refresh the Moonsea landing page's Side Quests summary.

## Continue the story

The three cards on the site homepage are generated from `continueStory` frontmatter on:

- `content/Campaigns/Moonsea/index.md`
- `content/Campaigns/Dark Sun/index.md`
- `content/Campaigns/Moonsea/Sessions/Chapter 11/Pugs Side Quest/index.md`

Do not hand-edit the generated block between `continue-story:start` and `continue-story:end` in `content/index.md`. GitHub Pages runs `npm run check:continue` and refuses to deploy stale cards.

## Assets

- Treat Roll20 exports as raw Inbox inputs; do not copy an entire export into `content/`.
- Match art only for entities created or materially touched in the session. A full back-catalogue pass is a separate task.
- Prefer an exact canonical-name match. Never guess an ambiguous match.
- Store selected art in the relevant campaign's `Assets/` folder with a filename matching the canonical note title.
- Never overwrite a manually placed image or add a second image to a note. Keep an alternative as an explicitly reported spare.
- Before committing, check for accidental duplicate or unusually large files with `git status --short`, `npm run audit:assets`, and `du -ah content/Campaigns/*/Assets | sort -h | tail`.
- `npm run audit:assets` is report-only. It never deletes duplicate art; consolidation requires a separate, reviewed task.

## Source-of-truth rules

- Campaign `_Inbox/Build Prompt.md`: speaker identity, lore, canonical names, document naming, and per-session processing.
- Campaign landing page: current situation and homepage card copy.
- Campaign or side-quest `Archive.md`: append-only history.
- This README and `docs/SESSION_BUILD_HANDOFF.md`: publishing contract shared by every campaign.
- `docs/CAMPAIGN_THEME.md`: visual-system maintenance.

## Local commands

Start from a clean checkout or a dedicated Git worktree. Never run an automated campaign build in a checkout containing unrelated campaign changes.

```bash
npm ci
npm run install-plugins
npm run sync:continue
npm run check:continue
npm run check:titles
npm run check
npm test
npm run build
npm run check:site
```

`npm run check:site` validates both absolute and relative internal links and images, blocks public transcript links, catches paths that escape `/campaign-codex/`, and rejects canonical/social URLs ending in `/index`. Missing page links from historical content are reported as non-blocking debt. Exact legacy broken-image references are recorded in `scripts/site-validation-baseline.json`; any new broken image fails the build.

Use `npm run build` rather than invoking Quartz directly. The repository contains enough content and image processing to exceed Node's default heap; the canonical script supplies the required memory limit consistently on developer machines and in CI.

Two GitHub Actions workflows are active:

- `.github/workflows/ci.yaml` runs the complete verification sequence for pull requests and manual checks.
- `.github/workflows/deploy.yml` repeats the same gates on `v5`, versions social-preview image URLs from the commit, and deploys to GitHub Pages only after every gate passes.

Do not bypass a failed gate or deploy from a dirty checkout. Fix the source or validator, rerun the full sequence, then review the generated page before pushing.

## Maintenance utilities

- `node scripts/remove-duplicate-titles.mjs` previews redundant opening headings, including punctuation-only differences such as `Title: Subtitle` versus `Title - Subtitle`. Add `--write` only after reviewing the list; `npm run check:titles` is the non-mutating deployment gate.
- `npm run audit:assets` reports byte-identical images and potential space savings without changing files.
- `OG_IMAGE_VERSION=<version> node scripts/version-og-urls.mjs public` explicitly versions generated social cards. In CI, the script uses `GITHUB_SHA`; locally it falls back to the current commit.
