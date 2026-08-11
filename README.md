# Campaign Codex

The published companion site for **The Team You've Definitely Heard Of**. It turns the Moonsea and Dark Sun Obsidian campaign vaults into a Quartz site while keeping raw transcripts private.

## Session publishing workflow

1. Put the raw transcript, Roll20 chat/export, notes, and optional journal in that campaign's `_Inbox`.
2. Run the campaign's `_Inbox/Build Prompt.md`. Its speaker map, canonical-name registry, current situation, and campaign-specific naming rules remain authoritative.
3. Review the generated session and entity notes. A transcript must have `publish: false` and `dg-publish: false` and must never be linked from published notes.
4. Update the campaign landing page and its matching `Archive.md` using the current-versus-append-only rules in the prompt.
5. Update the landing page's `continueStory` frontmatter and run `npm run sync:continue` from this repository.
6. Run `npm run check:continue` and `npx quartz build` before committing.
7. Delete or archive the raw Inbox files only after the generated notes and assets have been checked.

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
- Before committing, check for accidental duplicate or unusually large files with `git status --short` and `du -ah content/Campaigns/*/Assets | sort -h | tail`.

## Source-of-truth rules

- Campaign `_Inbox/Build Prompt.md`: speaker identity, lore, canonical names, document naming, and per-session processing.
- Campaign landing page: current situation and homepage card copy.
- Campaign or side-quest `Archive.md`: append-only history.
- This README and `docs/SESSION_BUILD_HANDOFF.md`: publishing contract shared by every campaign.
- `docs/CAMPAIGN_THEME.md`: visual-system maintenance.

## Local commands

```bash
npm ci
npm run sync:continue
npm run check:continue
npx quartz build
```

The site deploys from the `v5` branch through `.github/workflows/deploy.yml`.
