terraform {
  backend "s3" {
    bucket         = "terraform-state-filrouge"
    key            = "env/dev/terraform.tfstate"
    region         = "eu-west-3"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}

provider "aws" {
  region = "eu-west-3"
}

module "network" {
  source = "./network"
}

module "iam" {
  source = "./iam"
}

module "ecs" {
  source             = "./ecs"
  subnet_ids         = module.network.public_subnet_ids
  security_group_id  = module.network.ecs_security_group_id
  execution_role_arn = module.iam.execution_role_arn
  cluster_name       = "todo-cluster"
  backend_image      = var.backend_image
  frontend_image     = var.frontend_image
}

module "dynamodb" {
  source = "./dynamodb"
}
