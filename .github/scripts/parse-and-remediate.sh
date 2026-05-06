#!/usr/bin/env bash
# parse-and-remediate.sh
#
# Parses Black Duck scan results (or mock data) and creates Devin sessions
# via the Devin API for each vulnerability meeting the severity threshold.
#
# Required env vars:
#   DEVIN_API_KEY       - API key for creating Devin sessions
#   GITHUB_REPOSITORY   - owner/repo (e.g., "EvangelosG/angular2-hn")
#   MIN_SEVERITY        - Minimum severity to act on: CRITICAL, HIGH, MEDIUM, or LOW
#   DRY_RUN             - If "true", log what would happen without calling the API

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_FILE="${SCRIPT_DIR}/blackduck-results.json"
SESSION_LOG="${SCRIPT_DIR}/devin-sessions.log"
DEVIN_API_URL="https://api.devin.ai/v1/sessions"

# Severity ranking for threshold comparison
declare -A SEVERITY_RANK=(
  ["CRITICAL"]=4
  ["HIGH"]=3
  ["MEDIUM"]=2
  ["LOW"]=1
)

# ── Locate scan results ─────────────────────────────────────────────────────

find_scan_results() {
  # Black Duck Rapid scan outputs JSON to a runs/ directory
  local rapid_results
  rapid_results=$(find . -path "*/runs/*.json" -type f 2>/dev/null | head -1)

  if [[ -n "$rapid_results" ]]; then
    echo "Found Black Duck Rapid scan results: $rapid_results"
    normalize_blackduck_results "$rapid_results"
    return 0
  fi

  # Check for mock data
  if [[ -f "$RESULTS_FILE" ]]; then
    echo "Using existing results file: $RESULTS_FILE"
    return 0
  fi

  echo "No scan results found."
  echo '{"vulnerabilities":[]}' > "$RESULTS_FILE"
  return 0
}

# ── Normalize Black Duck JSON to a common format ────────────────────────────

normalize_blackduck_results() {
  local input_file="$1"

  # Black Duck Rapid scan output varies by version. This handles the common
  # format where each entry has componentName, componentVersion, and a
  # violatingPolicies array with vulnerability details.
  jq '[
    .[] |
    select(.violatingPolicies != null and (.violatingPolicies | length) > 0) |
    {
      component: "\(.componentName)@\(.componentVersion)",
      component_name: .componentName,
      component_version: .componentVersion,
      cve: (if .vulnerabilities and (.vulnerabilities | length) > 0
            then .vulnerabilities[0].name
            else "N/A" end),
      severity: (if .vulnerabilities and (.vulnerabilities | length) > 0
                 then .vulnerabilities[0].vulnSeverity
                 else "UNKNOWN" end),
      description: (if .vulnerabilities and (.vulnerabilities | length) > 0
                    then (.vulnerabilities[0].description // "No description available")
                    else "Policy violation without specific CVE" end),
      fix_version: (if .shortTermUpgradeGuidance and .shortTermUpgradeGuidance.versionName
                    then .shortTermUpgradeGuidance.versionName
                    else null end),
      all_cves: [.vulnerabilities[]?.name // empty]
    }
  ] | {vulnerabilities: .}' "$input_file" > "$RESULTS_FILE" 2>/dev/null || {
    echo "Warning: Could not parse Black Duck output format. Trying alternative format..."
    # Fallback: try the developer scan / full scan format
    jq '[
      .components[]? |
      select(.securityRiskProfile.counts | map(select(.countType == "CRITICAL" or .countType == "HIGH")) | map(.count) | add > 0) |
      .vulnerabilities[]? |
      {
        component: "\(.componentName)@\(.componentVersion)",
        component_name: .componentName,
        component_version: .componentVersion,
        cve: .vulnId,
        severity: .severity,
        description: (.description // "No description"),
        fix_version: null,
        all_cves: [.vulnId]
      }
    ] | {vulnerabilities: .}' "$input_file" > "$RESULTS_FILE" 2>/dev/null || {
      echo "Could not parse scan results in any known format"
      echo '{"vulnerabilities":[]}' > "$RESULTS_FILE"
    }
  }
}

# ── Check if severity meets threshold ────────────────────────────────────────

meets_threshold() {
  local severity="$1"
  local min_rank="${SEVERITY_RANK[${MIN_SEVERITY}]:-3}"
  local vuln_rank="${SEVERITY_RANK[${severity}]:-0}"
  [[ "$vuln_rank" -ge "$min_rank" ]]
}

# ── Create a Devin session for a vulnerability ──────────────────────────────

create_devin_session() {
  local component="$1"
  local cve="$2"
  local severity="$3"
  local description="$4"
  local fix_version="$5"

  local fix_hint=""
  if [[ "$fix_version" != "null" && -n "$fix_version" ]]; then
    fix_hint=" The recommended fix version is ${fix_version}."
  fi

  local prompt="Security vulnerability detected by Black Duck SCA scan in repository ${GITHUB_REPOSITORY}.

**Vulnerability:** ${cve} (${severity})
**Affected component:** ${component}
**Description:** ${description}${fix_hint}

Please:
1. Clone the repository ${GITHUB_REPOSITORY}
2. Investigate this vulnerability — check how the component is used and the impact
3. Upgrade the affected package to a patched version (${fix_version:-latest secure version})
4. Run the build (\`npm run build\` or \`npx ng build\`) to verify nothing breaks
5. Open a PR with the fix, referencing ${cve} in the PR title and description"

  if [[ "${DRY_RUN}" == "true" ]]; then
    echo "[DRY RUN] Would create Devin session for: ${component} (${cve}, ${severity})" | tee -a "$SESSION_LOG"
    echo "[DRY RUN] Prompt: ${prompt}" >> "$SESSION_LOG"
    echo "---" >> "$SESSION_LOG"
    return 0
  fi

  echo "Creating Devin session for: ${component} (${cve}, ${severity})"

  local response
  response=$(curl -s -w "\n%{http_code}" -X POST "$DEVIN_API_URL" \
    -H "Authorization: Bearer ${DEVIN_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "$(jq -n --arg prompt "$prompt" '{prompt: $prompt, idempotent: false}')")

  local http_code
  http_code=$(echo "$response" | tail -1)
  local body
  body=$(echo "$response" | sed '$d')

  if [[ "$http_code" -ge 200 && "$http_code" -lt 300 ]]; then
    local session_url
    session_url=$(echo "$body" | jq -r '.url // "N/A"')
    local session_id
    session_id=$(echo "$body" | jq -r '.session_id // "N/A"')
    echo "  Session created: ${session_id} (${session_url})" | tee -a "$SESSION_LOG"
  else
    echo "  ERROR: Failed to create session (HTTP ${http_code}): ${body}" | tee -a "$SESSION_LOG"
  fi
}

# ── Main ─────────────────────────────────────────────────────────────────────

main() {
  echo "============================================"
  echo "Black Duck → Devin Remediation Pipeline"
  echo "============================================"
  echo "Repository:    ${GITHUB_REPOSITORY}"
  echo "Min Severity:  ${MIN_SEVERITY}"
  echo "Dry Run:       ${DRY_RUN}"
  echo "============================================"
  echo ""

  # Initialize session log
  echo "# Devin Remediation Sessions - $(date -u)" > "$SESSION_LOG"
  echo "# Repository: ${GITHUB_REPOSITORY}" >> "$SESSION_LOG"
  echo "---" >> "$SESSION_LOG"

  find_scan_results

  local total
  total=$(jq '.vulnerabilities | length' "$RESULTS_FILE")
  echo "Total vulnerabilities found: ${total}"

  if [[ "$total" -eq 0 ]]; then
    echo "No vulnerabilities to process."
    echo "No vulnerabilities found." >> "$SESSION_LOG"
    exit 0
  fi

  local processed=0
  local skipped=0
  local created=0

  # Process each vulnerability
  while IFS= read -r vuln; do
    local component cve severity description fix_version
    component=$(echo "$vuln" | jq -r '.component')
    cve=$(echo "$vuln" | jq -r '.cve')
    severity=$(echo "$vuln" | jq -r '.severity')
    description=$(echo "$vuln" | jq -r '.description')
    fix_version=$(echo "$vuln" | jq -r '.fix_version')

    processed=$((processed + 1))

    if meets_threshold "$severity"; then
      echo ""
      echo "[${processed}/${total}] ${severity}: ${component} (${cve})"
      create_devin_session "$component" "$cve" "$severity" "$description" "$fix_version"
      created=$((created + 1))
    else
      echo "[${processed}/${total}] SKIP (below threshold): ${component} (${cve}, ${severity})"
      skipped=$((skipped + 1))
    fi
  done < <(jq -c '.vulnerabilities[]' "$RESULTS_FILE")

  echo ""
  echo "============================================"
  echo "Summary"
  echo "============================================"
  echo "Total vulnerabilities: ${total}"
  echo "Sessions created:     ${created}"
  echo "Skipped (below ${MIN_SEVERITY}): ${skipped}"
  echo "============================================"

  # Append summary to log
  {
    echo ""
    echo "# Summary"
    echo "Total: ${total} | Created: ${created} | Skipped: ${skipped}"
  } >> "$SESSION_LOG"
}

main
