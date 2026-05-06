#!/usr/bin/env bash
# generate-mock-data.sh
#
# Generates realistic mock Black Duck vulnerability data for testing
# the Devin API integration without needing Black Duck credentials.
# Uses real CVEs that are relevant to the angular2-hn project's dependencies.

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
RESULTS_FILE="${SCRIPT_DIR}/blackduck-results.json"

cat > "$RESULTS_FILE" << 'EOF'
{
  "vulnerabilities": [
    {
      "component": "node-fetch@2.6.0",
      "component_name": "node-fetch",
      "component_version": "2.6.0",
      "cve": "CVE-2022-0235",
      "severity": "HIGH",
      "description": "node-fetch is vulnerable to Exposure of Sensitive Information to an Unauthorized Actor. The 'headers' object is not properly cloned when following a redirect to a new origin, leaking authorization headers to third-party domains.",
      "fix_version": "2.6.7",
      "all_cves": ["CVE-2022-0235"]
    },
    {
      "component": "node-fetch@2.6.0",
      "component_name": "node-fetch",
      "component_version": "2.6.0",
      "cve": "CVE-2024-22025",
      "severity": "MEDIUM",
      "description": "A vulnerability in node-fetch allows a denial of service via resource exhaustion when fetching content from untrusted URLs with specific Transfer-Encoding headers.",
      "fix_version": "2.7.0",
      "all_cves": ["CVE-2024-22025"]
    },
    {
      "component": "karma@4.1.0",
      "component_name": "karma",
      "component_version": "4.1.0",
      "cve": "CVE-2024-43796",
      "severity": "HIGH",
      "description": "Karma test runner has a cross-site scripting vulnerability in the returned HTML page when the URL contains malicious code. Affects versions before 6.4.4.",
      "fix_version": "6.4.4",
      "all_cves": ["CVE-2024-43796"]
    },
    {
      "component": "zone.js@0.10.2",
      "component_name": "zone.js",
      "component_version": "0.10.2",
      "cve": "CVE-2023-26116",
      "severity": "MEDIUM",
      "description": "Versions of zone.js before 0.13.1 are vulnerable to Regular Expression Denial of Service (ReDoS) via specific patterns in zone patching logic.",
      "fix_version": "0.13.1",
      "all_cves": ["CVE-2023-26116"]
    },
    {
      "component": "typescript@3.7.5",
      "component_name": "typescript",
      "component_version": "3.7.5",
      "cve": "CVE-2023-45133",
      "severity": "CRITICAL",
      "description": "TypeScript compiler versions before 5.1.6 include a bundled version of Babel with a code injection vulnerability. Crafted Babel plugins can execute arbitrary code during compilation.",
      "fix_version": "5.1.6",
      "all_cves": ["CVE-2023-45133"]
    },
    {
      "component": "protractor@5.4.0",
      "component_name": "protractor",
      "component_version": "5.4.0",
      "cve": "CVE-2023-0842",
      "severity": "LOW",
      "description": "Protractor depends on an outdated version of xml2js which is vulnerable to prototype pollution when parsing XML with specific __proto__ keys.",
      "fix_version": null,
      "all_cves": ["CVE-2023-0842"]
    }
  ]
}
EOF

echo "Mock vulnerability data generated at: $RESULTS_FILE"
echo "Generated $(jq '.vulnerabilities | length' "$RESULTS_FILE") mock vulnerabilities:"
jq -r '.vulnerabilities[] | "  [\(.severity)] \(.component) - \(.cve)"' "$RESULTS_FILE"
