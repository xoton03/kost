# Agent Prompt — K.O.S.T. v9.1

## Contexte

Tu travailles sur **K.O.S.T.**, une PWA de gestion de stock retail (checkage sans ticket) pour Kiabi / Flo.  
Stack : Vanilla JS, HTML, Tailwind CDN, Dexie.js, Supabase, Service Worker.  
Cible : `C:\Users\moi\Desktop\dev app\ginder` (WSL : `/mnt/c/Users/moi/Desktop/dev\ app/ginder`).  
Déploiement visé : hébergement statique public futur (GitHub Pages / Vercel / équivalent).

---

## État actuel (ne pas modifier)

- ✅ Modularisation de `app.js` terminée :  
  - `app.js` → point d’entrée  
  - `js/state.js` → inventory + persistance  
  - `js/ui.js` → renderList, showToast, updateClock, escapeHtml, initLucide  
  - `js/scanner.js` → performSearch, initScanner  
  - `js/modals.js` → openModal, closeModal, initModals, submit preventDefault  
  - `js/bg3d.js` → canvas 3D + visibilité onglet  
- ✅ Double horloge supprimée  
- ✅ ID `btn-sync-database` dupliqué supprimé  
- ✅ XSS barcode/emplacement échappés via `escapeHtml()`  
- ✅ Pause canvas 3D quand onglet inactif  
- ✅ `initLucide()` avec garde globale  
- ✅ Formulaire modal protégé contre le reload
- ✅ `config.js` + `config.example.js` créés, `.gitignore` mis à jour
- ✅ `offline.html` + stratégies SW ajoutés
- ✅ Tailwind compilé par page, CDN retiré
- ✅ ESLint ajouté, warnings nettoyés

---

## Problème bloquant à résoudre en priorité (P0bis)

**Symptôme :** après extraction de la config vers `config.js`, l’impression distante (GAS) et la communication Supabase sont cassées.

**Hypothèses confirmées :**
- `js/modals.js` utilise `GAS_URL` brut (globale implicite) au lieu de `window.KostConfig.GAS_URL`
- `database.js` conserve des globales héritées (`window.SUPABASE_URL`, `window.SUPABASE_KEY`) en parallèle de `window.KostConfig`
- Ordre de chargement `defer` : `database.js` doit être lu **après** `config.js` pour hériter des valeurs

**Consigne :** corriger uniquement les chemins qui cassent la config, sans refonte ni régression fonctionnelle.

---

## Problème bloquant production (P0ter)

**Symptôme observé en ligne :** bannière d’installation visible, mais `window.KostConfig` est vide sur `https://xoton03.github.io/kost/`.

**Cause probable :** `config.js` n’est pas chargé / pas livré / pas vu sur GitHub Pages.

**Règle d’or ici :** on veut que ça marche sur GitHub Pages, **pas de contrainte de sécurité**. Les clés peuvent donc être stockées en clair dans le repo.

**Consigne :**
- Option simple et retenue : stocker les credentials directement dans `config.js` à la racine.
- `config.js` doit exposer `window.KostConfig = { SUPABASE_URL, SUPABASE_KEY, GAS_URL }` avec les **bonnes valeurs de production**.
- `config.example.js` sert seulement de modèle ; ce n’est pas lui qui est lu en ligne.
- Vérifier que `https://xoton03.github.io/kost/config.js` retourne bien un JS valide contenant les 3 valeurs.
- Garantir que `window.KostConfig` est peuplé **avant** `database.js` et les modules `js/`.
- Si ça casse encore, ajouter un fallback par module : chaque fichier réseau (`js/ui.js`, `database.js`, `js/modals.js`) doit d’abord lire `window.KostConfig`, et seulement ensuite utiliser un fallback global.

---

## Mission

### Phase 1 — Sécurité & Config (P0)
**Cible : hébergement GitHub Pages public `xoton03.github.io/kost`**

**1.1 — Nettoyage immédiat des secrets**
- Remplacer les valeurs dans `config.example.js` par des placeholders vides (ex: `"your-supabase-anon-key"`, `"https://script.google.com/macros/s/.../exec"`).
- Supprimer les blocs inline Supabase/GAS des pages `tictache.html`, `ticticket.html`, `station.html` (elles chargent déjà `config.js` en `defer`).
- Ajouter `config.js` et `config.example.js` dans `.gitignore`.
- Conserver `config.js` en local ; il ne doit pas être poussé sur le repo public.

**1.2 — Rotation des clés (si nécessaire)**
- Si les clés ont été exposées, générer une nouvelle anon key Supabase et redéployer le GAS.
- Les anciennes URL restent compatibles tant qu'elles n'ont pas été révoquées.

**Vérification :**  
`git clone` frais du projet → l'app charge sans erreur JS. Les boutons Cloud / Sync sont désactivés visuellement ou affichent un message clair si `config.js` est absent.

---

### Phase 2 — Architecture & Modularité (P1)

**2.1 — Éliminer le JS inline de `tictache.html`**
- Créer `js/tictache.js` avec : config Supabase locale (lecture de `window.KostConfig`), recherche ref → couleur → taille, rendu JsBarcode, impression locale et distante (`print_queue`).
- Charger `js/tictache.js` en `defer` **après** `config.js`, `database.js`, `navigation.js`.
- Retirer le `<script>` inline massif de `tictache.html`.

**2.2 — Harmoniser l'endpoint GAS**
- Choisir un seul `GAS_URL` (celui de `config.js`).
- Si un endpoint spécifique à l'impression mobile est nécessaire, l'ajouter explicitement dans `config.js` sous `GAS_PRINT_URL`.
- Toutes les pages doivent lire `window.KostConfig.GAS_URL` (ou `GAS_PRINT_URL`), aucune constante GAS en dur dans les HTML.

**2.3 — Alignement `station.html`**
- Vérifier que `station.html` suit le même ordre de chargement `defer` que `index.html`.
- Extraire tout script inline vers un fichier `js/` dédié si présent.

---

### Phase 3 — Robustesse & UX (P1-P2)

**3.1 — Focus trap dans les modales**
- Dans `js/modals.js` : quand une modale s'ouvre, ajouter un listener `keydown` pour confiner `Tab` / `Shift+Tab` dans la modale.
- Quand la modale se ferme, rendre le focus au bouton qui a ouvert la modale (`btn-open-search` ou `btn-close-edit`).

**3.2 — Améliorer la gestion du `no-cors` GAS**
- Après un POST `no-cors` (impression mobile ou sync), faire un GET de confirmation sur un endpoint dédié (ex: `?action=status`) pour vérifier que l'étiquette est bien en file d'impression.
- Si la confirmation échoue, afficher un toast d'avertissement (et ne pas marquer l'item comme `Validé (Cloud)`).

**3.3 — Précharger les fonts Google dans le SW**
- Ajouter les URLs des fonts dans `urlsToCache` de `sw.js` (Inter, Space Grotesk, JetBrains Mono).
- Cela évite le FOIT et le layout shift lors des premiers chargements hors ligne.

**3.4 — Backup automatique avant suppression de la DB**
- Dans `database.js`, avant `db.delete()` sur `UpgradeError`, sauvegarder `catalogue_articles` dans `localStorage` (export JSON) pour permettre une restauration manuelle.
- Afficher un toast informant l'utilisateur que la DB va être réinitialisée.

---

### Phase 4 — Performance & Données (P2)

**4.1 — Indexation Dexie**
- Vérifier que les champs les plus filtrés (`ref_article`, `code_barres`, `brand`, `couleur`, `taille`) ont des index efficaces.
- Si `searchArticles` reste lent sur mobile, ajouter un index composite ou une table dédiée à la recherche full-text.

**4.2 — Merge intelligent lors du refresh cloud**
- Éviter de concaténer les items `En attente` à chaque refresh.
- Comparer par `uuid` plutôt que par position.
- Détecter les suppressions côté serveur (items présents dans le cloud mais plus dans l'inventaire local).

**4.3 — Bundler JS (optionnel)**
- Ajouter Vite ou Rollup pour grouper les scripts `js/` en un seul bundle.
- Réduit le nombre de requêtes `defer` et améliore le temps de chargement.
- À valider sur la taille finale et la compatibilité PWA.

---

## Règles d'intervention

1. **Ne jamais casser l'existant.** Chaque modification doit être testable en rechargeant `index.html`.
2. **Ne pas modifier** la logique métier suivante :
   - `performSearch()` (scan barcode → item)
   - `envoyerAuCloud()` / `actualiserCloud()` (GAS sync)
   - `syncCatalogue()` (`database.js`, synchro Supabase)
3. **Conserver le design brutalist actuel.** Pas de changement de palette, de fonts ou de layout global.
4. **Ne pas ajouter de dépendances npm** sans validation préalable.
5. Toute modification de `index.html` doit garder l'ordre des scripts `defer` suivant :
   `dexie.js` → `database.js` → `sync.js` → `navigation.js` → `js/state.js` → `js/ui.js` → `js/scanner.js` → `js/modals.js` → `js/bg3d.js` → `app.js` → `updater.js`.
6. **Ne jamais supprimer de commit historique.** Si une action d'audit ou de nettoyage l'exige, proposer systématiquement une alternative non destructive (ex: rotation des secrets, réécriture limitée refusée, ajout de garde-fous).
7. **Git** : chaque modification doit être commitée séparément avec un message explicite (ex: `feat(security): clean secrets from public repo`, `refactor: extract tictache inline JS to module`).

---

## Livrable attendu

- Pour chaque phase, fournir un `git diff --stat` propre.
- Un court message de commit par tâche.
- En fin de session, lister les tâches cochées + celles restantes.
