/**
 * K.O.S.T. - FLO STOCK UI
 * Integrated with shared KostSharedDB for high-performance offline search.
 */

// UI Elements
const searchInput = document.getElementById('search-input');
const resultsBodyDesktop = document.getElementById('results-body-desktop');
const resultsBodyMobile = document.getElementById('results-body-mobile');
const btnScan = document.getElementById('btn-scan');

// Price Formatting Helper (French style thousands dot separator)
function formatPrice(val) {
    if (val === undefined || val === null) return '--';
    const num = parseFloat(String(val).replace(/[^0-9.-]/g, ''));
    if (isNaN(num)) return val;
    return new Intl.NumberFormat('fr-FR', { useGrouping: true }).format(num).replace(/\s/g, '.');
}



// Custom Offline Vector Brand Logos Engine matching Obsidian Pulse design system
function getBrandLogo(brandName) {
    if (!brandName) return `<span class="text-slate-600 font-bold font-body-mono tracking-widest text-sm">--</span>`;
    const cleanBrand = String(brandName).trim().toUpperCase();
    if (cleanBrand === "" || cleanBrand === "0" || cleanBrand === "NULL" || cleanBrand === "UNDEFINED" || cleanBrand === "MARQUE NON SPÉCIFIÉE") {
        return `<span class="text-slate-600 font-bold font-body-mono tracking-widest text-xs select-none">--</span>`;
    }

    // Normalize Turkish characters and spaces for robust matching
    const matchBrand = cleanBrand.replace(/İ/g, 'I').replace(/[-_\s]+/g, ' ');

    switch (matchBrand) {
        case 'POLARIS':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="polaris-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#06b6d4" />
                        <stop offset="100%" stop-color="#3b82f6" />
                    </linearGradient>
                </defs>
                <path d="M14 4 L17 12 L25 15 L17 18 L14 26 L11 18 L3 15 L11 12 Z" fill="url(#polaris-grad)" />
                <circle cx="14" cy="15" r="2.5" fill="#ffffff" />
                <text x="32" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="13" fill="#ffffff" letter-spacing="1">POLARIS</text>
            </svg>`;

        case 'KINETIX':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="kinetix-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f97316" />
                        <stop offset="100%" stop-color="#eab308" />
                    </linearGradient>
                </defs>
                <path d="M4 8 L12 16 L4 24 L8 24 L16 16 L8 8 Z" fill="url(#kinetix-grad)" />
                <path d="M11 8 L19 16 L11 24 L15 24 L23 16 L15 8 Z" fill="url(#kinetix-grad)" opacity="0.8" />
                <text x="30" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-style="italic" font-size="13" fill="#ffffff" letter-spacing="0.5">KINETIX</text>
            </svg>`;

        case 'TOREX':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="torex-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#10b981" />
                        <stop offset="100%" stop-color="#059669" />
                    </linearGradient>
                </defs>
                <path d="M3 24 L11 10 L19 24 Z" fill="url(#torex-grad)" />
                <path d="M11 24 L17 14 L23 24 Z" fill="url(#torex-grad)" opacity="0.75" />
                <circle cx="20" cy="9" r="2.5" fill="#f59e0b" />
                <text x="28" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="13" fill="#ffffff" letter-spacing="1.5">TOREX</text>
            </svg>`;

        case 'PROSHOT':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="16" r="9" stroke="#ef4444" stroke-width="2" fill="none" />
                <circle cx="14" cy="16" r="3" fill="#ef4444" />
                <line x1="14" y1="2" x2="14" y2="30" stroke="#ffffff" stroke-width="1" />
                <line x1="2" y1="16" x2="26" y2="16" stroke="#ffffff" stroke-width="1" />
                <text x="30" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="13" fill="#ffffff" letter-spacing="0.5">PROSHOT</text>
            </svg>`;

        case 'SEVENTEEN':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="14,4 24,10 24,22 14,28 4,22 4,10" stroke="#fbbf24" stroke-width="1.8" fill="#1e1b4b" />
                <text x="14" y="20" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="10" fill="#fbbf24" text-anchor="middle">17</text>
                <text x="30" y="21" font-family="'Space Grotesk', sans-serif" font-weight="800" font-size="12" fill="#ffffff" letter-spacing="1">SEVENTEEN</text>
            </svg>`;

        case 'BUTIGO':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="butigo-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f472b6" />
                        <stop offset="100%" stop-color="#fb7185" />
                    </linearGradient>
                </defs>
                <path d="M14 8 C9 8, 6 12, 6 16 C6 20, 9 24, 14 24 C19 24, 22 20, 22 16 C22 12, 19 8, 14 8 Z" stroke="url(#butigo-grad)" stroke-width="2" fill="none" />
                <circle cx="14" cy="16" r="3" fill="url(#butigo-grad)" />
                <text x="28" y="20" font-family="'Inter', sans-serif" font-weight="600" font-size="12" fill="#ffffff" letter-spacing="2">BUTIGO</text>
            </svg>`;

        case 'MISS F':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="16" r="9" stroke="#fcd34d" stroke-width="1.5" fill="none" />
                <text x="14" y="21" font-family="'Times New Roman', serif" font-style="italic" font-weight="900" font-size="14" fill="#fcd34d" text-anchor="middle">F</text>
                <text x="28" y="20" font-family="'Space Grotesk', sans-serif" font-weight="500" font-size="11" fill="#ffffff" letter-spacing="1">MISS <tspan font-weight="800" fill="#fcd34d">F</tspan></text>
            </svg>`;

        case 'LUMBERJACK':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="lumber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#b45309" />
                        <stop offset="100%" stop-color="#d97706" />
                    </linearGradient>
                </defs>
                <path d="M14 4 L16 9 L21 8 L18 12 L22 15 L16 16 L17 21 L14 18 L11 21 L12 16 L6 15 L10 12 L7 8 L12 9 Z" fill="url(#lumber-grad)" />
                <line x1="14" y1="18" x2="14" y2="25" stroke="#d97706" stroke-width="2" stroke-linecap="round" />
                <text x="28" y="20" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="11" fill="#ffffff" letter-spacing="0.5">LUMBERJACK</text>
            </svg>`;

        case 'INCI':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect x="5" y="5" width="18" height="18" rx="2" stroke="#e2e8f0" stroke-width="1.5" fill="none" transform="rotate(45 14 14)" />
                <circle cx="14" cy="14" r="3" fill="#e2e8f0" />
                <text x="32" y="21" font-family="'Georgia', serif" font-style="italic" font-weight="bold" font-size="14" fill="#ffffff" letter-spacing="3">İNCI</text>
            </svg>`;

        case 'I COOL':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="cool-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#38bdf8" />
                        <stop offset="100%" stop-color="#0284c7" />
                    </linearGradient>
                </defs>
                <g stroke="url(#cool-grad)" stroke-width="1.5" stroke-linecap="round">
                    <line x1="14" y1="6" x2="14" y2="26" />
                    <line x1="4" y1="16" x2="24" y2="16" />
                    <line x1="7" y1="9" x2="21" y2="23" />
                    <line x1="7" y1="23" x2="21" y2="9" />
                </g>
                <text x="28" y="20" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="12" fill="#ffffff" letter-spacing="1">I COOL</text>
            </svg>`;

        case 'YELLOW KIDS':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="16" r="8" fill="#fbbf24" />
                <circle cx="11" cy="13" r="1" fill="#000000" />
                <circle cx="17" cy="13" r="1" fill="#000000" />
                <path d="M10 18 Q14 21 18 18" stroke="#000000" stroke-width="1.2" fill="none" stroke-linecap="round" />
                <path d="M14 2 L14 4 M14 28 L14 30 M2 14 L4 14 M28 14 L30 14" stroke="#f59e0b" stroke-width="1.2" stroke-linecap="round" />
                <text x="28" y="20" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="10" fill="#ffffff" letter-spacing="0.5">YELLOW <tspan fill="#fbbf24">KIDS</tspan></text>
            </svg>`;

        case 'MICKEY MOUSE':
        case 'MINNIES MOUSE':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="19" r="6" fill="#ef4444" />
                <circle cx="9" cy="12" r="3.8" fill="#1e293b" />
                <circle cx="19" cy="12" r="3.8" fill="#1e293b" />
                <text x="28" y="20" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="10" fill="#ffffff" letter-spacing="1">MICKEY <tspan font-weight="300" fill="#94a3b8">MOUSE</tspan></text>
            </svg>`;

        case 'FROZEN':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <g stroke="#67e8f9" stroke-width="1.2" stroke-linecap="round">
                    <line x1="14" y1="5" x2="14" y2="27" />
                    <line x1="3" y1="16" x2="25" y2="16" />
                    <path d="M11 9 L14 12 L17 9" fill="none" />
                    <path d="M11 23 L14 20 L17 23" fill="none" />
                    <path d="M7 13 L10 16 L7 19" fill="none" />
                    <path d="M21 13 L18 16 L21 19" fill="none" />
                </g>
                <text x="28" y="20" font-family="'Georgia', serif" font-weight="bold" font-style="italic" font-size="12" fill="#ffffff" letter-spacing="1.5">FROZEN</text>
            </svg>`;

        case 'SPIDERMAN':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="14" r="3" fill="#ef4444" />
                <path d="M14 16 L14 23 C14 23 14 23 14 23 C16 19, 16 16, 16 15 Z" fill="#ef4444" />
                <path d="M12 12 Q8 10 6 16 M12 14 Q7 15 6 20 M16 12 Q20 10 22 16 M16 14 Q23 15 22 20" stroke="#ef4444" stroke-width="1.5" fill="none" />
                <text x="28" y="20" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="10" fill="#ffffff" letter-spacing="1.5">SPIDER<tspan fill="#ef4444">MAN</tspan></text>
            </svg>`;

        case 'AVENGERS':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <circle cx="14" cy="16" r="10" stroke="#f43f5e" stroke-width="1.8" fill="none" />
                <path d="M14 6 L7 24 L11 24 L13 19 L17 19 L18 24 L22 24 Z" fill="#ffffff" />
                <path d="M14 11 L12 16 L18 16 Z" fill="#000000" />
                <path d="M12 16 L20 16 L17 13 L20 16 L17 19" stroke="#f43f5e" stroke-width="2" stroke-linejoin="round" fill="none" />
                <text x="32" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="11" fill="#ffffff" letter-spacing="1.5">AVENGERS</text>
            </svg>`;

        case 'LOTTO':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="10,6 20,14 16,26 6,18" fill="#ef4444" />
                <polygon points="16,6 26,14 22,26 12,18" fill="#f43f5e" opacity="0.8" />
                <polygon points="13,11 18,15 15,21 10,17" fill="#000000" />
                <text x="32" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-style="italic" font-size="14" fill="#ffffff" letter-spacing="1">lotto</text>
            </svg>`;

        case 'DOCKERS':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="dockers-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#eab308" />
                        <stop offset="100%" stop-color="#ca8a04" />
                    </linearGradient>
                </defs>
                <circle cx="14" cy="9" r="2.2" stroke="url(#dockers-grad)" stroke-width="1.5" fill="none" />
                <line x1="14" y1="11" x2="14" y2="23" stroke="url(#dockers-grad)" stroke-width="2" />
                <line x1="8" y1="14" x2="20" y2="14" stroke="url(#dockers-grad)" stroke-width="1.5" />
                <path d="M6 18 Q14 27 22 18" stroke="url(#dockers-grad)" stroke-width="2" fill="none" />
                <text x="28" y="20" font-family="'Space Grotesk', sans-serif" font-weight="800" font-size="12" fill="#ffffff" letter-spacing="1">DOCKERS</text>
            </svg>`;

        case 'U.S. POLO ASSN.':
        case 'US POLO ASSN':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 6 L23 6 L23 16 C23 21, 14 26, 14 26 C14 26, 5 21, 5 16 Z" stroke="#3b82f6" stroke-width="1.5" fill="none" />
                <path d="M11 12 Q14 10 16 14 L13 18 L17 22 M14 11 L12 8" stroke="#ffffff" stroke-width="1.5" fill="none" />
                <text x="28" y="20" font-family="'Space Grotesk', sans-serif" font-weight="800" font-size="9" fill="#ffffff" letter-spacing="0.5">U.S. POLO ASSN.</text>
            </svg>`;

        case 'BJK GRUP':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 4 L23 4 L23 16 C23 21, 14 27, 14 27 C14 27, 5 21, 5 16 Z" fill="#1e293b" />
                <rect x="8" y="6" width="2" height="12" fill="#ffffff" />
                <rect x="11" y="6" width="2" height="12" fill="#ef4444" />
                <rect x="14" y="6" width="2" height="12" fill="#ffffff" />
                <rect x="17" y="6" width="2" height="12" fill="#ef4444" />
                <text x="28" y="20" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="11" fill="#ffffff" letter-spacing="1">BJK-GRUP</text>
            </svg>`;

        case 'FORESTER':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="12,22 15,10 18,22" fill="#10b981" />
                <polygon points="7,22 10,13 13,22" fill="#059669" />
                <polygon points="17,22 20,13 23,22" fill="#059669" />
                <line x1="15" y1="22" x2="15" y2="26" stroke="#78350f" stroke-width="1.5" />
                <line x1="10" y1="22" x2="10" y2="26" stroke="#78350f" stroke-width="1.5" />
                <line x1="20" y1="22" x2="20" y2="26" stroke="#78350f" stroke-width="1.5" />
                <text x="28" y="20" font-family="'Space Grotesk', sans-serif" font-weight="800" font-size="12" fill="#ffffff" letter-spacing="1.5">FORESTER</text>
            </svg>`;

        case 'WINX':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 16 C18 10, 23 8, 22 15 C21 20, 16 18, 14 16 Z" fill="#e879f9" opacity="0.8" />
                <path d="M14 16 C10 10, 5 8, 6 15 C7 20, 12 18, 14 16 Z" fill="#e879f9" opacity="0.8" />
                <text x="26" y="20" font-family="'Space Grotesk', sans-serif" font-style="italic" font-weight="900" font-size="13" fill="#ffffff" letter-spacing="1">WINX</text>
            </svg>`;

        case 'LOL':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M4 14 Q6 4, 14 4 Q22 4, 24 14 Q22 24, 14 24 Q9 24, 6 28 Z" fill="#ec4899" />
                <text x="14" y="17" font-family="Impact, sans-serif" font-weight="900" font-size="8" fill="#ffffff" text-anchor="middle">LOL!</text>
                <text x="28" y="20" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="13" fill="#ffffff" letter-spacing="1">LOL</text>
            </svg>`;

        case 'DOWN TOWN':
        case 'DOWNTOWN':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="16" width="3" height="12" fill="#818cf8" />
                <rect x="8" y="10" width="4" height="18" fill="#6366f1" />
                <rect x="13" y="14" width="3" height="14" fill="#4f46e5" />
                <rect x="17" y="8" width="5" height="20" fill="#818cf8" />
                <text x="26" y="20" font-family="'Space Grotesk', sans-serif" font-weight="800" font-size="11" fill="#ffffff" letter-spacing="1.5">DOWN <tspan fill="#818cf8">TOWN</tspan></text>
            </svg>`;

        case 'PANAMA CLUB':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="panama-grad" x1="0%" y1="0%" x2="0%" y2="100%">
                        <stop offset="0%" stop-color="#f97316" />
                        <stop offset="100%" stop-color="#f43f5e" />
                    </linearGradient>
                </defs>
                <circle cx="14" cy="16" r="9" fill="url(#panama-grad)" />
                <path d="M14 25 Q12 19, 14 10" stroke="#000000" stroke-width="2" fill="none" />
                <path d="M14 10 Q9 8, 7 13 M14 10 Q19 8, 21 13" stroke="#000000" stroke-width="1.5" fill="none" />
                <text x="28" y="20" font-family="'Space Grotesk', sans-serif" font-weight="800" font-size="9" fill="#ffffff" letter-spacing="1">PANAMA CLUB</text>
            </svg>`;

        case 'TRAVEL SOFT':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 22 C12 22, 22 18, 22 11 C22 7, 17 7, 14 11 C10 15, 7 18, 5 22 Z" stroke="#22d3ee" stroke-width="1.5" fill="none" />
                <text x="26" y="20" font-family="'Space Grotesk', sans-serif" font-weight="500" font-size="9" fill="#ffffff" letter-spacing="1">TRAVEL <tspan font-weight="900" fill="#22d3ee">SOFT</tspan></text>
            </svg>`;

        case 'FLEXALL CFA':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 16 C5 10, 7 6, 11 6 C15 6, 14 14, 16 16 C18 18, 22 12, 23 16 C24 20, 21 26, 16 26 C11 26, 5 22, 5 16 Z" stroke="#f97316" stroke-width="1.5" fill="none" />
                <rect x="12" y="11" width="3" height="9" fill="#f97316" rx="0.5" />
                <rect x="9" y="14" width="9" height="3" fill="#f97316" rx="0.5" />
                <text x="26" y="20" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="9" fill="#ffffff" letter-spacing="1.5">FLEXALL <tspan font-weight="400" fill="#f97316">CFA</tspan></text>
            </svg>`;

        case 'SALVANO':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="salvano-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#f59e0b" />
                        <stop offset="100%" stop-color="#d97706" />
                    </linearGradient>
                </defs>
                <circle cx="14" cy="16" r="9" fill="url(#salvano-grad)" />
                <text x="14" y="20" font-family="'Georgia', serif" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle">S</text>
                <text x="28" y="20" font-family="'Georgia', serif" font-weight="bold" font-size="12" fill="#ffffff" letter-spacing="1.5">SALVANO</text>
            </svg>`;

        case 'OXIDE':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <polygon points="14,5 22,10 22,22 14,27 6,22 6,10" stroke="#a3e635" stroke-width="1.5" fill="none" />
                <text x="14" y="19" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle">X</text>
                <text x="26" y="20" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="12" fill="#ffffff" letter-spacing="1.5">OXIDE</text>
            </svg>`;

        case 'GARAMOND':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect x="4" y="4" width="20" height="20" fill="#ffffff" opacity="0.05" stroke="#ffffff" stroke-width="1" />
                <text x="14" y="19" font-family="'Georgia', serif" font-weight="900" font-size="13" fill="#ffffff" text-anchor="middle">G</text>
                <text x="28" y="20" font-family="'Georgia', serif" font-weight="bold" font-size="11" fill="#ffffff" letter-spacing="1.5">GARAMOND</text>
            </svg>`;

        case 'BALLOON S':
        case 'BALLOONS':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 6 C9 6, 7 10, 7 16 C7 20, 11 24, 14 24 C17 24, 21 20, 21 16 C21 10, 19 6, 14 6 Z" fill="#f87171" />
                <path d="M14 6 C11.5 6, 9.5 10, 9.5 16 C9.5 20, 11.5 24, 14 24 Z" fill="#ffffff" opacity="0.4" />
                <rect x="12" y="25" width="4" height="2" fill="#b91c1c" />
                <text x="26" y="20" font-family="'Space Grotesk', sans-serif" font-weight="800" font-size="11" fill="#ffffff" letter-spacing="1">BALLOON-S</text>
            </svg>`;

        case 'ART BELLA':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bella-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#ec4899" />
                        <stop offset="100%" stop-color="#f43f5e" />
                    </linearGradient>
                </defs>
                <path d="M4 16 C8 6, 20 6, 24 16 C20 26, 8 26, 4 16 Z" stroke="url(#bella-grad)" stroke-width="1.5" fill="none" />
                <text x="14" y="20" font-family="'Times New Roman', serif" font-style="italic" font-weight="900" font-size="12" fill="#ffffff" text-anchor="middle">A</text>
                <text x="28" y="20" font-family="'Georgia', serif" font-style="italic" font-weight="bold" font-size="12" fill="#ffffff" letter-spacing="1">Art Bella</text>
            </svg>`;

        case 'JJ STILLER':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M5 5 L23 5 L23 15 Q23 23, 14 27 Q5 23, 5 15 Z" fill="#334155" />
                <text x="14" y="18" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="10" fill="#ffffff" text-anchor="middle">JJ</text>
                <text x="28" y="20" font-family="'Space Grotesk', sans-serif" font-weight="800" font-size="11" fill="#ffffff" letter-spacing="1">JJ-STILLER</text>
            </svg>`;

        case 'FLOGART':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <path d="M14 6 C17 6, 20 9, 20 12 C20 16, 14 26, 14 26 C14 26, 8 16, 8 12 C8 9, 11 6, 14 6 Z" stroke="#3b82f6" stroke-width="1.5" fill="none" />
                <circle cx="14" cy="12" r="3" fill="#3b82f6" />
                <text x="26" y="20" font-family="'Space Grotesk', sans-serif" font-weight="700" font-size="12" fill="#ffffff" letter-spacing="1.5">FLOGART</text>
            </svg>`;

        default:
            // Custom HSL gradient badge monogram fallback for generic/minor brands
            const cleanName = cleanBrand.replace(/[^A-Z0-9\s]/g, '').trim();
            const parts = cleanName.split(/\s+/).filter(Boolean);
            let initials = "";
            if (parts.length >= 2) {
                initials = (parts[0][0] + parts[1][0]).toUpperCase();
            } else if (parts.length === 1) {
                initials = parts[0].substring(0, Math.min(2, parts[0].length)).toUpperCase();
            } else {
                initials = "--";
            }

            // Create a deterministic hash from the brand name
            let hash = 0;
            for (let i = 0; i < matchBrand.length; i++) {
                hash = matchBrand.charCodeAt(i) + ((hash << 5) - hash);
            }

            const hue = Math.abs(hash) % 360;
            const gradStart = `hsl(${hue}, 85%, 45%)`;
            const gradEnd = `hsl(${(hue + 45) % 360}, 85%, 35%)`;
            const borderCol = `hsl(${hue}, 95%, 65%)`;

            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="fallback-grad-${hue}" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="${gradStart}" />
                        <stop offset="100%" stop-color="${gradEnd}" />
                    </linearGradient>
                </defs>
                <rect x="4" y="4" width="24" height="24" rx="4" fill="url(#fallback-grad-${hue})" stroke="${borderCol}" stroke-width="1" />
                <text x="16" y="20" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="11" fill="#ffffff" text-anchor="middle">${initials}</text>
                <text x="32" y="20" font-family="'Space Grotesk', sans-serif" font-weight="800" font-size="10" fill="#ffffff" letter-spacing="0.5">${cleanName.substring(0, 13)}</text>
            </svg>`;
    }
}

// Global Manifest Action Handler (exposed to window for inline onclick attributes)
window.handleAddToManifest = function(ref, name) {
    const formattedRef = String(ref || "").trim().toUpperCase().replace(/\s+/g, '_');
    showToast(`ADDED_${formattedRef}_TO_MANIFEST`, 'success');
};

// Toast notification container
function showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;
    const toast = document.createElement('div');
    toast.className = 'toast animate-entrance';
    let icon = 'check-circle';
    let color = 'text-green-400';
    if (type === 'error') {
        icon = 'alert-circle';
        color = 'text-red-400';
    }
    toast.innerHTML = `<i data-lucide="${icon}" class="w-5 h-5 ${color}"></i><span class="text-sm font-medium font-body-mono">${message.toUpperCase()}</span>`;
    container.appendChild(toast);
    if (window.lucide) lucide.createIcons();
    setTimeout(() => {
        toast.style.transform = 'translateX(100%)';
        toast.style.opacity = '0';
        toast.style.transition = 'all 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

// Search Logic
async function performSearch() {
    const query = searchInput.value.trim();
    if (!query || query.length < 3) {
        resultsBodyMobile.innerHTML = '';
        if (resultsBodyDesktop) resultsBodyDesktop.innerHTML = '';
        return;
    }

    try {
        // Use shared search engine
        const results = await searchArticles(query);
        renderResults(results);
    } catch (error) {
        console.error('[Flo Search] Error:', error);
    }
}

// Render Results (Lazy Display matching flo_screen.html markup)
function renderResults(results) {
    if (results.length === 0) {
        const noResultMobile = `<div class="col-span-full text-center py-12 text-slate-500 font-bold uppercase tracking-widest border border-dashed border-outline bg-surface">AUCUN_RESULTAT_TROUVE</div>`;
        resultsBodyMobile.innerHTML = noResultMobile;
        if (resultsBodyDesktop) resultsBodyDesktop.innerHTML = '';
        return;
    }

    const cleanStr = (val) => {
        if (val === undefined || val === null) return "";
        const s = String(val).trim();
        return (s === "0" || s.toLowerCase() === "null" || s.toLowerCase() === "undefined") ? "" : s;
    };

    // High fidelity brutalist grid rendering
    resultsBodyMobile.innerHTML = results.map(item => {
        const isPromo = item.prix_reduit && item.prix_reduit < item.prix_tarif;
        const price = { tarif: item.prix_tarif || 0, reduit: isPromo ? item.prix_reduit : null };
        
        const rawTitle = cleanStr(item.libelle);
        const formattedTitle = rawTitle ? rawTitle.toUpperCase().replace(/\s+/g, '_') : "ARTICLE_SANS_NOM";
        
        const rawRef = cleanStr(item.ref_article);
        const formattedRef = rawRef ? rawRef.toUpperCase() : "SANS_REF";
        
        const brand = cleanStr(item.brand);
        const genre = cleanStr(item.genre);
        const typeArticle = cleanStr(item.type_article);
        const couleur = cleanStr(item.couleur);
        const taille = cleanStr(item.taille);
        const marche = cleanStr(item.marche);
        const groupe = cleanStr(item.groupe);
        
        return `
        <section class="flex flex-col border border-outline bg-surface animate-entrance">
            <div class="p-6 border-b border-outline">
                <h2 class="font-headline-md text-headline-md text-white font-bold leading-tight uppercase tracking-tight">${formattedTitle}</h2>
                <div class="flex flex-wrap items-center gap-2 mt-2">
                    ${genre ? `<span class="font-body-mono text-label-caps text-on-surface-variant border border-outline px-2 py-0.5">${genre}</span>` : ''}
                    ${typeArticle ? `<span class="font-body-mono text-label-caps text-on-surface-variant border border-outline px-2 py-0.5">${typeArticle}</span>` : ''}
                    ${couleur ? `<span class="font-body-mono text-label-caps text-slate-400 border border-outline px-2 py-0.5">${couleur}</span>` : ''}
                    ${taille ? `<span class="font-body-mono text-label-caps text-slate-400 border border-outline px-2 py-0.5">T_${taille}</span>` : ''}
                </div>
            </div>
            
            ${price.reduit ? `
            <div class="p-6 border-b border-outline flex flex-col items-start gap-1">
                <div class="flex justify-between items-center w-full">
                    <span class="font-label-caps text-label-caps text-on-surface-variant uppercase">UNIT_PRICE_NET</span>
                    <span class="font-body-mono text-xs text-red-500 font-bold border border-red-500/30 bg-red-500/10 px-2 py-0.5 uppercase tracking-wider">PROMO_ACTIVE</span>
                </div>
                <div class="flex items-baseline flex-wrap gap-2">
                    <span class="font-display-lg text-6xl text-red-500 font-black tracking-tighter">${formatPrice(price.reduit)}</span>
                    <span class="font-headline-md text-2xl text-red-500 font-bold">DA</span>
                    <span class="font-body-mono text-sm text-slate-500 line-through ml-2">${formatPrice(price.tarif)} DA</span>
                </div>
            </div>
            ` : `
            <div class="p-6 border-b border-outline flex flex-col items-start gap-1">
                <span class="font-label-caps text-label-caps text-on-surface-variant uppercase">UNIT_PRICE_NET</span>
                <div class="flex items-baseline gap-2">
                    <span class="font-display-lg text-6xl text-primary-container font-black tracking-tighter">${formatPrice(price.tarif)}</span>
                    <span class="font-headline-md text-2xl text-primary-container font-bold">DA</span>
                </div>
            </div>
            `}
            
            <div class="grid grid-cols-2 gap-px bg-outline">
                <div class="bg-surface p-4 flex flex-col">
                    <span class="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">REFERENCE</span>
                    <span class="font-body-mono text-body-mono text-white">${formattedRef}</span>
                </div>
                <div class="bg-surface p-4 flex flex-col">
                    <span class="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">GENCOD</span>
                    <span class="font-body-mono text-body-mono text-white">${item.gencod}</span>
                </div>
                <div class="bg-surface p-4 flex flex-col">
                    <span class="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">MARCHÉ</span>
                    <span class="font-body-mono text-body-mono text-white">${marche || '--'}</span>
                </div>
                <div class="bg-surface p-4 flex flex-col justify-between">
                    <span class="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">MARQUE</span>
                    <div class="flex items-center justify-start h-8 overflow-hidden">${getBrandLogo(brand)}</div>
                </div>
                ${groupe ? `
                <div class="bg-surface p-4 flex flex-col col-span-2">
                    <span class="font-label-caps text-[10px] text-on-surface-variant uppercase mb-1">GROUPE</span>
                    <span class="font-body-mono text-body-mono text-white">${groupe}</span>
                </div>` : ''}
            </div>
            
            <button onclick="handleAddToManifest('${formattedRef}', '${formattedTitle}')" class="w-full bg-primary-container text-on-primary-container py-6 font-label-caps text-label-caps font-black uppercase hover:bg-white hover:text-black transition-colors">
                ADD_TO_MANIFEST
            </button>
        </section>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

// Event Listeners
searchInput.addEventListener('input', performSearch);
searchInput.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') e.target.blur();
});

// Barcode Scanner Integration with html5-qrcode
let html5QrCode = null;

async function startScanner() {
    const scannerModal = document.getElementById('scanner-modal');
    if (!scannerModal) return;

    scannerModal.classList.remove('hidden');
    scannerModal.classList.add('flex');
    
    const statusEl = document.getElementById('scanner-status');
    if (statusEl) statusEl.textContent = 'INITIALIZING_CAMERA...';
    
    try {
        if (!html5QrCode) {
            // Instantiate with the scanner-reader div ID
            html5QrCode = new Html5Qrcode("scanner-reader");
        }
        
        const qrCodeSuccessCallback = (decodedText, decodedResult) => {
            console.log(`[Flo Scanner] Success: ${decodedText}`, decodedResult);
            
            // Populate search and query database
            if (searchInput) {
                searchInput.value = decodedText;
                performSearch();
            }
            
            showToast(`SCANNED_CODE_${decodedText}`, 'success');
            stopScanner();
        };
        
        const config = {
            fps: 15,
            qrbox: (width, height) => {
                // Returns scan window dimensions optimized for linear barcodes
                return {
                    width: Math.min(width * 0.85, 320),
                    height: Math.min(height * 0.35, 140)
                };
            },
            aspectRatio: 1.333333
        };
        
        await html5QrCode.start(
            { facingMode: "environment" },
            config,
            qrCodeSuccessCallback
        );
        
        if (statusEl) statusEl.textContent = 'ACTIVE_READY';
        
    } catch (err) {
        console.error('[Flo Scanner] Error initiating scanner:', err);
        if (statusEl) statusEl.textContent = 'ERROR_CAMERA_ACCESS_DENIED';
        showToast('CAMERA_ACCESS_DENIED', 'error');
        // Hide modal automatically on error after 2 seconds
        setTimeout(stopScanner, 2000);
    }
}

async function stopScanner() {
    const scannerModal = document.getElementById('scanner-modal');
    if (!scannerModal) return;

    scannerModal.classList.add('hidden');
    scannerModal.classList.remove('flex');
    
    if (html5QrCode && html5QrCode.isScanning) {
        try {
            await html5QrCode.stop();
        } catch (err) {
            console.error('[Flo Scanner] Stop error:', err);
        }
    }
}

// Initialization
document.addEventListener('DOMContentLoaded', () => {
    // Clear results on load
    resultsBodyMobile.innerHTML = '';
    if (resultsBodyDesktop) resultsBodyDesktop.innerHTML = '';
    
    // Bind Scanner Buttons
    if (btnScan) {
        btnScan.addEventListener('click', (e) => {
            e.preventDefault();
            startScanner();
        });
    }

    const btnCloseScanner = document.getElementById('btn-close-scanner');
    if (btnCloseScanner) {
        btnCloseScanner.addEventListener('click', (e) => {
            e.preventDefault();
            stopScanner();
        });
    }

    const scannerModal = document.getElementById('scanner-modal');
    if (scannerModal) {
        scannerModal.addEventListener('click', (e) => {
            if (e.target === scannerModal) {
                stopScanner();
            }
        });
    }
    
    console.log('[Flo UI] Initialized with shared database and camera barcode scanner.');
});

