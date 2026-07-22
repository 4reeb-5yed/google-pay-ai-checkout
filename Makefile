.PHONY: setup lint format test build docs clean help

help: ## Show this help message
	@grep -E '^[a-zA-Z_-]+:.*?## .*$$' $(MAKEFILE_LIST) | sort | awk 'BEGIN {FS = ":.*?## "}; {printf "\033[36m%-20s\033[0m %s\n", $$1, $$2}'

setup: ## Install dependencies
	npm install
	@echo "Setup complete. See CONTRIBUTING.md for full development workflow."

lint: ## Run linters
	npm run lint

format: ## Format code
	npm run format

test: ## Run test suite
	npm run test

build: ## Build project
	npm run build

docs: ## Validate documentation
	@echo "Documentation validation will be configured with CI/CD pipeline"

clean: ## Clean build artifacts
	rm -rf dist/ build/ coverage/ node_modules/
