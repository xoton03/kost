/**
 * K.O.S.T. - Shared Database Engine (Dexie.js)
 * Centralized IndexedDB for all modules (Checkage, Tic-Tache, Flo).
 */

window.SUPABASE_URL = window.SUPABASE_URL || "https://jphzmgscxpejcyjlnspq.supabase.co";
window.SUPABASE_KEY = window.SUPABASE_KEY || "sb_publishable_gshF6Y08DYJYO9c8Z_Cv2Q_9nEZr7J9";

// Initialize Dexie
const db = new Dexie("KostSharedDB");

// Schema Definition (V8)
db.version(4).stores({
    catalogue_articles: "gencod, ref_article, libelle, couleur, taille, groupe, departement"
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
    // Using count=estimated for 1.2M+ rows to avoid Supabase timeout (Error 500)
    const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/produits_kiabi?select=count`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Range-Unit': 'items',
            'Prefer': 'count=estimated'
        }
    });
    
    if (!countResponse.ok) {
        const errText = await countResponse.text();
        console.error(`[DB] Supabase Count Error (${countResponse.status}):`, errText);
        throw new Error(`Erreur Serveur Supabase (${countResponse.status})`);
    }
    
    const contentRange = countResponse.headers.get('Content-Range');
    const totalItems = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
    
    console.log(`[DB] Total items to sync (exact): ${totalItems}`);
    
    // 2. Clear local table before sync
    await db.catalogue_articles.clear();
    
    // 3. Paginated Fetch (5000 lines blocks)
    const chunkSize = 5000;
    let offset = 0;
    let totalSaved = 0;
    
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
        
        // Map Supabase columns to local schema + TRIM strings
        const mappedData = data.map(item => ({
            gencod: String(item.code_barres || "").trim(),
            ref_article: String(item.code_article || "").trim().toUpperCase(),
            libelle: String(item.departement || 'ARTICLE').trim(),
            couleur: String(item.couleur || "").trim().toUpperCase(),
            taille: String(item.taille || "").trim().toUpperCase(),
            groupe: String(item.groupe || "").trim().toUpperCase(),
            departement: String(item.departement || "").trim().toUpperCase(),
            collection: String(item.collection || "").trim().toUpperCase()
        }));
        
        await db.catalogue_articles.bulkPut(mappedData);
        
        totalSaved += mappedData.length;
        offset += chunkSize;
        
        if (onProgress) onProgress(Math.min(offset, totalItems), totalItems);
        
        // Log progress every 50k items
        if (totalSaved % 50000 === 0 || totalSaved >= totalItems) {
            console.log(`[DB] Progress: ${totalSaved} / ${totalItems} items saved.`);
        }
    }
    
    console.log(`[DB] Synchronization complete. Total items saved: ${totalSaved}`);
    localStorage.setItem('kost_last_sync', new Date().toISOString());
    localStorage.setItem('kost_articles_count', totalSaved);
}

/**
 * Search: Get unique colors for a reference
 */
async function getColors(ref) {
    const cleanRef = String(ref || "").trim().toUpperCase();
    console.log(`[DB] Recherche couleurs pour ref: ${cleanRef}`);
    try {
        const results = await db.catalogue_articles
            .where('ref_article')
            .startsWithIgnoreCase(cleanRef)
            .toArray();
        console.log(`[DB] ${results.length} variantes trouvées pour ${cleanRef}`);
        return [...new Set(results.map(r => r.couleur))].sort();
    } catch (err) {
        console.error(`[DB] Erreur getColors(${cleanRef}):`, err);
        throw err;
    }
}

/**
 * Search: Get unique sizes for a ref/color pair
 */
async function getSizes(ref, color) {
    const cleanRef = String(ref || "").trim().toUpperCase();
    const cleanColor = String(color || "").trim().toUpperCase();
    console.log(`[DB] Recherche tailles pour ref: ${cleanRef}, couleur: ${cleanColor}`);
    try {
        const results = await db.catalogue_articles
            .where('ref_article')
            .startsWithIgnoreCase(cleanRef)
            .and(item => item.couleur === cleanColor)
            .toArray();
        return [...new Set(results.map(r => r.taille))].sort();
    } catch (err) {
        console.error(`[DB] Erreur getSizes(${cleanRef}, ${cleanColor}):`, err);
        throw err;
    }
}

/**
 * Search: Get full article details
 */
async function getArticle(ref, color, size) {
    const cleanRef = String(ref || "").trim().toUpperCase();
    const cleanColor = String(color || "").trim().toUpperCase();
    const cleanSize = String(size || "").trim().toUpperCase();
    console.log(`[DB] Recherche article complet: ${cleanRef}, ${cleanColor}, ${cleanSize}`);
    try {
        return await db.catalogue_articles
            .where('ref_article')
            .startsWithIgnoreCase(cleanRef)
            .and(item => item.couleur === cleanColor && item.taille === cleanSize)
            .first();
    } catch (err) {
        console.error(`[DB] Erreur getArticle(${cleanRef}, ${cleanColor}, ${cleanSize}):`, err);
        throw err;
    }
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
