# Campaign Codex theme guide

The site keeps campaign content in `content/` and presentation in small Sass modules under `quartz/styles/campaign/`. Avoid editing Quartz core layout files for ordinary visual changes.

## Where things live

| What you want to change                  | File                                      |
| ---------------------------------------- | ----------------------------------------- |
| Homepage words, cards and destinations   | `content/index.md`                        |
| Shared colours, typography and mastheads | `quartz/styles/campaign/_foundation.scss` |
| Site crest, sidebar, search and Explorer | `quartz/styles/campaign/_navigation.scss` |
| Homepage cards and sections              | `quartz/styles/campaign/_homepage.scss`   |
| Tablet and mobile behavior               | `quartz/styles/campaign/_responsive.scss` |
| Crest artwork                            | `quartz/static/codex-crest.svg`           |
| Enabled Quartz features and site name    | `quartz.config.default.yaml`              |

`quartz/styles/custom.scss` is only the entry point that imports these modules. Keep it small.

## Common updates

### Change a homepage card

Edit the matching `<a>` block in `content/index.md`. Keep each card as one link, preserve its `aria-label`, and do not put blank lines inside the surrounding raw HTML `<section>`; Markdown may otherwise render part of the card as code.

### Change campaign artwork

Add the image to the campaign's `Assets` folder, then update the corresponding `background-image` rule in `_homepage.scss` or masthead variable in `_foundation.scss`. Quartz converts asset names to lowercase kebab-case URLs when publishing.

### Change the sidebar

Visual changes belong in `_navigation.scss`. The page title, toolbar and Explorer are Quartz components configured in `quartz.config.default.yaml`; style their stable classes rather than editing installed plugin code.

## Verification checklist

Before committing:

1. Run `git diff --check`.
2. Run `npm run check` when dependencies are installed.
3. Run `npx quartz build --serve`.
4. Check the homepage and both campaign homepages at 390px, 768px and 1440px widths.
5. Confirm keyboard focus is visible, the Explorer opens on mobile, tables scroll rather than squeeze, and artwork loads.
6. Keep unrelated Obsidian content or image changes out of the theme commit.
