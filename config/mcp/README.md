# MCP Server Configuration

> **Master Plan Reference**: Section 20 (AI-Native Software Engineering)

## Purpose

Configuration templates for connecting AI tools to the Google Pay MCP Server.

## Setup

1. Copy `mcp-config.template.json` to `mcp-config.json`
2. Replace placeholder values with your actual configuration
3. Never commit `mcp-config.json` (it's in .gitignore)

## Required Configuration

| Variable | Purpose | Format |
|----------|---------|--------|
| `<MCP_SERVER_URL>` | Google Pay MCP Server endpoint | URL |
| `<MCP_AUTH_TOKEN>` | Authentication token for MCP access | Bearer token |
