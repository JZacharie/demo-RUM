# OpenTelemetry Traces - Améliorations Demo-RUM

## 🎯 Objectif

Cette amélioration ajoute le support complet d'**OpenTelemetry** à l'application demo-RUM, permettant de créer des **traces distribuées** qui sont envoyées à OpenObserve pour une observabilité complète.

## ✨ Nouvelles Fonctionnalités

### 1. **Module d'Instrumentation OpenTelemetry** (`src/telemetry.js`)

Un module complet qui fournit :
- ✅ Initialisation automatique d'OpenTelemetry Web SDK
- ✅ Export des traces vers OpenObserve via OTLP/HTTP
- ✅ Instrumentation automatique des appels fetch/XHR
- ✅ Instrumentation des interactions utilisateur
- ✅ Instrumentation du chargement de page
- ✅ Helpers pour créer des traces manuelles

#### Fonctions principales :

```javascript
// Initialiser OpenTelemetry
initTelemetry(config)

// Créer une trace pour une action
traceAction(actionName, fn, attributes)

// Tracer un appel API
traceApiCall(method, endpoint, fn)

// Tracer une opération base de données
traceDatabaseOperation(operation, dbName, fn)

// Tracer le chargement d'un plugin
tracePluginLoad(pluginId, pluginName, fn)

// Ajouter des événements à un span
addSpanEvent(eventName, attributes)

// Définir des attributs sur un span
setSpanAttributes(attributes)
```

### 2. **Nouvelle Page Traces** (`traces.html` + `src/traces.js`)

Une page dédiée avec des scénarios de tracing complets :

#### 🎯 Actions Simples
- **Simple Action** : Trace basique avec un seul span
- **API Call** : Simulation d'appel API avec attributs HTTP
- **Database Query** : Simulation de requête SQL avec métadonnées

#### 🔗 Workflows Complexes
- **E-commerce Checkout** : 5 spans imbriqués
  - Validation du panier (DB query)
  - Traitement du paiement (API call)
  - Mise à jour de l'inventaire (DB update)
  - Création de commande (DB insert)

- **Data Pipeline** : 4 spans pour ETL
  - Extract (lecture depuis PostgreSQL)
  - Transform (normalisation, enrichissement)
  - Load (écriture vers data warehouse)

- **Microservices Call** : 4 spans pour orchestration
  - Appel au service utilisateur
  - Appel au service produits
  - Appel au service analytics

#### ⚡ Scénarios de Performance
- **Fast Operation** : 50-100ms
- **Slow Operation** : 2-3s (avec warning)
- **Parallel Operations** : 3 tâches en parallèle
- **Error Scenario** : Gestion d'erreurs avec exceptions

### 3. **Instrumentation des Pages Existantes**

#### `index.html` / `src/main.js`
- ✅ Initialisation d'OpenTelemetry
- ✅ Traces sur les boutons "Track Action" et "Load Resource"
- ✅ Événements de span pour suivre le cycle de vie
- ✅ Attributs enrichis (user, interactions, durée)

#### `plugins.html` / `src/plugins.js`
- ✅ Traces pour le chargement de plugins
- ✅ Spans imbriqués : plugin.load → db.query
- ✅ Métadonnées complètes (plugin type, description, DB statement)
- ✅ Gestion d'erreurs avec `span.recordException()`

## 📊 Visualisation dans OpenObserve

Les traces sont envoyées à OpenObserve via OTLP/HTTP :

```
Endpoint: https://o2-openobserve.p.zacharie.org/api/default/v1/traces
Format: OTLP/HTTP (JSON)
Authentication: Basic Auth avec clientToken
```

### Attributs de Trace

Chaque trace contient :
- **Service attributes** : `service.name`, `service.version`, `deployment.environment`
- **User context** : `user.id`, `user.interactions`
- **Operation details** : `action.type`, `component`, `operation`
- **Performance metrics** : `duration_ms`, `http.status_code`, `db.rows_affected`
- **Custom attributes** : Spécifiques à chaque action

### Structure des Spans

```
Trace: ecommerce.checkout
├─ Span: db.query (validate_cart)
├─ Span: http.post (process_payment)
├─ Span: db.update (update_inventory)
└─ Span: db.insert (create_order)
```

## 🚀 Utilisation

### 1. Installer les dépendances

```bash
cd /home/joseph/git/demo-RUM
npm install
```

### 2. Lancer l'application

```bash
npm run dev
```

### 3. Tester les traces

1. Ouvrir http://localhost:5173
2. Naviguer vers la page **Traces**
3. Cliquer sur les différents boutons pour générer des traces
4. Observer les traces dans OpenObserve

## 📦 Dépendances Ajoutées

```json
{
  "@opentelemetry/api": "^1.9.0",
  "@opentelemetry/sdk-trace-web": "^1.28.0",
  "@opentelemetry/instrumentation": "^0.56.0",
  "@opentelemetry/instrumentation-fetch": "^0.56.0",
  "@opentelemetry/instrumentation-xml-http-request": "^0.56.0",
  "@opentelemetry/instrumentation-document-load": "^0.42.0",
  "@opentelemetry/instrumentation-user-interaction": "^0.42.0",
  "@opentelemetry/exporter-trace-otlp-http": "^0.56.0",
  "@opentelemetry/resources": "^1.28.0",
  "@opentelemetry/semantic-conventions": "^1.28.0",
  "@opentelemetry/context-zone": "^1.28.0"
}
```

## 🔍 Exemples de Traces

### Exemple 1 : Chargement de Plugin

```javascript
await tracePluginLoad('analytics', 'Advanced Analytics', async (span) => {
    span.setAttribute('plugin.type', 'Database');
    
    const data = await traceDatabaseOperation('query', 'demo-rum', async (dbSpan) => {
        dbSpan.setAttribute('db.statement', "SELECT * FROM plugins WHERE id = 'analytics'");
        dbSpan.setAttribute('db.table', 'plugins');
        
        const response = await fetch('/api/load-plugin/analytics');
        return await response.json();
    });
});
```

**Résultat** : 2 spans imbriqués avec contexte complet

### Exemple 2 : Workflow E-commerce

```javascript
await traceAction('ecommerce.checkout', async (parentSpan) => {
    // Validation
    await traceDatabaseOperation('SELECT', 'demo-rum', async (span) => {
        // Valider le panier
    });
    
    // Paiement
    await traceApiCall('POST', '/api/payments', async (span) => {
        // Traiter le paiement
    });
    
    // Inventaire
    await traceDatabaseOperation('UPDATE', 'demo-rum', async (span) => {
        // Mettre à jour l'inventaire
    });
    
    // Commande
    await traceDatabaseOperation('INSERT', 'demo-rum', async (span) => {
        // Créer la commande
    });
});
```

**Résultat** : 5 spans avec relations parent-enfant

## 🎨 Interface Utilisateur

La nouvelle page **Traces** affiche :
- 📊 **Statistiques** : Total traces, total spans, durée moyenne
- 🎯 **Actions simples** : Pour tester des traces basiques
- 🔗 **Workflows complexes** : Pour tester des traces multi-spans
- ⚡ **Scénarios de performance** : Pour tester différents patterns

## 🔧 Configuration

La configuration OpenTelemetry utilise les mêmes paramètres que RUM :

```javascript
const config = {
    serviceName: 'demo-rum',
    serviceVersion: '0.0.4',
    environment: 'production',
    endpoint: 'https://o2-openobserve.p.zacharie.org/api/default/v1/traces',
    headers: {
        'Authorization': 'Basic ...',
        'stream-name': 'default'
    }
};
```

## 📈 Avantages

1. **Observabilité complète** : RUM + Logs + Traces
2. **Traces distribuées** : Suivi des requêtes à travers les services
3. **Performance monitoring** : Identification des goulots d'étranglement
4. **Debugging facilité** : Contexte complet pour chaque opération
5. **Conformité OpenTelemetry** : Standard industriel

## 🎯 Prochaines Étapes

- [ ] Ajouter des métriques OpenTelemetry
- [ ] Implémenter le context propagation pour les appels backend
- [ ] Créer des dashboards Grafana pour les traces
- [ ] Ajouter des alertes sur les traces lentes
- [ ] Intégrer avec le backend Python pour des traces end-to-end

## 📝 Notes

- Les traces sont envoyées par batch toutes les 500ms
- Maximum 100 spans en queue
- Les erreurs sont automatiquement enregistrées avec `span.recordException()`
- Le context propagation est activé pour tous les domaines
