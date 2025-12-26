# 🚀 Guide de Démarrage Rapide - OpenTelemetry Traces

## Installation

```bash
cd /home/joseph/git/demo-RUM
npm install
```

## Lancement

```bash
npm run dev
```

L'application sera disponible sur http://localhost:3000

## Tester les Traces

### 1. Page d'Accueil (/)
- Cliquer sur **"Track Action"** → Génère une trace simple
- Cliquer sur **"Load Resource"** → Génère une trace avec timing

### 2. Page Plugins (/plugins.html)
- Cliquer sur **"Load Plugin"** → Génère une trace avec span DB imbriqué

### 3. Page Traces (/traces.html) ⭐ NOUVEAU

#### Actions Simples
```
[Simple Action]    → 1 span  (user.simple_action)
[API Call]         → 1 span  (http.GET)
[Database Query]   → 1 span  (db.SELECT)
```

#### Workflows Complexes
```
[E-commerce Checkout]  → 5 spans
  ├─ ecommerce.checkout
  ├─ db.SELECT (validate_cart)
  ├─ http.POST (process_payment)
  ├─ db.UPDATE (update_inventory)
  └─ db.INSERT (create_order)

[Data Pipeline]        → 4 spans
  ├─ pipeline.process_data
  ├─ pipeline.extract
  ├─ pipeline.transform
  └─ pipeline.load

[Microservices Call]   → 4 spans
  ├─ microservices.orchestration
  ├─ http.GET (user-service)
  ├─ http.GET (product-service)
  └─ http.POST (analytics-service)
```

#### Scénarios de Performance
```
[Fast Operation]      → ~75ms   (performance.fast_operation)
[Slow Operation]      → ~2500ms (performance.slow_operation)
[Parallel Operations] → ~200ms  (3 tâches en parallèle)
[Error Scenario]      → Trace avec exception
```

## Visualiser dans OpenObserve

### 1. Accéder à OpenObserve
```
URL: https://o2-openobserve.p.zacharie.org
```

### 2. Naviguer vers Traces
```
Menu → Traces → Stream: default
```

### 3. Filtrer les Traces
```
Service: demo-rum
Environment: production
```

### 4. Exemples de Requêtes

#### Toutes les traces
```
service.name = "demo-rum"
```

#### Traces lentes (> 1s)
```
service.name = "demo-rum" AND duration > 1000000000
```

#### Traces avec erreurs
```
service.name = "demo-rum" AND status.code = "ERROR"
```

#### Traces de checkout
```
service.name = "demo-rum" AND name = "ecommerce.checkout"
```

#### Traces de base de données
```
service.name = "demo-rum" AND component = "database"
```

## Structure d'une Trace

### Attributs de Service
```json
{
  "service.name": "demo-rum",
  "service.version": "0.0.4",
  "deployment.environment": "production",
  "telemetry.sdk.language": "javascript",
  "telemetry.sdk.name": "opentelemetry"
}
```

### Attributs de Span
```json
{
  "action.type": "button_click",
  "component": "interactive_demo",
  "user.id": "demo-user",
  "user.interactions": 5,
  "operation.duration_ms": 150
}
```

### Événements de Span
```json
{
  "name": "button_clicked",
  "timestamp": "2025-12-26T22:00:00.000Z",
  "attributes": {
    "button.id": "btn-action"
  }
}
```

## Développement

### Créer une Nouvelle Trace

```javascript
import { traceAction } from './telemetry.js';

// Trace simple
await traceAction('my.custom.action', async (span) => {
    // Ajouter des attributs
    span.setAttribute('custom.attribute', 'value');
    
    // Faire quelque chose
    await doSomething();
    
    // Ajouter un événement
    addSpanEvent('something_happened', {
        'detail': 'info'
    });
});
```

### Créer une Trace avec Spans Imbriqués

```javascript
import { traceAction, traceDatabaseOperation } from './telemetry.js';

await traceAction('parent.operation', async (parentSpan) => {
    // Opération parent
    parentSpan.setAttribute('parent.attr', 'value');
    
    // Opération enfant 1
    await traceDatabaseOperation('SELECT', 'mydb', async (childSpan) => {
        childSpan.setAttribute('db.table', 'users');
        // Faire la requête
    });
    
    // Opération enfant 2
    await traceApiCall('POST', '/api/endpoint', async (childSpan) => {
        childSpan.setAttribute('http.status_code', 200);
        // Faire l'appel API
    });
});
```

### Gérer les Erreurs

```javascript
import { traceAction, SpanStatusCode } from './telemetry.js';

try {
    await traceAction('risky.operation', async (span) => {
        // Opération risquée
        throw new Error('Something went wrong');
    });
} catch (error) {
    // L'erreur est automatiquement enregistrée dans le span
    console.error('Operation failed:', error);
}
```

## Configuration

### Variables d'Environnement

Créer un fichier `.env` :

```env
VITE_OTEL_SERVICE_NAME=demo-rum
VITE_OTEL_SERVICE_VERSION=0.0.4
VITE_OTEL_ENVIRONMENT=production
VITE_OTEL_ENDPOINT=https://o2-openobserve.p.zacharie.org/api/default/v1/traces
VITE_OTEL_TOKEN=rumZmfACViIKP6YzziM
```

### Utiliser dans le Code

```javascript
const config = {
    serviceName: import.meta.env.VITE_OTEL_SERVICE_NAME || 'demo-rum',
    serviceVersion: import.meta.env.VITE_OTEL_SERVICE_VERSION || '0.0.1',
    environment: import.meta.env.VITE_OTEL_ENVIRONMENT || 'development',
    endpoint: import.meta.env.VITE_OTEL_ENDPOINT,
    headers: {
        'Authorization': `Basic ${btoa(import.meta.env.VITE_OTEL_TOKEN + ':')}`,
        'stream-name': 'default'
    }
};

initTelemetry(config);
```

## Déploiement

### Build Production

```bash
npm run build
```

### Docker

```bash
docker build -t demo-rum:latest .
docker run -p 8080:80 demo-rum:latest
```

### Kubernetes (Helm)

```bash
cd helm
helm upgrade --install demo-rum . \
  --set image.tag=latest \
  --set env.OTEL_ENDPOINT=https://o2-openobserve.p.zacharie.org/api/default/v1/traces
```

## Troubleshooting

### Les traces n'apparaissent pas dans OpenObserve

1. Vérifier la console du navigateur pour les erreurs
2. Vérifier l'endpoint OTLP : `https://o2-openobserve.p.zacharie.org/api/default/v1/traces`
3. Vérifier l'authentification (clientToken)
4. Vérifier le stream name : `default`

### Erreur CORS

Si vous voyez des erreurs CORS, vérifier la configuration OpenObserve :
```
Access-Control-Allow-Origin: *
Access-Control-Allow-Headers: Content-Type, Authorization
```

### Traces trop volumineuses

Ajuster la configuration du batch processor :
```javascript
batchConfig: {
    maxQueueSize: 50,        // Réduire la queue
    maxExportBatchSize: 5,   // Réduire la taille du batch
    scheduledDelayMillis: 2000, // Augmenter le délai
}
```

## Ressources

- 📖 [Documentation complète](./OPENTELEMETRY_TRACES.md)
- 📊 [Résumé des améliorations](./IMPROVEMENTS_SUMMARY.md)
- 🔧 [Configuration exemple](./src/telemetry.config.example.js)
- 🌐 [OpenTelemetry Docs](https://opentelemetry.io/docs/)
- 🔍 [OpenObserve Traces](https://openobserve.ai/docs/traces/)

## Support

Pour toute question ou problème :
1. Consulter la documentation
2. Vérifier les logs du navigateur
3. Vérifier les traces dans OpenObserve
4. Contacter l'équipe de développement

---

**Bon tracing ! 🚀**
