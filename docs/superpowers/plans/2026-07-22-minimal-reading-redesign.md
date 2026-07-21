# Minimal Reading Redesign — Implementation Plan

> **For agentic workers:** Implement task-by-task. Each page ends with visual check, commit, and push.

**Goal:** Replace the blog reading surface with a minimal reading shell and token system.

**Architecture:** `ReadingShell` + `reading.scss` for in-scope pages; feature pages untouched.

**Tech Stack:** Astro 5, Sass, existing content collections.

## Tasks

0. Branch + design spec — done in this commit series
1. ReadingShell + tokens
2. Home `/`
3. Archive `/blog`
4. Post layout
5. Tags
6. About
7. Shuoshuo
8. Message
9. Copyright
10. Legacy cleanup (reading surface only)
11. Final polish + checklist
