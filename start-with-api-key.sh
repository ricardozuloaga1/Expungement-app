#!/bin/bash

# Set the OpenAI API key from environment variable
# Make sure to set OPENAI_API_KEY in your environment before running this script
if [ -z "$OPENAI_API_KEY" ]; then
    echo "❌ Error: OPENAI_API_KEY environment variable is not set"
    echo "Please set your OpenAI API key:"
    echo "export OPENAI_API_KEY='your-api-key-here'"
    echo "Then run: ./start-with-api-key.sh"
    exit 1
fi

echo "✅ OpenAI API key found, starting development server..."

# Start the development server
npm run dev
