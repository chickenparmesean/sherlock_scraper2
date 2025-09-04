#!/bin/bash

echo "🎨 Starting Auditor Slide Generator Plugin Development"
echo "=================================================="

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "📦 Installing dependencies..."
    npm install
fi

echo "🔨 Building plugin..."
npm run build

echo "✅ Plugin built successfully!"
echo ""
echo "📋 Next Steps:"
echo "1. Open Figma Desktop App"
echo "2. Go to Plugins → Development → Import plugin from manifest..."
echo "3. Select the manifest.json file from this directory"
echo "4. Start using the plugin!"
echo ""
echo "🛠️  Development Commands:"
echo "  npm run dev     - Start development mode with watch"
echo "  npm run build   - Build for production"
echo "  npm run start   - Start development server"
echo ""
echo "📖 See README.md for detailed usage instructions"