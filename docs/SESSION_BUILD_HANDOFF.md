# Session Build Handoff

Add the following shared handoff to both campaign `_Inbox/Build Prompt.md` files. It complements their campaign-specific rules; it does not replace their speaker maps, registries, or current-situation blocks.

## Required prompt addition

After updating the relevant campaign or side-quest landing page:

1. Update that landing page's `continueStory` frontmatter. Derive a short title and one-sentence summary from the new current situation; do not invent developments beyond the session. Keep `card`, `href`, `ariaLabel`, and `imageAlt` unchanged unless the destination or artwork intentionally changes.
2. If this is a Pug side-quest session, also refresh the Side Quests summary on the main Moonsea landing page.
3. In the Campaign Codex repository, run `npm run sync:continue`. Do not hand-edit the generated block in the root `content/index.md`.
4. Run `npm run check:continue` and `npx quartz build`. Report failures; do not publish around them.
5. Report the files created, updated, archived, and left unresolved. Include unmatched or ambiguous images, missing art, broken links, and canonical-name conflicts.

## Required Inbox README addition

Extend each `_Inbox/README.md` “After the build” section with this checklist:

- Confirm the transcript is private (`publish: false`, `dg-publish: false`) and is not linked from public notes.
- Confirm the old Latest Session links and previous current NPC/location entries were moved to the matching append-only Archive.
- Confirm Hall of Fame received one new row and no earlier row changed.
- Confirm selected assets are canonical-name matched, campaign-local, and do not replace existing manual art.
- Confirm `continueStory` was updated and the root cards were regenerated and checked.
- Review the completion report before deleting or archiving the raw Inbox inputs.

## Differences found in the current Inbox files

- Dark Sun's prompt currently tells the Latest Session section to link the Transcript. This conflicts with Moonsea's explicit private-transcript rule and the site's ignore pattern. Dark Sun should adopt the same rule: transcripts always use `publish: false` and `dg-publish: false`, are retained only as private source records, and are never linked from a public page.
- Dark Sun imagery is already scoped to entities touched in the current session. Moonsea currently says to report every vault page with no Roll20 art; narrow that report to pages created or touched in the current session so routine builds remain bounded.
- Neither prompt currently updates the site-wide Continue the story cards. The required prompt addition above closes that gap for both campaigns and for Pug's independent story stream.
- Both Inbox READMEs stop at deleting or archiving raw inputs. Add the verification checklist above before cleanup.
