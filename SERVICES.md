# 🏢 Services OpenTelemetry - Demo-RUM

## 📊 Vue d'Ensemble

L'application demo-RUM utilise maintenant des **noms de service spécifiques** pour chaque composant, permettant une meilleure identification et visualisation des traces distribuées dans OpenObserve.

## 🎯 Architecture des Services

```
┌─────────────────────────────────────────────────────────────┐
│                     FRONTEND                                │
│                  demo-rum-frontend                          │
│  (Actions utilisateur, interface web)                      │
└─────────────────────────────────────────────────────────────┘
                            │
                            ▼
┌─────────────────────────────────────────────────────────────┐
│                   API GATEWAY                               │
│                demo-rum-api-gateway                         │
│  (Orchestration, routage des requêtes)                     │
└─────────────────────────────────────────────────────────────┘
                            │
            ┌───────────────┼───────────────┐
            ▼               ▼               ▼
    ┌──────────────┐ ┌──────────────┐ ┌──────────────┐
    │ User Service │ │Product Service│ │Analytics Svc │
    │ demo-rum-    │ │ demo-rum-    │ │ demo-rum-    │
    │ user-service │ │product-service│ │analytics-svc │
    └──────────────┘ └──────────────┘ └──────────────┘
            │               │               │
            └───────────────┼───────────────┘
                            ▼
    ┌────────────────────────────────────────────────┐
    │         BUSINESS SERVICES                      │
    ├────────────────┬──────────────┬────────────────┤
    │ Payment        │ Inventory    │ Order          │
    │ demo-rum-      │ demo-rum-    │ demo-rum-      │
    │ payment-service│inventory-svc │ order-service  │
    └────────────────┴──────────────┴────────────────┘
                            │
                            ▼
    ┌────────────────────────────────────────────────┐
    │         DATA LAYER                             │
    ├────────────────┬──────────────┬────────────────┤
    │ Database       │ Plugin       │ ETL            │
    │ demo-rum-      │ demo-rum-    │ demo-rum-etl-* │
    │ database-svc   │ plugin-svc   │                │
    └────────────────┴──────────────┴────────────────┘
```

## 📋 Liste des Services

### 🎨 Frontend Layer

#### 1. **demo-rum-frontend**
- **Description** : Interface utilisateur web
- **Responsabilités** :
  - Actions utilisateur
  - Interactions UI
  - Affichage des données
- **Traces** :
  - `user.simple_action`
  - `ecommerce.checkout` (orchestration)

### 🌐 API Gateway Layer

#### 2. **demo-rum-api-gateway**
- **Description** : Point d'entrée API et orchestrateur
- **Responsabilités** :
  - Routage des requêtes
  - Orchestration des microservices
  - Agrégation des réponses
- **Traces** :
  - `http.get`, `http.post`
  - `microservices.orchestration`

### 👥 Core Services

#### 3. **demo-rum-user-service**
- **Description** : Gestion des utilisateurs
- **Responsabilités** :
  - Authentification
  - Profils utilisateurs
  - Préférences
- **Traces** :
  - `user.get_profile`
  - `user.update_profile`
  - `user.authenticate`

#### 4. **demo-rum-product-service**
- **Description** : Catalogue produits
- **Responsabilités** :
  - Gestion du catalogue
  - Recommandations
  - Recherche produits
- **Traces** :
  - `product.get_recommendations`
  - `product.search`
  - `product.get_details`

#### 5. **demo-rum-analytics-service**
- **Description** : Collecte et analyse de données
- **Responsabilités** :
  - Tracking d'événements
  - Métriques utilisateur
  - Rapports
- **Traces** :
  - `analytics.track_event`
  - `analytics.generate_report`

### 💼 Business Services

#### 6. **demo-rum-payment-service**
- **Description** : Traitement des paiements
- **Responsabilités** :
  - Validation des cartes
  - Transactions
  - Remboursements
- **Traces** :
  - `payment.process`
  - `payment.validate`
  - `payment.refund`
- **Attributs** :
  - `payment.method`
  - `payment.amount`
  - `payment.currency`

#### 7. **demo-rum-inventory-service**
- **Description** : Gestion des stocks
- **Responsabilités** :
  - Réservation d'articles
  - Mise à jour des stocks
  - Vérification de disponibilité
- **Traces** :
  - `inventory.update`
  - `inventory.reserve`
  - `inventory.check_availability`
- **Attributs** :
  - `inventory.operation`
  - `inventory.items_count`

#### 8. **demo-rum-order-service**
- **Description** : Gestion des commandes
- **Responsabilités** :
  - Création de commandes
  - Suivi de statut
  - Historique
- **Traces** :
  - `order.create`
  - `order.update_status`
  - `order.get_history`
- **Attributs** :
  - `order.id`
  - `order.total`
  - `order.status`

#### 9. **demo-rum-notification-service**
- **Description** : Notifications et alertes
- **Responsabilités** :
  - Emails
  - SMS
  - Push notifications
- **Traces** :
  - `notification.send_email`
  - `notification.send_sms`

### 💾 Data Layer

#### 10. **demo-rum-database-service**
- **Description** : Accès aux données PostgreSQL
- **Responsabilités** :
  - Requêtes SQL
  - Transactions
  - Migrations
- **Traces** :
  - `db.SELECT`
  - `db.INSERT`
  - `db.UPDATE`
  - `db.DELETE`
- **Attributs** :
  - `db.system`: postgresql
  - `db.name`: demo-rum
  - `db.operation`
  - `db.table`

#### 11. **demo-rum-plugin-service**
- **Description** : Gestion des plugins
- **Responsabilités** :
  - Chargement de plugins
  - Configuration
  - Activation/Désactivation
- **Traces** :
  - `plugin.load`
  - `plugin.configure`
- **Attributs** :
  - `plugin.id`
  - `plugin.name`
  - `plugin.type`

### 🔄 ETL Services

#### 12. **demo-rum-etl-orchestrator**
- **Description** : Orchestrateur ETL
- **Responsabilités** :
  - Coordination des pipelines
  - Gestion des erreurs
  - Monitoring
- **Traces** :
  - `pipeline.process_data`

#### 13. **demo-rum-etl-extract**
- **Description** : Extraction de données
- **Responsabilités** :
  - Lecture depuis sources
  - Validation initiale
- **Traces** :
  - `pipeline.extract`
- **Attributs** :
  - `source`
  - `records_extracted`

#### 14. **demo-rum-etl-transform**
- **Description** : Transformation de données
- **Responsabilités** :
  - Normalisation
  - Enrichissement
  - Agrégation
- **Traces** :
  - `pipeline.transform`
- **Attributs** :
  - `transformations`

#### 15. **demo-rum-etl-load**
- **Description** : Chargement de données
- **Responsabilités** :
  - Écriture vers destination
  - Validation finale
- **Traces** :
  - `pipeline.load`
- **Attributs** :
  - `destination`
  - `records_loaded`

## 🔍 Exemples de Traces par Service

### E-commerce Checkout (5 services)

```
Trace: ecommerce.checkout
├─ demo-rum-frontend (parent)
├─ demo-rum-database-service (validate cart)
├─ demo-rum-payment-service (process payment)
├─ demo-rum-inventory-service (update inventory)
└─ demo-rum-order-service (create order)
```

### Microservices Orchestration (4 services)

```
Trace: microservices.orchestration
├─ demo-rum-api-gateway (parent)
├─ demo-rum-user-service (get profile)
├─ demo-rum-product-service (get recommendations)
└─ demo-rum-analytics-service (track event)
```

### Data Pipeline (4 services)

```
Trace: pipeline.process_data
├─ demo-rum-etl-orchestrator (parent)
├─ demo-rum-etl-extract (extract data)
├─ demo-rum-etl-transform (transform data)
└─ demo-rum-etl-load (load data)
```

## 📊 Visualisation dans OpenObserve

### Filtrer par Service

```sql
-- Toutes les traces d'un service spécifique
service.name = "demo-rum-payment-service"

-- Traces entre deux services
service.name IN ["demo-rum-frontend", "demo-rum-api-gateway"]

-- Traces du workflow e-commerce
service.name LIKE "demo-rum-%" AND 
  (name = "ecommerce.checkout" OR parent_span_id IS NOT NULL)
```

### Service Map

OpenObserve peut générer une carte des services montrant :
- Les dépendances entre services
- Le volume de requêtes
- Les latences moyennes
- Les taux d'erreur

## 🎯 Avantages

1. **Identification Claire** : Chaque service est facilement identifiable
2. **Debugging Facilité** : Isolation rapide des problèmes par service
3. **Monitoring Granulaire** : Métriques par service
4. **Architecture Visible** : Compréhension des dépendances
5. **Performance** : Identification des goulots d'étranglement

## 🔧 Configuration

Les noms de service sont définis dans `src/telemetry.js` :

```javascript
// Exemple pour le service de paiement
export async function tracePaymentService(operation, fn, attributes = {}) {
    return traceAction(`payment.${operation}`, fn, {
        'service.type': 'payment-processing',
        ...attributes
    }, 'demo-rum-payment-service');
}
```

## 📈 Métriques par Service

Pour chaque service, vous pouvez suivre :
- **Throughput** : Nombre de requêtes/seconde
- **Latency** : P50, P95, P99
- **Error Rate** : Pourcentage d'erreurs
- **Availability** : Uptime du service

## 🚀 Prochaines Étapes

1. Ajouter des métriques OpenTelemetry par service
2. Créer des dashboards Grafana par service
3. Configurer des alertes par service
4. Implémenter le context propagation vers le backend
5. Ajouter des health checks par service

---

**Version** : 0.0.4  
**Date** : 2025-12-26  
**Services** : 15 services distincts
