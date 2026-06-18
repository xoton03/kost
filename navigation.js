/**
 * K.O.S.T. NAVIGATION SYSTEM
 * Shared logic for the principal navigation drawer.
 */

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
});
