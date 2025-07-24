variable "environment" {
  description = "Environment name"
  type        = string
  default     = "dev"
}

variable "project_name" {
  description = "Project name"
  type        = string
  default     = "todo-app"
}

variable "region" {
  description = "AWS region"
  type        = string
  default     = "eu-west-3"
}

variable "backend_image" {
  description = "Docker image for the backend service"
  type        = string
  default     = "nginx:latest" # Default image, will be overridden by CI/CD
}

variable "frontend_image" {
  description = "Docker image for the frontend service"
  type        = string
  default     = "nginx:latest" # Default image, will be overridden by CI/CD
}
