# AU IT Admissions Agent — Project README
## By Professor De León · Atlantis University

---

## What This Is

A knowledge base + system prompt architecture for an AI-powered admissions advisor for the Department of Information Technology at Atlantis University. The agent assists admissions representatives in real-time, giving them accurate program knowledge, prospect conversation frameworks, and bilingual (EN/ES) support.

---

## Project Structure

```
au_admissions_agent/
│
├── CLAUDE.md                         ← Master agent definition (load this in Claude Code)
│
├── skills/                           ← Admissions conversation layer
│   ├── 01_programs.md                ← Degrees, knowledge areas, courses, certifications (summary)
│   ├── 02_prospects.md               ← Prospect profiles, conversation scripts, objection handling
│   ├── 03_careers.md                 ← Job titles, salary ranges, career trajectories
│   ├── 04_ai_integration.md          ← Applied Gen AI curriculum and talking points
│   ├── 05_miami_market.md            ← Miami tech market, bilingual advantage, employers
│   └── 06_boundaries.md             ← What the agent doesn't know, routing guide
│
├── knowledge/                        ← Catalog-sourced institutional facts (authoritative)
│   ├── 01_accreditation_institution.md  ← ACCSC accreditation, campus info, official contacts
│   ├── 02_tuition_fees.md               ← Official 2026 tuition, fees, cost estimates
│   ├── 03_admissions_requirements.md    ← Exact admissions criteria from 2026 catalog
│   ├── 04_course_descriptions.md        ← Official course descriptions for all CIT courses
│   ├── 05_diploma_programs.md           ← NOP, ECP, ISP, CIT diploma programs + pricing
│   ├── 06_program_structures.md         ← Official credit hour tables for AS and BS IT
│   └── README.md                        ← How to add more local knowledge files
│
├── prompts/
│   └── system_prompt.md              ← API-ready system prompt + Python integration example
│
└── README.md                         ← This file
```

---

## Knowledge Layer — From the 2026 IT Catalog

The `knowledge/` folder now contains 6 files extracted directly from the official 2026 Atlantis University IT Catalog:

| File | What It Contains |
|---|---|
| `01_accreditation_institution.md` | ACCSC/CIE accreditation, campus address, official contacts, hours |
| `02_tuition_fees.md` | $450/credit undergrad tuition, all fees, total cost estimates for AS and BS |
| `03_admissions_requirements.md` | Exact admission criteria, document requirements, rolling admissions process |
| `04_course_descriptions.md` | Official descriptions for all 20+ CIT courses with certification prep targets |
| `05_diploma_programs.md` | NOP (4 mo/$8,840), ECP (6 mo/$13,260), ISP (4 mo/$13,260), CIT (14 mo/$28,000) |
| `06_program_structures.md` | Official credit hour tables, full course lists for AS (60 cr) and BS (123 cr) |

These files answer questions the `skills/` layer routes to institutional sources — now the agent can answer them accurately.

## How to Use with Claude Code Desktop

1. Open Claude Code in this project folder
2. Claude Code will automatically read `CLAUDE.md`
3. All skill files in `skills/` are available as context
4. Ask questions as if you're an admissions rep mid-call

**Example prompts for Claude Code:**
- "A prospect says they want to work with AI but don't know anything about IT. What do I say?"
- "Un prospecto me dice que no cree ser suficientemente inteligente para TI. Cómo lo manejo?"
- "What's the salary range for a cybersecurity graduate in Miami?"
- "A parent called asking about tuition. How do I handle that?"

---

## How to Use with the Anthropic API

1. Copy the system prompt from `prompts/system_prompt.md` (the block inside the code fence)
2. Use `claude-sonnet-4-20250514` as the model
3. Maintain conversation history for multi-turn sessions
4. Optionally inject all skill files as additional context before the first user message

See `prompts/system_prompt.md` for the full Python implementation example.

---

## How to Add Your Local Knowledge

Create markdown files in the `knowledge/` folder. Structure them clearly:

```markdown
# My Local Knowledge: [Topic]

## [Section]
[Your content]
```

Examples of useful local knowledge files:
- `knowledge/current_tuition.md` — current term pricing
- `knowledge/intake_schedule.md` — upcoming enrollment dates
- `knowledge/local_employer_contacts.md` — specific hiring contacts
- `knowledge/common_objections.md` — objections specific to your prospect pool
- `knowledge/financial_aid_programs.md` — current aid offerings

---

## Skill File Update Cadence

| File | Update when |
|---|---|
| `01_programs.md` | Course numbers change, new certifications added |
| `02_prospects.md` | New common objections emerge, scripts need refreshing |
| `03_careers.md` | Salary data updates (annually), new job titles emerge |
| `04_ai_integration.md` | New AI tools added to curriculum, new platforms emerge |
| `05_miami_market.md` | New major employers, market shifts |
| `06_boundaries.md` | Routing contacts change, new policy areas emerge |

---

## Design Principles

1. **Lead with the usable answer** — admissions reps are often mid-call
2. **Match language** — English in, English out; Spanish in, Spanish out
3. **Route don't guess** — anything about tuition, accreditation, or scheduling goes to a human
4. **Right fit over enrollment** — the agent recommends honestly, even if that means saying "this isn't the right program"
5. **Skills files are source of truth** — the agent should not answer outside what's in the skill files without flagging uncertainty

---

## Author

**Professor De León**
Faculty, Department of Information Technology
Atlantis University · Miami, FL
professordeleon.blog
