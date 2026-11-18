.PHONY: help install dev build start lint typecheck format format-check test ci docker-build docker-up docker-down clean

help: ## Show available targets
	@grep -E '^[a-zA-Z_-]+:.*?## ' $(MAKEFILE_LIST) | awk 'BEGIN {FS = ":.*?## "}; {printf "  %-16s %s\n", $$1, $$2}'

install: ## Install npm dependencies
	npm ci

dev: ## Run Next.js dev server
	npm run dev

build: ## Production build
	npm run build

start: ## Start production server
	npm run start

lint: ## ESLint
	npm run lint

typecheck: ## TypeScript check
	npm run typecheck

format: ## Write Prettier formatting
	npm run format

format-check: ## Check Prettier formatting
	npm run format:check

test: ## Alias for local quality gates (lint + types)
	npm run test

ci: ## Full local CI parity
	npm run ci

docker-build: ## Build production Docker image
	docker build -t domp-site:local .

docker-up: ## Start compose dev environment
	docker compose up --build

docker-down: ## Stop compose environment
	docker compose down

clean: ## Remove build artifacts
	rm -rf .next out coverage
