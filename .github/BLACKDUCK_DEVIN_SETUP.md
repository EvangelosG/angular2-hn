# Black Duck + Devin: Automated Vulnerability Remediation

This workflow automatically scans dependencies with [Black Duck SCA](https://www.synopsys.com/software-integrity/security-testing/software-composition-analysis.html), and when Critical/High vulnerabilities are found, creates [Devin](https://devin.ai) sessions to investigate and open PRs with fixes.

## How It Works

```
Black Duck Scan → Parse Vulnerabilities → Filter by Severity → Create Devin Sessions → Devin Opens Fix PRs
```

1. **Black Duck Rapid Scan** runs in CI and produces a JSON report of vulnerable dependencies
2. **`parse-and-remediate.sh`** extracts each vulnerability, filters by severity threshold
3. For each qualifying vulnerability, a **Devin session** is created via the API with a prompt that tells Devin to:
   - Investigate the vulnerability and its impact
   - Upgrade the affected package to a patched version
   - Verify the build still passes
   - Open a PR with the fix

## Setup

### 1. Add GitHub Secrets

Go to **Settings → Secrets and variables → Actions** in your repository and add:

| Secret | Description |
|--------|-------------|
| `BLACKDUCK_URL` | Your Black Duck server URL (e.g., `https://your-org.app.blackduck.com`) |
| `BLACKDUCK_API_TOKEN` | API token from Black Duck (User → API Tokens → Generate) |
| `DEVIN_API_KEY` | Devin API key (from [Devin Settings → API Keys](https://app.devin.ai/settings/api-keys)) |

### 2. Trigger Options

The workflow runs automatically on:
- **Push to `master`** — full scan + Devin remediation for Critical/High
- **Pull requests** — scan only, posts findings as a PR comment (no Devin sessions)
- **Weekly schedule** (Monday 6:00 UTC) — catches newly disclosed CVEs
- **Manual dispatch** — with options for dry run, severity threshold, and mock mode

### 3. Test Without Black Duck

To test the Devin API integration without Black Duck credentials:

1. Go to **Actions → Black Duck Security Scan + Devin Remediation**
2. Click **Run workflow**
3. Check **"Use mock Black Duck data"**
4. Optionally check **"Dry run"** to see what would happen without creating actual Devin sessions

The mock data includes realistic vulnerabilities based on this project's actual dependencies.

## Configuration

### Severity Threshold

By default, only **CRITICAL** and **HIGH** vulnerabilities trigger Devin sessions. You can change this:

- **Via manual dispatch**: Select a different minimum severity
- **In the workflow file**: Change the `MIN_SEVERITY` default in the `env` section

### Customizing the Devin Prompt

Edit the `create_devin_session()` function in `.github/scripts/parse-and-remediate.sh` to customize what Devin does when a vulnerability is found. The prompt supports markdown formatting.

## Files

```
.github/
├── workflows/
│   └── blackduck-devin.yml          # GitHub Actions workflow
├── scripts/
│   ├── parse-and-remediate.sh       # Parses results and creates Devin sessions
│   └── generate-mock-data.sh        # Generates test data (mock mode)
└── BLACKDUCK_DEVIN_SETUP.md         # This file
```

## Alternative: Webhook-Based Approach

For continuous monitoring (not just CI-time scanning), Black Duck supports webhooks that fire when new vulnerabilities are disclosed against your existing scan results. You can set up a webhook receiver (e.g., AWS Lambda, Cloudflare Worker) that calls the Devin API when notified. This catches vulnerabilities that are discovered *after* your code was scanned.
