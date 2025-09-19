#!/bin/bash

set -e

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

# Check if we're in a git repository
if ! git rev-parse --git-dir > /dev/null 2>&1; then
    print_error "Not in a git repository"
    exit 1
fi

# Check if we have uncommitted changes
if ! git diff-index --quiet HEAD --; then
    print_error "You have uncommitted changes. Please commit or stash them before creating a release."
    exit 1
fi

# Check if package.json exists
if [ ! -f "package.json" ]; then
    print_error "package.json not found in current directory"
    exit 1
fi

# Check if gh CLI is installed for GitHub releases
if ! command -v gh &> /dev/null; then
    print_warning "GitHub CLI (gh) not found. Release will be created without GitHub CLI."
    USE_GH=false
else
    USE_GH=true
fi

# Get current version from package.json
CURRENT_VERSION=$(node -p "require('./package.json').version")
print_status "Current version: $CURRENT_VERSION"

# Split version into parts
IFS='.' read -ra VERSION_PARTS <<< "$CURRENT_VERSION"
MAJOR=${VERSION_PARTS[0]}
MINOR=${VERSION_PARTS[1]}
PATCH=${VERSION_PARTS[2]}

# Increment patch version
NEW_PATCH=$((PATCH + 1))
NEW_VERSION="$MAJOR.$MINOR.$NEW_PATCH"

print_status "New version will be: $NEW_VERSION"

# Ask for confirmation
read -p "Do you want to create release $NEW_VERSION? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    print_warning "Release creation cancelled"
    exit 0
fi

# Update package.json version
print_status "Updating package.json version to $NEW_VERSION"
if command -v node &> /dev/null; then
    node -e "
        const fs = require('fs');
        const pkg = JSON.parse(fs.readFileSync('package.json', 'utf8'));
        pkg.version = '$NEW_VERSION';
        fs.writeFileSync('package.json', JSON.stringify(pkg, null, 2) + '\n');
    "
else
    # Fallback using sed (less reliable but works without Node.js)
    sed -i.bak "s/\"version\": \"$CURRENT_VERSION\"/\"version\": \"$NEW_VERSION\"/" package.json
    rm package.json.bak
fi

print_success "Updated package.json version"

# Build the project to ensure everything works
print_status "Building project to verify everything works..."
if command -v bun &> /dev/null; then
    bun run build
else
    npm run build
fi

print_success "Build completed successfully"

# Commit the version change
print_status "Committing version change"
git add package.json
git commit -m "chore: bump version to $NEW_VERSION"

# Create git tag
print_status "Creating git tag v$NEW_VERSION"
git tag -a "v$NEW_VERSION" -m "Release v$NEW_VERSION"

# Push changes and tags
print_status "Pushing changes and tags to remote"
git push origin $(git branch --show-current)
git push origin "v$NEW_VERSION"

print_success "Git tag v$NEW_VERSION created and pushed"

# Create GitHub release
if [ "$USE_GH" = true ]; then
    print_status "Creating GitHub release"
    
    # Generate release notes (basic changelog)
    RELEASE_NOTES="## What's Changed

Release v$NEW_VERSION

### Changes since v$CURRENT_VERSION:
$(git log v$CURRENT_VERSION..HEAD --pretty=format:'- %s (%h)' --no-merges)

**Full Changelog**: https://github.com/xtreamium/xtreamium-web/compare/v$CURRENT_VERSION...v$NEW_VERSION"

    if gh release create "v$NEW_VERSION" \
        --title "Release v$NEW_VERSION" \
        --notes "$RELEASE_NOTES" \
        --latest; then
        print_success "GitHub release v$NEW_VERSION created successfully"
        print_status "Release URL: https://github.com/xtreamium/xtreamium-web/releases/tag/v$NEW_VERSION"
    else
        print_error "Failed to create GitHub release. You can create it manually at:"
        print_error "https://github.com/xtreamium/xtreamium-web/releases/new?tag=v$NEW_VERSION"
    fi
else
    print_warning "GitHub CLI not available. Please create the release manually at:"
    print_warning "https://github.com/xtreamium/xtreamium-web/releases/new?tag=v$NEW_VERSION"
fi

print_success "Release process completed!"
print_status "Version $NEW_VERSION has been:"
print_status "  ✓ Updated in package.json"
print_status "  ✓ Committed to git"
print_status "  ✓ Tagged as v$NEW_VERSION"
print_status "  ✓ Pushed to remote repository"
if [ "$USE_GH" = true ]; then
    print_status "  ✓ Published as GitHub release"
else
    print_status "  ⚠ GitHub release needs to be created manually"
fi