# AI Task Workflow Guide

Panduan ini menjelaskan workflow praktis supaya model lain bisa menghasilkan output kerja yang konsisten, rapi, dan berguna di repo mana pun.

Tujuan panduan ini:
- menjaga kualitas teknis
- menjaga scope tetap sempit dan jelas
- membuat hasil kerja mudah direview
- membuat planning, implementation, review, dan merge terasa konsisten

---

## 1. Core Principles

Selalu pegang prinsip ini:

1. Understand before changing.  
Jangan langsung ngoding. Baca context dulu.

2. Narrow scope wins.  
Lebih baik satu perubahan kecil yang selesai daripada perubahan lebar yang kabur.

3. Behavior over theory.  
Fokus ke behavior nyata di code dan tests, bukan cuma asumsi.

4. Tests are evidence.  
Claim bahwa sesuatu "sudah selesai" harus didukung tests dan verification.

5. Commit messages must match reality.  
Jangan over-claim.

6. Docs should reflect true scope.  
Kalau sesuatu cuma selesai untuk narrow scope, docs harus bilang begitu.

---

## 2. Standard Workflow

Gunakan urutan kerja ini untuk hampir semua task:

1. Read context
2. Identify scope and constraints
3. Inspect relevant files
4. Decide whether the task is:
   - simple enough to do directly
   - or large enough to benefit from planning
5. Implement or plan
6. Add or update tests
7. Run verification
8. Review the changes critically
9. Update docs if the change affects roadmap, progress, API, behavior, or status
10. Clean up commit history if needed

---

## 3. How To Start A Task

Before changing anything, collect these:

- current branch or working context
- relevant plan docs, tickets, specs, or issue notes
- target files
- current tests
- current known limitations

For most repos, usually check:

- root `README.md`
- any `docs/`, `plans/`, `specs/`, or `architecture/` folders
- relevant source files for the feature or bug
- existing tests near the changed code
- config files that may affect behavior

Questions to answer first:

- what exactly is broken or missing
- what is already implemented
- what is intentionally deferred
- what counts as "done" for this task
- what should definitely stay out of scope

---

## 4. When To Use Planning

Use planning when:

- the task has multiple phases
- the design is ambiguous
- the work needs stricter traceability
- you want checkpoints or reviewable planning artifacts

Do not force planning when:

- the task is a small bugfix
- the files and change are already obvious
- a simple checklist is enough

Rule of thumb:

- small scoped fix: direct work
- medium task with some design ambiguity: optional planning
- larger phased work: planning is useful

When planning:

- do not write the final implementation
- do not generate large code blocks
- do not produce patch-ready output
- do not blur planning into execution
- keep examples short and structural only if they are truly needed

---

## 5. How To Write A Good AI Prompt

A strong prompt usually contains:

1. Context
2. Task
3. Goal
4. Definition of done
5. Relevant files
6. Constraints
7. Execution requirements
8. Commit style requirements

### Prompt Template

```text
Work on this existing brownfield project.

First inspect the current code, tests, and relevant docs before making changes.

Task:
[describe the task]

Goal:
[describe the desired outcome]

Definition of done:
- [done condition 1]
- [done condition 2]
- [done condition 3]

Relevant files:
- [file 1]
- [file 2]
- [file 3]

Constraints:
- [constraint 1]
- [constraint 2]
- [constraint 3]

Execution requirements:
- inspect current implementation first
- explain current behavior briefly
- propose a concise implementation plan
- implement the change
- add or update tests
- run verification
- summarize what changed, what was verified, and what remains deferred

Commit style requirements:
- use focused commits
- use `feat:`, `fix:`, `test:`, `docs:`, `refactor:`
- do not overstate what a commit changes
- avoid mixing unrelated changes
```

### Prompt Checklist

Before using a prompt, verify:

- does it define the task clearly
- does it define the goal clearly
- does it set the boundaries
- does it mention tests
- does it mention verification
- does it mention commit style

---

## 6. How To Review Work

Review should not start from "what changed".  
Start from:

- what behavior is claimed
- whether code actually does that
- whether tests prove it
- whether docs say the right thing

### Review Priorities

1. Bugs
2. Regression risk
3. Missing tests
4. Scope drift
5. Misleading docs or commit messages

### Review Checklist

When reviewing a branch or patch:

1. Check commit list or diff summary
2. Check changed files
3. Read runtime code changes first
4. Read tests next
5. Read docs last
6. Run typecheck or static analysis if relevant
7. Run targeted tests
8. Run broader validation if needed

### What To Look For In Code

- does the code actually implement the claimed behavior
- does the logic preserve backward compatibility when needed
- does it create a new hidden coupling
- does it handle the intended edge case only, or accidentally broaden behavior

### What To Look For In Tests

- are tests proving the real target behavior
- are tests too weak
- are they only testing happy path
- are important edge cases still missing

### What To Look For In Docs

- do docs overstate completion
- do docs blur scoped completion vs full completion
- do docs list deferred limitations accurately

### How To Review A Spec

When reviewing a spec, ask:

- is the problem statement clear
- are the intended users, flows, or actors clear
- are in-scope and out-of-scope boundaries explicit
- are important edge cases listed
- are failure states described
- are fixed decisions separated from open questions
- does the spec quietly imply extra phases or extra UI beyond the approved scope
- does the implementation guidance match the stated goal

Good spec review findings usually focus on:

- ambiguity
- contradiction
- missing constraints
- missing edge cases
- hidden scope growth

### How To Review An Implementation Plan

When reviewing a plan, ask:

- are the steps ordered correctly
- does each step depend only on earlier steps
- does each step identify the relevant files or system areas
- does each step have a verification checkpoint
- are the proposed queries, mutations, APIs, or commands specific enough
- does the plan respect approved constraints and non-goals
- are risky assumptions called out
- are manual checks separated from automated verification
- is the plan actionable enough that another engineer or model could execute it without guessing

Good implementation plan review findings usually focus on:

- missing steps
- bad sequencing
- unclear ownership of files or components
- weak verification
- scope drift
- mismatch between the approved design and the proposed work

---

## 7. How To Judge Status

A task is not complete just because "some code exists".

Call a task, milestone, or deliverable complete only when:

- the agreed scope is implemented
- tests cover the intended behavior
- validation passes
- docs reflect the true state

### Important Distinction

Always separate:

- narrow scoped completion
- full idealized completion

Example wording:

- good: "complete for the agreed narrow scope"
- bad: "full support complete" when important limitations still exist

If needed, split status language like this:

- first pass complete
- advanced or deferred work remains

---

## 8. How To Keep Commit History Clean

### Good Commit Rules

- one commit, one theme
- keep runtime changes separate from tests when practical
- keep docs separate unless tightly coupled
- use honest messages

### Recommended Prefixes

- `feat:` for behavior changes
- `fix:` for bug fixes
- `test:` for tests
- `docs:` for documentation
- `refactor:` for structural change without behavior change

### Avoid

- timestamp-heavy prefixes unless your team explicitly wants them
- vague messages
- claiming a broader implementation than the code actually contains

### Example

Good:
- `fix: preserve existing validation when parser returns partial data`
- `test: add coverage for partial parsing fallback`

Less good:
- `feat: complete parser support`

---

## 9. How To Handle Planning Files

If using planning files:

- keep them relevant
- do not let them become project noise
- remove quick artifacts if they are not intended as long-term docs

### For temporary planning

If planning artifacts are temporary:

- do not keep them in history unless they are useful project docs

If the planning is abandoned:

- either remove the planning files cleanly
- or reset the branch back to the point before planning started

### If You Need To Undo Planning Work

Two clean options:

1. Restore or remove only planning files
2. Reset the branch back to the commit before planning started

Use the second option when the entire planning run should be treated as if it never happened.

---

## 10. Practical Verification Standard

Use a verification stack that matches the repo and the size of the change.

Typical examples:

```bash
# JavaScript / TypeScript
npm run lint
npm run typecheck
npm test

# Python
pytest

# Go
go test ./...

# Rust
cargo test
```

Not every task needs every command immediately, but merge-ready work usually should pass the relevant checks for that repo.

### Verification Strategy

- small change: run targeted tests first
- broader confidence: run the main test suite
- before merge: ensure relevant lint, typecheck, tests, and build checks pass

---

## 11. Standard Deliverable Format

A good final report from a model should usually answer:

1. What changed
2. Why it changed
3. What was verified
4. What remains deferred or risky

### Example

- implemented fallback behavior when the primary parser returns incomplete data
- added regression coverage for the failing edge case
- verified with targeted tests and relevant static checks
- broader parser refactor remains intentionally deferred

---

## 12. Minimal Operating Checklist

If another model wants the shortest usable checklist, use this:

1. Read the relevant docs and code first
2. Identify the narrow task and explicit non-goals
3. Change the smallest number of files needed
4. Add or update tests
5. Run verification
6. Review commit messages for accuracy
7. Update docs if status or behavior changed
8. Be explicit about what is complete and what is deferred

---

## 13. Repository Adaptation Notes

Before using this guide in a specific repo:

- identify the repo's source directories
- identify where tests live
- identify the preferred verification commands
- identify whether the team uses plans, tickets, ADRs, or milestone docs
- identify the expected commit or PR style

If needed, create a short repo-local appendix that fills in:

- key directories
- key commands
- key docs
- ownership or review expectations

---

## 14. Final Rule

The goal is not just to "finish a task".

The goal is to leave behind:

- correct behavior
- believable tests
- accurate docs
- clean commits
- a code change that another engineer can trust quickly
