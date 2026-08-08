#!/usr/bin/env bash
set -euo pipefail

usage() {
  cat <<'USAGE'
Usage: scripts/github-retarget-pr-base.sh <owner/repo> <pr-number> <new-base>

Retargets a GitHub PR base using the REST API. This avoids gh CLI GraphQL
field-selection failures such as repository.pullRequest.projectCards.

Authentication: GH_TOKEN/GITHUB_TOKEN, or git credential helper for github.com.
USAGE
}

if [[ "${1:-}" == "--help" || "${1:-}" == "-h" ]]; then
  usage
  exit 0
fi

if [[ $# -ne 3 ]]; then
  usage >&2
  exit 1
fi

OWNER_REPO="$1"
PR_NUMBER="$2"
NEW_BASE="$3"

if [[ ! "$OWNER_REPO" =~ ^[A-Za-z0-9_.-]+/[A-Za-z0-9_.-]+$ ]]; then
  echo "Invalid owner/repo: $OWNER_REPO" >&2
  exit 1
fi

if [[ ! "$PR_NUMBER" =~ ^[0-9]+$ ]]; then
  echo "Invalid PR number: $PR_NUMBER" >&2
  exit 1
fi

if [[ ! "$NEW_BASE" =~ ^[A-Za-z0-9_./-]+$ ]]; then
  echo "Invalid base branch: $NEW_BASE" >&2
  exit 1
fi

TOKEN="${GH_TOKEN:-${GITHUB_TOKEN:-}}"
if [[ -z "$TOKEN" ]]; then
  TOKEN=$(printf 'protocol=https\nhost=github.com\n\n' \
    | git credential fill \
    | sed -n 's/^password=//p' \
    | head -n 1 || true)
fi

if [[ -z "$TOKEN" ]]; then
  echo 'Missing GitHub token. Set GH_TOKEN/GITHUB_TOKEN or configure git credentials.' >&2
  exit 1
fi

export OWNER_REPO PR_NUMBER NEW_BASE TOKEN
python3 - <<'PY'
import json
import os
import urllib.error
import urllib.request

owner_repo = os.environ['OWNER_REPO']
pr_number = os.environ['PR_NUMBER']
new_base = os.environ['NEW_BASE']
token = os.environ['TOKEN']

payload = json.dumps({'base': new_base}).encode()
req = urllib.request.Request(
    f'https://api.github.com/repos/{owner_repo}/pulls/{pr_number}',
    data=payload,
    method='PATCH',
    headers={
        'Authorization': f'Bearer {token}',
        'Accept': 'application/vnd.github+json',
        'X-GitHub-Api-Version': '2022-11-28',
        'Content-Type': 'application/json',
        'User-Agent': 'localsnow-github-retarget-pr-base',
    },
)

try:
    with urllib.request.urlopen(req, timeout=30) as resp:
        data = json.load(resp)
except urllib.error.HTTPError as exc:
    body = exc.read().decode('utf-8', errors='replace')
    try:
        parsed = json.loads(body)
    except json.JSONDecodeError:
        parsed = {'raw': body}
    print(json.dumps(parsed, indent=2), flush=True)
    raise SystemExit(1)

print(json.dumps({
    'url': data['html_url'],
    'state': data['state'],
    'base': data['base']['ref'],
    'head': data['head']['ref'],
}, indent=2))
PY
