Here is a guide for how to make sure that changelog and releases work properly:

# Commit Messages

The following are example commit messages which conform to the proper format

## For bug-fixes

**fix: Fixed issue with XYZ (fixes #100)**

(The fix: prefix means a bug fix has applied, so the patch version will be bumped — ie. 1.0.1 > 1.0.2)

## For new features

**feat: Added feature A**

(The feat: prefix means a feature has been added, so the minor version will be bumped — ie. 1.0.1 > 1.1.0)

## For breaking changes

**feat!: Added feature B**

(The exclamation mark says it's a breaking change, and the major version will be bumped — ie. 1.0.1 > 2.0.0)

# Merging PRs

Make sure to merge PRs as a squash and ensure the commit message conforms to the above format

# Release

When you're ready to run a release, run 
```sh
standard-version
```

This will do the following:

- Update changelog
- Bump the version # 
- Create a commit with the version # 
- Create a tag with the version # on the new commit

When this is done, quickly make sure that the changelog looks correct, then you can push the commit and tags

After this, the GH action will automatically publish and generate the GH release
