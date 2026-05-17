/**
 * K.O.S.T. - FLO STOCK UI
 * Integrated with shared KostSharedDB for high-performance offline search.
 */

// UI Elements
const searchInput = document.getElementById('search-input');
const resultsBodyDesktop = document.getElementById('results-body-desktop');
const resultsBodyMobile = document.getElementById('results-body-mobile');
const btnScan = document.getElementById('btn-scan');

// Price Formatting Helper (French style thousands dot separator)
function formatPrice(val) {
    if (val === undefined || val === null) return '--';
    const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('fr-FR', { useGrouping: true }).format(num).replace(/\s/g, '.');
}



// Global Manifest Action Handler (exposed to window for inline onclick attributes)
window.handleAddToManifest = function(ref, name) {
    const formattedRef = String(ref || "").trim().toUpperCase().replace(/\s+/g, '_');
    showToast(`ADDED_${formattedRef}_TO_MANIFEST`, 'success');
};

// Toast notification container
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast animate-entrance';
    let icon = 'check-circle';
    let color = 'text-green-400';
    if (type === 'error') {
        icon = 'alert-circle';
        color = 'text-red-400';
    }
    toast.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5 ${color}"></i><span class="text-sm font-medium font-body-mono">${message.toUpperCase()}</span>`;
    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Search Logic
async function performSearch() {
    const query = searchInput.value.trim();
    if (!query || query.length < 3) {
        resultsBodyMobile.innerHTML = '';
        if (resultsBodyDesktop) resultsBodyDesktop.innerHTML = '';
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

// Render Results (Lazy Display matching flo_screen.html markup)
function renderResults(results) {
    if (results.length === 0) {
        const noResultMobile = `<div class="col-span-full text-center py-12 text-slate-500 font-bold uppercase tracking-widest border border-dashed border-outline bg-surface">AUCUN_RESULTAT_TROUVE</div>`;
        resultsBodyMobile.innerHTML = noResultMobile;
        if (resultsBodyDesktop) resultsBodyDesktop.innerHTML = '';
        return;
    }

    const cleanStr = (val) => {
        if (val === undefined || val === null) return "";
        const s = String(val).trim();
        return (s === "0" || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") ? "" : s;
    };

    // High fidelity brutalist grid rendering
    resultsBodyMobile.innerHTML = results.map(item => {
        const isPromo = item.prix_reduit && item.prix_reduit < item.prix_tarif;
        const price = { tarif: item.prix_tarif || 0, reduit: isPromo ? item.prix_reduit : null };
        
        const rawTitle = cleanStr(item.libelle);
        const formattedTitle = rawTitle ? rawTitle.toUpperCase().replace(/\s+/g, '_') : "ARTICLE_SANS_NOM";
        
        const rawRef = cleanStr(item.ref_article);
        const formattedRef = rawRef ? rawRef.toUpperCase() : "SANS_REF";
        
        const brand = cleanStr(item.brand);
        const genre = cleanStr(item.genre);
        const typeArticle = cleanStr(item.type_article);
        const couleur = cleanStr(item.couleur);
        const taille = cleanStr(item.taille);
        const marche = cleanStr(item.marche);
        const groupe = cleanStr(item.groupe);
        
        return `
        <section class="flex flex-col border border-outline bg-surface animate-entrance">
            <div class="p-6 border-b border-outline">
                <h2 class="font-headline-md text-headline-md text-white font-bold leading-tight uppercase tracking-tight">${formattedTitle}</h2>
                <div class="flex flex-wrap items-center gap-2 mt-2">
                    ${genre ? `<span class="font-body-mono text-label-caps text-on-surface-variant border border-outline px-2 py-0.5">${genre}</span>` : ''}
                    ${typeArticle ? `<span class="font-body-mono text-label-caps text-on-surface-variant border border-outline px-2 py-0.5">${typeArticle}</span>` : ''}
                    ${couleur ? `<span class="font-body-mono text-label-caps text-slate-400 border border-outline px-2 py-0.5">${couleur}</span>` : ''}
                    ${taille ? `<span class="font-body-mono text-label-caps text-slate-400 border border-outline px-2 py-0.5">T_${taille}</span>` : ''}
                </div>
            </div>
            
            ${price.reduit ? `
            <div class="p-6 border-b border-outline flex flex-col items-start gap-1">
                <div class="flex justify-between items-center w-full">
                    <span class="font-label-caps text-label-caps text-on-surface-variant uppercase">UNIT_PRICE_NET</span>
                    <span class="font-body-mono text-xs text-red-500 font-bold border border-red-500/30 bg-red-500/10 px-2 py-0.5 uppercase tracking-wider">PROMO_ACTIVE</span>
                </div>
                <div class="flex items-baseline flex-wrap gap-2">
                    <span class="font-display-lg text-6xl text-red-500 font-black tracking-tighter">${formatPrice(price.reduit)}</span>
                    <span class="font-headline-md text-2xl text-red-500 font-bold">DA</span>
                    <span class="font-body-mono text-sm text-slate-500 line-through ml-2">${formatPrice(price.tarif)} DA</span>
                </div>
            </div>
            ` : `
            <div class="p-6 border-b border-outline flex flex-col items-start gap-1">
                <span class="font-label-caps text-label-caps text-on-surface-variant uppercase">UNIT_PRICE_NET</span>
                <div class="flex items-baseline gap-2">
                    <span class="font-display-lg text-6xl text-primary-container font-black tracking-tighter">${formatPrice(price.tarif)}</span>
                    <span class="font-headline-md text-2xl text-primary-container font-bold">DA</span>
                </div>
            </div>
            `}
            
            <div class="grid grid-cols-2 gap-px bg-outline">
                <div class="bg-surface p-4 flex flex-col">
                    <span class="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">REFERENCE</span>
                    <span class="font-body-mono text-body-mono text-white">${formattedRef}</span>
                </div>
                <div class="bg-surface p-4 flex flex-col">
                    <span class="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">GENCOD</span>
                    <span class="font-body-mono text-body-mono text-white">${item.gencod}</span>
                </div>
                <div class="bg-surface p-4 flex flex-col">
                    <span class="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">MARCHÉ</span>
                    <span class="font-body-mono text-body-mono text-white">${marche || '--'}</span>
                </div>
                <div class="bg-surface p-4 flex flex-col">
                    <span class="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">MARQUE</span>
                    <span class="font-body-mono text-body-mono text-primary font-bold">${brand || '--'}</span>
                </div>
                ${groupe ? `
                <div class="bg-surface p-4 flex flex-col col-span-2">
                    <span class="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">GROUPE</span>
                    <span class="font-body-mono text-body-mono text-white">${groupe}</span>
                </div>` : ''}
            </div>
            
            <button onclick="handleAddToManifest('${formattedRef}', '${formattedTitle}')" class="w-full bg-primary-container text-on-primary-container py-6 font-label-caps text-label-caps font-black uppercase hover:bg-white hover:text-black transition-colors">
                ADD_TO_MANIFEST
            </button>
        </section>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

// Event Listeners
searchInput.addEventListener('input', performSearch);
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.target.blur();
});

// Barcode Scanner Integration with html5-qrcode
let html5QrCode = null;

async function startScanner() {
    const scannerModal = document.getElementById('scanner-modal');
    if (!scannerModal) return;

    scannerModal.classList.remove('hidden');
    scannerModal.classList.add('flex');
    
    const statusEl = document.getElementById('scanner-status');
    if (statusEl) statusEl.textContent = 'INITIALIZING_CAMERA...';
    
    try {
        if (!html5QrCode) {
            // Instantiate with the scanner-reader div ID
            html5QrCode = new Html5Qrcode("scanner-reader");
        }
        
        const qrCodeSuccessCallback = (decodedText, decodedResult) => {
            console.log(`[Flo Scanner] Success: ${decodedText}`, decodedResult);
            
            // Populate search and query database
            if (searchInput) {
                searchInput.value = decodedText;
                performSearch();
            }
            
            showToast(`SCANNED_CODE_${decodedText}`, 'success');
            stopScanner();
        };
        
        const config = {
            fps: 15,
            qrbox: (width, height) => {
                // Returns scan window dimensions optimized for linear barcodes
                return {
                    width: Math.min(width * 0.85, 320),
                    height: Math.min(height * 0.35, 140)
                };
            },
            aspectRatio: 1.333333
        };
        
        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            qrCodeSuccessCallback
        );
        
        if (statusEl) statusEl.textContent = 'ACTIVE_READY';
        
    } catch (err) {
        console.error('[Flo Scanner] Error initiating scanner:', err);
        if (statusEl) statusEl.textContent = 'ERROR_CAMERA_ACCESS_DENIED';
        showToast('CAMERA_ACCESS_DENIED', 'error');
        // Hide modal automatically on error after 2 seconds
        setTimeout(stopScanner, 2000);
    }
}

async function stopScanner() {
    const scannerModal = document.getElementById('scanner-modal');
    if (!scannerModal) return;

    scannerModal.classList.add('hidden');
    scannerModal.classList.remove('flex');
    
    if (html5QrCode && html5QrCode.isScanning) {
        try {
            await html5QrCode.stop();
        } catch (err) {
            console.error('[Flo Scanner] Stop error:', err);
        }
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Clear results on load
    resultsBodyMobile.innerHTML = '';
    if (resultsBodyDesktop) resultsBodyDesktop.innerHTML = '';
    
    // Bind Scanner Buttons
    if (btnScan) {
        btnScan.addEventListener('click', (e) => {
            e.preventDefault();
            startScanner();
        });
    }

    const btnCloseScanner = document.getElementById('btn-close-scanner');
    if (btnCloseScanner) {
        btnCloseScanner.addEventListener('click', (e) => {
            e.preventDefault();
            stopScanner();
        });
    }

    const scannerModal = document.getElementById('scanner-modal');
    if (scannerModal) {
        scannerModal.addEventListener('click', (e) => {
            if (e.target === scannerModal) {
                stopScanner();
            }
        });
    }
    
    console.log('[Flo UI] Initialized with shared database and camera barcode scanner.');
});

