#!/bin/sh
# Generate config.js from environment variables

cat > /usr/share/nginx/html/config.js << EOF
window.RUM_CONFIG = {
  clientToken: '${RUM_CLIENT_TOKEN:-rumZmfACViIKP6YzziM}',
  applicationId: '${RUM_APPLICATION_ID:-web-application-id}',
  site: '${RUM_SITE:-o2-openobserve.p.zacharie.org}',
  service: '${RUM_SERVICE:-my-web-application}',
  env: '${RUM_ENV:-production}',
  version: '${RUM_VERSION:-0.0.1}',
  organizationIdentifier: '${RUM_ORGANIZATION_IDENTIFIER:-default}',
  insecureHTTP: ${RUM_INSECURE_HTTP:-false},
  apiVersion: '${RUM_API_VERSION:-v1}'
};
EOF

# Start nginx
exec nginx -g 'daemon off;'
