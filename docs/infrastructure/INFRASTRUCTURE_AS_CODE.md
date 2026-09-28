# INFRASTRUCTURE AS CODE (IaC) CHARTER

This charter specifies the Terraform architecture, state locking protocols, and directory structures governing KETRACO SCM resources.

---

## 1. Directory Structure & Layouts

We organize Terraform configurations using isolated environment states and reusable child modules. This prevents blast radius issues:

```
  /terraform/
    ├── modules/ (Reusable Infrastructure Blocks)
    │     ├── vpc/ (VPC networks, Subnets, Firewalls)
    │     ├── gke/ (GKE private clusters)
    │     ├── database/ (Cloud SQL PGVector configurations)
    │     └── storage/ (GCS encrypted backup buckets)
    └── environments/ (Active Environments)
          ├── dev/ (Sandbox states)
          ├── staging/ (Integration states)
          └── prod/ (Production cluster states)
```

---

## 2. Remote State & Locking Protocols

All states must be stored in private, highly secure Google Cloud Storage buckets. Local states are strictly prohibited.

```hcl
# backend.tf - production environment
terraform {
  backend "gcs" {
    bucket = "ketraco-terraform-state-prod"
    prefix = "scm-nexus/state"
  }
}
```

### Safety Features:
* **State Locking**: Handled natively by GCS object locking APIs. Prevents concurrent modifications.
* **Versioning**: Object versioning is enabled on the state bucket, allowing SRE teams to roll back accidental state corruptions.
* **Encryption**: Backed by customer-managed KMS keys.

---

## 3. Immutable Infrastructure Principles

* **Manual Override Prevention**: No GCP console modifications are permitted. Production IAM permissions are restricted strictly to read-only for humans; write permissions are held solely by the GitOps Service Account.
* **Drift Detection**: Daily cron pipelines execute `terraform plan -detailed-exitcode` to detect and alert on any manual platform modifications.
* **Resource Tagging**: All resources must include labels tracking ownership, environment, and cost-center ID:
```hcl
resource "google_compute_network" "vpc_network" {
  name = "ketraco-vpc-prod"
  # labels
  labels = {
    environment = "production"
    owner       = "scm-sre"
    cost_center = "ke-9402"
    project     = "nexus-platform"
  }
}
```
