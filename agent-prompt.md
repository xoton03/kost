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

---

## Mission

### A) Sécurité & configuration (P0)

**A1 — Extraire les clés API hors du code**

- Déplacer `GAS_URL`, `SUPABASE_URL`, `SUPABASE_KEY` depuis `js/state.js` vers un fichier `config.js` à la racine.
- `config.js` doit exposer `window.KostConfig = { SUPABASE_URL, SUPABASE_KEY, GAS_URL }` avec des **chaînes vides** par défaut.
- `js/state.js` doit lire `window.KostConfig` et **ne plus hardcoder** les valeurs.
- Créer `config.example.js` (modèle à copier) et ajouter `config.js` dans `.gitignore`.
- Si `KostConfig` est vide au démarrage, désactiver proprement les features réseau et afficher un toast « configuration manquante ».

**Vérification :**  
`git clone` frais du projet → l’app charge sans erreur JS. Les boutons Cloud / Sync sont désactivés visuellement ou affichent un message clair.

---

**A2 — Durcir CORS / erreurs réseau**

- Dans `app.js`, `actualiserCloud()` et `backgroundSync()` : actuellement l’erreur CORS est retournée comme toast générique. Ajouter le status HTTP et l’URL queryée dans le message d’erreur pour debug.
- Dans `js/state.js`, `supabaseFetch()` : vérifier que les headers `apikey` / `Authorization` sont cohérents avec la nouvelle config.

**Vérification :**  
Couper le réseau → cliquer sur « Actualiser » → toast explicite mentionnant CORS / offline / status.

---

### B) Accessibilité & UX (P1)

**B1 — ARIA sur toasts et modals**

- `js/ui.js`, `showToast()` : ajouter `role="alert"` sur l’élément toast créé.
- `index.html` : sur `#toast-container`, ajouter `aria-live="polite"` et `role="status"`.
- `index.html` : sur `#search-modal` et `#edit-modal`, ajouter `role="dialog"`, `aria-modal="true"`, et un `aria-labelledby` pointant vers le titre du modal.
- Sur les boutons icônes seuls (edit/delete dans la table, copie barcode), ajouter `aria-label` explicite.

**B2 — Focus trap dans les modals**

- `js/modals.js` : quand un modal s’ouvre, ajouter un listener `keydown` pour confiner Tab / Shift+Tab dans le modal.
- Quand le modal se ferme, rendre le focus au bouton qui a ouvert le modal (`btn-open-search` ou `btn-close-edit`).

**Vérification :**  
Ouvrir le modal → Tab circule uniquement sur les champs du modal → Escape ferme → focus revient au déclencheur.

---

### C) Service Worker & offline (P2)

**C1 — Stratégie de cache**

- Modifier `sw.js` pour :
  - `stale-while-revalidate` sur `.js`, `.css`, les fonts Google et les images `assets/`.
  - `networkFirst` sur les requêtes Supabase / GAS (si possible via `fetch` event handling).
- Créer `offline.html` (page simple : logo K.O.S.T. + « Hors ligne ») et la servir en fallback quand une navigation échoue hors ligne.

**C2 — Update SW**

- Dans `sw.js`, ajouter un `skipWaiting()` automatique quand une nouvelle version est installée et que l’utilisateur recharge la page (évite la bannière bloquante sur mobile).

**Vérification :**  
Mode avion → recharger → affichage `offline.html`. Réactiver le réseau → nouvelle page → assets à jour.

---

### D) Qualité de code (P3)

**D1 — Linter**

- Ajouter ESLint (`.eslintrc.json`) avec règles : `no-unused-vars`, `no-alert`, `prefer-const`.
- Corriger les warnings existants (ex : variables inutilisées, `var` restants).

**D2 — Vite / build step**

- Migrer de Tailwind CDN vers Tailwind CSS via PostCSS/Vite pour réduire la taille du CSS produit et autoriser les `@apply`.
- Garder la compatibilité PWA (manifest + SW).

**Optionnel :** Si la migration Vite est trop longue, laisser le CDN mais ajouter un `style-processor` en CI.

---

## Règles d’intervention

1. **Ne jamais casser l’existant.** Chaque modification doit être testable en rechargeant `index.html`.
2. **Ne pas modifier** la logique métier suivante :  
   - `performSearch()` (scan barcode → item)  
   - `envoyerAuCloud()` / `actualiserCloud()` (GAS sync)  
   - `syncCatalogue()` (`database.js`, synchro Supabase)
3. **Conserver le design brutalist actuel.** Pas de changement de palette, de fonts ou de layout global.
4. **Ne pas ajouter de dépendances npm** sans validation préalable.
5. Toute modification de `index.html` doit garder l’ordre des scripts `defer` suivant :  
   `dexie.js` → `database.js` → `sync.js` → `navigation.js` → `js/state.js` → `js/ui.js` → `js/scanner.js` → `js/modals.js` → `js/bg3d.js` → `app.js` → `updater.js`.

---

## Livrable attendu

- Fichiers modifiés/créés avec un `git diff --stat` propre.
- Un court message de commit par tâche (`feat(security): extract API keys to config.js`, `fix(a11y): add ARIA on modals and toasts`, etc.).
- En fin de session, lister les tâches A, B, C, D cochées + celles restantes.
