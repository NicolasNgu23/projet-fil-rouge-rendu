terraform {
  backend "s3" {
    bucket         = "terraform-state-filrouge"
    key            = "env/dev/terraform.tfstate"
    region         = "eu-west-3"
    dynamodb_table = "terraform-locks"
    encrypt        = true
  }
}
