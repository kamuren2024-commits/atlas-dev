# TERRAFORM STATE RECOVERY PLAYBOOK

This document describes state migration, recovery, and manual lock override procedures.

---

## 1. Multi-State Architecture

To prevent a mistake in one component from corrupting the entire cloud state, we segment state files using `terraform_remote_state` data bindings:

* **`/terraform/vpc/`**: Deploys baseline network subnets. Exports VPC self-links.
* **`/terraform/gke/`**: Reads VPC details via remote state; provisions private nodes.
* **`/terraform/apps/`**: Reads GKE endpoint outputs; configures cluster-specific providers.

---

## 2. Emergency lock Overrides

If a Terraform run crashes or times out, the GCS state may remain locked. Follow this SOP to force release:

### Step 1: Identify Lock ID
Extract the lock metadata from the failed pipeline logs:
```
Lock Info:
  ID:        a9b3c4d5-e6f7-...
  Operation: OperationTypeApply
  Who:       runner@github-ci
```

### Step 2: Force Release (SRE Approval Mandatory)
Obtain team verification, then run:
```bash
terraform force-unlock a9b3c4d5-e6f7-...
```
Never execute this command while a CI job is actively running.
