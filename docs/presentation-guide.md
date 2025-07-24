# Présentation du Projet Fil Rouge

## 🎯 Objectif de la Présentation (10 minutes)

### Structure suggérée

#### 1. Introduction (1 minute)
- **Équipe** : Présentez les membres et leur rôle
- **Contexte** : Application Todo List déployée sur AWS
- **Technologies** : React, Node.js, DynamoDB, ECS, Terraform

#### 2. Architecture & Choix Techniques (3 minutes)

**Slide 1 : Vue d'ensemble**
- Schéma d'architecture (voir `docs/architecture.md`)
- Justification des choix AWS (ECS vs EC2, DynamoDB vs RDS)

**Slide 2 : Infrastructure as Code**
- Organisation des modules Terraform
- Gestion de l'état avec S3 + DynamoDB
- Scalabilité et haute disponibilité

#### 3. Démonstration Live (4 minutes)

**Slide 3 : Application déployée**
- URL de l'application en production
- Démonstration des fonctionnalités CRUD
- Interface utilisateur responsive

**Slide 4 : Pipeline CI/CD**
- GitHub Actions en action
- Processus de déploiement automatisé
- Monitoring et logs CloudWatch

#### 4. Observabilité & DevOps (1.5 minutes)

**Slide 5 : Monitoring**
- Métriques CloudWatch (CPU, mémoire, requêtes)
- Logs centralisés
- Health checks et auto-recovery

#### 5. Conclusion & Questions (0.5 minute)
- Retour d'expérience
- Défis rencontrés et solutions
- Questions du jury

## 📊 Points d'évaluation à couvrir

### Qualité technique ✅
- **Dockerfiles** : Multi-stage builds, utilisateurs non-root
- **Terraform** : Modules réutilisables, variables, outputs
- **CI/CD** : Tests automatisés, build sécurisé, déploiement
- **Sécurité** : IAM roles, Security Groups, HTTPS

### Architecture Cloud ✅
- **Justification ECS Fargate** : Simplicité vs contrôle
- **Load Balancer** : Distribution et haute disponibilité
- **DynamoDB** : NoSQL pour performance et scalabilité
- **Multi-AZ** : Résilience et disponibilité

### Maîtrise des outils ✅
- **Docker** : Conteneurisation des applications
- **Terraform** : Provisioning reproductible
- **GitHub Actions** : Automatisation complète
- **AWS Services** : Intégration native

### Travail collaboratif ✅
- **Git** : Historique des commits, branches
- **Documentation** : README, guides de déploiement
- **Scripts** : Outils de développement (`scripts/dev.sh`)

## 🎤 Conseils pour la présentation

### Préparation
1. **Testez votre démo** : Assurez-vous que l'application fonctionne
2. **Préparez un backup** : Screenshots au cas où
3. **Répartissez les rôles** : Qui présente quoi
4. **Chronométrez** : Respectez les 10 minutes

### Pendant la présentation
1. **Soyez techniques** : Utilisez le vocabulaire approprié
2. **Montrez le code** : Quelques extraits clés
3. **Expliquez vos choix** : Pourquoi ECS et pas EC2 ?
4. **Soyez confiants** : Vous maîtrisez votre sujet

### Gestion des questions
- **Questions sur l'architecture** : Référez-vous au schéma
- **Questions sur la sécurité** : IAM, HTTPS, Security Groups
- **Questions sur les coûts** : Estimation ~$50-75/mois
- **Questions sur la scalabilité** : Auto Scaling ECS, DynamoDB

## 📝 Checklist avant présentation

### Infrastructure ✅
- [ ] Application accessible via ALB DNS
- [ ] Tests automatisés passent
- [ ] Pipeline CI/CD fonctionnel
- [ ] Monitoring CloudWatch actif

### Documentation ✅
- [ ] README complet
- [ ] Architecture documentée
- [ ] Guide de déploiement
- [ ] Historique Git propre

### Démonstration ✅
- [ ] Créer une tâche
- [ ] Modifier une tâche
- [ ] Supprimer une tâche
- [ ] Montrer les logs CloudWatch
- [ ] Montrer les métriques

### Support ✅
- [ ] Slides préparés
- [ ] URLs notées
- [ ] Screenshots de backup
- [ ] Partage d'écran testé

## 🚀 URLs importantes à noter

```bash
# Récupérer l'URL de l'application
cd infra/terraform
terraform output alb_dns_name

# URL de base
http://<ALB_DNS_NAME>

# API Health Check
http://<ALB_DNS_NAME>/health

# GitHub Repository
https://github.com/<USERNAME>/projet-fil-rouge-rendu

# GitHub Actions
https://github.com/<USERNAME>/projet-fil-rouge-rendu/actions
```

## 🎯 Questions potentielles et réponses

**Q: Pourquoi ECS et pas EC2 directement ?**
R: ECS Fargate offre une gestion simplifiée des conteneurs sans gestion de serveurs, auto-scaling natif, et facturation à l'usage.

**Q: Pourquoi DynamoDB et pas RDS ?**
R: Pour une application simple, DynamoDB offre des performances prévisibles, auto-scaling, et moins de maintenance qu'une base relationnelle.

**Q: Comment gérez-vous la sécurité ?**
R: IAM roles avec principe du moindre privilège, HTTPS terminé au load balancer, utilisateurs non-root dans les conteneurs, Security Groups restrictifs.

**Q: Quel est le coût de cette architecture ?**
R: Environ $50-75/mois en usage modéré, optimisable avec Reserved Instances et auto-scaling agressif.

**Q: Comment monitorer l'application ?**
R: CloudWatch pour les logs et métriques, health checks ECS, alertes sur seuils critiques.

**Q: Et la haute disponibilité ?**
R: Déploiement multi-AZ, auto-scaling ECS, load balancer, auto-recovery des tâches défaillantes.

## 📱 Commandes de démonstration

```bash
# Vérifier l'état des services
aws ecs describe-services --cluster todo-cluster --services todo-backend-service

# Voir les logs en temps réel
aws logs tail /ecs/todo-backend --follow

# Déclencher un déploiement
git push origin main

# Vérifier la santé de l'application
curl -s http://<ALB_DNS>/health | jq
```

## 🏆 Points de différenciation

- **Architecture professionnelle** : Production-ready avec monitoring
- **Sécurité** : Bonnes pratiques appliquées
- **Automatisation complète** : De commit à production
- **Documentation exhaustive** : Guides et schémas
- **Tests automatisés** : Backend et frontend
- **Observabilité** : Logs et métriques intégrés

---

**Bonne chance pour votre présentation ! 🚀**
