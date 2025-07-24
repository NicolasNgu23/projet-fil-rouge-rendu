variable "subnet_ids" {
  description = "Subnet IDs for ECS service"
  type        = list(string)
}

variable "security_group_id" {
  description = "Security group ID for ECS tasks"
  type        = string
}

variable "execution_role_arn" {
  description = "ECS task execution role ARN"
  type        = string
}

variable "cluster_name" {
  description = "ECS cluster name"
  type        = string
}

variable "backend_image" {
  description = "Docker image for the backend service"
  type        = string
  default     = "nginx:latest"
}

variable "frontend_image" {
  description = "Docker image for the frontend service"
  type        = string
  default     = "nginx:latest"
}
