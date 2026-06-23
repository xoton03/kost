// K.O.S.T. - Station Module Logic

window.addEventListener('DOMContentLoaded', () => {
    // Dismiss user gesture warning banner on any page interaction
    const gestureWarning = document.getElementById('gesture-warning');
    if (gestureWarning) {
        const dismissWarning = () => {
            gestureWarning.style.opacity = '0';
            setTimeout(() => {
                gestureWarning.style.display = 'none';
            }, 300);
            window.removeEventListener('click', dismissWarning);
            window.removeEventListener('keydown', dismissWarning);
        };
        window.addEventListener('click', dismissWarning);
        window.addEventListener('keydown', dismissWarning);
    }

    // ============================================================
    // CONFIG
    // ============================================================
    const PROD_SUPABASE_URL = "https://jphzmgscxpejcyjlnspq.supabase.co";
    const PROD_SUPABASE_KEY = "sb_publishable_gshF6Y08DYJYO9c8Z_Cv2Q_9nEZr7J9";

    window.SUPABASE_URL = (window.KostConfig && window.KostConfig.SUPABASE_URL) || window.SUPABASE_URL || PROD_SUPABASE_URL;
    window.SUPABASE_KEY = (window.KostConfig && window.KostConfig.SUPABASE_KEY) || window.SUPABASE_KEY || PROD_SUPABASE_KEY;

    /* global supabase */
    const { createClient } = supabase;
    const client = createClient(window.SUPABASE_URL, window.SUPABASE_KEY);

    // ============================================================
    // STATUS UI
    // ============================================================
    function setStatus(state) {
        const badge = document.getElementById('status-badge');
        const dot   = document.getElementById('status-dot');
        const text  = document.getElementById('status-text');
        if (!badge || !text) return;
        
        // Re-apply base Tailwind classes for status badge
        badge.className = "flex items-center gap-2 px-3 py-1 rounded-full border text-[10px] font-bold uppercase tracking-widest transition-all duration-300";
        
        if (dot) {
            dot.className = "w-2 h-2 rounded-full transition-all duration-300";
        }
        
        if (state === 'connected') {
            badge.classList.add('border-emerald-500/30', 'bg-emerald-500/10', 'text-emerald-400');
            if (dot) dot.classList.add('bg-emerald-500', 'animate-pulse');
            text.textContent = 'Connectée';
        } else if (state === 'disconnected') {
            badge.classList.add('border-rose-500/30', 'bg-rose-500/10', 'text-rose-400');
            if (dot) dot.classList.add('bg-rose-500');
            text.textContent = 'Déconnectée';
        } else { // connecting
            badge.classList.add('border-slate-700', 'bg-slate-800/50', 'text-slate-300');
            if (dot) dot.classList.add('bg-slate-500', 'animate-pulse');
            text.textContent = 'Connexion...';
        }
    }

    // ============================================================
    // SUPABASE HELPERS
    // ============================================================
    async function sbFetch(path, method = 'GET', body = null) {
        const opts = {
            method,
            headers: {
                'apikey': window.SUPABASE_KEY,
                'Authorization': `Bearer ${window.SUPABASE_KEY}`,
                'Content-Type': 'application/json'
            }
        };
        if (body) opts.body = JSON.stringify(body);
        const res = await fetch(`${window.SUPABASE_URL}/rest/v1/${path}`, opts);
        if (!res.ok) throw new Error(`Supabase error: ${res.status}`);
        if (method === 'GET') return res.json();
        return res;
    }

    async function markJobDone(id, isTicketTable = false, isFloTable = false) {
        let table = 'print_queue';
        if (isTicketTable) table = 'print_queue_tickets';
        if (isFloTable) table = 'print_queue_flo';
        await sbFetch(`${table}?id=eq.${id}`, 'PATCH', { status: 'done' });
    }

    async function markJobPrinting(id, isTicketTable = false, isFloTable = false) {
        let table = 'print_queue';
        if (isTicketTable) table = 'print_queue_tickets';
        if (isFloTable) table = 'print_queue_flo';
        await sbFetch(`${table}?id=eq.${id}`, 'PATCH', { status: 'printing' });
    }

    // ============================================================
    // PRINT JOB QUEUE (prevents overlap)
    // ============================================================
    let isPrinting = false;
    const localQueue = [];

    async function enqueueJob(job) {
        localQueue.push(job);
        updateQueueUI();
        if (!isPrinting) processNextJob();
    }

    async function processNextJob() {
        if (localQueue.length === 0) { isPrinting = false; updateQueueUI(); return; }
        isPrinting = true;
        const job = localQueue.shift();
        updateQueueUI();
        await executePrintJob(job);
    }

    function updateQueueUI() {
        const list = document.getElementById('queue-list');
        if (!list) return;
        list.innerHTML = '';
        
        if (localQueue.length === 0) {
            list.innerHTML = '<p class="queue-empty text-[10px] text-slate-500 font-bold uppercase text-center py-8">Aucun travail en attente</p>';
            return;
        }
        
        localQueue.forEach((job) => {
            let displayName = job.details;
            if (job.barcode === 'TICKET_PROMO') {
                try {
                    const data = JSON.parse(job.details);
                    displayName = `🏷️ Promo: ${data.reference} (${data.discount})`;
                } catch(e) {}
            } else if (job.barcode === 'TICKET_FLO') {
                try {
                    const data = JSON.parse(job.details);
                    displayName = `🏷️ Flo: ${data.reference} (${data.price})`;
                } catch(e) {}
            } else {
                displayName = `📦 ${job.details || job.barcode}`;
            }
            
            const item = document.createElement('div');
            item.className = 'queue-item';
            
            const timeSpan = document.createElement('span');
            timeSpan.className = 'queue-time';
            const time = job.created_at ? new Date(job.created_at) : new Date();
            timeSpan.textContent = `${String(time.getHours()).padStart(2,'0')}:${String(time.getMinutes()).padStart(2,'0')}`;
            
            const detailsSpan = document.createElement('span');
            detailsSpan.className = 'queue-details';
            detailsSpan.textContent = displayName;
            
            const qtySpan = document.createElement('span');
            qtySpan.className = 'queue-qty';
            qtySpan.textContent = `×${job.quantity}`;
            
            const statusSpan = document.createElement('span');
            statusSpan.className = 'queue-status';
            statusSpan.textContent = 'ATTENTE';
            
            item.appendChild(timeSpan);
            item.appendChild(detailsSpan);
            item.appendChild(qtySpan);
            item.appendChild(statusSpan);
            
            list.appendChild(item);
        });
    }

    // ============================================================
    // PRINT EXECUTION
    // ============================================================
    // Format price helper
    function formatPrice(val) {
        if (val === undefined || val === null || val === '') return '-- DA';
        const clean = String(val).replace(/[\.,\s]/g, '');
        const num = parseFloat(clean);
        if (isNaN(num)) return '-- DA';
        return Math.round(num).toString() + ',00 DA';
    }

    async function executePrintJob(job) {
        // Parse quantity robustly
        const quantity = parseInt(job.quantity, 10) || 1;

        // 1. Claim the job (mark as 'printing') to prevent other stations from taking it
        try {
            await markJobPrinting(job.id, job.isTicketTable, job.isFloTable);
        } catch(e) {
            console.warn('Could not claim job', job.id, e);
            // If we can't mark it, still try to print (best effort)
        }

        // Detect if promo job or flo job
        let isPromo = false;
        let promoData = null;
        let isFlo = false;
        let floData = null;
        if (job.barcode === 'TICKET_PROMO') {
            isPromo = true;
            try {
                promoData = JSON.parse(job.details);
            } catch(e) {
                console.error('Failed to parse promo job details:', e);
            }
        } else if (job.barcode === 'TICKET_FLO') {
            isFlo = true;
            try {
                floData = JSON.parse(job.details);
            } catch(e) {
                console.error('Failed to parse flo job details:', e);
            }
        }

        // 2. Show active job UI
        const idleCard = document.getElementById('idle-card');
        if (idleCard) idleCard.style.opacity = '0.3';
        const jobCard = document.getElementById('job-card');
        if (jobCard) jobCard.classList.add('active');
        
        const jobDetailsEl = document.getElementById('job-details');
        const jobQtyEl = document.getElementById('job-qty');
        const jobBarcodeEl = document.getElementById('job-barcode');

        if (isPromo && promoData) {
            if (jobDetailsEl) jobDetailsEl.textContent = `🏷️ Promo: ${promoData.reference} (${promoData.discount})`;
            if (jobQtyEl) jobQtyEl.textContent = `${quantity} étiquette${quantity > 1 ? 's' : ''}`;
            if (jobBarcodeEl) jobBarcodeEl.textContent = `Ancien: ${formatPrice(promoData.old_price)} ➔ Nouveau: ${formatPrice(promoData.new_price)}`;
        } else if (isFlo && floData) {
            if (jobDetailsEl) jobDetailsEl.textContent = `🏷️ Flo: ${floData.reference}`;
            if (jobQtyEl) jobQtyEl.textContent = `${quantity} étiquette${quantity > 1 ? 's' : ''}`;
            if (jobBarcodeEl) jobBarcodeEl.textContent = `Prix: ${floData.price}`;
        } else {
            if (jobDetailsEl) jobDetailsEl.textContent = job.details;
            if (jobQtyEl) jobQtyEl.textContent = `${quantity} étiquette${quantity > 1 ? 's' : ''}`;
            if (jobBarcodeEl) jobBarcodeEl.textContent = `Code-barres : ${job.barcode}`;
        }

        // 3. Build print zone
        const printZone = document.getElementById('print-zone');
        if (printZone) {
            printZone.innerHTML = '';

            for (let i = 0; i < quantity; i++) {
                const label = document.createElement('div');
                
                if (isPromo && promoData) {
                    label.className = 'print-label promo-label';
                    
                    const oldPriceEl = document.createElement('div');
                    oldPriceEl.className = 'promo-old-price';
                    oldPriceEl.textContent = formatPrice(promoData.old_price);
                    
                    const discountEl = document.createElement('div');
                    discountEl.className = 'promo-discount';
                    discountEl.textContent = promoData.discount;
                    
                    const newPriceEl = document.createElement('div');
                    newPriceEl.className = 'promo-new-price';
                    newPriceEl.textContent = formatPrice(promoData.new_price);
                    
                    const refEl = document.createElement('div');
                    refEl.className = 'promo-ref';
                    refEl.textContent = promoData.reference;
                    
                    label.appendChild(oldPriceEl);
                    label.appendChild(discountEl);
                    label.appendChild(newPriceEl);
                    label.appendChild(refEl);
                } else if (isFlo && floData) {
                    label.className = 'print-label flo-label';
                    
                    const priceEl = document.createElement('div');
                    priceEl.className = 'flo-price';
                    priceEl.textContent = floData.price;
                    label.appendChild(priceEl);
                    
                    if (floData.article_name) {
                        const nameEl = document.createElement('div');
                        nameEl.className = 'flo-name';
                        nameEl.textContent = floData.article_name;
                        label.appendChild(nameEl);
                    }
                    
                    const refEl = document.createElement('div');
                    refEl.className = 'flo-ref';
                    refEl.textContent = floData.reference;
                    label.appendChild(refEl);
                } else {
                    label.className = 'print-label';

                    const refDiv = document.createElement('div');
                    refDiv.className = 'print-ref';
                    refDiv.textContent = job.details;
                    label.appendChild(refDiv);

                    const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
                    svg.id = `ps-bc-${i}`;
                    label.appendChild(svg);
                }

                printZone.appendChild(label);
            }
        }

        // 4. Render barcodes (if not promo and not flo)
        if (!isPromo && !isFlo) {
            /* global JsBarcode */
            for (let i = 0; i < quantity; i++) {
                const barcodeOpts = {
                    width: 2, height: 55,
                    displayValue: true, fontSize: 11,
                    margin: 0, marginLeft: 2, marginRight: 2,
                    background: '#ffffff', lineColor: '#000000'
                };
                try {
                    JsBarcode(`#ps-bc-${i}`, job.barcode, { ...barcodeOpts, format: 'EAN13' });
                } catch(e) {
                    JsBarcode(`#ps-bc-${i}`, job.barcode, { ...barcodeOpts, format: 'CODE128' });
                }
            }
        }

        // Wait for DOM layout and rendering to complete before printing
        await new Promise(r => setTimeout(r, 300));

        // 5. Trigger print
        window.print();

        // 6. Mark as done in Supabase (anti-doublon)
        try {
            await markJobDone(job.id, job.isTicketTable, job.isFloTable);
        } catch(e) {
            console.error('Could not mark job done:', e);
        }

        // 7. Add to history
        addToHistory(job);

        // 8. Reset UI after short delay
        await new Promise(r => setTimeout(r, 1500));
        if (jobCard) jobCard.classList.remove('active');
        if (idleCard) idleCard.style.opacity = '1';

        // 9. Process next job
        processNextJob();
    }

    // ============================================================
    // HISTORY
    // ============================================================
    function addToHistory(job) {
        const list = document.getElementById('history-list');
        if (!list) return;
        const empty = list.querySelector('.history-empty');
        if (empty) empty.remove();

        const now = new Date();
        const time = `${String(now.getHours()).padStart(2,'0')}:${String(now.getMinutes()).padStart(2,'0')}`;

        let displayName = job.details;
        if (job.barcode === 'TICKET_PROMO') {
            try {
                const data = JSON.parse(job.details);
                displayName = `🏷️ Promo: ${data.reference} (${data.discount})`;
            } catch(e) {}
        } else if (job.barcode === 'TICKET_FLO') {
            try {
                const data = JSON.parse(job.details);
                displayName = `🏷️ Flo: ${data.reference} (${data.price})`;
            } catch(e) {}
        }

        const item = document.createElement('div');
        item.className = 'history-item flex items-center justify-between gap-2';
        item.innerHTML = `
            <div class="flex items-center gap-2 flex-1 min-w-0">
                <span class="history-time shrink-0">${time}</span>
                <span class="history-details truncate">${displayName}</span>
            </div>
            <div class="flex items-center gap-1.5 shrink-0">
                <span class="history-qty">×${job.quantity}</span>
                <button class="btn-reprint bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white px-2 py-0.5 rounded border border-slate-700 hover:border-slate-500 text-[8px] font-bold uppercase transition-all flex items-center gap-1 cursor-pointer" title="Réimprimer cet article">
                    <i data-lucide="printer" style="width:10px;height:10px;"></i>
                    <span>Imp.</span>
                </button>
                <span class="history-status">✓ OK</span>
            </div>
        `;

        // Click handler to manually reprint the job
        const reprintBtn = item.querySelector('.btn-reprint');
        if (reprintBtn) {
            reprintBtn.addEventListener('click', async (e) => {
                e.stopPropagation();
                await executePrintJob(job);
            });
        }

        list.insertBefore(item, list.firstChild);

        // Render lucide printer icon on the reprint button
        if (window.lucide) {
            window.lucide.createIcons({
                attrs: { class: 'lucide' },
                nameAttr: 'data-lucide'
            });
        }
    }

    let startupChecked = false;
    async function checkPendingJobsOnStartup() {
        if (startupChecked) return;
        startupChecked = true;
        try {
            // 1. Fetch from print_queue (classic)
            const jobs = await sbFetch('print_queue?status=eq.pending&order=created_at.asc');
            if (jobs && jobs.length > 0) {
                console.log(`${jobs.length} job(s) classique(s) en attente trouvé(s) au démarrage.`);
                for (const job of jobs) {
                    enqueueJob(job);
                }
            }

            // 2. Fetch from print_queue_tickets (promo tickets)
            const ticketJobs = await sbFetch('print_queue_tickets?status=eq.pending&order=created_at.asc');
            if (ticketJobs && ticketJobs.length > 0) {
                console.log(`${ticketJobs.length} job(s) ticket promo en attente trouvé(s) au démarrage.`);
                for (const job of ticketJobs) {
                    const mappedJob = {
                        id: job.id,
                        barcode: 'TICKET_PROMO',
                        quantity: job.quantity,
                        status: job.status,
                        isTicketTable: true,
                        details: JSON.stringify({
                            type: 'promo',
                            old_price: job.old_price,
                            new_price: job.new_price,
                            discount: job.discount,
                            reference: job.reference
                        })
                    };
                    enqueueJob(mappedJob);
                }
            }

            // 3. Fetch from print_queue_flo (Flo articles)
            const floJobs = await sbFetch('print_queue_flo?status=eq.pending&order=created_at.asc');
            if (floJobs && floJobs.length > 0) {
                console.log(`${floJobs.length} job(s) Flo en attente trouvé(s) au démarrage.`);
                for (const job of floJobs) {
                    const mappedJob = {
                        id: job.id,
                        barcode: 'TICKET_FLO',
                        quantity: job.quantity,
                        status: job.status,
                        isFloTable: true,
                        details: JSON.stringify({
                            type: 'flo',
                            price: job.price,
                            reference: job.reference,
                            article_name: job.article_name
                        })
                    };
                    enqueueJob(mappedJob);
                }
            }
        } catch(e) {
            console.error('Erreur vérification jobs au démarrage:', e);
            // Reset flag on error to allow retry
            startupChecked = false;
        }
    }

    // ============================================================
    // SUPABASE REALTIME SUBSCRIPTION
    // ============================================================
    const channel = client
        .channel('print-station-v2')
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'print_queue' },
            (payload) => {
                const job = payload.new;
                if (job.status !== 'pending') return;
                console.log('Nouveau job classique reçu via Realtime:', job);
                enqueueJob(job);
            }
        )
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'print_queue_tickets' },
            (payload) => {
                const job = payload.new;
                if (job.status !== 'pending') return;
                console.log('Nouveau job ticket promo reçu via Realtime:', job);
                const mappedJob = {
                    id: job.id,
                    barcode: 'TICKET_PROMO',
                    quantity: job.quantity,
                    status: job.status,
                    isTicketTable: true,
                    details: JSON.stringify({
                        type: 'promo',
                        old_price: job.old_price,
                        new_price: job.new_price,
                        discount: job.discount,
                        reference: job.reference
                    })
                };
                enqueueJob(mappedJob);
            }
        )
        .on(
            'postgres_changes',
            { event: 'INSERT', schema: 'public', table: 'print_queue_flo' },
            (payload) => {
                const job = payload.new;
                if (job.status !== 'pending') return;
                console.log('Nouveau job Flo reçu via Realtime:', job);
                const mappedJob = {
                    id: job.id,
                    barcode: 'TICKET_FLO',
                    quantity: job.quantity,
                    status: job.status,
                    isFloTable: true,
                    details: JSON.stringify({
                        type: 'flo',
                        price: job.price,
                        reference: job.reference,
                        article_name: job.article_name
                    })
                };
                enqueueJob(mappedJob);
            }
        )
        .subscribe((status) => {
            console.log('Realtime status:', status);
            if (status === 'SUBSCRIBED') {
                setStatus('connected');
                // Check for any jobs that arrived while we were offline
                checkPendingJobsOnStartup();
            } else if (status === 'CLOSED' || status === 'CHANNEL_ERROR') {
                setStatus('disconnected');
            } else {
                setStatus('connecting');
            }
        });
});
