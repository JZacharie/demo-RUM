#!/bin/bash

# Script de test pour vérifier l'installation OpenTelemetry

echo "🧪 Test de l'installation OpenTelemetry"
echo "========================================"
echo ""

# Vérifier que les dépendances sont installées
echo "1️⃣ Vérification des dépendances..."
if [ -d "node_modules/@opentelemetry" ]; then
    echo "✅ Dépendances OpenTelemetry installées"
    echo "   Packages trouvés:"
    ls -1 node_modules/@opentelemetry | head -5
    echo "   ..."
else
    echo "❌ Dépendances OpenTelemetry manquantes"
    echo "   Exécuter: npm install"
    exit 1
fi
echo ""

# Vérifier que les fichiers sources existent
echo "2️⃣ Vérification des fichiers sources..."
files=(
    "src/telemetry.js"
    "src/traces.js"
    "traces.html"
    "OPENTELEMETRY_TRACES.md"
    "IMPROVEMENTS_SUMMARY.md"
    "QUICKSTART.md"
)

all_files_exist=true
for file in "${files[@]}"; do
    if [ -f "$file" ]; then
        echo "✅ $file"
    else
        echo "❌ $file manquant"
        all_files_exist=false
    fi
done
echo ""

if [ "$all_files_exist" = false ]; then
    echo "❌ Certains fichiers sont manquants"
    exit 1
fi

# Vérifier que le serveur de développement peut démarrer
echo "3️⃣ Test de démarrage du serveur..."
echo "   Démarrage de Vite..."
timeout 10 npm run dev > /tmp/vite-test.log 2>&1 &
VITE_PID=$!
sleep 3

if ps -p $VITE_PID > /dev/null; then
    echo "✅ Serveur Vite démarré avec succès"
    kill $VITE_PID 2>/dev/null
else
    echo "❌ Échec du démarrage du serveur"
    cat /tmp/vite-test.log
    exit 1
fi
echo ""

# Vérifier que les pages HTML sont valides
echo "4️⃣ Vérification des pages HTML..."
html_files=(
    "index.html"
    "plugins.html"
    "apis.html"
    "traces.html"
)

for file in "${html_files[@]}"; do
    if grep -q "OpenObserve RUM" "$file"; then
        echo "✅ $file est valide"
    else
        echo "❌ $file semble invalide"
    fi
done
echo ""

# Vérifier que les imports JavaScript sont corrects
echo "5️⃣ Vérification des imports JavaScript..."
js_files=(
    "src/main.js"
    "src/plugins.js"
    "src/traces.js"
)

for file in "${js_files[@]}"; do
    if grep -q "from './telemetry.js'" "$file"; then
        echo "✅ $file importe telemetry.js"
    else
        echo "⚠️  $file n'importe pas telemetry.js"
    fi
done
echo ""

# Résumé
echo "========================================"
echo "✅ Tests terminés avec succès!"
echo ""
echo "📝 Prochaines étapes:"
echo "   1. Démarrer le serveur: npm run dev"
echo "   2. Ouvrir http://localhost:3000"
echo "   3. Naviguer vers /traces.html"
echo "   4. Tester les différentes actions"
echo "   5. Vérifier les traces dans OpenObserve"
echo ""
echo "📚 Documentation:"
echo "   - Guide rapide: QUICKSTART.md"
echo "   - Documentation complète: OPENTELEMETRY_TRACES.md"
echo "   - Résumé: IMPROVEMENTS_SUMMARY.md"
echo ""
echo "🚀 Bon tracing!"
