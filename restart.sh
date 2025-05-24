#!/bin/bash

echo "🧹 Cleaning build cache..."
rm -rf node_modules/.cache
rm -rf build

echo "📦 Reinstalling dependencies..."
npm install

echo "🚀 Starting development server..."
npm start