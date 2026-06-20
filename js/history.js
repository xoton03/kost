/**
 * K.O.S.T. — Labeling History Logic
 * Direct integration with Supabase print_queue_tickets.
 */

document.addEventListener('DOMContentLoaded', () => {
    // Config fallback
    const config = window.KostConfig || {};
    const SUPABASE_URL = config.SUPABASE_URL || "";
    const SUPABASE_KEY = config.SUPABASE_KEY || "";

    // State
    let jobsList = [];
    let filteredJobs = [];

    // Elements
    const tableBody = document.getElementById('history-table-body');
    const loadingState = document.getElementById('history-loading');
    const emptyState = document.getElementById('history-empty');
    const filterButtons = document.querySelectorAll('.filter-btn');
    const searchInput = document.getElementById('history-search');
    const btnRefresh = document.getElementById('btn-refresh-history');
    const configWarning = document.getElementById('config-warning');

    // Check config
    if (!SUPABASE_URL || !SUPABASE_KEY) {
        if (configWarning) configWarning.classList.remove('hidden');
        if (loadingState) loadingState.classList.add('hidden');
        showToast("CONFIGURATION SUPABASE MANQUANTE", "error");
        return;
    }

    // Helper: Show Toast
    function showToast(message, type = 'info') {
        if (window.showToast) {
            window.showToast(message, type);
            return;
        }
        
        const toast = document.createElement('div');
        toast.className = 'toast';
        toast.setAttribute('role', 'alert');
        let icon = 'info';
        let color = 'text-blue-400';
        if (type === 'success') { icon = 'check-circle'; color = 'text-green-400'; }
        if (type === 'error') { icon = 'alert-circle'; color = 'text-red-400'; }
        if (type === 'cloud') { icon = 'cloud-check'; color = 'text-indigo-400'; }
        toast.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5 ${color}"></i><span class="text-sm font-medium">${message}</span>`;
        
        const container = document.getElementById('toast-container');
        if (container) {
            container.appendChild(toast);
            if (window.initLucide) window.initLucide();
        }
        setTimeout(() => {
            toast.classList.add('show');
        }, 10);
        setTimeout(() => {
            toast.classList.remove('show');
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }

    // Format Date
    function formatDate(dateStr) {
        try {
            const date = new Date(dateStr);
            const pad = (n) => n.toString().padStart(2, '0');
            return `${pad(date.getDate())}/${pad(date.getMonth() + 1)}/${date.getFullYear()} ${pad(date.getHours())}:${pad(date.getMinutes())}`;
        } catch (e) {
            return dateStr;
        }
    }

    // Fetch Jobs
    async function fetchJobs() {
        if (loadingState) loadingState.classList.remove('hidden');
        if (emptyState) emptyState.classList.add('hidden');
        if (tableBody) tableBody.innerHTML = '';

        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/print_queue_tickets?order=created_at.desc`, {
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            if (!res.ok) {
                throw new Error(`Erreur HTTP ${res.status}`);
            }

            jobsList = await res.json();
            applyFilters();
        } catch (err) {
            console.error('Error fetching history:', err);
            showToast(`ERREUR CHARGEMENT HISTORIQUE: ${err.message}`, 'error');
            if (emptyState) {
                emptyState.querySelector('span').textContent = "Erreur de chargement";
                emptyState.classList.remove('hidden');
            }
        } finally {
            if (loadingState) loadingState.classList.add('hidden');
        }
    }

    // Apply Filters & Search
    function applyFilters() {
        const activeBtn = document.querySelector('.filter-btn.active');
        const filterStatus = activeBtn ? activeBtn.getAttribute('data-status') : 'all';
        const searchQuery = searchInput ? searchInput.value.trim().toUpperCase() : '';

        filteredJobs = jobsList.filter(job => {
            const matchesStatus = filterStatus === 'all' || job.status === filterStatus;
            const matchesSearch = !searchQuery || 
                (job.reference && job.reference.toUpperCase().includes(searchQuery));
            return matchesStatus && matchesSearch;
        });

        renderJobs();
    }

    // Render Jobs Table
    function renderJobs() {
        if (!tableBody) return;
        tableBody.innerHTML = '';

        if (filteredJobs.length === 0) {
            if (emptyState) {
                emptyState.querySelector('span').textContent = "Aucun historique trouvé";
                emptyState.classList.remove('hidden');
            }
            return;
        }

        if (emptyState) emptyState.classList.add('hidden');

        filteredJobs.forEach(job => {
            const tr = document.createElement('div');
            tr.className = 'flex items-center px-4 py-3 border-b border-white/5 hover:bg-white/[0.02] transition-colors font-body-main text-body-main';

            // Status Badge Classes
            let statusClass = 'border border-white/10 text-slate-500';
            let statusText = job.status.toUpperCase();
            if (job.status === 'pending') {
                statusClass = 'border border-amber-500/30 text-amber-400 bg-amber-500/10';
                statusText = 'EN ATTENTE';
            } else if (job.status === 'printing') {
                statusClass = 'border border-accent text-accent bg-accent-alpha';
                statusText = 'EN COURS';
            } else if (job.status === 'done') {
                statusClass = 'border border-green-500/30 text-green-400 bg-green-500/10';
                statusText = 'TERMINÉ';
            }

            tr.innerHTML = `
                <div class="w-[15%] font-mono text-xs text-slate-400">${formatDate(job.created_at)}</div>
                <div class="w-[18%] font-mono text-sm font-bold text-orange-500 tracking-wider">${job.reference || 'N/A'}</div>
                <div class="w-[11%] text-right font-mono text-xs text-slate-500 line-through">${job.old_price} DA</div>
                <div class="w-[11%] text-right font-mono text-sm font-bold text-green-400">${job.new_price} DA</div>
                <div class="w-[9%] text-right font-mono text-xs font-extrabold text-rose-500">${job.discount || '-'}</div>
                <div class="w-[9%] text-right font-mono text-sm text-slate-300">${job.quantity}</div>
                <div class="w-[14%] flex justify-center">
                    <span class="px-2.5 py-0.5 rounded-none uppercase tracking-widest text-[9px] font-bold ${statusClass}">
                        ${statusText}
                    </span>
                </div>
                <div class="w-[13%] flex justify-end gap-2">
                    <button class="btn-reprint border border-purple-500/30 text-purple-400 hover:bg-purple-500/20 hover:text-white font-mono text-[9px] px-2.5 py-1 transition-colors active:scale-95 flex items-center justify-center gap-1 cursor-pointer" data-id="${job.id}" title="Ré-imprimer" aria-label="Ré-imprimer le ticket promo">
                        <i data-lucide="printer" class="w-3.5 h-3.5"></i>
                        REPRINT
                    </button>
                    <button class="btn-delete border border-white/10 text-slate-500 hover:border-red-500 hover:text-red-400 p-1.5 flex items-center justify-center transition-colors active:scale-95 cursor-pointer" data-id="${job.id}" title="Supprimer" aria-label="Supprimer l'ordre d'impression">
                        <i data-lucide="trash-2" class="w-3.5 h-3.5"></i>
                    </button>
                </div>
            `;

            tableBody.appendChild(tr);
        });

        // Initialize Lucide Icons
        if (window.initLucide) window.initLucide();

        // Bind Action Buttons
        tableBody.querySelectorAll('.btn-reprint').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = parseInt(btn.getAttribute('data-id'));
                const job = jobsList.find(j => j.id === id);
                if (job) reprintJob(job);
            });
        });

        tableBody.querySelectorAll('.btn-delete').forEach(btn => {
            btn.addEventListener('click', async (e) => {
                const id = parseInt(btn.getAttribute('data-id'));
                deleteJob(id);
            });
        });
    }

    // Reprint Job
    async function reprintJob(job) {
        showToast("RÉ-ENVOI EN COURS...", "info");
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/print_queue_tickets?id=eq.${job.id}`, {
                method: 'PATCH',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`,
                    'Content-Type': 'application/json',
                    'Prefer': 'return=minimal'
                },
                body: JSON.stringify({
                    status: 'pending'
                })
            });

            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

            showToast("TICKET ENVOYÉ À LA QUEUE !", "success");
            // Update local state status
            job.status = 'pending';
            applyFilters();
        } catch (err) {
            console.error('Error reprinting job:', err);
            showToast("ERREUR DE RÉ-IMPRESSION", "error");
        }
    }

    // Delete Job
    async function deleteJob(id) {
        if (!confirm("Voulez-vous vraiment supprimer cet ordre d'impression ?")) return;

        showToast("SUPPRESSION EN COURS...", "info");
        try {
            const res = await fetch(`${SUPABASE_URL}/rest/v1/print_queue_tickets?id=eq.${id}`, {
                method: 'DELETE',
                headers: {
                    'apikey': SUPABASE_KEY,
                    'Authorization': `Bearer ${SUPABASE_KEY}`
                }
            });

            if (!res.ok) throw new Error(`HTTP Error ${res.status}`);

            showToast("ORDRE SUPPRIMÉ", "success");
            // Update local state
            jobsList = jobsList.filter(j => j.id !== id);
            applyFilters();
        } catch (err) {
            console.error('Error deleting job:', err);
            showToast("ERREUR DE SUPPRESSION", "error");
        }
    }

    // Filter Buttons events
    filterButtons.forEach(btn => {
        btn.addEventListener('click', () => {
            filterButtons.forEach(b => {
                b.classList.remove('active', 'border-accent', 'bg-accent-alpha', 'text-accent');
                b.classList.add('border-white/10', 'text-slate-400');
            });
            btn.classList.add('active', 'border-accent', 'bg-accent-alpha', 'text-accent');
            btn.classList.remove('border-white/10', 'text-slate-400');
            applyFilters();
        });
    });

    // Search input event
    if (searchInput) {
        searchInput.addEventListener('input', applyFilters);
    }

    // Refresh button event
    if (btnRefresh) {
        btnRefresh.addEventListener('click', fetchJobs);
    }

    // Initial Fetch
    fetchJobs();
});
