/**
 * K.O.S.T. - FLO STOCK UI
 * Integrated with shared KostSharedDB for high-performance offline search.
 */

// UI Elements
const searchInput = document.getElementById('search-input');
const resultsBodyDesktop = document.getElementById('results-body-desktop');
const resultsBodyMobile = document.getElementById('results-body-mobile');
const btnScan = document.getElementById('btn-scan');

// Search Logic
async function performSearch() {
    const query = searchInput.value.trim();
    if (!query || query.length < 3) {
        resultsBodyDesktop.innerHTML = '';
        resultsBodyMobile.innerHTML = '';
        return;
    }

    try {
        // Use shared search engine
        const results = await searchArticles(query);
        renderResults(results);
    } catch (error) {
        console.error('[Flo Search] Error:', error);
    }
}

// Render Results (Lazy Display)
function renderResults(results) {
    if (results.length === 0) {
        const noResult = `<tr><td colspan="4" class="text-center py-12 text-slate-500 font-bold uppercase tracking-widest">Aucun résultat trouvé</td></tr>`;
        const noResultMobile = `<div class="text-center py-12 text-slate-500 font-bold uppercase tracking-widest">Aucun résultat trouvé</div>`;
        resultsBodyDesktop.innerHTML = noResult;
        resultsBodyMobile.innerHTML = noResultMobile;
        return;
    }

    // Desktop Rendering
    resultsBodyDesktop.innerHTML = results.map(item => `
        <tr class="animate-entrance border-b border-white/5 hover:bg-white/[0.02] transition-colors">
            <td class="py-4 px-2 font-mono text-xs text-slate-400">${item.gencod}</td>
            <td class="py-4 px-2 font-black text-orange-500 tracking-tighter">${item.ref_article}</td>
            <td class="py-4 px-2 uppercase font-bold text-xs tracking-wide">${item.libelle}</td>
            <td class="py-4 px-2 text-right">
                <div class="flex flex-col items-end">
                    ${item.prix_reduit ? `<span class="text-[10px] line-through text-slate-500 font-bold">${item.prix_tarif} DA</span>` : ''}
                    <span class="font-black text-lg ${item.prix_reduit ? 'text-red-500' : 'text-white'}">${item.prix_reduit || item.prix_tarif || '--'} DA</span>
                </div>
            </td>
        </tr>
    `).join('');

    // Mobile Rendering
    resultsBodyMobile.innerHTML = results.map(item => `
        <div class="stock-card animate-entrance bg-slate-900/50 border border-white/10 p-4 rounded-lg mb-3 shadow-xl backdrop-blur-sm">
            <div class="flex justify-between items-start mb-2">
                <span class="text-[10px] font-bold text-slate-500 tracking-widest uppercase">${item.gencod}</span>
                <span class="text-xs font-black text-orange-500">${item.ref_article}</span>
            </div>
            <h3 class="text-sm font-black text-white uppercase mb-4">${item.libelle}</h3>
            <div class="flex justify-between items-end">
                <div class="flex flex-col">
                    ${item.prix_reduit ? `<span class="text-[10px] line-through text-slate-500 font-bold mb-0.5">${item.prix_tarif} DA</span>` : ''}
                    <span class="text-2xl font-black ${item.prix_reduit ? 'text-red-500' : 'text-white'}">${item.prix_reduit || item.prix_tarif || '--'} <span class="text-xs">DA</span></span>
                </div>
                <div class="flex flex-col items-end gap-1">
                    <span class="text-[8px] font-black px-2 py-1 bg-green-500/20 text-green-400 border border-green-500/30 rounded uppercase tracking-widest">En Stock</span>
                    ${item.couleur ? `<span class="text-[9px] text-slate-400 font-bold uppercase">${item.couleur} / ${item.taille || '-'}</span>` : ''}
                </div>
            </div>
        </div>
    `).join('');

    if (window.lucide) lucide.createIcons();
}

// Clock Logic
function updateClock() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const secStr = now.getSeconds().toString().padStart(2, '0');
    const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    const timeElement = document.getElementById('current-time');
    const secondsElement = document.getElementById('current-seconds');
    const dateElement = document.getElementById('current-date');
    
    if (timeElement) timeElement.textContent = timeStr;
    if (secondsElement) secondsElement.textContent = secStr;
    if (dateElement) dateElement.textContent = formattedDate;
}

// Event Listeners
searchInput.addEventListener('input', performSearch);
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.target.blur();
});

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    updateClock();
    setInterval(updateClock, 1000);
    
    // Clear results on load
    resultsBodyDesktop.innerHTML = '';
    resultsBodyMobile.innerHTML = '';

    console.log('[Flo UI] Initialized with shared database.');
});
