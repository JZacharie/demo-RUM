# OpenObserve RUM Demo

A modern web application demonstrating Real User Monitoring (RUM) with OpenObserve. This project showcases how to integrate OpenObserve's browser RUM and logging capabilities into a web application, with complete Docker containerization and Kubernetes deployment via Helm.

## 🚀 Features

- **Real User Monitoring**: Track user interactions, page views, and errors in real-time
- **Session Replay**: Record and replay user sessions for debugging
- **Performance Tracking**: Monitor resources, long tasks, and user interactions
- **Error Monitoring**: Capture and forward JavaScript errors to OpenObserve
- **OpenTelemetry Traces**: Distributed tracing with OTLP export to OpenObserve ⭐ NEW
- **Modern UI**: Beautiful, responsive interface with animations and glassmorphism
- **Production Ready**: Docker containerization with multi-stage builds
- **Kubernetes Native**: Complete Helm chart for easy deployment
- **CI/CD Pipeline**: Automated Docker builds and Helm releases via GitHub Actions

## 📋 Prerequisites

- Node.js 20+ (for local development)
- Docker (for containerization)
- Kubernetes cluster (for deployment)
- Helm 3+ (for Kubernetes deployment)

## 🛠️ Local Development

### Install Dependencies

```bash
npm install
```

### Run Development Server

```bash
npm run dev
```

The application will be available at `http://localhost:3000`

### Build for Production

```bash
npm run build
```

## 🐳 Docker

### Build Docker Image

```bash
docker build -t demo-rum:latest .
```

### Run Docker Container

```bash
docker run -p 8080:80 demo-rum:latest
```

Access the application at `http://localhost:8080`

## ☸️ Kubernetes Deployment

### Add Helm Repository

```bash
helm repo add demo-rum https://jzacharie.github.io/demo-RUM
helm repo update
```

### Install with Helm

```bash
helm install demo-rum demo-rum/demo-rum
```

### Install with Custom Values

```bash
helm install demo-rum demo-rum/demo-rum -f custom-values.yaml
```

### Example Custom Values

```yaml
replicaCount: 3

image:
  tag: "v0.0.1"

ingress:
  enabled: true
  className: "nginx"
  hosts:
    - host: demo-rum.yourdomain.com
      paths:
        - path: /
          pathType: Prefix
  tls:
    - secretName: demo-rum-tls
      hosts:
        - demo-rum.yourdomain.com

resources:
  limits:
    cpu: 500m
    memory: 256Mi
  requests:
    cpu: 200m
    memory: 128Mi
```

### Upgrade Deployment

```bash
helm upgrade demo-rum demo-rum/demo-rum
```

### Uninstall

```bash
helm uninstall demo-rum
```

## 🔧 Configuration

### OpenObserve Settings

The application is configured to send RUM data to OpenObserve with the following settings:

- **Site**: `o2-openobserve.p.zacharie.org`
- **Organization**: `default`
- **Service**: `my-web-application`
- **Environment**: `production`
- **Version**: `0.0.1`

These settings can be modified in [`src/main.js`](src/main.js).

## 🔍 OpenTelemetry Traces ⭐ NEW

This application now includes comprehensive **OpenTelemetry distributed tracing** capabilities!

### Features

- ✅ **Automatic instrumentation** of fetch/XHR requests
- ✅ **Manual instrumentation** with helper functions
- ✅ **Nested spans** for complex workflows
- ✅ **OTLP export** to OpenObserve
- ✅ **Rich attributes** (service, user, operation details)
- ✅ **Error tracking** with span exceptions

### Quick Start

1. Navigate to `/traces.html` in the running application
2. Click on various action buttons to generate traces
3. View traces in OpenObserve at `https://o2-openobserve.p.zacharie.org`

### Documentation

- 📖 **[Complete Documentation](OPENTELEMETRY_TRACES.md)** - Detailed guide on OpenTelemetry integration
- 🚀 **[Quick Start Guide](QUICKSTART.md)** - Get started in 5 minutes
- 📊 **[Improvements Summary](IMPROVEMENTS_SUMMARY.md)** - Overview of all changes

### Example Traces

The application includes several trace scenarios:

- **Simple Actions**: Single-span traces for basic operations
- **E-commerce Checkout**: 5-span workflow (cart validation → payment → inventory → order)
- **Data Pipeline**: ETL workflow with extract, transform, load spans
- **Microservices**: Orchestration across multiple services
- **Performance Tests**: Fast, slow, parallel, and error scenarios

### Configuration

Traces are exported to OpenObserve via OTLP/HTTP:

```javascript
endpoint: 'https://o2-openobserve.p.zacharie.org/api/default/v1/traces'
format: OTLP/HTTP (JSON)
authentication: Basic Auth
```

See [`src/telemetry.config.example.js`](src/telemetry.config.example.js) for configuration examples.

## 📦 CI/CD Pipeline

The project includes two GitHub Actions workflows:

### Docker Build (`docker-build.yaml`)

Triggers on version tags (`v*`) and:
- Builds multi-architecture Docker images (amd64, arm64)
- Pushes to GitHub Container Registry
- Tags with semantic versioning

### Helm Release (`helm-release.yaml`)

Triggers on version tags (`v*`) and:
- Packages the Helm chart
- Publishes to GitHub Pages
- Creates a GitHub release with the chart

### Creating a Release

```bash
git tag v0.0.1
git push origin v0.0.1
```

This will automatically:
1. Build and push Docker image to `ghcr.io/jzacharie/demo-rum:v0.0.1`
2. Package and publish Helm chart to GitHub Pages
3. Create a GitHub release

## 🏗️ Project Structure

```
demo-RUM/
├── .github/
│   └── workflows/
│       ├── docker-build.yaml      # Docker build pipeline
│       └── helm-release.yaml      # Helm release pipeline
├── helm/
│   └── demo-rum/
│       ├── Chart.yaml             # Helm chart metadata
│       ├── values.yaml            # Default configuration
│       └── templates/             # Kubernetes manifests
├── src/
│   ├── main.js                    # OpenObserve RUM initialization
│   ├── plugins.js                 # Plugin manager page
│   ├── apis.js                    # External APIs page
│   ├── traces.js                  # OpenTelemetry traces page ⭐ NEW
│   ├── telemetry.js               # OpenTelemetry instrumentation ⭐ NEW
│   ├── telemetry.config.example.js # Config example ⭐ NEW
│   └── style.css                  # Application styles
├── Dockerfile                     # Multi-stage Docker build
├── nginx.conf                     # Nginx configuration
├── index.html                     # Main HTML file
├── plugins.html                   # Plugin manager page
├── apis.html                      # External APIs page
├── traces.html                    # OpenTelemetry traces page ⭐ NEW
├── package.json                   # Node.js dependencies
├── vite.config.js                 # Vite configuration
├── OPENTELEMETRY_TRACES.md        # OpenTelemetry documentation ⭐ NEW
├── IMPROVEMENTS_SUMMARY.md        # Summary of improvements ⭐ NEW
├── QUICKSTART.md                  # Quick start guide ⭐ NEW
└── test-installation.sh           # Installation test script ⭐ NEW
```

## 🎯 Interactive Demo Features

The application includes several interactive buttons to demonstrate RUM capabilities:

### Main Page
- **Track Action**: Log custom user actions
- **Simulate Navigation**: Track page navigation events
- **Load Resource**: Simulate API calls and resource loading
- **Generate Error**: Create test errors for error monitoring
- **Send Log**: Send logs with different severity levels
- **Update User**: Change user context dynamically

### Plugin Manager Page
- **Load Plugin**: Simulate loading plugins from PostgreSQL database
- Creates distributed traces with database operations

### OpenTelemetry Traces Page ⭐ NEW
- **Simple Actions**: Single-span traces (action, API call, DB query)
- **E-commerce Checkout**: Multi-span workflow simulation
- **Data Pipeline**: ETL process with extract, transform, load
- **Microservices Call**: Service orchestration simulation
- **Performance Tests**: Fast, slow, parallel, and error scenarios

## 📊 Monitoring

After deploying the application, you can monitor:

- **User Sessions**: View session replays in OpenObserve
- **Performance Metrics**: Track page load times, resource loading
- **User Interactions**: Monitor clicks, navigation, and custom actions
- **Errors**: View JavaScript errors and stack traces
- **Logs**: Access application logs with different severity levels

## 🔒 Security

The application implements several security best practices:

- Non-root container user
- Read-only root filesystem (where applicable)
- Security headers in Nginx
- Minimal container image (Alpine-based)
- Resource limits in Kubernetes

## 📝 License

This project is open source and available for demonstration purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📧 Support

For issues and questions, please open an issue on GitHub.