# ENVIRONMENT PROMOTION SCHEMES

This document specifies how changes are promoted from development to production.

---

## 1. Linear Environment Progression

Changes must progress sequentially through our environment stages; bypassing staging is strictly prohibited:

```
  [ Dev Branch ] ──► [ Staging Branch ] ──► [ Main (Prod) Branch ]
                      (Integration Tests)     (Release Approvals)
```

---

## 2. Promotion SOP

### Step 1: Promote to Staging
1. Merge the feature branch into `staging`.
2. The CI pipeline builds the staging image and deploys it to the `scm-staging` namespace.
3. Automated integration and contract tests run.

### Step 2: Promote to Production
1. Open a PR from `staging` to `main`.
2. Confirm all automated tests have passed.
3. Obtain required approvals from the SRE and SCM Directors.
4. Merge the PR. ArgoCD detects the change and synchronizes the production cluster.
