# Projet Fil Rouge : Architecture Cloud & DevOps

## 📋 Vue d'ensemble

Ce projet implémente une application web de gestion de tâches (Todo List) déployée sur AWS en utilisant les principes DevOps et l'Infrastructure as Code (IaC).

### Architecture

- **Frontend** : Application React moderne avec interface utilisateur responsive
- **Backend** : API REST Node.js/Express
- **Base de données** : Amazon DynamoDB (NoSQL managé)
- **Infrastructure** : AWS ECS (Fargate) avec Application Load Balancer
- **CI/CD** : GitHub Actions pour l'automatisation
- **IaC** : Terraform pour la gestion de l'infrastructure

## 🏗️ Architecture Technique

```
┌─────────────────┐     ┌──────────────────┐     ┌─────────────────┐
│   Utilisateur   │────▶│  Application     │────▶│   AWS Cloud     │
│                 │     │  Load Balancer   │     │                 │
└─────────────────┘     └──────────────────┘     └─────────────────┘
                                 │
                    ┌────────────┼────────────┐
                    │            │            │
            ┌───────▼───────┐    │    ┌───────▼───────┐
            │   Frontend    │    │    │   Backend     │
            │ (React/Nginx) │    │    │ (Node.js)     │
            │  ECS Service  │    │    │ ECS Service   │
            └───────────────┘    │    └───────┬───────┘
                                 │            │
                                 │    ┌───────▼───────┐
                                 │    │   DynamoDB    │
                                 │    │   (NoSQL)     │
                                 │    └───────────────┘
                    ┌────────────▼────────────┐
                    │      Monitoring       │
                    │    (CloudWatch)       │
                    └───────────────────────┘
```

## 🚀 Démarrage Rapide

### Prérequis

- **Docker** et **Docker Compose**
- **Node.js** 18+ (pour le développement local)
- **Terraform** 1.5+ (pour le déploiement)
- **AWS CLI** configuré
- **Git**

### Développement Local

1. **Cloner le repository :**
   ```bash
   git clone <repository-url>
   cd projet-fil-rouge
   ```

2. **Utiliser le script de développement :**
   ```bash
   # Vérifier les prérequis
   ./scripts/dev.sh check
   
   # Installer les dépendances
   ./scripts/dev.sh install
   
   # Démarrer l'environnement de développement
   ./scripts/dev.sh start
   ```

3. **Accéder à l'application :**
   - Frontend : http://localhost:3001
   - Backend : http://localhost:3000
   - Health check : http://localhost:3000/health
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
