# INGRESS & TRAFFIC ROUTING POLICY

This document outlines the Ingress rules, SSL policies, and perimeter protection parameters implemented on KETRACO Kubernetes clusters.

---

## 1. Edge Protection & SSL Termination

We use an **Enterprise NGINX Ingress Controller** integrated with Google Cloud Armor to shield the cluster boundary:

```
  [ Client Browser ] ──► [ Cloud Armor (WAF/DDoS) ] ──► [ Ingress Nginx (SSL) ] ──► [ Mesh Gateway ]
```

### Security Settings:
* **TLS Version**: Strict TLS `v1.3` mandatory; TLS 1.0, 1.1, and 1.2 are blocked at the perimeter.
* **Certificates**: Managed automatically via `cert-manager` using Let's Encrypt DNS-01 challenges.
* **HTTP Redirection**: All HTTP traffic is permanently redirected to HTTPS using a 301 status.

---

## 2. Ingress Controller Configurations

The following annotations are mandatory on all ingress resources:

```yaml
apiVersion: networking.k8s.io/v1
kind: Ingress
metadata:
  name: scm-nexus-ingress
  annotations:
    kubernetes.io/ingress.class: "nginx"
    nginx.ingress.kubernetes.io/ssl-redirect: "true"
    nginx.ingress.kubernetes.io/backend-protocol: "HTTP"
    nginx.ingress.kubernetes.io/limit-rps: "100" # Rate limiting
    nginx.ingress.kubernetes.io/cors-allow-origin: "https://*.ketraco.co.ke"
```
This protects KETRACO APIs from unauthorized access and brute-force spikes.
