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
            const tr = document.createElement('tr');
            tr.className = 'border-b border-white/5 hover:bg-white/[0.02] transition-colors';

            // Status Badge Classes
            let statusClass = 'bg-slate-800 text-slate-400 border border-slate-700';
            let statusText = job.status.toUpperCase();
            if (job.status === 'pending') {
                statusClass = 'bg-amber-500/10 text-amber-400 border border-amber-500/20';
                statusText = 'EN ATTENTE';
            } else if (job.status === 'printing') {
                statusClass = 'bg-blue-500/10 text-blue-400 border border-blue-500/20';
                statusText = 'EN COURS';
            } else if (job.status === 'done') {
                statusClass = 'bg-green-500/10 text-green-400 border border-green-500/20';
                statusText = 'TERMINÉ';
            }

            tr.innerHTML = `
                <td class="px-6 py-4 text-sm font-medium text-slate-400 font-mono">${formatDate(job.created_at)}</td>
                <td class="px-6 py-4 text-sm font-bold text-white tracking-wider font-mono">${job.reference || 'N/A'}</td>
                <td class="px-6 py-4 text-sm font-medium text-slate-400 font-mono">${job.old_price} DA</td>
                <td class="px-6 py-4 text-sm font-bold text-[#22C55E] font-mono">${job.new_price} DA</td>
                <td class="px-6 py-4 text-sm font-extrabold text-rose-500 font-mono">${job.discount || '-'}</td>
                <td class="px-6 py-4 text-sm font-medium text-slate-300 font-mono">${job.quantity}</td>
                <td class="px-6 py-4 text-xs font-semibold">
                    <span class="px-2.5 py-1 rounded-full uppercase tracking-widest text-[9px] font-bold ${statusClass}">
                        ${statusText}
                    </span>
                </td>
                <td class="px-6 py-4 text-right space-x-2">
                    <button class="btn-reprint p-1.5 rounded bg-purple-500/10 border border-purple-500/20 text-purple-400 hover:text-white hover:bg-purple-500/20 transition-all cursor-pointer active:scale-95 inline-flex items-center justify-center" data-id="${job.id}" title="Ré-imprimer" aria-label="Ré-imprimer le ticket promo">
                        <i data-lucide="printer" class="w-4 h-4"></i>
                    </button>
                    <button class="btn-delete p-1.5 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:text-white hover:bg-rose-500/20 transition-all cursor-pointer active:scale-95 inline-flex items-center justify-center" data-id="${job.id}" title="Supprimer" aria-label="Supprimer l'ordre d'impression">
                        <i data-lucide="trash-2" class="w-4 h-4"></i>
                    </button>
                </td>
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
            filterButtons.forEach(b => b.classList.remove('active', 'bg-white/10', 'text-white'));
            filterButtons.forEach(b => b.classList.add('text-slate-400'));
            btn.classList.add('active', 'bg-white/10', 'text-white');
            btn.classList.remove('text-slate-400');
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
