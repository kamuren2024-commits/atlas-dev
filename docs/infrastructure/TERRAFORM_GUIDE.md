# SRE TERRAFORM OPERATIONS GUIDE

This document serves as the standard playbook for executing, review, and updating Terraform modules inside the KETRACO repository.

---

## 1. Development & Verification Workflow

### Step 1: Write and lint code
Verify formatting and style guides before committing:
```bash
terraform fmt -recursive
terraform validate
```

### Step 2: Validate Security Policies (trivy/checkov)
Use security linters to ensure no public firewalls or wide permissions are introduced:
```bash
checkov -d .
```

### Step 3: Propose Plan via PR
Push changes to a branch. The CI pipeline will automatically run:
```bash
terraform plan -out=tfplan
```
The plan output is added as an automated PR comment for SRE review.

---

## 2. Code Review Gates

To promote a plan:
1. **Require Approvals**: At least two SRE Leads must approve the PR.
2. **Deterministic Apply**: The CD system runs `terraform apply tfplan` strictly in non-interactive mode. No manual interventions are permitted.
