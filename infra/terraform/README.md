Terraform modules and environment configs will live here. Start by creating modules for:
- VPC
- EKS cluster
- RDS (Postgres)
- ElastiCache (Redis)
- S3 buckets

Use remote state (Terraform Cloud or S3 + DynamoDB) and strict IAM policies.
