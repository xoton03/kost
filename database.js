/**
 * K.O.S.T. - Shared Database Engine (Dexie.js)
 * Centralized IndexedDB for all modules (Checkage, Tic-Tache, Flo).
 */

window.SUPABASE_URL = window.SUPABASE_URL || "https://jphzmgscxpejcyjlnspq.supabase.co";
window.SUPABASE_KEY = window.SUPABASE_KEY || "sb_publishable_gshF6Y08DYJYO9c8Z_Cv2Q_9nEZr7J9";

// Initialize Dexie
const db = new Dexie("KostSharedDB");

// Schema Definition
// Indexing gencod and ref_article is critical for performance
db.version(2).stores({
    catalogue_articles: "++gencod, ref_article, libelle, couleur, taille"
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
    // Note: Using 'produits_kiabi' as the source for now
    const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/produits_kiabi?select=count`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Range-Unit': 'items',
            'Prefer': 'count=exact'
        }
    });
    
    const contentRange = countResponse.headers.get('Content-Range');
    const totalItems = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
    
    console.log(`[DB] Total items to sync: ${totalItems}`);
    
    // 2. Clear local table before sync
    await db.catalogue_articles.clear();
    
    // 3. Paginated Fetch (5000 lines blocks)
    const chunkSize = 5000;
    let offset = 0;
    
    while (offset < totalItems) {
        const end = Math.min(offset + chunkSize - 1, totalItems - 1);
        
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/produits_kiabi?select=code_barres,code_article,departement,couleur,taille,collection,prix_tarif,prix_reduit&order=code_barres.asc`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Range': `${offset}-${end}`
                }
            });
            
            const data = await response.json();
            
            // Map Supabase columns to local schema
            const mappedData = data.map(item => ({
                gencod: item.code_barres,
                ref_article: item.code_article,
                libelle: item.departement || 'ARTICLE',
                couleur: item.couleur,
                taille: item.taille,
                collection: item.collection,
                prix_tarif: item.prix_tarif,
                prix_reduit: item.prix_reduit
            }));
            
            await db.catalogue_articles.bulkAdd(mappedData);
            
            offset += chunkSize;
            if (onProgress) onProgress(Math.min(offset, totalItems), totalItems);
            
        } catch (err) {
            console.error(`[DB] Sync error at offset ${offset}:`, err);
            throw err;
        }
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
