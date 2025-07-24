# Guide de Déploiement - Projet Fil Rouge

## 📋 Prérequis

### Outils requis
- **AWS CLI** configuré avec les permissions appropriées
- **Terraform** v1.5+ installé
- **Docker** et **Docker Compose** pour le développement local
- **Node.js** v18+ et **npm**
- **Git**

### Permissions AWS requises
Votre utilisateur AWS doit avoir les permissions pour :
- ECS (création clusters, services, task definitions)
- EC2 (VPC, subnets, security groups, load balancers)
- DynamoDB (création et gestion tables)
- IAM (création rôles et politiques)
- ECR (création repositories, push/pull images)
- CloudWatch (logs et métriques)
- S3 (pour l'état Terraform)

## 🚀 Déploiement Initial

### Étape 1 : Configuration AWS

1. **Configurer AWS CLI :**
   ```bash
   aws configure
   # Saisir votre Access Key ID
   # Saisir votre Secret Access Key
   # Région : eu-west-3
   # Format de sortie : json
   ```

2. **Vérifier la configuration :**
   ```bash
   aws sts get-caller-identity
   aws ec2 describe-regions --region eu-west-3
   ```

### Étape 2 : Préparation de l'infrastructure Terraform

1. **Créer le bucket S3 pour l'état Terraform :**
   ```bash
   aws s3 mb s3://terraform-state-filrouge --region eu-west-3
   
   # Activer le versioning
   aws s3api put-bucket-versioning \
     --bucket terraform-state-filrouge \
     --versioning-configuration Status=Enabled
   
   # Activer le chiffrement
   aws s3api put-bucket-encryption \
     --bucket terraform-state-filrouge \
     --server-side-encryption-configuration '{
       "Rules": [
         {
           "ApplyServerSideEncryptionByDefault": {
             "SSEAlgorithm": "AES256"
           }
         }
       ]
     }'
   ```

2. **Créer la table DynamoDB pour les verrous Terraform :**
   ```bash
   aws dynamodb create-table \
     --table-name terraform-locks \
     --attribute-definitions AttributeName=LockID,AttributeType=S \
     --key-schema AttributeName=LockID,KeyType=HASH \
     --provisioned-throughput ReadCapacityUnits=5,WriteCapacityUnits=5 \
     --region eu-west-3
   ```

### Étape 3 : Déploiement de l'infrastructure

1. **Naviguer vers le dossier Terraform :**
   ```bash
   cd infra/terraform
   ```

2. **Initialiser Terraform :**
   ```bash
   terraform init
   ```

3. **Planifier le déploiement :**
   ```bash
   terraform plan
   ```

4. **Appliquer les changements :**
   ```bash
   terraform apply
   ```
   > Saisir `yes` pour confirmer

5. **Noter les outputs importants :**
   ```bash
   terraform output
   ```

### Étape 4 : Construction et publication des images Docker

1. **Créer les repositories ECR :**
   ```bash
   # Ces commandes seront exécutées automatiquement par le pipeline
   # Mais vous pouvez les créer manuellement si nécessaire
   aws ecr create-repository --repository-name todo-backend --region eu-west-3
   aws ecr create-repository --repository-name todo-frontend --region eu-west-3
   ```

2. **Se connecter à ECR :**
   ```bash
   aws ecr get-login-password --region eu-west-3 | docker login --username AWS --password-stdin <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com
   ```

3. **Construire et pousser les images (optionnel - fait par CI/CD) :**
   ```bash
   # Backend
   cd ../../backend
   docker build -t <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/todo-backend:latest .
   docker push <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/todo-backend:latest
   
   # Frontend
   cd ../frontend
   docker build -t <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/todo-frontend:latest .
   docker push <ACCOUNT_ID>.dkr.ecr.eu-west-3.amazonaws.com/todo-frontend:latest
   ```

## 🔄 Pipeline CI/CD

### Configuration GitHub Actions

1. **Ajouter les secrets dans GitHub :**
   Aller dans Settings > Secrets and variables > Actions, puis ajouter :
   
   - `AWS_ACCESS_KEY_ID` : Votre clé d'accès AWS
   - `AWS_SECRET_ACCESS_KEY` : Votre clé secrète AWS
   - `AWS_ACCOUNT_ID` : Votre ID de compte AWS (12 chiffres)

2. **Le pipeline s'exécute automatiquement :**
   - Sur chaque push vers `main`
   - Le pipeline teste, construit, et déploie automatiquement

### Déclenchement manuel

Vous pouvez déclencher le pipeline manuellement :
1. Aller dans l'onglet "Actions" de votre repository GitHub
2. Sélectionner le workflow "CI/CD Pipeline"
3. Cliquer sur "Run workflow"

## 🛠️ Développement Local

### Développement avec Docker Compose

1. **Démarrer l'environnement local :**
   ```bash
   ./scripts/dev.sh start
   ```

2. **Accéder à l'application :**
   - Frontend : http://localhost:3001
   - Backend : http://localhost:3000
   - Health check : http://localhost:3000/health

3. **Voir les logs :**
   ```bash
   ./scripts/dev.sh logs
   ```

4. **Arrêter l'environnement :**
   ```bash
   ./scripts/dev.sh stop
   ```

### Développement sans Docker

1. **Backend :**
   ```bash
   cd backend
   npm install
   npm run dev  # Utilise nodemon pour le hot reload
   ```

2. **Frontend :**
   ```bash
   cd frontend
   npm install
   npm start    # Démarre le serveur de développement React
   ```

## 🧪 Tests

### Tests automatisés

```bash
# Tests complets
./scripts/dev.sh test

# Tests backend uniquement
cd backend && npm test

# Tests frontend uniquement
cd frontend && npm test

# Tests avec couverture
cd backend && npm test -- --coverage
cd frontend && npm test -- --coverage --watchAll=false
```

### Tests manuels

1. **API Backend :**
   ```bash
   # Health check
   curl http://localhost:3000/health
   
   # Lister les tâches
   curl http://localhost:3000/api/tasks
   
   # Créer une tâche
   curl -X POST http://localhost:3000/api/tasks \
     -H "Content-Type: application/json" \
     -d '{"title":"Test Task","description":"Description","status":"pending"}'
   ```

2. **Frontend :**
   - Naviguer vers http://localhost:3001
   - Tester la création, modification, suppression de tâches

## 📊 Monitoring et Observabilité

### Logs CloudWatch

1. **Voir les logs via AWS Console :**
   - Aller dans CloudWatch > Log groups
   - Chercher `/ecs/todo-backend` et `/ecs/todo-frontend`

2. **Voir les logs via CLI :**
   ```bash
   # Logs backend
   aws logs tail /ecs/todo-backend --follow --region eu-west-3
   
   # Logs frontend
   aws logs tail /ecs/todo-frontend --follow --region eu-west-3
   ```

### Métriques

1. **Métriques ECS :**
   - CPU et mémoire des services
   - Nombre de tâches en cours
   - État des health checks

2. **Métriques ALB :**
   - Nombre de requêtes
   - Latence
   - Codes de réponse

3. **Métriques DynamoDB :**
   - Consommation RCU/WCU
   - Throttling
   - Erreurs

## 🚨 Dépannage

### Problèmes courants

1. **Terraform apply échoue :**
   ```bash
   # Vérifier l'état
   terraform show
   
   # Importer des ressources existantes si nécessaire
   terraform import aws_s3_bucket.terraform_state terraform-state-filrouge
   
   # Forcer le refresh
   terraform refresh
   ```

2. **Services ECS ne démarrent pas :**
   ```bash
   # Vérifier l'état des services
   aws ecs describe-services --cluster todo-cluster --services todo-backend-service todo-frontend-service
   
   # Vérifier les logs
   aws logs tail /ecs/todo-backend --follow
   ```

3. **Images Docker ne sont pas trouvées :**
   ```bash
   # Vérifier les repositories ECR
   aws ecr describe-repositories
   
   # Vérifier les images
   aws ecr list-images --repository-name todo-backend
   ```

4. **Problèmes de permissions :**
   ```bash
   # Vérifier l'identité AWS
   aws sts get-caller-identity
   
   # Vérifier les rôles IAM
   aws iam get-role --role-name todo-ecs-execution-role
   ```

### Commandes de diagnostic

```bash
# État général de l'infrastructure
terraform output
aws ecs list-clusters
aws ecs list-services --cluster todo-cluster

# État détaillé d'un service
aws ecs describe-services --cluster todo-cluster --services todo-backend-service

# Tâches en cours
aws ecs list-tasks --cluster todo-cluster
aws ecs describe-tasks --cluster todo-cluster --tasks <task-arn>

# Health checks ALB
aws elbv2 describe-target-health --target-group-arn <target-group-arn>

# État DynamoDB
aws dynamodb describe-table --table-name todo-tasks
```

## 🔄 Mise à jour et maintenance

### Mise à jour de l'application

1. **Via CI/CD (recommandé) :**
   - Pusher les changements vers `main`
   - Le pipeline se charge automatiquement du déploiement

2. **Mise à jour manuelle :**
   ```bash
   # Forcer un nouveau déploiement
   aws ecs update-service --cluster todo-cluster --service todo-backend-service --force-new-deployment
   aws ecs update-service --cluster todo-cluster --service todo-frontend-service --force-new-deployment
   ```

### Mise à jour de l'infrastructure

```bash
cd infra/terraform
terraform plan
terraform apply
```

### Sauvegarde et restauration

1. **DynamoDB :**
   - Activer la sauvegarde automatique
   - Exporter les données pour une sauvegarde manuelle

2. **État Terraform :**
   - Sauvegardé automatiquement dans S3 avec versioning

## 🗑️ Nettoyage des ressources

⚠️ **Attention : Cette opération supprime toutes les ressources AWS**

```bash
cd infra/terraform
terraform destroy
```

Puis supprimer manuellement :
```bash
# Bucket S3 (vider d'abord)
aws s3 rm s3://terraform-state-filrouge --recursive
aws s3 rb s3://terraform-state-filrouge

# Table DynamoDB des verrous
aws dynamodb delete-table --table-name terraform-locks

# Repositories ECR (optionnel)
aws ecr delete-repository --repository-name todo-backend --force
aws ecr delete-repository --repository-name todo-frontend --force
```
