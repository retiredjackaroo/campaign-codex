# Campaign website maintenance

Preserve canonical vault notes and all pre-existing user edits. This repository is a public projection, never the private evidence store. Never copy transcripts, DM-private data, campaign registries, source manifests, \_Inbox or evidence directories into content. Campaign identities and images must not cross into other campaigns. The Show Must Go On has its own repository; stale copies in Campaign Codex are excluded from builds pending historical reconciliation.

Start with package.json and affected source paths. Exclude node_modules, .quartz, public, previews, source maps and emojimap from routine search. Run check:content for input privacy/hash inventory, and existing targeted tests while editing. Full release gates: npm run check, npm test, npm run build, npm run check:site. The build creates cached, lossless WebP delivery images and preserves original media URLs and source files. Read .campaign-cache/media-report.json for measured savings; do not dump full generated HTML into context.

Install dependencies only on an absent/invalid installation or a lockfile/Node change. npm run install-plugins uses Quartz's supported bootstrap command. Never run npm ci through a node_modules symlink; use an isolated install for release validation. Do not erase or overwrite another worktree's caches.

Campaign previews are local subsets only and cannot replace the full release build. Validate both campaigns when common code changes. Do not deploy a dirty checkout or unrelated user edits. Keep unmerged branches and raw assets recoverable. Old corrective specs are historical references, not mandatory context for every task.
