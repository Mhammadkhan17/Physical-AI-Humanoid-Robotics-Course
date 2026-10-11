# CONTEXT.md

Domain terms for this project.

- **Ask AI** — feature: select textbook text, ask the chatbot about it.
- **selection** — `{text, chapterId, anchor}`; set and cleared atomically; dies by the chat-aware rule.
- **chapter context** — the `chapterId` riding with a selection; expires when its doc page unmounts.
