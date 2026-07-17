#!/bin/bash

# Feature Completion Goal Checker for Angular HN PWA
# Usage: ./check-feature-complete.sh <feature-name> [--strict]

set -e

FEATURE_NAME="$1"
STRICT_MODE="${2:-}"

# Validate input
if [ -z "$FEATURE_NAME" ]; then
    cat << 'EOF'
{
  "decision": "block",
  "reason": "Feature name required. Usage: check-feature-complete.sh <feature-name> [--strict]"
}
EOF
    exit 0
fi

# Function to log progress
log_progress() {
    echo "[$(date '+%Y-%m-%d %H:%M:%S')] Feature: $FEATURE_NAME - $1" >> ".devin/feature-progress.log"
}

# Function to check if directory exists
check_directory() {
    if [ -d "src/app/$1" ]; then
        log_progress "✓ Directory src/app/$1 exists"
        return 0
    else
        log_progress "✗ Directory src/app/$1 missing"
        return 1
    fi
}

# Function to check for required Angular files
check_angular_files() {
    log_progress "Checking Angular component files..."

    local component_exists=false
    local test_exists=false
    local html_exists=false
    local css_exists=false
    local spec_exists=false
    local module_exists=false

    # Check for component file
    if [ -f "src/app/${FEATURE_NAME}/${FEATURE_NAME}.component.ts" ]; then
        component_exists=true
        log_progress "✓ Component file found"
    else
        log_progress "✗ Component file missing"
    fi

    # Check for HTML template
    if [ -f "src/app/${FEATURE_NAME}/${FEATURE_NAME}.component.html" ]; then
        html_exists=true
        log_progress "✓ HTML template found"
    else
        log_progress "✗ HTML template missing"
    fi

    # Check for CSS/SCSS file
    if [ -f "src/app/${FEATURE_NAME}/${FEATURE_NAME}.component.scss" ] || [ -f "src/app/${FEATURE_NAME}/${FEATURE_NAME}.component.css" ]; then
        css_exists=true
        log_progress "✓ Style file found"
    else
        log_progress "✗ Style file missing"
    fi

    # Check for test file
    if [ -f "src/app/${FEATURE_NAME}/${FEATURE_NAME}.component.spec.ts" ]; then
        test_exists=true
        log_progress "✓ Test file found"
    else
        log_progress "✗ Test file missing"
    fi

    # Check for module file (if it's a lazy-loaded module)
    if [ -f "src/app/${FEATURE_NAME}/${FEATURE_NAME}.module.ts" ]; then
        module_exists=true
        log_progress "✓ Module file found"
    else
        log_progress "ℹ Module file not required or missing"
    fi

    echo "$component_exists,$test_exists,$html_exists,$css_exists,$module_exists"
}

# Function to check component content quality
check_component_quality() {
    log_progress "Checking component quality..."

    local component_file="src/app/${FEATURE_NAME}/${FEATURE_NAME}.component.ts"

    if [ ! -f "$component_file" ]; then
        return 1
    fi

    # Check for basic Angular component structure
    if grep -q "@Component" "$component_file" && \
       grep -q "selector:" "$component_file" && \
       grep -q "templateUrl:" "$component_file" && \
       grep -q "styleUrls:" "$component_file"; then
        log_progress "✓ Component has proper Angular decorators"
        return 0
    else
        log_progress "✗ Component missing required Angular decorators"
        return 1
    fi
}

# Function to check if tests pass
check_tests() {
    log_progress "Running tests for feature..."

    # First check if any test files exist
    if ! find src/app -name "*.spec.ts" -path "*/${FEATURE_NAME}/*" | grep -q .; then
        log_progress "ℹ No test files found for feature"
        return 1
    fi

    # Run tests specific to the feature if possible
    if NODE_OPTIONS=--openssl-legacy-provider npm test -- --watch=false --browsers=ChromeHeadless --include="**/${FEATURE_NAME}/**/*.spec.ts" >/dev/null 2>&1; then
        log_progress "✓ Feature tests pass"
        return 0
    else
        log_progress "✗ Feature tests fail"
        return 1
    fi
}

# Function to check TypeScript compilation
check_compilation() {
    log_progress "Checking TypeScript compilation..."

    # Use Angular CLI to check compilation
    if NODE_OPTIONS=--openssl-legacy-provider npx ng build --aot --buildOptimizer 2>/dev/null | grep -q "ERROR"; then
        log_progress "✗ TypeScript compilation errors"
        return 1
    else
        log_progress "✓ TypeScript compilation successful"
        return 0
    fi
}

# Function to check linting
check_lint() {
    log_progress "Running lint check..."

    if npm run lint 2>/dev/null | grep -q "error"; then
        log_progress "✗ Lint errors found"
        return 0  # Don't block on this, just log
    else
        log_progress "✓ Lint check passed"
        return 0  # Don't block on this, just log
    fi
}

# Function to check if feature is integrated in routing
check_routing_integration() {
    log_progress "Checking routing integration..."

    if grep -q "${FEATURE_NAME}" src/app/app.routes.ts 2>/dev/null; then
        log_progress "✓ Feature found in routing configuration"
        return 0
    else
        log_progress "ℹ Feature not found in routing (may be intentional)"
        return 0  # Don't block on this, just log
    fi
}

# Main logic
log_progress "Starting feature completion check"

# Check if feature directory exists
if ! check_directory "$FEATURE_NAME"; then
    cat << EOF
{
  "decision": "block",
  "reason": "Feature directory 'src/app/${FEATURE_NAME}' does not exist"
}
EOF
    exit 0
fi

# Check required files
file_results=$(check_angular_files)
component_exists=$(echo "$file_results" | cut -d',' -f1)
test_exists=$(echo "$file_results" | cut -d',' -f2)
html_exists=$(echo "$file_results" | cut -d',' -f3)
css_exists=$(echo "$file_results" | cut -d',' -f4)

# Basic validation
if [ "$component_exists" = false ] || [ "$html_exists" = false ] || [ "$css_exists" = false ]; then
    missing_files=()
    [ "$component_exists" = false ] && missing_files+=("component.ts")
    [ "$html_exists" = false ] && missing_files+=("component.html")
    [ "$css_exists" = false ] && missing_files+=("component.scss/css")

    reason="Missing required files: $(IFS=', '; echo "${missing_files[*]}")"
    cat << EOF
{
  "decision": "block",
  "reason": "$reason"
}
EOF
    exit 0
fi

# Check component quality
if ! check_component_quality; then
    cat << 'EOF'
{
  "decision": "block",
  "reason": "Component missing required Angular decorators or structure"
}
EOF
    exit 0
fi

# In strict mode, require tests
if [ "$STRICT_MODE" = "--strict" ] && [ "$test_exists" = false ]; then
    cat << 'EOF'
{
  "decision": "block",
  "reason": "Strict mode: Test file is required"
}
EOF
    exit 0
fi

# Check compilation
if ! check_compilation; then
    cat << 'EOF'
{
  "decision": "block",
  "reason": "TypeScript compilation errors"
}
EOF
    exit 0
fi

# Optional checks (don't block but log)
check_routing_integration
check_lint

# In strict mode, require passing tests
if [ "$STRICT_MODE" = "--strict" ] && [ "$test_exists" = true ]; then
    if ! check_tests; then
        cat << 'EOF'
{
  "decision": "block",
  "reason": "Strict mode: Feature tests must pass"
}
EOF
        exit 0
    fi
fi

# All checks passed
log_progress "✓ Feature completion validated successfully"
cat << 'EOF'
{
  "decision": "approve",
  "reason": "Feature implementation complete and validated"
}
EOF
