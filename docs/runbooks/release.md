# Runbook · Release

**Never release on a filing day** (the 8th–11th of a month, or any day the owner has told
you they are filing). **Never release during shop hours** without the owner's agreement.

## Before

1. `main` is green: `npm test`, `npm run lint`, `npm run i18n:check`.
2. Migrations reviewed — confirm none deletes or rewrites an invoice, return, ARN or import log.
3. Backup taken and its restore verified (see `backup-restore.md`).
4. Release note written in the sponsor's language of choice, one paragraph, what changes at the counter.

## Release

1. Tag: `v0.<milestone>.<n>`.
2. Migrate, then deploy. Migrations run forward-only.
3. Smoke test in this order — walk-in booking in 4 taps · complete a job and see the draft invoice · open the GST period and confirm totals · load `/book` as a customer.
4. Post the release note to the sponsor.

## Rollback

Redeploy the previous tag. **Do not roll back a migration that touched statutory tables** —
restore from backup and call the sponsor and the CA. Any live filing made after the bad
deploy is documented in writing the same day.
