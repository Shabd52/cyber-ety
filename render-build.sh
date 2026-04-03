#!/bin/bash
# render-build.sh
# Build script for Render deployment

echo "🚀 Starting Render build process..."
echo ""

# Build shared first
echo "📦 Building shared module..."
cd shared
npm install
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Shared module build failed"
  exit 1
fi

echo "✅ Shared module built successfully"
echo ""

# Navigate to backend
echo "📦 Building backend..."
cd ../backend
npm install
npm run build

if [ $? -ne 0 ]; then
  echo "❌ Backend build failed"
  exit 1
fi

echo "✅ Backend built successfully"
echo ""

# Go back to root
cd ..

echo "🎉 Build process complete! Ready for deployment."
