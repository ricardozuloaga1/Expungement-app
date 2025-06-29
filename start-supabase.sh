#!/bin/bash

export NODE_ENV=development
export DATABASE_URL="postgresql://postgres.xssividnqebolxurgzpj:Ric70707070@@!!@@@aws-0-us-east-2.pooler.supabase.com:6543/postgres"
export JWT_SECRET="3zwDexeq2nDWQPSfcBW2J/vx0eSP56PEk+TimOZmNLd5RvwSJJSlDUxFMOeNycVKlwz+UAD2JElJhfPHSoBPgw=="
export SUPABASE_URL="https://xssividnqebolxurgzpj.supabase.co"
export SUPABASE_SERVICE_ROLE_KEY="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inhzc2l2aWRucWVib2x4dXJnenBqIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1MTA1NDg3NywiZXhwIjoyMDY2NjMwODc3fQ.ntldXOJgKX4cpN5ELBdYGbO-8mvMPkFVqh2fQP87V8s"

echo "Starting server with Supabase configuration..."
node dist/server/index.js 