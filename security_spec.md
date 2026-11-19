# Security Specification: RESET-AI Research Journal

## 1. Data Invariants
- **Stage Invariant**: A `ResearchStage` (`/stages/{stageId}`) has `stageNumber` between 1 and 6, a bounded `activities` array (`size() <= 20`), and can only be modified by an authenticated research team member or teacher advisor (`isVerifiedMember()`).
- **Journal Invariant**: A `JournalEntry` (`/journals/{journalId}`) must contain all 29 required fields conforming to Appendix VIII, with `authorUid == request.auth.uid` on creation, `createdAt == request.time`, and immutable `createdAt`, `code`, and `authorUid` on updates.
- **Evidence Invariant**: An `EvidenceItem` (`/evidences/{evidenceId}`) must have `uploadedByUid == request.auth.uid` on creation, valid bounded string lengths, and `isApprovedForJury` controlled by teacher/admin approval.
- **Appendix Invariant**: An `AppendixDocument` (`/appendices/{appendixId}`) represents official Plan 5999 appendices II–IX and requires valid string bounds and verified user authentication for updates.

## 2. The "Dirty Dozen" Payloads
1. **Unauthenticated Write**: Creating a journal entry with `request.auth == null`.
2. **Unverified Email Write**: Creating a journal entry where `request.auth.token.email_verified == false`.
3. **ID Poisoning**: Creating a document with a 300-character or special-character document ID.
4. **Shadow Field Injection (Create)**: Creating a journal entry with an extra `isSuperAdmin: true` property.
5. **Shadow Field Injection (Update)**: Updating a journal entry with an unallowed property `hacked: true`.
6. **Identity Spoofing**: Creating a journal entry where `authorUid` does not match `request.auth.uid`.
7. **Timestamp Forgery (Create)**: Creating a journal entry where `createdAt` is a forged past/future timestamp instead of `request.time`.
8. **Timestamp Forgery (Update)**: Updating a journal entry where `updatedAt` does not match `request.time`.
9. **Immortal Field Mutation**: Attempting to change `createdAt` or `authorUid` during an update on `/journals/{journalId}`.
10. **Array Overflow Attack**: Submitting a `ResearchStage` with 50 items in `activities` (exceeding max 20) or `revisionHistory` > 20.
11. **String Overflow (Denial of Wallet)**: Submitting a `workDone` string of 50,000 characters (exceeding max 3,000).
12. **Value Type Poisoning**: Updating `stageNumber` with a string `"one"` instead of an integer/number.
