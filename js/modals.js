// Modal State and UI Logic
window.resetModalState = function() {
    const refInput = document.getElementById('modal-ref');
    const colorSelect = document.getElementById('modal-color');
    const sizeSelect = document.getElementById('modal-size');
    const colorGroup = document.getElementById('color-group');
    const sizeGroup = document.getElementById('size-group');
    const searchLoader = document.getElementById('search-loader');
    
    if (refInput) refInput.value = '';
    
    if (colorSelect) {
        colorSelect.innerHTML = '<option value="">Choisir une couleur...</option>';
        colorSelect.value = '';
    }
    if (sizeSelect) {
        sizeSelect.innerHTML = '<option value="">Choisir une taille...</option>';
        sizeSelect.value = '';
    }
    
    if (colorGroup) colorGroup.classList.add('hidden');
    if (sizeGroup) sizeGroup.classList.add('hidden');
    if (searchLoader) searchLoader.classList.add('hidden');
};

window.openModal = function() {
    resetModalState();
    const searchModal = document.getElementById('search-modal');
    const modalContent = document.getElementById('modal-content');

    if (searchModal) {
        searchModal.classList.remove('hidden');
        searchModal.classList.add('flex');
    }
    setTimeout(() => {
        if (modalContent) {
            modalContent.classList.remove('scale-95', 'opacity-0');
            modalContent.classList.add('scale-100', 'opacity-100');
        }
        const refInput = document.getElementById('modal-ref');
        if (refInput) refInput.focus();
    }, 10);
};

window.closeModal = function() {
    const searchModal = document.getElementById('search-modal');
    const modalContent = document.getElementById('modal-content');

    if (modalContent) {
        modalContent.classList.remove('scale-100', 'opacity-100');
        modalContent.classList.add('scale-95', 'opacity-0');
    }
    setTimeout(() => {
        if (searchModal) {
            searchModal.classList.add('hidden');
            searchModal.classList.remove('flex');
        }
        const btnOpenSearch = document.getElementById('btn-open-search');
        if (btnOpenSearch) btnOpenSearch.focus();
    }, 300);
};

// Modal Initialization & Event Listeners
window.initModals = function() {
    const searchModal = document.getElementById('search-modal');
    const btnOpenSearch = document.getElementById('btn-open-search');
    const btnCloseModal = document.getElementById('btn-close-modal');
    const modalSearchForm = document.getElementById('modal-search-form');
    const searchLoader = document.getElementById('search-loader');

    const modalRef = document.getElementById('modal-ref');
    const modalColor = document.getElementById('modal-color');
    const modalSize = document.getElementById('modal-size');
    const colorGroup = document.getElementById('color-group');
    const sizeGroup = document.getElementById('size-group');

    const editModal = document.getElementById('edit-modal');
    const btnCloseEdit = document.getElementById('btn-close-edit');
    const modalEditForm = document.getElementById('modal-edit-form');
    const btnCopyEditBarcode = document.getElementById('btn-copy-edit-barcode');

    // Open/Close Search Modal
    if (btnOpenSearch) btnOpenSearch.addEventListener('click', openModal);
    if (btnCloseModal) btnCloseModal.addEventListener('click', closeModal);
    if (searchModal) {
        searchModal.addEventListener('click', (e) => {
            if (e.target === searchModal) closeModal();
        });
    }

    // Prevent Search Form Submission Reload
    if (modalSearchForm) {
        modalSearchForm.addEventListener('submit', (e) => {
            e.preventDefault();
        });
    }

    // Cascade Funnel Logic (Supabase)
    if (modalRef) {
        modalRef.addEventListener('input', async (e) => {
            let val = e.target.value.trim();
            if (val.length === 5) {
                val = val.toUpperCase();
                e.target.value = val;
                e.target.blur(); // Dismiss keyboard on mobile
                
                if (searchLoader) searchLoader.classList.remove('hidden');
                if (colorGroup) colorGroup.classList.add('hidden');
                if (sizeGroup) sizeGroup.classList.add('hidden');

                try {
                    const uniqueColors = await getColors(val);
                    
                    if (uniqueColors && uniqueColors.length > 0) {
                        modalColor.innerHTML = '<option value="">Choisir une couleur...</option>';
                        uniqueColors.forEach(color => {
                            modalColor.innerHTML += `<option value="${color}">${color}</option>`;
                        });
                        if (colorGroup) colorGroup.classList.remove('hidden');
                    } else {
                        if (typeof showToast === 'function') showToast('Référence introuvable localement', 'error');
                    }
                } catch (err) {
                    console.error(err);
                    if (typeof showToast === 'function') showToast('Erreur recherche locale', 'error');
                } finally {
                    if (searchLoader) searchLoader.classList.add('hidden');
                }
            } else {
                if (colorGroup) colorGroup.classList.add('hidden');
                if (sizeGroup) sizeGroup.classList.add('hidden');
            }
        });
    }

    if (modalColor) {
        modalColor.addEventListener('change', async (e) => {
            const color = e.target.value;
            const ref = modalRef ? modalRef.value : '';
            
            if (!color) {
                if (sizeGroup) sizeGroup.classList.add('hidden');
                return;
            }

            if (searchLoader) searchLoader.classList.remove('hidden');
            if (sizeGroup) sizeGroup.classList.add('hidden');

            try {
                const uniqueSizes = await getSizes(ref, color);
                
                if (uniqueSizes && uniqueSizes.length > 0) {
                    modalSize.innerHTML = '<option value="">Choisir une taille...</option>';
                    uniqueSizes.forEach(size => {
                        modalSize.innerHTML += `<option value="${size}">${size}</option>`;
                    });
                    if (sizeGroup) sizeGroup.classList.remove('hidden');
                }
            } catch (err) {
                console.error(err);
                if (typeof showToast === 'function') showToast('Erreur recherche locale', 'error');
            } finally {
                if (searchLoader) searchLoader.classList.add('hidden');
            }
        });
    }

    if (modalSize) {
        modalSize.addEventListener('change', async (e) => {
            const size = e.target.value;
            const ref = modalRef ? modalRef.value : '';
            const color = modalColor ? modalColor.value : '';

            if (!size) return;

            if (searchLoader) searchLoader.classList.add('hidden');

            try {
                const article = await getArticle(ref, color, size);
                
                if (article) {
                    const barcode = article.gencod;
                    const collection = article.collection;
                    
                    console.log(`Collection identifiée : ${collection}`);
                    const barcodeInput = document.getElementById('barcode');
                    if (barcodeInput) {
                        barcodeInput.value = barcode;
                    }
                    closeModal();
                    if (typeof showToast === 'function') showToast(`Article identifié (${collection}) : ${barcode}`, 'success');
                    
                    // Insertion directe
                    if (typeof performSearch === 'function') performSearch();
                } else {
                    if (typeof showToast === 'function') showToast('Article introuvable', 'error');
                }
            } catch (err) {
                console.error(err);
                if (typeof showToast === 'function') showToast('Erreur recherche locale', 'error');
            } finally {
                if (searchLoader) searchLoader.classList.add('hidden');
            }
        });
    }

    // Edit Modal Events
    if (btnCloseEdit) btnCloseEdit.addEventListener('click', closeModalEdit);
    if (editModal) {
        editModal.addEventListener('click', (e) => {
            if (e.target === editModal) closeModalEdit();
        });
    }

    // Copy Barcode from Edit Modal
    if (btnCopyEditBarcode) {
        btnCopyEditBarcode.addEventListener('click', () => {
            const editBarcodeInput = document.getElementById('edit-barcode');
            if (!editBarcodeInput) return;
            const val = editBarcodeInput.value;
            if (!val) return;
            
            if (navigator.clipboard && window.isSecureContext) {
                navigator.clipboard.writeText(val).then(() => {
                    if (typeof showToast === 'function') showToast('Code copié !', 'success');
                }).catch(err => {
                    console.error('Clipboard error:', err);
                    if (typeof fallbackCopy === 'function') fallbackCopy(val);
                });
            } else {
                if (typeof fallbackCopy === 'function') fallbackCopy(val);
            }
        });
    }

    // Save Edit Logic
    if (modalEditForm) {
        modalEditForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const id = parseFloat(document.getElementById('edit-id').value);
            const newEmplacement = document.getElementById('edit-emplacement').value.trim();
            const newBarcode = document.getElementById('edit-barcode').value.trim();
            
            const item = inventory.find(i => i.id === id);
            if (!item) return;
            
            item.emplacement = newEmplacement;
            item.barcode = newBarcode;
            
            if (typeof closeModalEdit === 'function') closeModalEdit();
            if (typeof renderList === 'function') renderList();
            
            if (item.status === 'Validé (Cloud)') {
                try {
                    const payload = {
                        action: 'UPDATE',
                        data: {
                            uuid: item.uuid,
                            emplacement: newEmplacement,
                            barcode: newBarcode
                        }
                    };
                    const gasUrl = window.KostConfig?.GAS_URL || window.GAS_URL || "";
                    await fetch(gasUrl, {
                        method: 'POST',
                        mode: 'no-cors',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(payload)
                    });
                    
                    if (typeof showToast === 'function') showToast('Article modifié sur le Cloud.', 'cloud');
                } catch (err) {
                    console.error(err);
                    if (typeof showToast === 'function') showToast('Erreur lors de la modification Cloud.', 'error');
                }
            } else {
                if (typeof showToast === 'function') showToast('Article modifié localement.', 'success');
            }
        });
    }

    // Focus Trap & Escape key handling
    setupFocusTrap('search-modal', closeModal);
    setupFocusTrap('edit-modal', () => {
        if (typeof closeModalEdit === 'function') closeModalEdit();
    });
};

function setupFocusTrap(modalId, closeFn) {
    const modal = document.getElementById(modalId);
    if (!modal) return;

    modal.addEventListener('keydown', (e) => {
        if (e.key === 'Escape') {
            closeFn();
            return;
        }

        if (e.key === 'Tab') {
            const focusables = modal.querySelectorAll('button:not([disabled]), input:not([type="hidden"]):not([disabled]), select:not([disabled]), textarea:not([disabled])');
            if (focusables.length === 0) return;

            const first = focusables[0];
            const last = focusables[focusables.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === first) {
                    last.focus();
                    e.preventDefault();
                }
            } else {
                if (document.activeElement === last) {
                    first.focus();
                    e.preventDefault();
                }
            }
        }
    });
}
