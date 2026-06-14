/**
 * K.O.S.T. NAVIGATION SYSTEM
 * Shared logic for the principal navigation drawer.
 */

document.addEventListener('DOMContentLoaded', () => {
    const navDrawer = document.getElementById('nav-drawer');
    const navBackdrop = document.getElementById('nav-backdrop');
    const logoTrigger = document.getElementById('logo-trigger');
    const hamburgerTrigger = document.getElementById('hamburger-trigger');
    const btnCloseDrawer = document.getElementById('btn-close-drawer');

    if (!navDrawer || !navBackdrop) {
        console.warn('Navigation drawer elements not found in DOM. Navigation logic skipped.');
    } else {
        function openDrawer(e) {
            if (e) e.preventDefault();
            navBackdrop.classList.remove('hidden');
            document.body.style.overflow = 'hidden'; // Lock scroll
            // Small delay to allow 'hidden' removal before opacity transition
            setTimeout(() => {
                navBackdrop.classList.add('opacity-100');
                navDrawer.classList.remove('-translate-x-full');
            }, 10);
        }

        function closeDrawer(e) {
            if (e) e.preventDefault();
            navBackdrop.classList.remove('opacity-100');
            navDrawer.classList.add('-translate-x-full');
            // Wait for transition to complete before hiding
            setTimeout(() => {
                navBackdrop.classList.add('hidden');
                document.body.style.overflow = ''; // Restore scroll
            }, 300);
        }

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
                    alert("Les Service Workers ne sont pas supportés sur ce navigateur.");
                }
            });
        }
    }

    // ============================================================
    // GLOBAL CLOCK LOGIC
    // ============================================================
    function updateClock() {
        const timeEl = document.getElementById('current-time');
        const secondsEl = document.getElementById('current-seconds');
        const dateEl = document.getElementById('current-date');
        const container = document.getElementById('clock-container');

        if (!timeEl) return;

        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const ss = String(now.getSeconds()).padStart(2, '0');
        
        // Date formatting
        const dateStr = now.toLocaleDateString('fr-FR', { 
            weekday: 'long', 
            day: 'numeric', 
            month: 'long', 
            year: 'numeric' 
        });
        const formattedDate = dateStr.charAt(0).toUpperCase() + dateStr.slice(1);

        // Update Text
        timeEl.textContent = `${hh}:${mm}`;
        if (secondsEl) secondsEl.textContent = ss;
        if (dateEl) dateEl.textContent = formattedDate;

        // Day-based coloring
        const dayIndex = now.getDay();
        const dayColor = `var(--day-${dayIndex})`;
        
        if (container) container.style.borderColor = dayColor;
        if (secondsEl) secondsEl.style.color = dayColor;
        if (dateEl) dateEl.style.color = dayColor;
    }

    // Initial run and interval
    updateClock();
    setInterval(updateClock, 1000);

    // Global icon initialization
    if (window.lucide) {
        lucide.createIcons();
    }
});
