output "vpc_id" {
  description = "VPC ID"
  value       = module.network.vpc_id
}

output "public_subnet_ids" {
  description = "Public subnet IDs"
  value       = module.network.public_subnet_ids
}

output "ecs_cluster_name" {
  description = "ECS cluster name"
  value       = module.ecs.cluster_name
}

output "dynamodb_table_name" {
  description = "DynamoDB table name"
  value       = module.dynamodb.table_name
}

output "load_balancer_dns" {
  description = "Application Load Balancer DNS name"
  value       = module.ecs.load_balancer_dns
}

output "alb_dns_name" {
  description = "Application Load Balancer DNS name (alias for CI/CD)"
  value       = module.ecs.load_balancer_dns
}
