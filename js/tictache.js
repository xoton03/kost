// K.O.S.T. - Tic Tache Module Logic

document.addEventListener('DOMContentLoaded', () => {
    // ============================================================
    // CONFIG SUPABASE & GAS
    // ============================================================
    const PROD_SUPABASE_URL = "https://jphzmgscxpejcyjlnspq.supabase.co";
    const PROD_SUPABASE_KEY = "sb_publishable_gshF6Y08DYJYO9c8Z_Cv2Q_9nEZr7J9";
    const PROD_GAS_PRINT_URL = "https://script.google.com/macros/s/AKfycbxPIhweJ51FptVFcCqAX28poGYlR10TCjZaVmhOij6rPmK8H8Hl33RWg3k3jTfGJiIb/exec";

    const SUPABASE_URL = (window.KostConfig && window.KostConfig.SUPABASE_URL) || window.SUPABASE_URL || PROD_SUPABASE_URL;
    const SUPABASE_KEY = (window.KostConfig && window.KostConfig.SUPABASE_KEY) || window.SUPABASE_KEY || PROD_SUPABASE_KEY;
    const GAS_PRINT_URL = (window.KostConfig && window.KostConfig.GAS_PRINT_URL) || window.GAS_PRINT_URL || PROD_GAS_PRINT_URL;

    async function supabaseFetch(table, select = '*', filters = {}, options = {}) {
        let url = `${SUPABASE_URL}/rest/v1/${table}?select=${select}`;
        Object.entries(filters).forEach(([key, val]) => {
            url += `&${key}=eq.${encodeURIComponent(val)}`;
        });
        if (options.order) url += `&order=${options.order}`;
        if (options.limit) url += `&limit=${options.limit}`;
        const res = await fetch(url, {
            headers: { 'apikey': SUPABASE_KEY, 'Authorization': `Bearer ${SUPABASE_KEY}` }
        });
        if (!res.ok) throw new Error('Erreur Supabase');
        return res.json();
    }

    // ============================================================
    // CONNECTIVITY STATUS ENGINE
    // ============================================================
    let isAppOnline = navigator.onLine;
    const netStatusEl = document.getElementById('net-status');

    async function checkConnectivity() {
        if (!navigator.onLine) {
            isAppOnline = false;
            updateConnectionStatusUI(false);
            return false;
        }
        try {
            const controller = new AbortController();
            const timeoutId = setTimeout(() => controller.abort(), 3000);
            // Query a lightweight row from produits_kiabi which is CORS-allowed and highly optimized
            const res = await fetch(`${SUPABASE_URL}/rest/v1/produits_kiabi?limit=1`, {
                method: 'GET',
                headers: { 
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                },
                signal: controller.signal
            });
            clearTimeout(timeoutId);
            const online = res.ok;
            isAppOnline = online;
            updateConnectionStatusUI(online);
            return online;
        } catch (e) {
            console.warn("[Connectivity] Connection check failed:", e);
            isAppOnline = false;
            updateConnectionStatusUI(false);
            return false;
        }
    }

    function updateConnectionStatusUI(online) {
        if (!netStatusEl) return;
        if (online) {
            netStatusEl.className = "flex items-center gap-1.5 px-2 py-1 rounded border border-emerald-500/30 bg-emerald-500/10 text-[9px] font-bold text-emerald-400 uppercase tracking-widest transition-all";
            netStatusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span><span>EN LIGNE</span>`;
        } else {
            netStatusEl.className = "flex items-center gap-1.5 px-2 py-1 rounded border border-amber-500/30 bg-amber-500/10 text-[9px] font-bold text-amber-500 uppercase tracking-widest transition-all";
            netStatusEl.innerHTML = `<span class="w-1.5 h-1.5 rounded-full bg-amber-500"></span><span>HORS LIGNE</span>`;
        }
    }

    // Trigger initial check
    checkConnectivity();

    // Event listeners for window connectivity events
    window.addEventListener('online', () => checkConnectivity());
    window.addEventListener('offline', () => {
        isAppOnline = false;
        updateConnectionStatusUI(false);
    });

    // Check periodically
    setInterval(checkConnectivity, 10000);

    // ============================================================
    // DYNAMIC SEARCH WRAPPERS (ONLINE WITH OFFLINE FALLBACK)
    // ============================================================
    async function getColorsWithFallback(ref) {
        await checkConnectivity();
        if (isAppOnline) {
            try {
                console.log(`[Search] Querying Supabase for colors of ref: ${ref}`);
                const data = await supabaseFetch('produits_kiabi', 'couleur', { 'code_article': ref });
                const colors = [...new Set(data.map(item => item.couleur))].filter(Boolean).sort();
                if (colors.length > 0) {
                    if (typeof showToast === 'function') showToast('Données chargées depuis le serveur', 'success');
                    return colors;
                }
            } catch (err) {
                console.warn('[Search] Supabase query failed, falling back to local DB:', err);
                if (typeof showToast === 'function') showToast('Réseau instable, bascule sur la base locale', 'error');
            }
        }
        console.log(`[Search] Querying Local DB for colors of ref: ${ref}`);
        const colors = await getColors(ref);
        if (colors && colors.length > 0) {
            if (typeof showToast === 'function') showToast('Données chargées localement', 'info');
            return colors;
        }
        return [];
    }

    async function getSizesWithFallback(ref, color) {
        await checkConnectivity();
        if (isAppOnline) {
            try {
                console.log(`[Search] Querying Supabase for sizes of ref: ${ref}, color: ${color}`);
                const data = await supabaseFetch('produits_kiabi', 'taille', { 'code_article': ref, 'couleur': color });
                const sizes = [...new Set(data.map(item => item.taille))].filter(Boolean).sort();
                if (sizes.length > 0) return sizes;
            } catch (err) {
                console.warn('[Search] Supabase query failed, falling back to local DB:', err);
            }
        }
        console.log(`[Search] Querying Local DB for sizes of ref: ${ref}, color: ${color}`);
        return await getSizes(ref, color);
    }

    async function getArticleWithFallback(ref, color, size) {
        await checkConnectivity();
        if (isAppOnline) {
            try {
                console.log(`[Search] Querying Supabase for article of ref: ${ref}, color: ${color}, size: ${size}`);
                const data = await supabaseFetch('produits_kiabi', '*', { 'code_article': ref, 'couleur': color, 'taille': size });
                if (data && data.length > 0) {
                    const item = data[0];
                    return {
                        gencod: String(item['code_barres'] || "").trim(),
                        ref_article: String(item['code_article'] || "").trim().toUpperCase(),
                        libelle: 'ARTICLE',
                        prix_tarif: null,
                        prix_reduit: null,
                        brand: '',
                        type_article: '',
                        taille: String(item['taille'] || "").trim().toUpperCase(),
                        couleur: String(item['couleur'] || "").trim().toUpperCase(),
                        marche: '',
                        genre: '',
                        groupe: String(item['groupe'] || "").trim().toUpperCase(),
                        collection: String(item['collection'] || "").trim().toUpperCase()
                    };
                }
            } catch (err) {
                console.warn('[Search] Supabase query failed, falling back to local DB:', err);
            }
        }
        console.log(`[Search] Querying Local DB for article of ref: ${ref}, color: ${color}, size: ${size}`);
        const article = await getArticle(ref, color, size);
        if (article && !article.collection) {
            article.collection = article.marche || '';
        }
        return article;
    }

    // ============================================================
    // SEARCH FUNNEL
    // ============================================================
    const ttRef = document.getElementById('tt-ref');
    const ttColor = document.getElementById('tt-color');
    const ttSize = document.getElementById('tt-size');
    const groupColor = document.getElementById('group-color');
    const groupSize = document.getElementById('group-size');
    const printCard = document.getElementById('print-card');
    const refLoader = document.getElementById('ref-loader');

    let currentBarcode = null;
    let currentRef = null;
    let currentCollection = null;

    function setStep(n) {
        for (let i = 1; i <= 3; i++) {
            const el = document.getElementById(`step-${i}`);
            if (el) el.classList.toggle('active', i <= n);
        }
    }

    if (ttRef) {
        ttRef.addEventListener('input', async (e) => {
            const val = e.target.value.trim().toUpperCase();
            e.target.value = val;
            if (val.length !== 5) {
                if (groupColor) groupColor.classList.add('hidden');
                if (groupSize) groupSize.classList.add('hidden');
                if (printCard) printCard.classList.add('hidden');
                setStep(1);
                return;
            }
            if (refLoader) refLoader.classList.remove('hidden');
            ttRef.blur();
            try {
                const colors = await getColorsWithFallback(val);
                if (colors && colors.length > 0) {
                    if (ttColor) {
                        ttColor.innerHTML = '<option value="">Choisir une couleur...</option>';
                        colors.forEach(c => ttColor.innerHTML += `<option value="${c}">${c}</option>`);
                    }
                    if (groupColor) groupColor.classList.remove('hidden');
                    if (groupSize) groupSize.classList.add('hidden');
                    if (printCard) printCard.classList.add('hidden');
                    currentRef = val;
                    setStep(2);
                } else {
                    if (typeof showToast === 'function') showToast('Référence introuvable', 'error');
                }
            } catch (err) {
                if (typeof showToast === 'function') showToast('Erreur de recherche', 'error');
            } finally {
                if (refLoader) refLoader.classList.add('hidden');
            }
        });
    }

    if (ttColor) {
        ttColor.addEventListener('change', async (e) => {
            const color = e.target.value;
            if (!color) {
                if (groupSize) groupSize.classList.add('hidden');
                return;
            }
            try {
                const sizes = await getSizesWithFallback(currentRef, color);
                if (sizes && sizes.length > 0) {
                    if (ttSize) {
                        ttSize.innerHTML = '<option value="">Choisir une taille...</option>';
                        sizes.forEach(s => ttSize.innerHTML += `<option value="${s}">${s}</option>`);
                    }
                    if (groupSize) groupSize.classList.remove('hidden');
                    if (printCard) printCard.classList.add('hidden');
                    setStep(3);
                }
            } catch (err) {
                if (typeof showToast === 'function') showToast('Erreur de recherche', 'error');
            }
        });
    }

    if (ttSize) {
        ttSize.addEventListener('change', async (e) => {
            const size = e.target.value;
            if (!size) return;
            try {
                const article = await getArticleWithFallback(currentRef, ttColor.value, size);

                if (article) {
                    currentBarcode = article.gencod;
                    currentCollection = article.collection;
                    renderBarcode(currentBarcode, currentRef, currentCollection);
                    // Show print card, hide placeholder
                    const placeholder = document.getElementById('barcode-placeholder');
                    if (placeholder) placeholder.style.display = 'none';
                    if (printCard) {
                        printCard.classList.remove('hidden');
                        printCard.style.display = 'flex';
                    }
                    if (typeof showToast === 'function') showToast(`Code-barres trouvé (${currentCollection})`, 'success');
                } else {
                    if (typeof showToast === 'function') showToast('Article introuvable', 'error');
                }
            } catch (err) {
                if (typeof showToast === 'function') showToast('Erreur de recherche', 'error');
            }
        });
    }

    function renderBarcode(code, ref, collection) {
        const opts = {
            width: 2.5,
            height: 85,
            displayValue: true,
            fontSize: 13,
            fontOptions: 'bold',
            margin: 0,
            marginTop: 0,
            marginBottom: 0,
            marginLeft: 3,
            marginRight: 3,
            background: 'transparent',
            lineColor: '#000000',
            textAlign: 'center',
            textPosition: 'bottom',
            textMargin: 6
        };
        try {
            JsBarcode('#barcode-svg', code, { ...opts, format: 'EAN13' });
        } catch (e) {
            JsBarcode('#barcode-svg', code, { ...opts, format: 'CODE128' });
        }
        const refDisplay = document.getElementById('barcode-ref-display');
        if (refDisplay) refDisplay.textContent = `${ref} — ${ttColor.value} — ${ttSize.value}`;
        const collEl = document.getElementById('barcode-collection-display');
        if (collEl) collEl.innerHTML = `<span class="barcode-collection-tag">Collection ${collection}</span>`;
    }

    // ============================================================
    // PRINT FUNCTION
    // ============================================================
    const btnPrint = document.getElementById('btn-print');
    if (btnPrint) {
        btnPrint.addEventListener('click', () => {
            if (!currentBarcode) return;
            const qtyInput = document.getElementById('tt-quantity');
            const qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;
            const printZone = document.getElementById('print-zone');
            if (!printZone) return;
            printZone.innerHTML = '';

            for (let i = 0; i < qty; i++) {
                const label = document.createElement('div');
                label.className = 'print-label';
                const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                svg.id = `print-barcode-${i}`;
                label.appendChild(svg);
                const ref = document.createElement('div');
                ref.className = 'print-ref';
                ref.textContent = `${currentRef} | ${ttColor.value} | ${ttSize.value}`;
                label.appendChild(ref);
                printZone.appendChild(label);
            }

            // Render barcodes in print zone
            for (let i = 0; i < qty; i++) {
                try {
                    JsBarcode(`#print-barcode-${i}`, currentBarcode, {
                        format: 'EAN13', width: 2, height: 60,
                        displayValue: true, fontSize: 12, margin: 6,
                        background: '#ffffff', lineColor: '#000000'
                    });
                } catch(e) {
                    JsBarcode(`#print-barcode-${i}`, currentBarcode, {
                        format: 'CODE128', width: 2, height: 60,
                        displayValue: true, fontSize: 12, margin: 6,
                        background: '#ffffff', lineColor: '#000000'
                    });
                }
            }

            window.print();
        });
    }

    // ============================================================
    // QUANTITY +/- BUTTONS
    // ============================================================
    const btnQtyMinus = document.getElementById('btn-qty-minus');
    const btnQtyPlus = document.getElementById('btn-qty-plus');
    const qtyInput = document.getElementById('tt-quantity');

    if (btnQtyMinus && qtyInput) {
        btnQtyMinus.addEventListener('click', () => {
            const val = parseInt(qtyInput.value) || 1;
            if (val > 1) qtyInput.value = val - 1;
        });
    }
    if (btnQtyPlus && qtyInput) {
        btnQtyPlus.addEventListener('click', () => {
            const val = parseInt(qtyInput.value) || 1;
            if (val < 100) qtyInput.value = val + 1;
        });
    }

    // ============================================================
    // REMOTE PRINT → SUPABASE print_queue INSERT
    // ============================================================
    const btnRemotePrint = document.getElementById('btn-remote-print');
    if (btnRemotePrint) {
        btnRemotePrint.addEventListener('click', async () => {
            if (!currentBarcode) return;
            const qty = parseInt(qtyInput ? qtyInput.value : 1) || 1;
            const details = `${currentRef} - ${ttColor.value} - ${ttSize.value}`;

            // Visual feedback: loading state
            btnRemotePrint.disabled = true;
            btnRemotePrint.innerHTML = '<i data-lucide="loader" class="w-5 h-5 animate-spin"></i> ENVOI EN COURS...';
            if (window.lucide) lucide.createIcons();

            try {
                // INSERT into print_queue
                const res = await fetch(`${SUPABASE_URL}/rest/v1/print_queue`, {
                    method: 'POST',
                    headers: {
                        'apikey': SUPABASE_KEY,
                        'Authorization': `Bearer ${SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        barcode: currentBarcode,
                        details: details,
                        quantity: qty,
                        status: 'pending'
                    })
                });

                if (!res.ok) throw new Error(`Supabase error: ${res.status}`);

                // Perform GET confirmation to check queue status
                try {
                    const confirmRes = await fetch(`${GAS_PRINT_URL}?action=status`);
                    if (!confirmRes.ok) throw new Error("Le serveur n'a pas renvoyé un statut valide.");
                    const confirmData = await confirmRes.json();
                    if (confirmData.status !== 'success') {
                        throw new Error("L'action n'a pas été confirmée par le serveur.");
                    }
                } catch (confirmErr) {
                    console.warn("GAS confirmation error (non-blocking for print queue insert):", confirmErr);
                }

                if (typeof showToast === 'function') showToast(`⚡ Ordre envoyé à la station ! (${qty} étiquette${qty > 1 ? 's' : ''})`, 'success');
            } catch (err) {
                console.error('Remote print error:', err);
                if (typeof showToast === 'function') showToast('Erreur d\'envoi — vérifiez votre connexion', 'error');
            } finally {
                btnRemotePrint.disabled = false;
                btnRemotePrint.innerHTML = '<i data-lucide="send" class="w-5 h-5"></i> LANCER L\'IMPRESSION À DISTANCE';
                if (window.lucide) lucide.createIcons();
            }
        });
    }

    // ============================================================
    // COPY TO CLIPBOARD
    // ============================================================
    const btnCopyBarcode = document.getElementById('btn-copy-barcode');
    if (btnCopyBarcode) {
        btnCopyBarcode.addEventListener('click', () => {
            if (!currentBarcode) return;
            
            // Convert to string in case it's a number
            const textToCopy = String(currentBarcode);
            
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(textToCopy).then(() => {
                    if (typeof showToast === 'function') showToast('Code-barres copié !', 'success');
                }).catch(err => {
                    console.error('Clipboard error:', err);
                    fallbackCopyTextToClipboard(textToCopy);
                });
            } else {
                fallbackCopyTextToClipboard(textToCopy);
            }
        });
    }

    function fallbackCopyTextToClipboard(text) {
        const textArea = document.createElement("textarea");
        textArea.value = text;
        textArea.style.position = "fixed"; 
        document.body.appendChild(textArea);
        textArea.focus();
        textArea.select();
        try {
            document.execCommand('copy');
            if (typeof showToast === 'function') showToast('Code-barres copié !', 'success');
        } catch (err) {
            if (typeof showToast === 'function') showToast('Erreur lors de la copie', 'error');
        }
        document.body.removeChild(textArea);
    }
});
