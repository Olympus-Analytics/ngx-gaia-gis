#!/bin/bash

# Deploy script for ngx-gaia-gis library
# This script automates the build and publish process

set -e  # Exit on any error

echo "🚀 Starting deployment process for ngx-gaia-gis..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if we're in the correct directory
if [ ! -f "angular.json" ]; then
    print_error "Please run this script from the root of the ngx-gaia-gis project"
    exit 1
fi

# Check if npm is logged in
if ! npm whoami > /dev/null 2>&1; then
    print_error "You need to be logged in to npm. Run 'npm login' first."
    exit 1
fi

print_status "Logged in as: $(npm whoami)"

# Get current version
CURRENT_VERSION=$(node -p "require('./projects/gaia-gis/package.json').version")
print_status "Current version: $CURRENT_VERSION"

# Ask for version bump type
echo ""
echo "Choose version bump type:"
echo "1) patch (bug fixes)"
echo "2) minor (new features)"
echo "3) major (breaking changes)"
echo "4) custom version"
echo "5) keep current version"
read -p "Enter your choice (1-5): " VERSION_CHOICE

case $VERSION_CHOICE in
    1)
        VERSION_TYPE="patch"
        ;;
    2)
        VERSION_TYPE="minor"
        ;;
    3)
        VERSION_TYPE="major"
        ;;
    4)
        read -p "Enter custom version (e.g., 1.0.7): " CUSTOM_VERSION
        VERSION_TYPE=$CUSTOM_VERSION
        ;;
    5)
        VERSION_TYPE="current"
        ;;
    *)
        print_error "Invalid choice"
        exit 1
        ;;
esac

# Update version if needed
if [ "$VERSION_TYPE" != "current" ]; then
    print_status "Updating version..."
    cd projects/gaia-gis

    if [ "$VERSION_CHOICE" == "4" ]; then
        npm version $CUSTOM_VERSION --no-git-tag-version
    else
        npm version $VERSION_TYPE --no-git-tag-version
    fi

    cd ../..
    NEW_VERSION=$(node -p "require('./projects/gaia-gis/package.json').version")
    print_success "Version updated to: $NEW_VERSION"
else
    NEW_VERSION=$CURRENT_VERSION
    print_status "Keeping current version: $NEW_VERSION"
fi

# Clean previous builds
print_status "Cleaning previous builds..."
rm -rf dist/gaia-gis

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    print_status "Installing dependencies..."
    bun install
fi

# Build the library
print_status "Building library for production..."
ng build Gaia-GIS --configuration production

if [ $? -ne 0 ]; then
    print_error "Build failed"
    exit 1
fi

print_success "Build completed successfully"

# Verify build output
if [ ! -d "dist/gaia-gis" ]; then
    print_error "Build output not found in dist/gaia-gis"
    exit 1
fi

# Check if files exist
REQUIRED_FILES=("package.json" "README.md" "index.d.ts" "fesm2022/ngx-gaia-gis.mjs")
for file in "${REQUIRED_FILES[@]}"; do
    if [ ! -f "dist/gaia-gis/$file" ]; then
        print_error "Required file missing: $file"
        exit 1
    fi
done

print_success "All required files present"

# Show what will be published
print_status "Package contents:"
cd dist/gaia-gis
npm pack --dry-run
cd ../..

# Confirm publication
echo ""
read -p "Do you want to publish version $NEW_VERSION to npm? (y/N): " CONFIRM

if [[ $CONFIRM =~ ^[Yy]$ ]]; then
    print_status "Publishing to npm..."
    cd dist/gaia-gis
    npm publish --access public

    if [ $? -eq 0 ]; then
        print_success "Successfully published ngx-gaia-gis@$NEW_VERSION to npm!"

        # Return to root directory
        cd ../..

        # Create git tag if version was updated
        if [ "$VERSION_TYPE" != "current" ]; then
            print_status "Creating git tag..."
            git add projects/gaia-gis/package.json
            git commit -m "chore: bump version to $NEW_VERSION"
            git tag "v$NEW_VERSION"

            print_status "Git tag v$NEW_VERSION created"
            print_warning "Don't forget to push your changes and tags:"
            echo "git push origin main"
            echo "git push origin v$NEW_VERSION"
        fi

        echo ""
        print_success "🎉 Deployment completed!"
        echo ""
        echo "Your package is now available at:"
        echo "https://www.npmjs.com/package/ngx-gaia-gis"
        echo ""
        echo "To install: npm install ngx-gaia-gis@$NEW_VERSION"

    else
        print_error "Publication failed"
        cd ../..
        exit 1
    fi
else
    print_warning "Publication cancelled"
    cd ../..
fi

echo ""
print_status "Deployment script finished"
