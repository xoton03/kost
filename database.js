/**
 * K.O.S.T. - Shared Database Engine (Dexie.js)
 * Centralized IndexedDB for all modules (Checkage, Tic-Tache, Flo).
 */

window.SUPABASE_URL = window.SUPABASE_URL || "https://jphzmgscxpejcyjlnspq.supabase.co";
window.SUPABASE_KEY = window.SUPABASE_KEY || "sb_publishable_gshF6Y08DYJYO9c8Z_Cv2Q_9nEZr7J9";

// Initialize Dexie
const db = new Dexie("KostSharedDB");

// Schema Definition
// gencod is the primary key (barcode)
db.version(3).stores({
    catalogue_articles: "gencod, ref_article, libelle, couleur, taille"
});

// Safeguard for primary key changes: 
// Dexie doesn't support changing the primary key on an existing table.
// If it happens (UpgradeError), we delete the DB and reload to start fresh.
db.open().catch("UpgradeError", function (err) {
    console.warn("[DB] Schema mismatch (Primary Key change). Deleting database to fix...");
    db.delete().then(() => {
        console.log("[DB] Database deleted. Reloading page...");
        window.location.reload();
    });
});

/**
 * Persistence: Request storage persistence from the browser
 */
async function requestPersistence() {
    if (navigator.storage && navigator.storage.persist) {
        const isPersisted = await navigator.storage.persist();
        console.log(`[DB] Storage persistence: ${isPersisted ? 'GRANTED' : 'DENIED'}`);
        return isPersisted;
    }
    return false;
}

/**
 * Synchronization: Fetch articles from Supabase in chunks
 * @param {Function} onProgress Callback for UI updates (current, total)
 */
async function syncCatalogue(onProgress) {
    console.log("[DB] Starting full synchronization...");
    
    // 1. Get total count
    // Optimized with count=planned for massive tables
    const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/produits_kiabi?select=count`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Range-Unit': 'items',
            'Prefer': 'count=planned'
        }
    });
    
    if (!countResponse.ok) {
        const errText = await countResponse.text();
        console.error(`[DB] Supabase Count Error (${countResponse.status}):`, errText);
        throw new Error(`Erreur Serveur Supabase (${countResponse.status})`);
    }
    
    const contentRange = countResponse.headers.get('Content-Range');
    const totalItems = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
    
    console.log(`[DB] Total items to sync (estimated): ${totalItems}`);
    
    // 2. Clear local table before sync
    await db.catalogue_articles.clear();
    
    // 3. Paginated Fetch (5000 lines blocks)
    const chunkSize = 5000;
    let offset = 0;
    
    while (offset < totalItems) {
        const end = Math.min(offset + chunkSize - 1, totalItems - 1);
        
        const response = await fetch(`${SUPABASE_URL}/rest/v1/produits_kiabi?select=code_barres,code_article,couleur,taille,collection,groupe,departement&order=code_barres.asc`, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Range': `${offset}-${end}`
            }
        });

        if (!response.ok) {
            const errText = await response.text();
            console.error(`[DB] Supabase Sync Error at offset ${offset} (${response.status}):`, errText);
            throw new Error(`Erreur Serveur Supabase (${response.status})`);
        }
        
        const data = await response.json();
        
        // Map Supabase columns to local schema
        const mappedData = data.map(item => ({
            gencod: String(item.code_barres),
            ref_article: item.code_article,
            libelle: item.departement || 'ARTICLE',
            couleur: item.couleur,
            taille: item.taille,
            collection: item.collection,
            groupe: item.groupe,
            prix_tarif: 0, 
            prix_reduit: 0
        }));
        
        await db.catalogue_articles.bulkPut(mappedData);
        
        offset += chunkSize;
        if (onProgress) onProgress(Math.min(offset, totalItems), totalItems);
    }
    
    console.log("[DB] Synchronization complete.");
    localStorage.setItem('kost_last_sync', new Date().toISOString());
    localStorage.setItem('kost_articles_count', totalItems);
}

/**
 * Search: Get unique colors for a reference
 */
async function getColors(ref) {
    const results = await db.catalogue_articles
        .where('ref_article')
        .equals(ref.toUpperCase())
        .toArray();
    return [...new Set(results.map(r => r.couleur))];
}

/**
 * Search: Get unique sizes for a ref/color pair
 */
async function getSizes(ref, color) {
    const results = await db.catalogue_articles
        .where('ref_article')
        .equals(ref.toUpperCase())
        .and(item => item.couleur === color)
        .toArray();
    return [...new Set(results.map(r => r.taille))];
}

/**
 * Search: Get full article details
 */
async function getArticle(ref, color, size) {
    return await db.catalogue_articles
        .where('ref_article')
        .equals(ref.toUpperCase())
        .and(item => item.couleur === color && item.taille === size)
        .first();
}

/**
 * Search: Get article by Gencod
 */
async function getArticleByGencod(gencod) {
    const val = typeof gencod === 'string' ? gencod : String(gencod);
    return await db.catalogue_articles.get(val);
}

/**
 * Search: Flexible search for Flo (Ref or Gencod)
 */
async function searchArticles(query, limit = 50) {
    if (!query) return [];
    
    // Exact Gencod search (High priority)
    const exact = await db.catalogue_articles.get(query);
    if (exact) return [exact];
    
    // Reference prefix search
    return await db.catalogue_articles
        .where('ref_article')
        .startsWithIgnoreCase(query)
        .limit(limit)
        .toArray();
}

// Request persistence on load
requestPersistence();
