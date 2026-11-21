#!/usr/bin/env bash
# Build and restart the UAT storefront. Run as root on the VPS:
#   sudo bash /opt/uat/salemtamilroots_web/deploy/uat/deploy.sh [branch]
set -euo pipefail
BRANCH="${1:-main}"
DIR=/opt/uat/salemtamilroots_web
cd "$DIR"

git fetch origin "$BRANCH"
git checkout -B "$BRANCH" "origin/$BRANCH"

npm ci
npm run build                       # reads .env.production.local; calls the UAT API to pre-render pages
chown -R www-data:www-data "$DIR/.next"   # the service writes its page and image cache here

systemctl restart salemtamilroots-web-uat
sleep 4
systemctl is-active salemtamilroots-web-uat
curl -s -o /dev/null -w "new site on localhost:3102 -> HTTP %{http_code}\n" http://localhost:3102/
