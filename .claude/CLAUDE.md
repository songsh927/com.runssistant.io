# Development Rules & Coding Style

## Core Philosophy: Simplicity First (KISS & DRY)
- **Do NOT over-engineer.** Write the simplest, most readable, and linear code that solves the problem.
- **STRICT BAN ON DESIGN PATTERNS UNLESS REQUESTED:**
  - **NEVER** implement Factory, Strategy, Builder, Adapter, or any other GOF Design Patterns on your own initiative.
  - Implement pattern-based solutions **ONLY** when the user explicitly instructs: *"Use [Pattern Name] pattern for this."*
- **Avoid premature abstraction.** Do not create custom generic wrappers, base abstract classes, or utility layers for code that isn't reused at least 3 times.
- **Prefer flat structure.** Avoid unnecessary interfaces, deep inheritance trees, or multi-layered indirection.

---

## Token Efficiency & Response Style
- **Be Concise:** Minimize preamble, postscript conversational fluff, and unrequested explanations.
- **Show, Don't Tell:** Jump straight to code modifications or file edits without summarizing what you are about to do unless asked.
- **No Unsolicited Code Reviews:** Focus strictly on answering the query or making the edit. Do not provide optional optimization suggestions, extra refactoring tips, or alternative approaches unless requested.
- **Brief Explanations:** If explanation is necessary, use short bullet points instead of long paragraphs.

---

## TypeScript Guidelines
- Keep types direct and simple. Avoid complex nested generics, conditional types, or intricate type utility chains.
- Prefer inline logic or plain functions over custom class abstractions.

---

## NestJS Best Practices
- **Stick to Standard Conventions:** Follow standard NestJS flow (`Controller` -> `Service` -> `Database/Repository`).
- **No Extra Layers:** Do not create abstract repositories, custom dynamic modules, or extra service wrapper layers unless explicitly requested.
- **Simple DTOs & Entities:** Keep DTOs and entities clean and straightforward using standard `class-validator` decorators without complex inheritance.

---

## Code Modification Rules
- **Minimal Touch:** Modify ONLY the code required for the task. Do not refactor surrounding untouched code.
- **No Speculative Code:** Do not add code or interfaces for "future extensibility" that was not asked for.
