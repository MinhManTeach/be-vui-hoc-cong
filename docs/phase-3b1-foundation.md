# Phase 3B.1 — Daily Adventure foundation

Base: `a67f9a823e388ea241f17c736e39c1684cc87450` on `stability-phase-0`.

This phase adds pure domain APIs and persistence, without a Daily screen or changes to existing gameplay. Do not route the existing endless mini-games into Daily until their adapters generate rounds using the adventure's `learningWorldId` and stop after three rounds. Existing mini-game question ranges are not safe for a beginner Daily.

## Save contract

The root remains version 2 and uses the existing v2 key. Optional `UserProgress.retention` is normalized on load to version 1. It owns the active adventure, distinct adventure dates, calendar high-water mark, event/reward receipts, sticker IDs and active finite mini-game session. Missing legacy retention starts empty; no historical dates are inferred.

Load validates known fields instead of spreading arbitrary raw JSON. Invalid retention sections recover independently. A valid prior snapshot is backed up before replacement; corrupt JSON is kept under the corrupt key, with backup recovery if available. Load does not erase the source on recovery. Root, retention and adventure-definition future versions block writes, including reset. Explicit supported-version reset removes game recovery keys as well as retention, preserving unrelated storage keys.

Receipts are deliberately not pruned in this foundation: deleting them could reopen already claimed adventures. Storage exhaustion is a save failure. No account, network or analytics is required. This is not secure anti-cheat or cross-tab locking.

## Integration contract for a later phase

1. Use `ensureDailyAdventure(progress, clock)` to create or resume an adventure. An unfinished/unclaimed adventure survives day rollover. A new adventure is allowed after claim on a later calendar day. The calendar adapter is injected; backward calendar movement is clamped to the saved high-water day.
2. Publish the sticker named by `rewardStickerId` before playing. No coins, XP or progression stars are granted by this domain.
3. Generate Daily questions using `learningWorldId`. Eligible skills must be unlocked and already practised (counting is the starting fallback); teacher unlock override does not expand the range.
4. Emit `QuestionCompleted` only once the answer is confirmed, with a stable nonpersonal question ID. Retries/hints do not decrement tasks. Learn takes five questions; help takes two or one confirmed interaction with the pinned companion (Thỏ Bông fallback).
5. `startDailyMiniGame` creates a three-round session. Use its `roundId` for each confirmed `MiniGameRoundCompleted`, including the skill world. The third round records session and play-task completion automatically. Duplicate explicit completion is harmless. Lifecycle controls are pause/resume/cancel; a cancelled session needs a fresh ID to restart.
6. Run every update through `commitRetentionUpdate(current, updater)` and publish the returned snapshot/animation only after success. It rejects stale saved snapshots and throws on a failed save. Reload latest state on a conflict; do not replay a reward animation from an old snapshot. Updates are synchronous in one JS context; concurrent writes from other tabs still require a future locking strategy.
7. `claimDailyReward` stores the reward receipt, claimed status and sticker ownership in one snapshot. Closing a modal or finishing an animation has no domain effect.

Adventure Days count confirmed Daily gameplay on distinct effective calendar days; 3/7/14 milestones are derived without a consecutive streak or expiry. Rest does not reset anything. Clock changes may delay the next adventure; they never remove progress or reopen an existing claim.

Foundation data uses IDs and catalog placeholder references only. Do not include child names/free text in event IDs or send them to cloud speech. The new domain has no speech or network calls.

## Verification

Baseline official toolchain: 65 existing tests pass, typecheck passes, production build passes. The `lint` script is the same TypeScript check, not a separate linter. Tests cover migration/recovery/future versions, duplicate events and claims, calendar behavior, finite sessions, learning range, stale snapshots and failed writes.
