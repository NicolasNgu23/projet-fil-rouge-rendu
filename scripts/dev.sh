#!/bin/bash

# Script de développement local pour le projet Fil Rouge

set -e

# Couleurs pour les messages
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Fonctions utilitaires
log_info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

log_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

log_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

log_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Fonction pour vérifier les prérequis
check_prerequisites() {
    log_info "Vérification des prérequis..."
    
    # Vérifier Docker
    if ! command -v docker &> /dev/null; then
        log_error "Docker n'est pas installé"
        exit 1
    fi
    
    # Vérifier Docker Compose
    if ! command -v docker-compose &> /dev/null; then
        log_error "Docker Compose n'est pas installé"
        exit 1
    fi
    
    # Vérifier Node.js
    if ! command -v node &> /dev/null; then
        log_warning "Node.js n'est pas installé (optionnel pour le développement local)"
    fi
    
    # Vérifier Terraform
    if ! command -v terraform &> /dev/null; then
        log_warning "Terraform n'est pas installé (requis pour le déploiement)"
    fi
    
    # Vérifier AWS CLI
    if ! command -v aws &> /dev/null; then
        log_warning "AWS CLI n'est pas installé (requis pour le déploiement)"
    fi
    
    log_success "Prérequis vérifiés"
}

# Fonction pour construire les images Docker
build_images() {
    log_info "Construction des images Docker..."
    
    # Construire l'image backend
    log_info "Construction de l'image backend..."
    docker build -t todo-backend:local ./backend
    
    # Construire l'image frontend
    log_info "Construction de l'image frontend..."
    docker build -t todo-frontend:local ./frontend
    
    log_success "Images construites avec succès"
}

# Fonction pour démarrer l'environnement local
start_local() {
    log_info "Démarrage de l'environnement local..."
    
    # Créer le réseau Docker s'il n'existe pas
    docker network create todo-network 2>/dev/null || true
    
    # Démarrer les services avec Docker Compose
    docker-compose up -d
    
    log_success "Environnement local démarré"
    log_info "Backend disponible sur: http://localhost:3000"
    log_info "Frontend disponible sur: http://localhost:3001"
}

# Fonction pour arrêter l'environnement local
stop_local() {
    log_info "Arrêt de l'environnement local..."
    docker-compose down
    log_success "Environnement local arrêté"
}

# Fonction pour nettoyer les ressources Docker
clean_docker() {
    log_info "Nettoyage des ressources Docker..."
    
    # Arrêter tous les conteneurs
    docker-compose down
    
    # Supprimer les images locales
    docker rmi todo-backend:local todo-frontend:local 2>/dev/null || true
    
    # Nettoyer les ressources inutilisées
    docker system prune -f
    
    log_success "Nettoyage terminé"
}

# Fonction pour valider le code Terraform
validate_terraform() {
    log_info "Validation du code Terraform..."
    
    cd infra/terraform
    
    # Initialiser Terraform (en mode local)
    terraform init -backend=false
    
    # Formater le code
    terraform fmt -recursive
    
    # Valider la syntaxe
    terraform validate
    
    cd ../..
    
    log_success "Code Terraform validé"
}

# Fonction pour installer les dépendances
install_dependencies() {
    log_info "Installation des dépendances..."
    
    # Installer les dépendances backend
    if [ -f "backend/package.json" ]; then
        log_info "Installation des dépendances backend..."
        cd backend && npm install && cd ..
    fi
    
    # Installer les dépendances frontend
    if [ -f "frontend/package.json" ]; then
        log_info "Installation des dépendances frontend..."
        cd frontend && npm install && cd ..
    fi
    
    log_success "Dépendances installées"
}

# Fonction pour exécuter les tests
run_tests() {
    log_info "Exécution des tests..."
    
    # Tests backend
    if [ -f "backend/package.json" ]; then
        log_info "Tests backend..."
        cd backend && npm test && cd ..
    fi
    
    # Tests frontend
    if [ -f "frontend/package.json" ]; then
        log_info "Tests frontend..."
        cd frontend && npm test -- --watchAll=false && cd ..
    fi
    
    log_success "Tests terminés"
}

# Fonction pour afficher les logs
show_logs() {
    log_info "Affichage des logs..."
    docker-compose logs -f
}

# Fonction pour afficher l'aide
show_help() {
    echo "Usage: $0 [COMMAND]"
    echo ""
    echo "Commands:"
    echo "  check       Vérifier les prérequis"
    echo "  install     Installer les dépendances"
    echo "  build       Construire les images Docker"
    echo "  start       Démarrer l'environnement local"
    echo "  stop        Arrêter l'environnement local"
    echo "  restart     Redémarrer l'environnement local"
    echo "  logs        Afficher les logs"
    echo "  test        Exécuter les tests"
    echo "  validate    Valider le code Terraform"
    echo "  clean       Nettoyer les ressources Docker"
    echo "  help        Afficher cette aide"
    echo ""
    echo "Examples:"
    echo "  $0 check"
    echo "  $0 start"
    echo "  $0 logs"
}

# Menu principal
case "$1" in
    check)
        check_prerequisites
        ;;
    install)
        check_prerequisites
        install_dependencies
        ;;
    build)
        check_prerequisites
        build_images
        ;;
    start)
        check_prerequisites
        build_images
        start_local
        ;;
    stop)
        stop_local
        ;;
    restart)
        stop_local
        build_images
        start_local
        ;;
    logs)
        show_logs
        ;;
    test)
        run_tests
        ;;
    validate)
        validate_terraform
        ;;
    clean)
        clean_docker
        ;;
    help|--help|-h)
        show_help
        ;;
    *)
        log_error "Commande inconnue: $1"
        show_help
        exit 1
        ;;
esac
