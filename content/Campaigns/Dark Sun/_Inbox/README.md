# \_Inbox

Drop raw session files here before starting a build. Claude will read from this folder, process the files, and write output directly into the vault.

## What to drop here each session

- **Discmeet transcript** (exported from Discmeet, any format)
- **Roll20 chat log** (exported as HTML from Roll20 game settings, then either raw or pre-extracted)
- **Session notes** (if your DM provides structured notes)
- **In-character journal** (if you write one after the session)

## How to trigger a build

Open a new Claude conversation, attach or paste the build prompt from `_Inbox/Build Prompt.md`, then paste or attach the raw files. Claude will read the existing vault via the Filesystem tool and write the new session directly in.

## File naming convention

Name dropped files clearly so Claude can identify them:

- `ep11-transcript.txt`
- `ep11-roll20.html`
- `ep11-notes.md`
- `ep11-journal.md`

## After the build

Delete or archive the raw files from this folder once the session is built. The processed output lives in `Sessions/`.
