/**
 * K.O.S.T. NAVIGATION SYSTEM
 * Shared logic for the principal navigation drawer.
 */

let deferredInstallPrompt = null;
window.addEventListener('beforeinstallprompt', (e) => {
    e.preventDefault();
    deferredInstallPrompt = e;
    const banner = document.getElementById('kost-install-banner');
    if (banner) {
        banner.classList.remove('hidden');
    }
});

window.initLucide = window.initLucide || function() {
    if (window.lucide) {
        window.lucide.createIcons();
    }
};

document.addEventListener('DOMContentLoaded', () => {
    const navDrawer = document.getElementById('nav-drawer');
    const navBackdrop = document.getElementById('nav-backdrop');
    const logoTrigger = document.getElementById('logo-trigger');
    const hamburgerTrigger = document.getElementById('hamburger-trigger');
    const btnCloseDrawer = document.getElementById('btn-close-drawer');

    if (!navDrawer || !navBackdrop) {
        console.warn('Navigation drawer elements not found in DOM. Navigation logic skipped.');
    } else {
        const openDrawer = (e) => {
            if (e) e.preventDefault();
            navBackdrop.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Lock scroll
            // Small delay to allow 'hidden' removal before opacity transition
            setTimeout(() => {
                navBackdrop.classList.add('opacity-100');
                navDrawer.classList.remove('-translate-x-full');
            }, 10);
        };

        const closeDrawer = (e) => {
            if (e) e.preventDefault();
            navBackdrop.classList.remove('opacity-100');
            navDrawer.classList.add('-translate-x-full');
            // Wait for transition to complete before hiding
            setTimeout(() => {
                navBackdrop.classList.add('hidden');
                document.body.style.overflow = ''; // Restore scroll
            }, 300);
        };

        // Event Listeners
        if (logoTrigger || hamburgerTrigger) {
            const triggers = [logoTrigger, hamburgerTrigger];
            triggers.forEach(trigger => {
                if (trigger) {
                    trigger.addEventListener('click', openDrawer);
                    trigger.addEventListener('touchstart', openDrawer, { passive: false });
                }
            });
        }

        if (btnCloseDrawer) {
            btnCloseDrawer.addEventListener('click', closeDrawer);
            btnCloseDrawer.addEventListener('touchstart', closeDrawer, { passive: false });
        }
        
        if (navBackdrop) {
            navBackdrop.addEventListener('click', closeDrawer);
            navBackdrop.addEventListener('touchstart', closeDrawer, { passive: false });
        }

        // Close on escape key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && navDrawer && !navDrawer.classList.contains('-translate-x-full')) {
                closeDrawer();
            }
        });

        // Force Update Button Logic
        const btnForceUpdate = document.getElementById('btn-force-update');
        if (btnForceUpdate) {
            btnForceUpdate.addEventListener('click', async (e) => {
                e.preventDefault();
                const icon = btnForceUpdate.querySelector('i');
                if (icon) icon.classList.add('animate-spin');
                
                if ('serviceWorker' in navigator) {
                    try {
                        const reg = await navigator.serviceWorker.getRegistration();
                        if (reg) {
                            console.log('[Updater] Forcing update check...');
                            await reg.update();
                            
                            // Check if there is a waiting worker after update
                            if (reg.waiting) {
                                if (window.kostUpdater) {
                                    window.kostUpdater.showUpdateBanner(reg.waiting);
                                } else {
                                    reg.waiting.postMessage('SKIP_WAITING');
                                }
                            } else {
                                if (typeof showToast === 'function') {
                                    showToast("AUCUNE MISE À JOUR DISPONIBLE", "success");
                                } else {
                                    // eslint-disable-next-line no-alert
                                    alert("AUCUNE MISE À JOUR DISPONIBLE");
                                }
                            }
                        } else {
                            if (typeof showToast === 'function') {
                                showToast("SERVICE WORKER NON ENREGISTRÉ", "error");
                            }
                        }
                    } catch (err) {
                        console.error('[Updater] Force update error:', err);
                        if (typeof showToast === 'function') {
                            showToast("ERREUR DE MISE À JOUR", "error");
                        }
                    } finally {
                        setTimeout(() => {
                            if (icon) icon.classList.remove('animate-spin');
                        }, 1000);
                    }
                } else {
                    // eslint-disable-next-line no-alert
                    alert("Les Service Workers ne sont pas supportés sur ce navigateur.");
                }
            });
        }
    }

    // Shared Clock logic for secondary pages (which don't load js/ui.js and app.js)
    if (!window.updateClock) {
        window.updateClock = function() {
            const now = new Date();
            const timeStr = now.toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' });
            const secStr = now.getSeconds().toString().padStart(2, '0');
            const dateStr = now.toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });
            const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

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
    }

    if (document.getElementById('clock-container') && !document.querySelector('script[src="app.js"]')) {
        window.updateClock();
        setInterval(window.updateClock, 1000);
    }

    // Global icon initialization
    if (window.initLucide) {
        window.initLucide();
    }

    // PWA Install Banner Logic
    const initInstallBanner = () => {
        const isStandalone = window.matchMedia('(display-mode: standalone)').matches;
        const isHiddenThisSession = sessionStorage.getItem('kost_install_prompt_hidden_this_session') === 'true';
        
        // Show banner only if NOT standalone and NOT hidden in this session
        if (isStandalone || isHiddenThisSession) {
            return;
        }

        // Create banner element
        const banner = document.createElement('div');
        banner.id = 'kost-install-banner';
        banner.className = 'install-banner hidden';
        banner.innerHTML = `
            <div class="install-banner-content">
                <img src="assets/logo.png" alt="Logo K.O.S.T." class="install-banner-logo">
                <div class="install-banner-text">
                    <span class="install-banner-title">Installer l'application</span>
                    <span class="install-banner-desc">Accédez à K.O.S.T. directement depuis l'écran d'accueil</span>
                </div>
                <div class="install-banner-actions">
                    <button id="btn-install-dismiss" class="install-btn-secondary">Plus tard</button>
                    <button id="btn-install-prompt" class="install-btn-primary">Installer</button>
                </div>
            </div>
        `;
        document.body.appendChild(banner);

        // Bind events
        const btnDismiss = document.getElementById('btn-install-dismiss');
        const btnInstall = document.getElementById('btn-install-prompt');

        if (btnDismiss) {
            btnDismiss.addEventListener('click', (e) => {
                e.preventDefault();
                banner.classList.add('hidden');
                sessionStorage.setItem('kost_install_prompt_hidden_this_session', 'true');
                localStorage.setItem('kost_install_prompt_dismissed', 'dismissed');
            });
        }

        if (btnInstall) {
            btnInstall.addEventListener('click', async (e) => {
                e.preventDefault();
                if (deferredInstallPrompt) {
                    deferredInstallPrompt.prompt();
                    const { outcome } = await deferredInstallPrompt.userChoice;
                    console.log(`[PWA Install] User choice: ${outcome}`);
                    if (outcome === 'accepted') {
                        localStorage.setItem('kost_install_prompt_dismissed', 'accepted');
                        banner.classList.add('hidden');
                    } else {
                        localStorage.setItem('kost_install_prompt_dismissed', 'dismissed');
                        sessionStorage.setItem('kost_install_prompt_hidden_this_session', 'true');
                        banner.classList.add('hidden');
                    }
                    deferredInstallPrompt = null;
                } else {
                    if (typeof showToast === 'function') {
                        showToast("INSTALLATEUR NON DISPONIBLE SUR CE NAVIGATEUR", "error");
                    } else {
                        alert("L'installation n'est pas supportée par votre navigateur (ou déjà installée).");
                    }
                    banner.classList.add('hidden');
                }
            });
        }

        // Show banner if event already fired
        if (deferredInstallPrompt) {
            banner.classList.remove('hidden');
        }
    };

    initInstallBanner();
});
