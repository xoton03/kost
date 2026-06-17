/**
 * K.O.S.T. - Shared Database Engine (Dexie.js)
 * Centralized IndexedDB for all modules (Checkage, Tic-Tache, Flo).
 */

window.SUPABASE_URL = window.SUPABASE_URL || "https://jphzmgscxpejcyjlnspq.supabase.co";
window.SUPABASE_KEY = window.SUPABASE_KEY || "sb_publishable_gshF6Y08DYJYO9c8Z_Cv2Q_9nEZr7J9";

// Initialize Dexie
const db = new Dexie("KostSharedDB");

// Schema Definition (V9)
db.version(5).stores({
    catalogue_articles: "gencod, ref_article, libelle, prix_tarif, prix_reduit, brand, type_article, taille, couleur, marche, genre, groupe"
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
 * Synchronization: Fetch articles from Supabase in chunks (V7 Force Sync)
 * @param {Function} onProgress Callback for UI updates (current, total, eta)
 * @param {Boolean} isResume If true, don't clear the table and start from existing count
 */
async function syncCatalogue(onProgress, isResume = false) {
    console.log(`[DB] Starting ${isResume ? 'RESUME' : 'FULL'} synchronization (V7 FORCE)...`);
    
    // 1. Get total count
    const countResponse = await fetch(`${SUPABASE_URL}/rest/v1/base_flo-new?select=count`, {
        headers: {
            'apikey': SUPABASE_KEY,
            'Range-Unit': 'items',
            'Prefer': 'count=estimated'
        }
    });
    
    if (!countResponse.ok) {
        throw new Error(`Erreur Serveur Supabase (${countResponse.status})`);
    }
    
    const contentRange = countResponse.headers.get('Content-Range');
    const totalItems = contentRange ? parseInt(contentRange.split('/')[1]) : 0;
    
    // 2. Resume Logic: Count local items if resuming
    let offset = 0;
    if (isResume) {
        offset = await db.catalogue_articles.count();
        console.log(`[DB] Resuming from offset: ${offset}`);
    } else {
        await db.catalogue_articles.clear();
    }
    
    // 3. Sync Settings
    const chunkSize = 1000; // Smaller chunks for stability
    const delay = 200;      // 200ms breathe time
    let totalSaved = offset;
    let startTime = Date.now();
    
    while (totalSaved < totalItems) {
        const end = Math.min(totalSaved + chunkSize - 1, totalItems - 1);
        
        try {
            const response = await fetch(`${SUPABASE_URL}/rest/v1/base_flo-new?select=*`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Range': `${totalSaved}-${end}`
                }
            });

            if (!response.ok) throw new Error(`Fetch Error: ${response.status}`);
            
            let data = await response.json();
            
            const mappedData = data.map(item => ({
                gencod: String(item['Code-barres article'] || "").trim(),
                ref_article: String(item['Ref'] || "").trim().toUpperCase(),
                libelle: String(item["Nom de l'article"] || 'ARTICLE').trim(),
                prix_tarif: item['Prix'] || null,
                prix_reduit: item['Prix solde'] || null,
                brand: String(item['Brand'] || "").trim().toUpperCase(),
                type_article: String(item["Type de l'article"] || "").trim().toUpperCase(),
                taille: String(item['Taille'] || "").trim().toUpperCase(),
                couleur: String(item['Couleur'] || "").trim().toUpperCase(),
                marche: String(item['March'] || "").trim().toUpperCase(),
                genre: String(item["Genre de l'article"] || "").trim().toUpperCase(),
                groupe: String(item["Groupe de l'article"] || "").trim().toUpperCase()
            }));
            
            await db.catalogue_articles.bulkPut(mappedData);
            
            totalSaved += mappedData.length;
            
            // Calculate ETA
            const elapsed = (Date.now() - startTime) / 1000;
            const processedSinceStart = totalSaved - offset;
            const speed = processedSinceStart / elapsed; // items per second
            const remaining = totalItems - totalSaved;
            const etaSeconds = speed > 0 ? Math.round(remaining / speed) : 0;
            
            if (onProgress) onProgress(totalSaved, totalItems, etaSeconds);
            
            // Memory Management
            data = null; 
            
            // Log progress
            if (totalSaved % 10000 === 0) {
                console.log(`[DB] Progress: ${totalSaved} / ${totalItems} (ETA: ${etaSeconds}s)`);
            }

            // Pause for disk writing and main thread breathing
            await new Promise(resolve => setTimeout(resolve, delay));
            
        } catch (err) {
            console.error(`[DB] Sync failed at ${totalSaved}:`, err);
            throw err;
        }
    }
    
    console.log(`[DB] Synchronization complete. Total items: ${totalSaved}`);
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
async function searchArticles(query, limit = 50, brandFilter = "") {
    console.log(`[DB] searchArticles called with query: "${query}", limit: ${limit}, brandFilter: "${brandFilter}"`);
    
    // If both query and brandFilter are empty, return empty
    if (!query && !brandFilter) return [];
    
    const cleanQuery = query.trim();
    const cleanBrandFilter = brandFilter.trim().toUpperCase();
    const results = [];
    const isOnline = navigator.onLine;
    
    try {
        const localCount = await db.catalogue_articles.count();
        console.log(`[DB] Local articles count: ${localCount}, Online status: ${isOnline}`);
        
        // 1. If local DB has items, search locally
        if (localCount > 0) {
            let tempResults = [];
            if (cleanQuery) {
                const queryLower = cleanQuery.toLowerCase();
                const isNumeric = /^\d+$/.test(cleanQuery);
                
                tempResults = await db.catalogue_articles
                    .filter(item => {
                        const matchGencod = item.gencod && item.gencod.includes(cleanQuery);
                        const matchRef = item.ref_article && item.ref_article.toLowerCase().includes(queryLower);
                        const matchLibelle = item.libelle && item.libelle.toLowerCase().includes(queryLower);
                        const matchBrand = item.brand && item.brand.toLowerCase().includes(queryLower);
                        return matchGencod || matchRef || matchLibelle || matchBrand;
                    })
                    .toArray();
                
                // Handle potential leading zero truncation from bigint database types
                if (isNumeric && cleanQuery.startsWith('0')) {
                    const strippedQuery = cleanQuery.replace(/^0+/, '');
                    if (strippedQuery.length > 0) {
                        const extraMatches = await db.catalogue_articles
                            .filter(item => item.gencod && item.gencod.includes(strippedQuery))
                            .toArray();
                        for (const m of extraMatches) {
                            if (!tempResults.some(r => r.gencod === m.gencod)) {
                                tempResults.push(m);
                            }
                        }
                    }
                }
            } else if (cleanBrandFilter) {
                // If query is empty but brand filter is active, get all articles for this brand
                console.log(`[DB] Local search: Empty query. Fetching all items for brand: "${cleanBrandFilter}"`);
                tempResults = await db.catalogue_articles
                    .where('brand')
                    .equals(cleanBrandFilter)
                    .toArray();
            }
            
            // Filter by brand if selected
            if (cleanBrandFilter) {
                tempResults = tempResults.filter(item => 
                    item.brand && item.brand.trim().toUpperCase() === cleanBrandFilter
                );
            }
            
            // Deduplicate and apply limit
            for (const item of tempResults) {
                if (results.length >= limit) break;
                if (!results.some(r => r.gencod === item.gencod)) {
                    results.push(item);
                }
            }
        }
        
        // 2. Fallback to Supabase search if we are online AND (local DB is empty OR local search returned 0 results)
        if (isOnline && (localCount === 0 || results.length === 0)) {
            console.log(`[DB] Online fallback: Querying Supabase for "${cleanQuery}" (Brand filter: "${cleanBrandFilter}")...`);
            const supabaseResults = await searchSupabaseFiltered(cleanQuery, cleanBrandFilter, limit);
            results.push(...supabaseResults);
        }
        
        console.log(`[DB] searchArticles returning ${results.length} total results.`);
        return results;
    } catch (err) {
        console.error(`[DB] Error in searchArticles for query "${query}":`, err);
        throw err;
    }
}

/**
 * Direct Supabase Search (fallback when local DB is empty or missing query)
 */
async function searchSupabase(query, limit = 50) {
    const cleanQuery = query.trim();
    if (!cleanQuery) return [];

    console.log(`[DB] Querying Supabase directly for: "${cleanQuery}"`);
    const isNumeric = /^\d+$/.test(cleanQuery);
    
    const encodedQuery = encodeURIComponent(cleanQuery);
    let url = `${SUPABASE_URL}/rest/v1/base_flo-new?select=*&limit=${limit}`;
    if (isNumeric) {
        url += `&or=("Code-barres article".eq.${encodedQuery},Ref.ilike.${encodedQuery}%,"Nom de l'article".ilike.%${encodedQuery}%,Brand.ilike.${encodedQuery}%)`;
    } else {
        url += `&or=(Ref.ilike.${encodedQuery}%,"Nom de l'article".ilike.%${encodedQuery}%,Brand.ilike.${encodedQuery}%)`;
    }

    try {
        const res = await fetch(url, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (!res.ok) {
            throw new Error(`Supabase returned status ${res.status}`);
        }
        const data = await res.json();
        console.log(`[DB] Supabase search returned ${data.length} items.`);
        
        return data.map(item => ({
            gencod: String(item['Code-barres article'] || "").trim(),
            ref_article: String(item['Ref'] || "").trim().toUpperCase(),
            libelle: String(item["Nom de l'article"] || 'ARTICLE').trim(),
            prix_tarif: item['Prix'] || null,
            prix_reduit: item['Prix solde'] || null,
            brand: String(item['Brand'] || "").trim().toUpperCase(),
            type_article: String(item["Type de l'article"] || "").trim().toUpperCase(),
            taille: String(item['Taille'] || "").trim().toUpperCase(),
            couleur: String(item['Couleur'] || "").trim().toUpperCase(),
            marche: String(item['March'] || "").trim().toUpperCase(),
            genre: String(item["Genre de l'article"] || "").trim().toUpperCase(),
            groupe: String(item["Groupe de l'article"] || "").trim().toUpperCase()
        }));
    } catch (err) {
        console.error('[DB] Failed to query Supabase directly:', err);
        return [];
    }
}

async function searchSupabaseFiltered(query, brandFilter, limit = 50) {
    const cleanQuery = query.trim();
    const cleanBrand = brandFilter.trim();
    if (!cleanQuery && !cleanBrand) return [];

    console.log(`[DB] Querying Supabase with brand filter directly for: "${cleanQuery}" (brand: ${cleanBrand})`);
    
    let url = `${SUPABASE_URL}/rest/v1/base_flo-new?select=*&limit=${limit}`;
    const conditions = [];

    if (cleanQuery) {
        const isNumeric = /^\d+$/.test(cleanQuery);
        const encodedQuery = encodeURIComponent(cleanQuery);
        if (isNumeric) {
            conditions.push(`or=("Code-barres article".eq.${encodedQuery},Ref.ilike.${encodedQuery}%,"Nom de l'article".ilike.%${encodedQuery}%,Brand.ilike.${encodedQuery}%)`);
        } else {
            conditions.push(`or=(Ref.ilike.${encodedQuery}%,"Nom de l'article".ilike.%${encodedQuery}%,Brand.ilike.${encodedQuery}%)`);
        }
    }
    
    if (cleanBrand) {
        conditions.push(`Brand.ilike.${encodeURIComponent(cleanBrand)}`);
    }

    if (conditions.length > 0) {
        url += `&${conditions.join('&')}`;
    }

    try {
        const res = await fetch(url, {
            headers: {
                'apikey': SUPABASE_KEY,
                'Authorization': `Bearer ${SUPABASE_KEY}`
            }
        });
        if (!res.ok) {
            throw new Error(`Supabase returned status ${res.status}`);
        }
        const data = await res.json();
        console.log(`[DB] Supabase filtered search returned ${data.length} items.`);
        
        return data.map(item => ({
            gencod: String(item['Code-barres article'] || "").trim(),
            ref_article: String(item['Ref'] || "").trim().toUpperCase(),
            libelle: String(item["Nom de l'article"] || 'ARTICLE').trim(),
            prix_tarif: item['Prix'] || null,
            prix_reduit: item['Prix solde'] || null,
            brand: String(item['Brand'] || "").trim().toUpperCase(),
            type_article: String(item["Type de l'article"] || "").trim().toUpperCase(),
            taille: String(item['Taille'] || "").trim().toUpperCase(),
            couleur: String(item['Couleur'] || "").trim().toUpperCase(),
            marche: String(item['March'] || "").trim().toUpperCase(),
            genre: String(item["Genre de l'article"] || "").trim().toUpperCase(),
            groupe: String(item["Groupe de l'article"] || "").trim().toUpperCase()
        }));
    } catch (err) {
        console.error('[DB] Failed to query Supabase directly in filtered search:', err);
        return [];
    }
}

// Request persistence on load
requestPersistence();
