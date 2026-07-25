# Home Follow-up Audit

## Screenshot Findings

Source screenshot: `/Users/link/.codex/attachments/fa477a48-2b8f-4e54-8a25-5afcf57b6991/image-1.png`

### Home-specific Problems

- The right side still reads like the previous demo style: profile block, icon rows, index block, and stream block behave like separate dashboard widgets.
- The avatar is grayscale. This makes the image look disabled or placeholder-like, not intentional.
- The right column does not share one alignment system. Avatar/name, profile rows, social links, index rows, and streams each use different internal grids and visual weights.
- The right column competes with Latest. For a reading-first blog, supporting material should be quieter and more ledger-like.
- The left navigation footer is pushed too close to the viewport bottom. The search/RSS controls feel pinned rather than placed.
- Search/RSS in the left rail look like form controls at the bottom of a tool, which weakens the quiet editorial tone.

### Cross-page Problems To Fix

- Any supporting rail should use the same line-based grammar: label, text, count, bottom rule. No chip clouds, pill buttons, or boxed mini cards.
- Avatars should be natural color unless there is a specific content reason to desaturate them.
- Context rails should align to a consistent left edge, with numbers and metadata using tabular rhythm.
- Mobile should not inherit boxed card remnants from desktop helper styles.
- Bottom utility controls in the left rail should sit after content with breathing room, not flush to the bottom.
- Topic/tag switching should read as a quiet index table, not a chip cloud or filter-control cluster.

## Repair Direction

- Home right side becomes one continuous `home-side-ledger`, not a stack of cards.
- Profile content becomes an inline identity row plus two definition rows and social text links.
- Index and Streams become line groups inside the same right ledger.
- Left rail footer changes from auto-pushed bottom controls to a quieter utility group after the nav/meta block.
- Other core pages get the same supporting-rail cleanup where matching issues exist.
- Tag detail pages convert the category switcher to a ruled topic index, including on mobile.
