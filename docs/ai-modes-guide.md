# AI Modes Guide

This guide explains distinct AI working modes so prompts do not get mixed between brainstorming, planning, execution, review, and documentation.

The most common problem is not a bad prompt. It is an unclear working mode.

---

## 1. Core Rule

Always decide first:

- is the AI being asked to think
- plan
- execute
- review
- or improve documentation

If the mode is unclear, the output usually becomes confused:

- brainstorming sounds too certain
- execution becomes too discussion-heavy
- review turns into implementation
- planning turns into document filler

---

## 2. The Five Main Modes

### A. Brainstorming Mode

Use this when you want to:

- explore options
- compare tradeoffs
- break down a problem
- identify risks
- find the most reasonable direction

Expected output:

- options
- tradeoffs
- recommendations
- open questions
- suggested scope

Do not use this mode if you actually want the AI to implement immediately.

### B. Planning Mode

Use this when the overall direction is mostly clear, but the work still needs to be broken down.

The purpose of this mode is to:

- split the task into steps
- define scope and non-goals
- decide sequencing
- define verification

Expected output:

- a plan
- a checklist
- milestones
- definition of done

Planning mode is not implementation mode.

In planning mode, do not generate:

- full solution code
- full component or page implementations
- patch-ready output
- large paste-ready code blocks
- completed business logic disguised as examples

If examples are necessary, keep them short, structural, and illustrative rather than complete.

### C. Execution Mode

This is `GSD` mode.

Use this when you want the AI to:

- inspect the code first
- make a short plan
- implement
- update tests
- run verification
- provide a final result that can be reviewed

Expected output:

- code changes
- tests
- verification
- an implementation summary

Do not use this mode if major decisions are still unresolved.

### D. Review Mode

Use this when work already exists and you want a critical evaluation.

The purpose of this mode is to:

- find bugs
- identify regression risk
- identify missing tests
- identify scope drift
- check whether docs and claims match reality

Expected output:

- findings
- risks
- open questions
- a review verdict

Do not turn review mode into implementation unless that is explicitly requested.

Common review targets:

- a product or technical spec
- an implementation plan
- a code patch or branch
- a documentation set

For spec and plan review, the job is not to propose endless alternatives. The job is to identify gaps, contradictions, missing constraints, hidden assumptions, and execution risk.

### E. Documentation Mode

Use this when the main goal is to write or improve docs.

The purpose of this mode is to:

- create a source of truth
- separate planning from progress and backlog
- clarify boundaries
- improve resumability

Expected output:

- cleaner docs
- templates
- clarified status
- improved doc structure

---

## 3. Quick Decision Rule

Use these questions:

1. Do you not yet know the best solution?  
   -> Brainstorming

2. Is the direction mostly chosen, but the work is not yet organized?  
   -> Planning

3. Do you already know what should be done and want a real result?  
   -> Execution / GSD

4. Does work already exist and you want to find problems in it?  
   -> Review

5. Is the main target a document rather than code?  
   -> Documentation

---

## 4. Brainstorming vs GSD

This is the most important distinction.

### Brainstorming

Goal:
- find direction

Good fit when:
- you are still unsure where to start
- there are several design options
- scope is not yet firm
- you want risks identified before coding

Ask the AI to:
- propose several options
- compare tradeoffs
- recommend one direction
- explain assumptions
- mark unresolved decisions

Do not ask it to:
- implement end-to-end immediately
- claim the task is complete
- claim anything is verified

### GSD / Execution

Goal:
- complete the task

Good fit when:
- the direction has already been chosen
- scope is clear
- boundaries are clear
- success criteria are clear

Ask the AI to:
- inspect context first
- implement
- add or update tests
- run verification
- report the result and remaining risks

Do not use it when:
- you still want to discuss major options
- requirements are still vague
- in-scope vs out-of-scope is still unclear

---

## 5. Mode Transition

A healthy workflow often looks like this:

1. Brainstorming
2. Planning
3. Execution
4. Review
5. Documentation update

Not every task needs every mode.

Examples:

- small bugfix: execution -> short review
- medium feature: brainstorming -> planning -> execution -> review
- doc cleanup: documentation only
- spec work: brainstorming -> spec review -> planning
- implementation planning: planning -> plan review -> execution

---

## 6. Prompt Shape By Mode

### Brainstorming Prompt Shape

Minimum contents:

- context
- problem
- constraints
- what kind of thinking is needed
- desired output format

Example:

```text
Help me brainstorm approaches for this existing project.

Context:
- [project context]
- [relevant files or system area]

Problem:
- [what is unclear or difficult]

Constraints:
- [constraint 1]
- [constraint 2]

What I want:
- 3 plausible approaches
- tradeoffs for each
- your recommendation
- open questions that should be resolved before implementation

Do not implement yet.
Do not assume the chosen direction is final.
```

### Planning Prompt Shape

Minimum contents:

- context
- chosen direction
- goal
- constraints
- definition of done
- expected plan format

Example:

```text
Help me create an implementation plan for this existing project.

Context:
- [project context]

Chosen direction:
- [decision already made]

Goal:
- [desired outcome]

Constraints:
- [constraint 1]
- [constraint 2]

Definition of done:
- [done condition 1]
- [done condition 2]

Output:
- proposed steps
- risks
- verification plan
- explicit non-goals

Do not implement yet.
Do not write full code blocks or paste-ready solutions.
If examples are needed, keep them minimal and illustrative only.
```

### Execution / GSD Prompt Shape

Minimum contents:

- context
- task
- goal
- relevant files
- constraints
- verification requirements
- final output expectations

Use `gsd-prompt-template.md` when you want end-to-end execution.

### Review Prompt Shape

Minimum contents:

- what to review
- claimed behavior
- review priorities
- whether code changes are allowed

For spec review, also include:

- the intended users or flow
- fixed decisions that are already approved
- non-goals
- what kind of findings matter most: ambiguity, inconsistency, missing edge cases, or scope issues

For implementation plan review, also include:

- whether the direction is already approved
- whether the reviewer should challenge sequencing
- expected delivery shape: steps, files, verification, commit mapping
- whether implementation is explicitly forbidden

Example:

```text
Review this work with a bug-finding mindset.

Focus on:
- bugs
- regression risk
- missing tests
- misleading docs or claims

Do not implement fixes unless I ask.
```

Spec review example:

```text
Review this spec critically before implementation starts.

Focus on:
- ambiguity
- contradictory decisions
- missing edge cases
- hidden scope expansion
- assumptions that should be made explicit

Do not rewrite the spec unless I ask.
Do not jump into implementation.
```

Implementation plan review example:

```text
Review this implementation plan for execution-readiness.

Focus on:
- missing steps
- incorrect sequencing
- weak verification
- unclear file ownership
- mismatch between scope and proposed work

Do not implement.
Do not redesign the approved direction unless the plan is clearly broken.
```

### Documentation Prompt Shape

Minimum contents:

- which docs to update
- what role each doc should have
- what confusion should be removed
- what format should be preserved

---

## 7. Good Prompts vs Bad Prompts

Bad:

- "Think deeply and finish this"
- "Review and fix and improve and plan everything"
- "Brainstorm the best solution and then just implement it"

Why these are bad:

- the mode is mixed
- the output expectation is vague
- it is unclear when the AI should stop

Better:

- "Brainstorm 3 approaches and recommend one. Do not implement yet."
- "Create a short implementation plan based on this chosen direction. Do not code yet."
- "Implement this scoped change, update tests, and verify."
- "Review this patch for bugs and regression risk only."

---

## 8. Recommended Rule For Real Work

If the problem is still unclear, start with brainstorming.

If the direction is already chosen, move to planning or directly to execution depending on task size.

If code has already changed, use review mode before treating the task as complete.

If progress, scope, or source-of-truth status has changed, update docs afterward.

---

## 9. Minimal Cheatsheet

- want options -> brainstorming
- want steps -> planning
- want a real implementation -> execution / GSD
- want to find problems in a spec, plan, patch, or doc -> review
- want clearer source of truth -> documentation

---

## 10. Final Rule

Do not ask one prompt to think, plan, implement, review, and document everything unless the task is truly tiny.

The clearer the mode, the better the output.
