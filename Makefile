# Makefile for Tuya Device Controller
# Provides common commands for development and deployment

.PHONY: help install dev build clean test lint docker-build docker-run deploy health-check

# Default target
help: ## Show this help message
	@echo "Tuya Device Controller - Available Commands:"
	@echo ""
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "  \033[36m%-20s\033[0m %s\n", $$1, $$2}'

# Development commands
install: ## Install dependencies
	npm ci

dev: ## Start development server
	npm run dev

build: ## Build application for production
	npm run build

clean: ## Clean build artifacts and node_modules
	rm -rf dist node_modules

test: ## Run tests (if implemented)
	@echo "Tests not yet implemented"

lint: ## Run linter
	npm run lint

# Docker commands
docker-build: ## Build Docker image
	docker build -t tuya-controller .

docker-run: ## Run Docker container
	docker run -p 80:80 tuya-controller

docker-dev: ## Start development environment with Docker
	docker-compose --profile dev up

docker-prod: ## Start production environment with Docker
	docker-compose up -d

docker-stop: ## Stop Docker containers
	docker-compose down

docker-logs: ## View Docker container logs
	docker-compose logs -f

# Deployment commands
deploy: ## Deploy application using Docker Compose
	./scripts/deploy.sh

deploy-staging: ## Deploy to staging environment
	./scripts/deploy.sh staging

deploy-prod: ## Deploy to production environment
	./scripts/deploy.sh latest docker-compose.prod.yml

# Utility commands
health-check: ## Check application health
	./scripts/health-check.sh

setup: ## Setup development environment
	./scripts/setup.sh

# CI/CD commands
ci-install: ## Install dependencies for CI
	npm ci --include=dev

ci-build: ## Build for CI/CD
	npm run build

ci-lint: ## Run linter for CI/CD
	npm run lint

ci-security: ## Run security audit
	npm audit --audit-level moderate

# Cleanup commands
docker-clean: ## Clean Docker images and containers
	docker system prune -f
	docker volume prune -f

docker-reset: ## Reset Docker environment completely
	docker-compose down -v --remove-orphans
	docker system prune -af
	docker volume prune -f