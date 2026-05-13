/**
 * K.O.S.T. - Shared Synchronization UI
 * Manages the progress bar and status updates across all modules.
 */

document.addEventListener('DOMContentLoaded', () => {
    const btnSyncMain = document.getElementById('btn-sync-database');
    const btnSyncDrawer = document.getElementById('btn-sync-database-drawer');
    const syncProgressContainer = document.getElementById('sync-progress-container');
    const syncBar = document.getElementById('sync-bar');
    const syncCount = document.getElementById('sync-count');
    const syncStatus = document.getElementById('sync-status');
    const dbStatusText = document.getElementById('local-db-status');

    // Helper to show toast if available
    function showNotification(msg, type) {
        if (typeof showToast === 'function') {
            showToast(msg, type);
        } else {
            console.log(`[Sync] ${type.toUpperCase()}: ${msg}`);
        }
    }

    const triggerSync = async () => {
        // Disable buttons
        [btnSyncMain, btnSyncDrawer].forEach(btn => {
            if (btn) {
                btn.disabled = true;
                btn.classList.add('opacity-50', 'cursor-not-allowed');
            }
        });

        if (syncProgressContainer) syncProgressContainer.classList.remove('hidden');
        if (syncStatus) {
            syncStatus.textContent = "Sychronisation...";
            syncStatus.classList.remove('text-red-500');
        }

        try {
            await syncCatalogue((current, total) => {
                const percent = (current / total) * 100;
                if (syncBar) syncBar.style.width = `${percent}%`;
                if (syncCount) syncCount.textContent = `${current.toLocaleString()} / ${total.toLocaleString()}`;
            });

            showNotification("Base de données à jour !", "success");
            updateDbStatusUI();

            // Hide progress after success
            setTimeout(() => {
                if (syncProgressContainer) syncProgressContainer.classList.add('hidden');
            }, 3000);

        } catch (err) {
            console.error("[Sync UI] Failed:", err);
            showNotification(err.message || "Échec de la synchronisation", "error");
            if (syncStatus) {
                syncStatus.textContent = err.message || "Échec Sync";
                syncStatus.classList.add('text-red-500');
            }
        } finally {
            // Re-enable buttons
            [btnSyncMain, btnSyncDrawer].forEach(btn => {
                if (btn) {
                    btn.disabled = false;
                    btn.classList.remove('opacity-50', 'cursor-not-allowed');
                }
            });
        }
    };

    function updateDbStatusUI() {
        if (!dbStatusText) return;
        const count = localStorage.getItem('kost_articles_count');
        const lastSync = localStorage.getItem('kost_last_sync');
        
        if (count && count > 0) {
            dbStatusText.textContent = `${parseInt(count).toLocaleString()} articles`;
            dbStatusText.classList.replace('text-slate-400', 'text-green-400');
        } else {
            dbStatusText.textContent = "Vide";
            dbStatusText.classList.replace('text-green-400', 'text-slate-400');
        }
    }

    // Attach events
    if (btnSyncMain) btnSyncMain.addEventListener('click', triggerSync);
    if (btnSyncDrawer) btnSyncDrawer.addEventListener('click', triggerSync);

    // Initial check
    updateDbStatusUI();
});
