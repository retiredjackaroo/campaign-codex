# _Inbox

Drop raw session files here before starting a build. Claude will read from this folder, process the files, and write output directly into the vault.

> Note: these two files (this README and `Build Prompt.md`) are meant to live in an `_Inbox` folder inside the Moonsea campaign, mirroring the Dark Sun setup. If they are currently sitting in the campaign root, create an `_Inbox` folder and move both in.

## What to drop here each session

- **Discmeet transcript** (exported from Discmeet, any format)
- **Roll20 chat log** (exported as HTML from Roll20 game settings, then either raw or pre-extracted)
- **Session notes** (if your DM provides structured notes)
- **In-character journal** ([[Jaag Nixon]]'s journal, if written after the session)

## How to trigger a build

Open a new Claude conversation, attach or paste the build prompt from `Build Prompt.md`, then paste or attach the raw files. Claude will read the existing vault via the Filesystem tool and write the new session directly in.

## File naming convention

Name dropped files clearly so Claude can identify them. Use the chapter/episode/session numbers:

- `ch11-ep1-s1-transcript.txt`
- `ch11-ep1-s1-roll20.html`
- `ch11-ep1-s1-notes.md`
- `ch11-ep1-jaag-journal.md`

## After the build

Delete or archive the raw files from this folder once the session is built. The processed output lives in `Sessions/Chapter <C>/Session <S>/`.
