##########################
# main.tf
##########################
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
  source = "./ecs"
  subnet_ids            = module.network.public_subnet_ids
  security_group_id     = module.network.ecs_security_group_id
  execution_role_arn    = module.iam.execution_role_arn
  cluster_name          = "todo-cluster"
}

module "dynamodb" {
  source = "./dynamodb"
}

##########################
# Dockerfile (API Backend)
##########################
# backend/Dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
EXPOSE 3000
CMD ["npm", "start"]

##########################
# Dockerfile (Frontend React)
##########################
# frontend/Dockerfile
FROM node:18-alpine AS build
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

FROM nginx:alpine
COPY --from=build /app/build /usr/share/nginx/html
EXPOSE 80
CMD ["nginx", "-g", "daemon off;"]

##########################
# docker-compose.yml (dev local)
##########################
version: '3'
services:
  api:
    build: ./backend
    ports:
      - "3000:3000"
  frontend:
    build: ./frontend
    ports:
      - "80:80"

##########################
# GitHub Actions Workflow
##########################
# .github/workflows/deploy.yml
name: Deploy to AWS

on:
  push:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest

    steps:
    - name: Checkout code
      uses: actions/checkout@v3

    - name: Log in to Docker Hub
      run: echo "${{ secrets.DOCKER_PASSWORD }}" | docker login -u ${{ secrets.DOCKER_USERNAME }} --password-stdin

    - name: Build and push backend image
      run: |
        docker build -t ${{ secrets.DOCKER_USERNAME }}/todo-api:latest ./backend
        docker push ${{ secrets.DOCKER_USERNAME }}/todo-api:latest

    - name: Build and push frontend image
      run: |
        docker build -t ${{ secrets.DOCKER_USERNAME }}/todo-frontend:latest ./frontend
        docker push ${{ secrets.DOCKER_USERNAME }}/todo-frontend:latest

    - name: Terraform Init + Apply
      working-directory: ./infra/terraform
      run: |
        terraform init
        terraform apply -auto-approve
      env:
        AWS_ACCESS_KEY_ID: ${{ secrets.AWS_ACCESS_KEY_ID }}
        AWS_SECRET_ACCESS_KEY: ${{ secrets.AWS_SECRET_ACCESS_KEY }}
