# Dark Sun Session Build Prompt

Copy and paste this at the start of a new Claude conversation each session, then attach or paste the raw files.

---

## Prompt

```
Campaign: Born Under a Dark Sun
Vault path: /Users/jamesrichardson/Documents/Obsidian Notes/Campaigns/Campaigns/Dark Sun/
Build guide: see attached Campaign_Wiki_Build_Guide.md (or reference our shared build guide)

Episode: <NUMBER>
Session title: <SHORT TITLE IF KNOWN>

Speaker map (Discmeet transcript):
- RetiredJackaroo = Derfel (James)
- Jaag/Derfel = Derfel (James) - "Durful" in transcripts is also Derfel, transcription error
- Soup (Tiz/Her) = Her
- Pug D'Astibar / Kit-Chac = Kit-Chac (Chris)
- Lavinia / Pterrance = Pterrence (Adrian)
- Petra/Anselem (Adam) = Anselem (Adam)
- Keithalas (Kei) Rogue / Salt = Salt (Dark Sun only - NOT Kei/Keithalas from Moonsea)
- erendor (Tchk'Tchk) = Tchk'Tchk Gulbadani
- sydb8100 = DM (Pete / Ereni Lokestar at the table)
- Daniel A. = unknown player; do not assign to a PC without confirmation

Speaker map (Roll20 chat):
- RetiredJackaroo = Derfel (James)
- Her = Her
- Kit-Chac (Chris) = Kit-Chac
- Pterrance (Adrian) = Pterrence
- Tchk'Tchk Gulbadani = Tchk'Tchk Gulbadani
- Brave = Brave (in-character dog messages)
- Daniel A. = unknown; treat as out-of-character table message

Known canonical names registry:
PCs:
- Derfel (Elf, Ranger 4, Beast Master) - player: James; "Durful" in transcripts = Derfel
- Her (Mul, mute) - do not refer to as "Kira"; alias Kira retained for link resolution only
- Pterrence (Pterran) - aliases: Terrence, Terra, Pterrance
- Kit-Chac (Thri-Kreen, Warrior of the Open Hand Monk) - aliases: Kit Chac, Kitchak, Kreen
- Tchk'Tchk Gulbadani (Thri-Kreen) - aliases: Tchk Tchk, Tchk'Tchk, Chick Chick
- Anselem (Fire Urokite) - aliases: Anselm; use "Urokite" not "genasi" in all wiki text
- Salt (Psion) - transcript label "Keithalas (Kei) Rogue / Salt" = Salt in Dark Sun ONLY; Salt passes as human in-character; the party does not know he is a Water Genasi; never refer to him as a Water Genasi or any non-human race in narrative, overview, or transcript text; use "human" or leave race unstated in all in-character documents
- Kei (Aasimar) - separate character from Salt; "Kei" is also alias for Keithalas in Moonsea

Companions:
- Brave (companion dog, current) - may send in-character Roll20 messages as "Brave: Woof"
- Maeve (companion dog, deceased Episode 10)
- Dave (companion dog, deceased)

Factions:
- The Alliance (also known as the Veiled Alliance) - one page, one entry, do not create separate pages

Instructions:
1. Read the existing vault using the Filesystem tool to check current entity pages and avoid duplicating them.
2. Pre-process the Roll20 HTML export if raw: strip mechanical content, extract typed messages and emotes only.
3. Clean the Discmeet transcript: normalise speakers using the speaker map above, remove filler, weave in Roll20 chat as italicised stage directions at the correct chronological points.
4. Build all session documents (Overview, Narrative, Notes, Journal if supplied, Transcript).
5. In the Narrative and Overview, ensure ALL party members are represented with their actions and contributions. Do not allow any PC to be absent from the narrative.
6. Create new entity pages for any characters, NPCs, locations, factions or items not already in the vault. Do not recreate existing pages.
7. Update existing entity pages where this session changes their status or adds to their relationships or notable moments.
8. Update Born Under a Dark Sun.md (home page) to include the new session and any new entities.
9. Write all output directly to the vault using the Filesystem tool. Do not zip.
10. Flag any uncertain entity merges, NPC name conflicts between transcript and Roll20 chat, and any cross-campaign name collisions with the Moonsea campaign.
11. Never refer to Her as "Kira" in any body text. The alias exists only so that any legacy [[Kira]] links resolve correctly.
12. When character notes are pasted directly from a player, transcribe them accurately and do not infer beyond what is written.
13. "Kei" in Dark Sun is a separate character from Keithalas/Kei in Moonsea. Never link across campaigns.
14. "Durful" appearing in transcripts is always Derfel — transcription error, not a separate character.
15. Salt passes as human in-character. Never reveal his Water Genasi nature in any in-character document regardless of what the transcript contains.

Attached files:
- <list files>
```

---

## Notes

- Always state the episode number so session files sort correctly.
- If you do not have a Roll20 export for a session, note that in the prompt so Claude does not wait for it.
- Update the canonical names registry above each session as new entities are confirmed.
- Salt and Kei are distinct Dark Sun characters despite sharing a Discmeet speaker label. Salt is the psion; Kei is the Aasimar.
- Salt's Water Genasi nature is an in-character secret. His character page reflects OOC knowledge only. All session documents treat him as human.
- The Alliance and The Veiled Alliance are the same faction. One page only.
- Brave may appear as a Roll20 chat speaker ("Brave: Woof") — this is in-character and should be rendered as an italicised stage direction in the transcript.
- Character notes pasted directly from players should be taken verbatim. Do not infer beyond what is written.
- Kei/Keithalas cross-campaign: Moonsea page canonical name is "Keithalas"; "Kei" is alias only. Dark Sun Kei resolves to Dark Sun/Characters/Kei.md.
