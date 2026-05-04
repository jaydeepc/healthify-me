#!/bin/bash

# Load parameters and generate .env.export file
echo "Loading environment parameters..."
node --experimental-modules scripts/params/load-params.js

# Source the exported environment variables
if [ -f ".env.export" ]; then
  echo "Sourcing environment variables from .env.export..."
  source "$(pwd)/.env.export"
else
  echo "Warning: .env.export file not found. Environment variables may not be available."
fi

# Delete the .env.export file if it exists
if [ -f ".env.export" ]; then
  echo "Deleting .env.export file..."
  rm .env.export
fi

# Start the applications
echo "Starting applications..."
concurrently "cd backend && npm run dev" "cd frontend && npm run dev"
