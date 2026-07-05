# Deployment Guide (Phase 1)

This document outlines the baseline deployment strategy.

Environments: `dev`, `staging`, `prod`.

Kubernetes: EKS with autoscaling, namespaces per environment.

CI/CD:
- GitHub Actions for CI
- Terraform Cloud / GitHub Actions for IaC
- Helm charts for app deployments

Secrets: AWS Secrets Manager or HashiCorp Vault.

Observability: OpenTelemetry, Prometheus, Grafana, Sentry, and alerting policies.
