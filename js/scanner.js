// Main Search / Scanner Logic
window.performSearch = function() {
    const barcodeInput = document.getElementById('barcode');
    const emplacementInput = document.getElementById('emplacement');
    if (!barcodeInput) return;

    const barcode = barcodeInput.value.trim();
    if (!barcode) return;

    const newItem = {
        id: Date.now(),
        uuid: crypto.randomUUID(),
        barcode: barcode,
        emplacement: emplacementInput ? emplacementInput.value || 'N/A' : 'N/A',
        timestamp: new Date().toLocaleTimeString('fr-FR'),
        status: 'En attente'
    };

    inventory.unshift(newItem);
    if (typeof renderList === 'function') renderList();
    
    barcodeInput.value = '';
    barcodeInput.focus();
};

// Scanner Event Listeners Setup
window.initScanner = function() {
    const barcodeInput = document.getElementById('barcode');
    if (barcodeInput) {
        barcodeInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                e.preventDefault();
                performSearch();
            }
        });
    }
};
