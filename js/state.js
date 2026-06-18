// State Management
window.inventory = window.inventory || [];

// Supabase Helper
window.supabaseFetch = async function(table, select = '*', filters = {}, options = {}) {
    const supabaseUrl = window.KostConfig?.SUPABASE_URL || window.SUPABASE_URL || "";
    const supabaseKey = window.KostConfig?.SUPABASE_KEY || window.SUPABASE_KEY || "";
    let url = `${supabaseUrl}/rest/v1/${table}?select=${select}`;
    Object.entries(filters).forEach(([key, val]) => {
        url += `&${key}=eq.${encodeURIComponent(val)}`;
    });
    
    if (options.order) {
        url += `&order=${options.order}`;
    }
    if (options.limit) {
        url += `&limit=${options.limit}`;
    }
    
    const response = await fetch(url, {
        method: 'GET',
        headers: {
            'apikey': supabaseKey,
            'Authorization': `Bearer ${supabaseKey}`,
            'Content-Type': 'application/json'
        }
    });
    
    if (!response.ok) throw new Error('Erreur réseau Supabase');
    return await response.json();
};

// Persistence Logic
window.saveToLocal = function() {
    localStorage.setItem('kost_backup', JSON.stringify(window.inventory));
};

window.loadFromLocal = function() {
    const backup = localStorage.getItem('kost_backup');
    if (backup) {
        try {
            window.inventory = JSON.parse(backup);
            if (typeof window.renderList === 'function') window.renderList();
            if (typeof window.showToast === 'function') window.showToast('Données locales restaurées.', 'success');
        } catch (e) {
            console.error('Erreur LocalStorage:', e);
        }
    }
};

window.clearCache = function() {
    // eslint-disable-next-line no-alert
    if (confirm('Voulez-vous vraiment vider le cache local ? Cela supprimera tous les scans non synchronisés.')) {
        localStorage.removeItem('kost_backup');
        window.inventory = [];
        if (typeof window.renderList === 'function') window.renderList();
        if (typeof window.showToast === 'function') window.showToast('Cache vidé.', 'error');
    }
};
