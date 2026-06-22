// UI Utilities & Initialization Guard
window.__lucideInitialized = window.__lucideInitialized || false;
window.initLucide = function() {
    if (!window.__lucideInitialized && window.lucide) {
        window.lucide.createIcons();
        window.__lucideInitialized = true;
    }
};

function escapeHtml(str) {
    const div = document.createElement('div');
    div.textContent = str;
    return div.innerHTML;
}

// Update Clock
window.updateClock = function() {
    const now = new Date();
    const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
    const secStr = now.getSeconds().toString().padStart(2, '0');
    const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
    const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

    // Desktop clock
    const timeElement = document.getElementById('current-time');
    const secondsElement = document.getElementById('current-seconds');
    const dateElement = document.getElementById('current-date');
    const clockContainer = document.getElementById('clock-container');
    
    if (timeElement) timeElement.textContent = timeStr;
    if (secondsElement) secondsElement.textContent = secStr;
    if (dateElement) dateElement.textContent = formattedDate;

    // Day-based coloring
    const dayIndex = now.getDay(); // 0 (Sun) to 6 (Sat)
    const dayColor = `var(--day-${dayIndex})`;
    
    if (clockContainer) clockContainer.style.borderColor = dayColor;
    if (secondsElement) secondsElement.style.color = dayColor;
    if (dateElement) dateElement.style.color = dayColor;
};

// Toast Notification
window.showToast = function(message, type = 'info', persistent = false) {
    const toast = document.createElement('div');
    toast.className = 'toast';
    toast.setAttribute('role', 'alert');
    let icon = 'info';
    let color = 'text-blue-400';
    if (type === 'success') { icon = 'check-circle'; color = 'text-green-400'; }
    if (type === 'error') { icon = 'alert-circle'; color = 'text-red-400'; }
    if (type === 'cloud') { icon = 'cloud-check'; color = 'text-indigo-400'; }
    toast.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5 ${color} shrink-0"></i><span class="text-sm font-medium flex-1">${message}</span>`;
    
    const container = document.getElementById('toast-container');
    if (container) {
        container.appendChild(toast);
        window.initLucide();
    }
    if (!persistent) {
        setTimeout(() => {
            toast.style.transform = 'translateX(100%)';
            toast.style.opacity = '0';
            toast.style.transition = 'all 0.3s ease';
            setTimeout(() => toast.remove(), 300);
        }, 3000);
    }
    return toast;
};

// Render List
window.renderList = function() {
    const inventoryList = document.getElementById('inventory-list');
    const emptyState = document.getElementById('empty-state');
    const itemCountSpan = document.getElementById('item-count');
    const statValidated = document.getElementById('stat-validated');
    const statPending = document.getElementById('stat-pending');

    if (!inventoryList) return;

    if (window.inventory.length === 0) {
        inventoryList.innerHTML = '';
        if (emptyState) inventoryList.appendChild(emptyState);
    } else {
        if (emptyState) emptyState.remove();
        inventoryList.innerHTML = window.inventory.map((item, index) => {
            let statusClass = 'status-pending';
            
            if (item.status === 'Validé (Cloud)') {
                statusClass = 'status-cloud';
            } else if (item.status === 'Validé') {
                statusClass = 'status-validated';
            } else if (item.status === 'Supprimé (Cloud)') {
                statusClass = 'status-deleted';
            }

            const rowClass = item.status === 'Supprimé (Cloud)' 
                ? 'row-deleted animate-entrance group hover:bg-white/[0.03] transition-all border-b border-white/[0.03]' 
                : 'animate-entrance group hover:bg-white/[0.03] transition-all border-b border-white/[0.03]';

            // Barcode dynamic styling
            const barcodeStr = String(item.barcode || '').trim();
            const barcodeColor = barcodeStr.length === 13 ? 'text-white' : 'text-red-500 font-black';
            
            // Icon selection
            let statusIcon = 'hourglass'; 
            if (item.status === 'Validé (Cloud)') statusIcon = 'cloud-check';
            if (item.status === 'Supprimé (Cloud)') statusIcon = 'cloud-off';
            if (item.status === 'Validé') statusIcon = 'check-circle';

            return `
                <tr class="${rowClass}" style="animation-delay: ${index * 40}ms">
                    <td class="px-8 py-5">
                        <div class="flex flex-col">
                            <span class="font-bold text-white tracking-tight">${escapeHtml(item.emplacement)}</span>
                            <span class="text-[9px] text-slate-600 font-bold uppercase tracking-widest mt-0.5">${item.timestamp}</span>
                        </div>
                    </td>
                    <td class="px-8 py-5">
                        <span class="font-mono ${barcodeColor} tracking-widest text-sm transition-colors">${escapeHtml(item.barcode)}</span>
                    </td>
                    <td class="px-8 py-5">
                        <span class="status-pill ${statusClass}">
                            <i data-lucide="${statusIcon}" class="w-3 h-3"></i>
                            ${item.status}
                        </span>
                    </td>
                    <td class="px-8 py-5 text-right flex justify-end gap-2">
                        <button id="btn-edit-${item.id}" onclick="window.editItem(${item.id})" class="text-slate-700 hover:text-cyan-400 p-2 transition-all hover:scale-110 active:scale-90" aria-label="Modifier l'article">
                            <i data-lucide="pencil" class="w-5 h-5"></i>
                        </button>
                        <button id="btn-delete-${item.id}" onclick="window.deleteItem(${item.id})" class="text-slate-700 hover:text-red-400 p-2 transition-all hover:scale-110 active:scale-90" aria-label="Supprimer l'article">
                            <i data-lucide="trash-2" class="w-5 h-5"></i>
                        </button>
                    </td>
                </tr>
            `;
        }).join('');
        window.initLucide();
    }

    if (itemCountSpan) itemCountSpan.textContent = `${window.inventory.length} article${window.inventory.length > 1 ? 's' : ''}`;
    if (statValidated) statValidated.textContent = window.inventory.filter(i => i.status.includes('Validé')).length;
    if (statPending) statPending.textContent = window.inventory.filter(i => i.status === 'En attente').length;
    
    // Sauvegarde auto à chaque changement de l'état
    if (typeof window.saveToLocal === 'function') window.saveToLocal();
};

// Edit Item UI Logic
window.editItem = (id) => {
    window.lastFocusedElement = document.getElementById(`btn-edit-${id}`) || document.activeElement;
    const item = window.inventory.find(i => i.id === id);
    if (!item) return;
    
    const editIdEl = document.getElementById('edit-id');
    const editUuidEl = document.getElementById('edit-uuid');
    const editEmplacementEl = document.getElementById('edit-emplacement');
    const editBarcodeEl = document.getElementById('edit-barcode');
    const editModal = document.getElementById('edit-modal');
    const editModalContent = document.getElementById('edit-modal-content');

    if (editIdEl) editIdEl.value = item.id;
    if (editUuidEl) editUuidEl.value = item.uuid || '';
    if (editEmplacementEl) editEmplacementEl.value = item.emplacement;
    if (editBarcodeEl) editBarcodeEl.value = item.barcode;
    
    if (editModal) {
        editModal.classList.remove('hidden');
        editModal.classList.add('flex');
    }
    setTimeout(() => {
        if (editModalContent) {
            editModalContent.classList.remove('scale-95', 'opacity-0');
            editModalContent.classList.add('scale-100', 'opacity-100');
        }
        if (editEmplacementEl) editEmplacementEl.focus();
    }, 10);
};

window.closeModalEdit = function() {
    const editModal = document.getElementById('edit-modal');
    const editModalContent = document.getElementById('edit-modal-content');

    if (editModalContent) {
        editModalContent.classList.remove('scale-100', 'opacity-100');
        editModalContent.classList.add('scale-95', 'opacity-0');
    }

    setTimeout(() => {
        if (editModal) {
            editModal.classList.add('hidden');
            editModal.classList.remove('flex');
        }
        if (window.lastFocusedElement && typeof window.lastFocusedElement.focus === 'function') {
            window.lastFocusedElement.focus();
        }
    }, 300);
};

window.fallbackCopy = function(text) {
    const srcText = String(text);
    const textArea = document.createElement("textarea");
    textArea.value = srcText;
    document.body.appendChild(textArea);
    textArea.select();
    try {
        document.execCommand('copy');
        if (typeof window.showToast === 'function') window.showToast('Code copié !', 'success');
    } catch {
        if (typeof window.showToast === 'function') window.showToast('Erreur copie', 'error');
    }
    document.body.removeChild(textArea);
};

// Delete Item
window.deleteItem = async (id) => {
    const item = window.inventory.find(i => i.id === id);
    if (!item) return;
    
    // Disable button to prevent double clicks
    const btn = document.getElementById(`btn-delete-${id}`);
    if (btn) {
        btn.disabled = true;
        btn.innerHTML = `<i data-lucide="loader-2" class="w-5 h-5 animate-spin"></i>`;
        window.initLucide();
    }
    
    const gasUrl = window.KostConfig?.GAS_URL || "";
    if (item.status === 'Validé (Cloud)') {
        try {
            const payload = {
                action: 'DELETE',
                data: { uuid: item.uuid }
            };
            
            await fetch(gasUrl, {
                method: 'POST',
                mode: 'no-cors',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            
            // GET status confirmation
            const confirmRes = await fetch(`${gasUrl}?action=status`);
            if (!confirmRes.ok) throw new Error("Statut de confirmation invalide");
            const confirmData = await confirmRes.json();
            if (confirmData.status !== 'success') throw new Error("Action non confirmée par le serveur");
            
            if (typeof window.showToast === 'function') window.showToast('Article supprimé du Cloud.', 'cloud');
        } catch (err) {
            console.error(err);
            if (typeof window.showToast === 'function') window.showToast('Échec de la suppression Cloud.', 'error');
            window.renderList();
            return;
        }
    } else {
        if (typeof window.showToast === 'function') window.showToast('Article supprimé localement.', 'success');
    }
    
    window.inventory = window.inventory.filter(i => i.id !== id);
    window.renderList();
};

// Real Cloud Synchronization (Google Apps Script)
window.envoyerAuCloud = async function() {
    const btnCloud = document.getElementById('btn-cloud');
    // Filter to get only 'En attente' lines as requested
    const itemsToSend = window.inventory.filter(item => item.status === 'En attente');
    
    if (itemsToSend.length === 0) {
        if (typeof window.showToast === 'function') window.showToast('Aucun article "En attente" à envoyer.', 'info');
        return;
    }

    let originalContent = '';
    if (btnCloud) {
        originalContent = btnCloud.innerHTML;
        btnCloud.disabled = true;
        btnCloud.innerHTML = `
            <i data-lucide="loader-2" class="w-6 h-6 animate-spin"></i>
            Envoi en cours...
        `;
        window.initLucide();
    }

    const gasUrl = window.KostConfig?.GAS_URL || "";
    try {
        const payload = {
            action: 'ADD',
            data: itemsToSend.map(item => ({
                emplacement: item.emplacement,
                barcode: item.barcode,
                uuid: item.uuid
            }))
        };

        // Execute fetch with no-cors to bypass security policies in local context
        await fetch(gasUrl, {
            method: 'POST',
            mode: 'no-cors',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });

        // GET status confirmation
        const confirmRes = await fetch(`${gasUrl}?action=status`);
        if (!confirmRes.ok) throw new Error("Statut de confirmation invalide");
        const confirmData = await confirmRes.json();
        if (confirmData.status !== 'success') throw new Error("Action non confirmée par le serveur");

        // Since no-cors gives an opaque response, we assume success if no network error occurred
        itemsToSend.forEach(item => {
            item.status = 'Validé (Cloud)';
        });

        window.renderList();
        if (typeof window.showToast === 'function') window.showToast(`${itemsToSend.length} articles envoyés au Cloud avec succès !`, 'cloud');
    } catch (err) {
        console.error('Cloud Sync Error:', err);
        if (typeof window.showToast === 'function') window.showToast('Échec de la connexion réseau au Cloud.', 'error');
    } finally {
        if (btnCloud) {
            btnCloud.disabled = false;
            btnCloud.innerHTML = originalContent;
            window.initLucide();
        }
    }
};

// Merge Cloud and Local Inventory (preserving local IDs & timestamps)
window.mergeInventory = function(serverItems) {
    const pendingItems = window.inventory.filter(item => item.status === 'En attente');
    const localValidated = window.inventory.filter(item => item.status === 'Validé (Cloud)');
    
    // Map local validated by UUID for fast lookup
    const localMap = new Map();
    localValidated.forEach(item => {
        if (item.uuid) localMap.set(item.uuid, item);
    });
    
    // Merge server items, preserving local id & timestamp if it already exists
    const mergedCloudItems = serverItems.map(serverItem => {
        const existing = localMap.get(serverItem.uuid);
        return {
            id: existing ? existing.id : (Date.now() + Math.random()),
            emplacement: serverItem.emplacement || 'INCONNU',
            barcode: serverItem.barcode || 'INCONNU',
            uuid: serverItem.uuid,
            status: 'Validé (Cloud)',
            timestamp: existing ? existing.timestamp : new Date().toISOString()
        };
    });
    
    // Check if there is any difference to avoid unneeded re-rendering and save local storage
    let hasChanges = false;
    if (localValidated.length !== mergedCloudItems.length) {
        hasChanges = true;
    } else {
        for (let i = 0; i < mergedCloudItems.length; i++) {
            const server = mergedCloudItems[i];
            const local = localMap.get(server.uuid);
            if (!local || local.emplacement !== server.emplacement || local.barcode !== server.barcode) {
                hasChanges = true;
                break;
            }
        }
    }
    
    if (hasChanges) {
        window.inventory = [...mergedCloudItems, ...pendingItems];
        window.inventory.sort((a, b) => new Date(b.timestamp) - new Date(a.timestamp));
        window.renderList();
        return true;
    }
    return false;
};

// Synchroniser avec le Cloud (GET)
window.actualiserCloud = async function() {
    const btnRefresh = document.getElementById('btn-refresh');
    let originalContent = '';
    if (btnRefresh) {
        originalContent = btnRefresh.innerHTML;
        btnRefresh.disabled = true;
        btnRefresh.innerHTML = `<i data-lucide="loader-2" class="w-6 h-6 animate-spin"></i> ACTUALISATION...`;
        window.initLucide();
    }

    const gasUrl = window.KostConfig?.GAS_URL || "";
    try {
        const response = await fetch(gasUrl, {
            method: 'GET',
            redirect: 'follow'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        
        if (data && data.status === 'success' && Array.isArray(data.items)) {
            const changed = window.mergeInventory(data.items);
            if (typeof window.showToast === 'function') {
                if (changed) {
                    window.showToast(`Mise à jour terminée : ${data.items.length} articles synchronisés.`, 'cloud');
                } else {
                    window.showToast(`À jour : aucun changement détecté.`, 'info');
                }
            }
        } else {
            if (typeof window.showToast === 'function') window.showToast('Erreur dans la réponse du serveur.', 'error');
        }
    } catch (err) {
        console.error('Erreur GET:', err);
        if (typeof window.showToast === 'function') {
            window.showToast(`Impossible de récupérer les données du Cloud (${err.message || 'CORS / Hors ligne'}). URL: ${gasUrl}`, 'error');
        }
    } finally {
        if (btnRefresh) {
            btnRefresh.disabled = false;
            btnRefresh.innerHTML = originalContent;
            window.initLucide();
        }
    }
};

// Silent Background Synchronization (READ-ONLY)
// Only checks if the Cloud data has changed. Never sends data.
window.backgroundSync = async function() {
    const gasUrl = window.KostConfig?.GAS_URL || "";
    try {
        const response = await fetch(gasUrl, {
            method: 'GET',
            redirect: 'follow'
        });
        
        if (!response.ok) {
            throw new Error(`HTTP ${response.status} - ${response.statusText}`);
        }
        
        const data = await response.json();
        if (data && data.status === 'success' && Array.isArray(data.items)) {
            window.mergeInventory(data.items);
        }
    } catch (err) {
        console.error(`[BackgroundSync] Erreur : ${err.message || 'CORS / Hors ligne'} | URL : ${gasUrl}`);
    }
};
