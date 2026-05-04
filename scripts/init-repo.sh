#!/bin/bash

# Script to initialize the repository by replacing template variables

# Check if the not-initialized-repo file exists
if [ ! -f "not-intialized-repo" ]; then
    echo "Repository is already initialized. Skipping initialization."
    exit 0
fi

# Check if the required arguments are provided
if [ $# -ne 5 ]; then
    echo "Usage: $0 <app-display-name> <repo-name> <app-url-prefix> <frontend-port> <backend-port>"
    echo "Example: $0 \"Tatkal Pulse\" tatkal-pulse /tatkal/pulse 8001 8002"
    exit 1
fi
 
APP_DISPLAY_NAME=$1
REPO_NAME=$2
APP_URL_PREFIX=$3
FRONTEND_PORT=$4
BACKEND_PORT=$5

# Create a DB-friendly version of REPO_NAME with hyphens replaced by underscores and _db suffix
DB_NAME=$(echo $REPO_NAME | tr '-' '_')
DB_NAME="${DB_NAME}_db"

echo "Initializing repository with:"
echo "  App Display Name: $APP_DISPLAY_NAME"
echo "  Repo Name: $REPO_NAME"
echo "  DB Name: $DB_NAME"
echo "  App URL Prefix: $APP_URL_PREFIX"
echo "  Frontend Port: $FRONTEND_PORT"
echo "  Backend Port: $BACKEND_PORT"

# Find and replace template variables in all files
echo "Replacing template variables in all files..."

# Find and replace display name (App Display Name)
find . -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/scripts/init-repo.sh" \
    -exec grep -l "{{APP_DISPLAY_NAME}}" {} \; | xargs -I{} sed -i.bak "s/{{APP_DISPLAY_NAME}}/$APP_DISPLAY_NAME/g" {}

# Find all files (excluding node_modules, .git, etc.) and replace repo name variables
find . -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/scripts/init-repo.sh" \
    -exec grep -l "{{REPO_NAME}}" {} \; | xargs -I{} sed -i.bak "s/{{REPO_NAME}}/$REPO_NAME/g" {}

# Handle DB name (replacing {{DB_NAME}} with underscore version)
find . -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/scripts/init-repo.sh" \
    -exec grep -l "{{DB_NAME}}" {} \; | xargs -I{} sed -i.bak "s/{{DB_NAME}}/$DB_NAME/g" {}

# Escape slashes in APP_URL_PREFIX for sed
ESCAPED_URL_PREFIX=$(echo "$APP_URL_PREFIX" | sed 's/\//\\\//g')
echo "Escaped URL prefix: $ESCAPED_URL_PREFIX"

find . -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/scripts/init-repo.sh" \
    -exec grep -l "{{APP_URL_PREFIX}}" {} \; | xargs -I{} sed -i.bak "s/{{APP_URL_PREFIX}}/$ESCAPED_URL_PREFIX/g" {}

# Replace frontend port placeholder
find . -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/scripts/init-repo.sh" \
    -exec grep -l "{{FRONTEND_PORT}}" {} \; | xargs -I{} sed -i.bak "s/{{FRONTEND_PORT}}/$FRONTEND_PORT/g" {}

# Replace backend port placeholder
find . -type f \
    -not -path "*/node_modules/*" \
    -not -path "*/.git/*" \
    -not -path "*/dist/*" \
    -not -path "*/scripts/init-repo.sh" \
    -exec grep -l "{{BACKEND_PORT}}" {} \; | xargs -I{} sed -i.bak "s/{{BACKEND_PORT}}/$BACKEND_PORT/g" {}

# Clean up backup files
find . -name "*.bak" -type f -delete

# Git operations
echo "Performing Git operations..."

# 0. Set Git configuration for the commit
git config user.name "BYOT Ops" || true
git config user.email "byot.ops@piramal.com" || true
echo "Set Git user configuration"

# 1. Backup .env file
cp .env .env.bak
echo "Created backup of .env file as .env.bak"

# 2. Delete .env
if [ -f ".env" ]; then
    rm .env
    echo "Deleted .env file"
else
    echo "No .env file found to delete"
fi

# 3. Remove the not-initialized-repo file
rm not-intialized-repo
echo "Removed not-intialized-repo file"


# 4. Create a Git commit for initialization
git add .
git commit -m "Initialize repository with app name: $APP_DISPLAY_NAME, repo name: $REPO_NAME, and URL prefix: $APP_URL_PREFIX"
echo "Created Git commit for initialization"
# 5. Restore the .env file from the backup
if [ -f ".env.bak" ]; then
    mv .env.bak .env
    echo "Restored .env file from backup"
else
    echo "No backup of .env file found to restore"
fi

# 5. Delete the .env.bak file
if [ -f ".env.bak" ]; then
    rm .env.bak
    echo "Deleted backup of .env file"
else
    echo "No backup of .env file found to delete"
fi

echo "Repository initialization complete!"
echo "App display name set to: $APP_DISPLAY_NAME"
echo "Repo name set to: $REPO_NAME"
echo "API URL prefix set to: $APP_URL_PREFIX"
echo ""
echo "Next steps:"
echo "1. Run 'npm run install:all' to install dependencies"
echo "2. Run 'npm run dev' to start the development server"
