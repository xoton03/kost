// K.O.S.T. - App Entry Point & Orchestrator

document.addEventListener('DOMContentLoaded', () => {
    // 1. Initialize Modules
    if (typeof initBg3D === 'function') initBg3D();
    if (typeof initBarcodeWaiting === 'function') initBarcodeWaiting();
    if (typeof initModals === 'function') initModals();
    if (typeof initScanner === 'function') initScanner();

    // 1.5 Check Configuration
    const isConfigMissing = !window.KostConfig || !window.KostConfig.SUPABASE_URL || !window.KostConfig.SUPABASE_KEY || !window.KostConfig.GAS_URL;
    if (isConfigMissing) {
        if (typeof showToast === 'function') {
            showToast("Configuration API manquante (config.js)", "error");
        }
        const btnCloud = document.getElementById('btn-cloud');
        if (btnCloud) {
            btnCloud.disabled = true;
            btnCloud.title = "Configuration API manquante";
            btnCloud.classList.add('opacity-50', 'cursor-not-allowed');
        }
        const btnRefresh = document.getElementById('btn-refresh');
        if (btnRefresh) {
            btnRefresh.disabled = true;
            btnRefresh.title = "Configuration API manquante";
            btnRefresh.classList.add('opacity-50', 'cursor-not-allowed');
        }
    }

    // 2. Load Local Data
    if (typeof loadFromLocal === 'function') loadFromLocal();

    // 3. Event Listeners for DOM Elements
    const btnCloud = document.getElementById('btn-cloud');
    if (!isConfigMissing && btnCloud && typeof envoyerAuCloud === 'function') {
        btnCloud.addEventListener('click', envoyerAuCloud);
    }

    const btnRefresh = document.getElementById('btn-refresh');
    if (!isConfigMissing && btnRefresh && typeof actualiserCloud === 'function') {
        btnRefresh.addEventListener('click', actualiserCloud);
    }

    const btnClearCache = document.getElementById('btn-clear-cache');
    if (btnClearCache && typeof clearCache === 'function') {
        btnClearCache.addEventListener('click', clearCache);
    }

    // 4. Clock and Synchronizations
    if (typeof updateClock === 'function') {
        updateClock();
        setInterval(updateClock, 1000);
    }

    // Initial actualisation after 1s
    if (!isConfigMissing && typeof actualiserCloud === 'function') {
        setTimeout(actualiserCloud, 1000);
    }

    // Background sync every 8s
    if (!isConfigMissing && typeof backgroundSync === 'function') {
        setInterval(backgroundSync, 8000);
    }

    // 5. Draggable & Resizable Clock Logic (Desktop only)
    const clock = document.getElementById('clock-container');
    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);
    
    if (clock && !isTouchDevice) {
        let isDragging = false;
        let offsetLeft, offsetTop;

        clock.addEventListener('mousedown', (e) => {
            const rect = clock.getBoundingClientRect();
            const isInResizeHandle = (e.clientX > rect.right - 20 && e.clientY > rect.bottom - 20);
            
            if (!isInResizeHandle) {
                isDragging = true;
                const rect = clock.getBoundingClientRect();
                clock.style.transform = 'none';
                clock.style.left = rect.left + 'px';
                clock.style.top = rect.top + 'px';
                
                offsetLeft = e.clientX - rect.left;
                offsetTop = e.clientY - rect.top;
                clock.style.transition = 'none';
                clock.style.right = 'auto';
            }
        });

        document.addEventListener('mousemove', (e) => {
            if (isDragging) {
                clock.style.left = `${e.clientX - offsetLeft}px`;
                clock.style.top = `${e.clientY - offsetTop}px`;
                clock.style.right = 'auto';
            }
        });

        document.addEventListener('mouseup', () => {
            isDragging = false;
        });

        // Auto-scaling Font
        const timeTxt = document.getElementById('current-time');
        const secTxt = document.getElementById('current-seconds');
        
        if (timeTxt && secTxt) {
            const resizeObserver = new ResizeObserver(entries => {
                for (const entry of entries) {
                    const width = entry.contentRect.width;
                    const height = entry.contentRect.height;
                    const fontSize = Math.min(width / 4.5, height / 1.5);
                    timeTxt.style.fontSize = `${fontSize}px`;
                    secTxt.style.fontSize = `${fontSize / 3}px`;
                }
            });
            resizeObserver.observe(clock);
        }
    }
});
