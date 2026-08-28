# Pushing this scaffold to github.com/valav-lem/kadai

The repository is currently empty. From the unzipped folder:

```bash
git init -b main
git add .
git commit -m "chore: project scaffold, PRD, charter and decision log"
git remote add origin git@github.com:valav-lem/kadai.git
git push -u origin main
```

Then in the repository settings:

- Protect `main` — require a PR and a passing CI check.
- Enable Discussions (the issue templates link to it for CA questions).
- Create labels: `bug`, `enhancement`, `statutory`, `needs-ca`, `w1`…`w7`, `m1`…`m4`.
- Create milestones M1–M4 with the dates from `docs/project-charter.md` §3.
- Replace the `@valav-lem` placeholders in `.github/CODEOWNERS` once the team is named
  (§4 of the charter still shows three TBAs).

Delete this file after the first push.
