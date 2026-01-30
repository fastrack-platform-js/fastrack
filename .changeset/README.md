# Changesets

We use [Changesets](https://github.com/changesets/changesets) for versioning and changelogs.

When you make user-facing changes, add a changeset:

```bash
pnpm changeset
```

Choose the packages affected and the version bump (patch/minor/major). The release workflow (or maintainers) will run `changeset version` and publish to npm.
