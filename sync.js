/**
 * K.O.S.T. - Shared Synchronization UI (V7 Force Sync)
 * Manages the progress bar and status updates across all modules.
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnSyncFull = document.getElementById('btn-sync-database');
    const btnSyncResume = document.getElementById('btn-resume-database');
    const syncProgressContainer = document.getElementById('sync-progress-container');
    const syncBar = document.getElementById('sync-bar');
    const syncCount = document.getElementById('sync-count');
    const syncStatus = document.getElementById('sync-status');
    const syncEta = document.getElementById('sync-eta');
    const dbStatusText = document.getElementById('local-db-status');

    // Helper to show toast if available
    function showNotification(msg, type) {
        if (typeof showToast === 'function') {
            showToast(msg, type);
        } else {
            console.log(`[Sync] ${type.toUpperCase()}: ${msg}`);
        }
    }

    /**
     * Formatting helper for ETA
     */
    function formatTime(seconds) {
        if (seconds < 60) return `${seconds}s`;
        const mins = Math.floor(seconds / 60);
        const secs = seconds % 60;
        return `${mins}m ${secs}s`;
    }

    const triggerSync = async (isResume = false) => {
        // Disable buttons
        [btnSyncFull, btnSyncResume].forEach(btn => {
            if (btn) {
                btn.disabled = true;
                btn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });

        if (syncProgressContainer) syncProgressContainer.classList.remove('hidden');
        if (syncStatus) {
            syncStatus.textContent = isResume ? "Reprise..." : "Synchronisation...";
            syncStatus.classList.remove('text-red-500');
        }

        try {
            await syncCatalogue((current, total, eta) => {
                const percent = (current / total) * 100;
                if (syncBar) syncBar.style.width = `${percent}%`;
                if (syncCount) syncCount.textContent = `${current.toLocaleString()} / ${total.toLocaleString()}`;
                if (syncEta) {
                    syncEta.textContent = eta > 0 ? `Restant : ~${formatTime(eta)}` : 'Calcul...';
                    syncEta.classList.remove('hidden');
                }
            }, isResume);

            showNotification("Base de données à jour !", "success");
            updateDbStatusUI();

            // Hide progress after success
            setTimeout(() => {
                if (syncProgressContainer) syncProgressContainer.classList.add('hidden');
            }, 5000);

        } catch (err) {
            console.error("[Sync UI] Failed:", err);
            showNotification(err.message || "Échec de la synchronisation", "error");
            if (syncStatus) {
                syncStatus.textContent = "Échec : " + (err.message || "Erreur");
                syncStatus.classList.add('text-red-500');
            }
        } finally {
            // Re-enable buttons
            [btnSyncFull, btnSyncResume].forEach(btn => {
                if (btn) {
                    btn.disabled = false;
                    btn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            });
        }
    };

    function updateDbStatusUI() {
        if (!dbStatusText) return;
        const count = localStorage.getItem('kost_articles_count') || 0;
        
        if (count > 0) {
            dbStatusText.textContent = `${parseInt(count).toLocaleString()} articles`;
            dbStatusText.className = "text-green-400 font-bold";
        } else {
            dbStatusText.textContent = "Vide / À synchroniser";
            dbStatusText.className = "text-slate-500";
        }
    }

    // Attach events
    if (btnSyncFull) btnSyncFull.addEventListener('click', () => triggerSync(false));
    if (btnSyncResume) btnSyncResume.addEventListener('click', () => triggerSync(true));

    // Initial check
    updateDbStatusUI();
});
