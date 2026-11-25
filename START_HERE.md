# CekDulu | Codex App starter package

Prepared 25 November 2026. Design first, deadline 10 December 2026.

## How to use

1. Create/open a dedicated local Git project folder in Codex App. Copy the contents of this package into its root (do not nest another repo). Do not overwrite existing project files blindly.
2. Copy user-selected screenshots/links into `docs/references/` (or attach them to the next Codex message). Keep private or licensed reference images out of a public repository unless permitted; use a local ignored folder instead or keep only a source link and observations.
3. In a new Codex thread, paste Prompt 01 from `CODEX_PROMPTS.md`. Codex must create its own `AGENTS.md` and `PLANS.md` before implementing anything. Review them. Start a new thread if needed to verify persistent instructions are discovered.
4. Optionally install a small set of trusted design tools after reviewing source, permissions and current docs. Use Prompt 02 once references are available. Choose visual direction and stack, then send Prompt 03. Only then use Prompt 04 and 05. Do not send Prompt 06 until design freeze.

## Files

- `PROJECT_BRIEF.md`: authoritative proposed product context, scope, constraints and academic requirements.
- `docs/DESIGN_BRIEF.md`: design-only requirements, screen inventory, scenarios and QA.
- `docs/API_RESEARCH.md`: copied prior API catalog (24 November 2026); historical research and implementation candidates, not verified access or live tests. Its older stack/timeline/priority assumptions are superseded by current PROJECT_BRIEF.md where inconsistent.
- `CODEX_PROMPTS.md`: phase-by-phase task prompts, with gates.
- `docs/references/README.md`: reference intake template.

No AGENTS.md, frontend/backend code, skill installation, paid account, or API credentials are included. The user wants Codex to create AGENTS.md using this context. Final branding and framework are deliberately unapproved. Original assignment PDF is not bundled; add it if accessible and verify course constraints.

## Recommended design tooling

- Impeccable: primary design workflow, product mode. Official docs: https://impeccable.style/docs/ ; source: https://github.com/pbakaus/impeccable . Review installer and any hooks before approving. Official docs show `npx impeccable install` or `npx skills add pbakaus/impeccable`; choose one installation method, not both. Codex invocation: `$impeccable init`, `$impeccable shape ...`, `$impeccable critique ...`, `$impeccable audit ...` (verify installed version). The agent may use its design files PRODUCT.md and DESIGN.md as canonical records. Do not assume init will choose approved aesthetic automatically.
- Mobbin: primary real product UI/UX research if paid account supports MCP. Official https://docs.mobbin.com/mcp/introduction and https://docs.mobbin.com/mcp/clients/overview . OAuth; MCP available on Pro, Team, Enterprise according to docs. Use official plugin/connector path; if unavailable, manually supply permitted screenshots, links or reference notes.
- Browser verification: use Codex built-in preview when available; optional official Microsoft Playwright MCP https://github.com/microsoft/playwright-mcp (review then configure locally). Do not use browser to open suspicious links or real malicious test objects.
- Context7: current library docs during implementation if needed. https://context7.com/docs/clients/codex . Not required for discovery. Avoid tool overload.
- Taste Skill: optional independent visual review or landing-page exploration after user-approved design; its app-screen mode is documented at https://www.tasteskill.dev/docs . Not the primary simultaneous design director. Review dependency/runtime requirements and avoid automatic random restyling. Use only if Impeccable + manual references aren't enough.
- Awwwards: optional web inspiration, not the primary reference for a functional security tool. No official Awwwards MCP was confirmed. A third-party example is https://github.com/slamsmart/Awwards-mcp (the README documents scraping public pages; review terms, source and permissions, and pin a reviewed version if used). Do not enable automatic updates or install a third-party scraper by default.

## Time limit

Target 25-27 November for discovery, design and mock prototype. Use a single approved visual direction, only 3-4 reusable layouts, and one UI framework. Freeze design before core Python integration. Backend work does not start in the first Codex task. Team can verify API access independently with benign data in parallel if desired.
