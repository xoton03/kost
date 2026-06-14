/**
 * K.O.S.T. - FLO STOCK UI
 * Integrated with shared KostSharedDB for high-performance offline search.
 */

// UI Elements
let searchInput = null;
let resultsBodyDesktop = null;
let resultsBodyMobile = null;
let btnScan = null;

// Price Formatting Helper (French style thousands dot separator)
function formatPrice(val) {
    if (val === undefined || val === null || val === '') return '--';
    const clean = String(val).replace(/[\.,\s]/g, '');
    const num = parseFloat(clean);
    if (isNaN(num)) return val;
    return Math.round(num).toString();
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
                    <linearGradient id="polaris-glow" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#00E5FF" />
                        <stop offset="100%" stop-color="#0088FF" />
                    </linearGradient>
                    <filter id="glow-polaris" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.5" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                <rect width="140" height="32" fill="#0A0A0A" />
                <text x="70" y="22" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="15" fill="url(#polaris-glow)" letter-spacing="3" text-anchor="middle" filter="url(#glow-polaris)">POLARIS</text>
                <line x1="15" y1="26" x2="125" y2="26" stroke="#00E5FF" stroke-width="1.5" opacity="0.8" />
                <circle cx="70" cy="26" r="2" fill="#FFFFFF" />
            </svg>`;

        case 'KINETIX':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="kinetix-orange" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#FF3D00" />
                        <stop offset="50%" stop-color="#FF6D00" />
                        <stop offset="100%" stop-color="#FFD600" />
                    </linearGradient>
                </defs>
                <rect width="140" height="32" fill="#0D0D0D" />
                <polygon points="5,4 135,4 130,28 0,28" fill="#1A1A1A" stroke="#333" stroke-width="1"/>
                <text x="65" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-style="italic" font-size="14" fill="url(#kinetix-orange)" letter-spacing="2" text-anchor="middle">KINETIX</text>
            </svg>`;

        case 'TOREX':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="torex-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#00E676" />
                        <stop offset="100%" stop-color="#00B0FF" />
                    </linearGradient>
                </defs>
                <rect width="140" height="32" fill="#0A0A0A" />
                <rect x="5" y="4" width="130" height="24" fill="none" stroke="#FF6D00" stroke-width="1.5" />
                <rect x="8" y="7" width="10" height="18" fill="#FF6D00" />
                <text x="75" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="13" fill="url(#torex-grad)" letter-spacing="3" text-anchor="middle">TOREX</text>
            </svg>`;

        case 'PROSHOT':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="proshot-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#FF1744" />
                        <stop offset="100%" stop-color="#B71C1C" />
                    </linearGradient>
                </defs>
                <rect width="140" height="32" fill="#0A0A0A" />
                <circle cx="20" cy="16" r="9" stroke="#FF1744" stroke-width="1.5" fill="none" />
                <line x1="20" y1="4" x2="20" y2="28" stroke="#FFFFFF" stroke-width="1" />
                <line x1="8" y1="16" x2="32" y2="16" stroke="#FFFFFF" stroke-width="1" />
                <text x="82" y="22" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="14" fill="#FFFFFF" letter-spacing="1" text-anchor="middle">PRO<tspan fill="#FF1744">SHOT</tspan></text>
            </svg>`;

        case 'SEVENTEEN':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="seventeen-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#FFD600" />
                        <stop offset="100%" stop-color="#FF6D00" />
                    </linearGradient>
                </defs>
                <rect width="140" height="32" fill="#1A0F2E" />
                <polygon points="8,4 28,4 23,28 3,28" fill="url(#seventeen-grad)" />
                <text x="15" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="14" fill="#000000" text-anchor="middle">17</text>
                <text x="82" y="21" font-family="'Space Grotesk', sans-serif" font-weight="800" font-size="12" fill="#FFFFFF" letter-spacing="2" text-anchor="middle">SEVENTEEN</text>
            </svg>`;

        case 'BUTIGO':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="butigo-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#FF4081" />
                        <stop offset="100%" stop-color="#FF80AB" />
                    </linearGradient>
                </defs>
                <rect width="140" height="32" fill="#0A0A0A" />
                <line x1="10" y1="16" x2="30" y2="16" stroke="url(#butigo-grad)" stroke-width="2" />
                <circle cx="30" cy="16" r="4" fill="url(#butigo-grad)" />
                <text x="85" y="21" font-family="'Inter', sans-serif" font-weight="600" font-size="13" fill="#FFFFFF" letter-spacing="3" text-anchor="middle">BUTIGO</text>
            </svg>`;

        case 'MISS F':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="gold-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#FFE082" />
                        <stop offset="50%" stop-color="#FFB300" />
                        <stop offset="100%" stop-color="#FF8F00" />
                    </linearGradient>
                </defs>
                <rect width="140" height="32" fill="#0A0A0A" />
                <circle cx="20" cy="16" r="10" stroke="url(#gold-grad)" stroke-width="1.5" fill="none" />
                <text x="20" y="21" font-family="'Georgia', serif" font-style="italic" font-weight="bold" font-size="14" fill="url(#gold-grad)" text-anchor="middle">F</text>
                <text x="80" y="20" font-family="'Space Grotesk', sans-serif" font-weight="600" font-size="12" fill="#FFFFFF" letter-spacing="1.5" text-anchor="middle">MISS <tspan fill="url(#gold-grad)">F</tspan></text>
            </svg>`;

        case 'LUMBERJACK':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="lumber-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#8D6E63" />
                        <stop offset="100%" stop-color="#4E342E" />
                    </linearGradient>
                </defs>
                <rect width="140" height="32" fill="#120A07" />
                <path d="M10 24 L14 8 L18 24 Z M22 8 L22 24 M28 8 L25 16 L28 24" stroke="#8D6E63" stroke-width="1.5" fill="none" />
                <text x="84" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="11" fill="#FFFFFF" letter-spacing="1.5" text-anchor="middle">LUMBERJACK</text>
            </svg>`;

        case 'INCI':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#0A0A0A" />
                <polygon points="20,6 32,16 20,26 8,16" stroke="#ECEFF1" stroke-width="1.5" fill="none" />
                <circle cx="20" cy="16" r="3" fill="#ECEFF1" />
                <text x="80" y="22" font-family="'Georgia', serif" font-style="italic" font-weight="bold" font-size="15" fill="#FFFFFF" letter-spacing="4" text-anchor="middle">İNCI</text>
            </svg>`;

        case 'I COOL':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="ice-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#00E5FF" />
                        <stop offset="100%" stop-color="#00E5FF" stop-opacity="0.2" />
                    </linearGradient>
                </defs>
                <rect width="140" height="32" fill="#001824" />
                <rect x="4" y="4" width="132" height="24" stroke="#00E5FF" stroke-width="1.5" fill="none" />
                <text x="70" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="14" fill="#00E5FF" letter-spacing="4" text-anchor="middle">I COOL</text>
            </svg>`;

        case 'YELLOW KIDS':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#0A0A0A" />
                <rect x="5" y="4" width="130" height="24" fill="#FFD600" />
                <text x="70" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="11" fill="#000000" letter-spacing="1.5" text-anchor="middle">YELLOW KIDS</text>
            </svg>`;

        case 'MICKEY MOUSE':
        case 'MINNIES MOUSE':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#1C1B1F" />
                <circle cx="20" cy="16" r="8" fill="#FF1744" />
                <circle cx="13" cy="10" r="4.5" fill="#000000" />
                <circle cx="27" cy="10" r="4.5" fill="#000000" />
                <text x="82" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="10" fill="#FFFFFF" letter-spacing="1.5" text-anchor="middle">MICKEY MOUSE</text>
            </svg>`;

        case 'FROZEN':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#0A0A0A" />
                <circle cx="70" cy="16" r="14" fill="#00E5FF" opacity="0.1" />
                <text x="70" y="21" font-family="'Georgia', serif" font-weight="bold" font-style="italic" font-size="13" fill="#E0F7FA" letter-spacing="3" text-anchor="middle">FROZEN</text>
            </svg>`;

        case 'SPIDERMAN':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#210000" />
                <path d="M5 16 L135 16 M20 4 L20 28 M120 4 L120 28" stroke="#FF1744" stroke-width="1" />
                <text x="70" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="12" fill="#FFFFFF" letter-spacing="3" text-anchor="middle">SPIDER<tspan fill="#FF1744">MAN</tspan></text>
            </svg>`;

        case 'AVENGERS':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#0A0A0A" />
                <polygon points="5,4 15,4 135,28 125,28" fill="#FF1744" opacity="0.3" />
                <text x="70" y="22" font-family="'Space Grotesk', sans-serif" font-weight="900" font-style="italic" font-size="15" fill="#FFFFFF" letter-spacing="2" text-anchor="middle">AVENGERS</text>
            </svg>`;

        case 'LOTTO':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#D50000" />
                <polygon points="10,4 30,4 20,28 0,28" fill="#FFFFFF" />
                <text x="75" y="22" font-family="'Space Grotesk', sans-serif" font-weight="900" font-style="italic" font-size="16" fill="#FFFFFF" letter-spacing="1" text-anchor="middle">lotto</text>
            </svg>`;

        case 'DOCKERS':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#1A1A1A" />
                <circle cx="20" cy="12" r="3" stroke="#FFD600" stroke-width="1.5" fill="none" />
                <line x1="20" y1="15" x2="20" y2="25" stroke="#FFD600" stroke-width="2" />
                <path d="M12 19 C12 24, 28 24, 28 19" stroke="#FFD600" stroke-width="1.5" fill="none" />
                <text x="80" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="13" fill="#FFFFFF" letter-spacing="2" text-anchor="middle">DOCKERS</text>
            </svg>`;

        case 'U.S. POLO ASSN.':
        case 'US POLO ASSN':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#0D1B2A" />
                <path d="M10 4 L130 4 L125 28 L15 28 Z" fill="#0D1B2A" stroke="#3F8EFC" stroke-width="1.5" />
                <text x="70" y="20" font-family="'Space Grotesk', sans-serif" font-weight="800" font-size="9" fill="#FFFFFF" letter-spacing="1" text-anchor="middle">U.S. POLO ASSN.</text>
            </svg>`;

        case 'BJK GRUP':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#000000" />
                <rect x="5" y="4" width="6" height="24" fill="#FFFFFF" />
                <rect x="15" y="4" width="6" height="24" fill="#FFFFFF" />
                <rect x="25" y="4" width="6" height="24" fill="#FFFFFF" />
                <text x="80" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="13" fill="#FFFFFF" letter-spacing="1" text-anchor="middle">BJK-GRUP</text>
            </svg>`;

        case 'FORESTER':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#1A2E1A" />
                <polygon points="5,28 70,4 135,28" fill="#2E7D32" opacity="0.3" />
                <text x="70" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="13" fill="#FFFFFF" letter-spacing="3" text-anchor="middle">FORESTER</text>
            </svg>`;

        case 'WINX':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="winx-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#E91E63" />
                        <stop offset="100%" stop-color="#9C27B0" />
                    </linearGradient>
                </defs>
                <rect width="140" height="32" fill="#0A0A0A" />
                <text x="70" y="22" font-family="'Space Grotesk', sans-serif" font-style="italic" font-weight="900" font-size="16" fill="url(#winx-grad)" letter-spacing="4" text-anchor="middle">WINX</text>
            </svg>`;

        case 'LOL':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="lol-shadow">
                        <feDropShadow dx="2" dy="2" stdDeviation="0" flood-color="#EC4899" />
                    </filter>
                </defs>
                <rect width="140" height="32" fill="#0A0A0A" />
                <text x="70" y="22" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="18" fill="#FFFFFF" letter-spacing="3" text-anchor="middle" filter="url(#lol-shadow)">LOL</text>
            </svg>`;

        case 'DOWN TOWN':
        case 'DOWNTOWN':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#0A0A0A" />
                <line x1="5" y1="26" x2="135" y2="26" stroke="#4F46E5" stroke-width="2" />
                <text x="70" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="13" fill="#FFFFFF" letter-spacing="2" text-anchor="middle">DOWN <tspan fill="#818CF8">TOWN</tspan></text>
            </svg>`;

        case 'PANAMA CLUB':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="panama-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#FF6D00" />
                        <stop offset="100%" stop-color="#FF4081" />
                    </linearGradient>
                </defs>
                <rect width="140" height="32" fill="#0A0A0A" />
                <circle cx="70" cy="16" r="14" fill="url(#panama-grad)" opacity="0.8" />
                <text x="70" y="20" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="10" fill="#000000" letter-spacing="1" text-anchor="middle">PANAMA CLUB</text>
            </svg>`;

        case 'TRAVEL SOFT':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#0A1C24" />
                <path d="M10 26 C40 10, 100 10, 130 26" stroke="#00E5FF" stroke-width="1.5" fill="none" />
                <text x="70" y="21" font-family="'Space Grotesk', sans-serif" font-weight="600" font-size="11" fill="#FFFFFF" letter-spacing="2" text-anchor="middle">TRAVEL <tspan fill="#00E5FF" font-weight="900">SOFT</tspan></text>
            </svg>`;

        case 'FLEXALL CFA':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#2E1700" />
                <rect x="5" y="4" width="130" height="24" stroke="#FF6D00" stroke-width="1.5" fill="none" />
                <text x="70" y="20" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="10" fill="#FFFFFF" letter-spacing="2" text-anchor="middle">FLEXALL <tspan fill="#FF6D00">CFA</tspan></text>
            </svg>`;

        case 'SALVANO':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="salvano-grad" x1="0%" y1="0%" x2="100%" y2="100%">
                        <stop offset="0%" stop-color="#FFD54F" />
                        <stop offset="100%" stop-color="#FF8F00" />
                    </linearGradient>
                </defs>
                <rect width="140" height="32" fill="#0A0A0A" />
                <rect x="4" y="4" width="132" height="24" stroke="url(#salvano-grad)" stroke-width="1.5" fill="none" />
                <text x="70" y="21" font-family="'Georgia', serif" font-weight="bold" font-size="13" fill="url(#salvano-grad)" letter-spacing="3" text-anchor="middle">SALVANO</text>
            </svg>`;

        case 'OXIDE':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#0A0A0A" />
                <polygon points="10,4 130,4 125,28 15,28" stroke="#CCFF00" stroke-width="1.5" fill="none" />
                <text x="70" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="13" fill="#CCFF00" letter-spacing="3" text-anchor="middle">OXIDE</text>
            </svg>`;

        case 'GARAMOND':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#1A1A1A" />
                <text x="70" y="21" font-family="'Georgia', serif" font-weight="bold" font-size="13" fill="#FFFFFF" letter-spacing="4" text-anchor="middle">GARAMOND</text>
            </svg>`;

        case 'BALLOON S':
        case 'BALLOONS':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#0A0A0A" />
                <ellipse cx="20" cy="16" rx="9" ry="11" fill="#FF1744" />
                <text x="80" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="12" fill="#FFFFFF" letter-spacing="2" text-anchor="middle">BALLOON S</text>
            </svg>`;

        case 'ART BELLA':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <linearGradient id="bella-grad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stop-color="#FF4081" />
                        <stop offset="100%" stop-color="#F50057" />
                    </linearGradient>
                </defs>
                <rect width="140" height="32" fill="#0A0A0A" />
                <rect x="5" y="4" width="130" height="24" stroke="url(#bella-grad)" stroke-width="1.5" fill="none" />
                <text x="70" y="21" font-family="'Georgia', serif" font-style="italic" font-weight="bold" font-size="13" fill="#FFFFFF" letter-spacing="2" text-anchor="middle">Art Bella</text>
            </svg>`;

        case 'JJ STILLER':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#263238" />
                <rect x="5" y="4" width="130" height="24" stroke="#78909C" stroke-width="1.5" fill="none" />
                <text x="70" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="12" fill="#FFFFFF" letter-spacing="2" text-anchor="middle">JJ STILLER</text>
            </svg>`;

        case 'FLOGART':
            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <rect width="140" height="32" fill="#0A0A0A" />
                <circle cx="70" cy="16" r="12" stroke="#2979FF" stroke-width="2" fill="none" />
                <text x="70" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="11" fill="#FFFFFF" letter-spacing="2" text-anchor="middle">FLOGART</text>
            </svg>`;

        default:
            // Custom HSL gradient badge monogram fallback for generic/minor brands
            const cleanName = cleanBrand.replace(/[^A-Z0-9\s]/g, '').trim();
            // Create a deterministic hash from the brand name
            let hash = 0;
            for (let i = 0; i < matchBrand.length; i++) {
                hash = matchBrand.charCodeAt(i) + ((hash << 5) - hash);
            }
            const hue = Math.abs(hash) % 360;
            const textCol = `hsl(${hue}, 100%, 65%)`;
            const displayBrand = cleanName.substring(0, 15);

            return `
            <svg viewBox="0 0 140 32" class="h-7 w-auto select-none" xmlns="http://www.w3.org/2000/svg">
                <defs>
                    <filter id="fallback-glow-${hue}" x="-20%" y="-20%" width="140%" height="140%">
                        <feGaussianBlur stdDeviation="1.2" result="blur" />
                        <feComposite in="SourceGraphic" in2="blur" operator="over" />
                    </filter>
                </defs>
                <rect width="140" height="32" fill="#0A0A0A" />
                <text x="70" y="21" font-family="'Space Grotesk', sans-serif" font-weight="900" font-size="12" fill="${textCol}" letter-spacing="1.5" text-anchor="middle" filter="url(#fallback-glow-${hue})">${displayBrand}</text>
            </svg>`;
    }
}

// Modal state variables
let currentPrintJob = null;

// Global Print Action Handler (exposed to window for inline onclick attributes)
window.handlePrintArticle = function(btn, gencod, ref, color, size, brand, price) {
    if (!btn) return;
    
    const formattedRef = String(ref || "").trim().toUpperCase();
    const formattedPrice = formatPrice(price) + " DA";
    
    // Set modal content
    const previewPrice = document.getElementById('preview-price');
    const previewRef = document.getElementById('preview-ref');
    const qtyInput = document.getElementById('print-qty-input');
    
    if (previewPrice) previewPrice.textContent = formattedPrice;
    if (previewRef) previewRef.textContent = formattedRef;
    if (qtyInput) qtyInput.value = "1";
    
    // Store current job context
    currentPrintJob = {
        btn, gencod, ref: formattedRef, color, size, brand, formattedPrice
    };
    
    // Show modal
    const modal = document.getElementById('print-modal');
    const content = document.getElementById('print-modal-content');
    if (modal && content) {
        modal.classList.remove('hidden');
        // Small delay to allow display:flex to apply before transition
        requestAnimationFrame(() => {
            modal.classList.remove('opacity-0');
            content.classList.remove('scale-95');
            content.classList.add('scale-100');
        });
    }
};

function closePrintModal() {
    const modal = document.getElementById('print-modal');
    const content = document.getElementById('print-modal-content');
    if (modal && content) {
        modal.classList.add('opacity-0');
        content.classList.remove('scale-100');
        content.classList.add('scale-95');
        setTimeout(() => {
            modal.classList.add('hidden');
        }, 300);
    }
    currentPrintJob = null;
}


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
let searchTimeout = null;

function debouncedSearch() {
    if (searchTimeout) {
        clearTimeout(searchTimeout);
    }
    searchTimeout = setTimeout(() => {
        performSearch(false);
    }, 150);
}

async function performSearch(force = false) {
    if (!searchInput) {
        console.error('[Flo UI] performSearch failed: searchInput is not initialized');
        return;
    }
    const query = searchInput.value.trim();
    console.log(`[Flo UI] performSearch called. Query: "${query}", Force: ${force}`);
    
    if (!query) {
        console.log('[Flo UI] Empty query. Clearing results.');
        if (resultsBodyMobile) resultsBodyMobile.innerHTML = '';
        if (resultsBodyDesktop) resultsBodyDesktop.innerHTML = '';
        return;
    }

    // Bypass length check if query is purely numeric (barcode) or if search is forced (e.g. Enter, camera scan)
    const isNumeric = /^\d+$/.test(query);
    if (!force && !isNumeric && query.length < 3) {
        console.log('[Flo UI] Alphanumeric query too short (< 3 chars) and not forced. Bypassing search.');
        return;
    }

    try {
        console.log(`[Flo UI] Querying database for: "${query}" (isNumeric: ${isNumeric})`);
        // Use shared search engine
        const results = await searchArticles(query);
        console.log(`[Flo UI] Database returned ${results.length} results.`);
        renderResults(results);
    } catch (error) {
        console.error('[Flo Search] Error during performSearch:', error);
    }
}

// Render Results (Lazy Display matching flo_screen.html markup)
function renderResults(results) {
    console.log('[Flo UI] Rendering results:', results);
    if (!resultsBodyMobile) {
        console.error('[Flo UI] renderResults failed: resultsBodyMobile is not initialized');
        return;
    }
    if (results.length === 0) {
        console.log('[Flo UI] No results found. Displaying AUCUN_RESULTAT_TROUVE.');
        
        const noResultMobile = `
        <div class="col-span-full text-center py-16 text-slate-500 font-bold uppercase tracking-widest border border-dashed border-outline bg-surface flex flex-col items-center justify-center gap-3">
            <span>AUCUN_RESULTAT_TROUVE</span>
            <div id="search-db-empty-warning" class="hidden text-xs text-red-500 font-heading font-medium mt-2 max-w-md bg-red-950/20 border border-red-900/30 px-4 py-2 rounded">
                AVERTISSEMENT : La base de données locale est vide. Ouvrez le menu de gauche et lancez une synchronisation (Nouvelle Sync).
            </div>
        </div>`;
        resultsBodyMobile.innerHTML = noResultMobile;
        if (resultsBodyDesktop) resultsBodyDesktop.innerHTML = '';
        
        // Asynchronously check if the DB is empty to display a warning
        if (typeof db !== 'undefined' && db.catalogue_articles) {
            db.catalogue_articles.count().then(count => {
                const warningEl = document.getElementById('search-db-empty-warning');
                if (count === 0 && warningEl) {
                    warningEl.classList.remove('hidden');
                }
            }).catch(err => console.error('[Flo UI] Error counting articles:', err));
        }
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
        const activePrice = price.reduit ? price.reduit : price.tarif;
        
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
            
            <button onclick="handlePrintArticle(this, '${item.gencod}', '${formattedRef}', '${couleur}', '${taille}', '${brand}', '${activePrice}')" class="w-full bg-primary-container text-on-primary-container py-6 font-label-caps text-label-caps font-black uppercase hover:bg-white hover:text-black transition-colors flex items-center justify-center gap-2">
                <i data-lucide="printer" class="w-5 h-5"></i>
                IMPRIMER
            </button>
        </section>
        `;
    }).join('');

    if (window.lucide) lucide.createIcons();
}

// Event Listeners are registered inside DOMContentLoaded to ensure UI elements are fully loaded.

// Barcode Scanner Integration with html5-qrcode
let html5QrCode = null;
let scannerCameras = [];
let currentCameraIndex = 0;

async function startScanner() {
    const scannerModal = document.getElementById('scanner-modal');
    if (!scannerModal) return;

    scannerModal.classList.remove('hidden');
    scannerModal.classList.add('flex');
    
    const statusEl = document.getElementById('scanner-status');
    if (statusEl) statusEl.textContent = 'INITIALIZING_CAMERA...';
    
    try {
        if (!html5QrCode) {
            // Instantiate with scanner-reader and restrict formats to 1D barcodes for huge performance gain
            html5QrCode = new Html5Qrcode("scanner-reader", {
                formatsToSupport: [
                    Html5QrcodeSupportedFormats.EAN_13,
                    Html5QrcodeSupportedFormats.EAN_8,
                    Html5QrcodeSupportedFormats.CODE_128
                ],
                verbose: false
            });
        }
        
        const qrCodeSuccessCallback = (decodedText, decodedResult) => {
            console.log(`[Flo Scanner] Success: ${decodedText}`, decodedResult);
            
            // Populate search and query database
            if (searchInput) {
                searchInput.value = decodedText;
                performSearch(true);
            }
            
            showToast(`SCANNED_CODE_${decodedText}`, 'success');
            stopScanner();
        };
        
        const config = {
            fps: 24, // Scan rate (24 FPS)
            qrbox: (width, height) => {
                // Returns scan window dimensions optimized for linear barcodes
                return {
                    width: Math.min(width * 0.9, 360),
                    height: Math.min(height * 0.4, 150)
                };
            },
            aspectRatio: 1.777778, // 16:9 aspect ratio helps activate the high-res back camera
            videoConstraints: {
                // Request higher resolution (1080p ideal, 720p fallback) for better barcode definition
                width: { min: 640, ideal: 1280, max: 1920 },
                height: { min: 480, ideal: 720, max: 1080 }
            },
            useBarCodeDetectorIfSupported: true, // Native barcode API acceleration
            experimentalFeatures: {
                useBarCodeDetectorIfSupported: true
            }
        };

        // Try to enumerate cameras to handle multi-camera iOS devices
        try {
            scannerCameras = await Html5Qrcode.getCameras();
        } catch (camErr) {
            console.warn('[Flo Scanner] Could not list cameras:', camErr);
            scannerCameras = [];
        }

        // Configure toggle camera button if multiple cameras are available
        const toggleBtn = document.getElementById('btn-toggle-camera');
        if (toggleBtn) {
            if (scannerCameras.length > 1) {
                toggleBtn.classList.remove('hidden');
                // Recreate element to purge old event listeners
                toggleBtn.replaceWith(toggleBtn.cloneNode(true));
                const newToggleBtn = document.getElementById('btn-toggle-camera');
                if (window.lucide) window.lucide.createIcons(); // Initialize the icon in the cloned button
                
                newToggleBtn.addEventListener('click', async () => {
                    if (!html5QrCode || !html5QrCode.isScanning) return;
                    currentCameraIndex = (currentCameraIndex + 1) % scannerCameras.length;
                    if (statusEl) statusEl.textContent = 'CHANGING_CAMERA...';
                    try {
                        await html5QrCode.stop();
                        const nextCameraId = scannerCameras[currentCameraIndex].id;
                        await html5QrCode.start(
                            nextCameraId,
                            config,
                            qrCodeSuccessCallback
                        );
                        if (statusEl) statusEl.textContent = 'ACTIVE_READY';
                        // Apply slight delay then focus constraint
                        setTimeout(applyFocusConstraint, 1000);
                    } catch (err) {
                        console.error('[Flo Scanner] Camera toggle error:', err);
                        if (statusEl) statusEl.textContent = 'ERROR_TOGGLE_FAILED';
                    }
                });
            } else {
                toggleBtn.classList.add('hidden');
            }
        }

        // Start scanning
        if (scannerCameras.length > 0) {
            // Find the main back camera (excluding ultra-wide, telephoto, virtual, dual, triple lenses)
            currentCameraIndex = -1;
            for (let i = 0; i < scannerCameras.length; i++) {
                const label = (scannerCameras[i].label || "").toLowerCase();
                const isBack = label.includes('back') || label.includes('arrière') || label.includes('rear') || label.includes('environment') || label.includes('standard');
                const isSpecialLens = label.includes('ultra') || label.includes('tele') || label.includes('télé') || label.includes('zoom') || label.includes('virtual') || label.includes('dual') || label.includes('triple') || label.includes('macro');
                
                if (isBack && !isSpecialLens) {
                    currentCameraIndex = i;
                    break;
                }
            }
            // Fallback: if no camera matches the strict main back camera criteria, just find any back camera
            if (currentCameraIndex === -1) {
                for (let i = 0; i < scannerCameras.length; i++) {
                    const label = (scannerCameras[i].label || "").toLowerCase();
                    if (label.includes('back') || label.includes('arrière') || label.includes('rear') || label.includes('environment')) {
                        currentCameraIndex = i;
                        break;
                    }
                }
            }
            // Second fallback: if still not found, just use the first camera in the list
            if (currentCameraIndex === -1) {
                currentCameraIndex = 0;
            }
            
            const defaultCameraId = scannerCameras[currentCameraIndex].id;
            await html5QrCode.start(
                defaultCameraId,
                config,
                qrCodeSuccessCallback
            );
        } else {
            // Fallback to standard environment facingMode if list is empty
            await html5QrCode.start(
                { facingMode: "environment" },
                config,
                qrCodeSuccessCallback
            );
        }
        
        if (statusEl) statusEl.textContent = 'ACTIVE_READY';

        // Apply continuous autofocus and zoom after start (with delay to ensure track is active)
        async function applyFocusConstraint() {
            try {
                if (html5QrCode && html5QrCode.isScanning) {
                    await html5QrCode.applyVideoConstraints({
                        focusMode: "continuous"
                    });
                    console.log('[Flo Scanner] Applied focusMode continuous constraint.');
                }
            } catch (err) {
                console.warn('[Flo Scanner] Could not set focusMode continuous:', err);
            }
        }

        setTimeout(applyFocusConstraint, 1500);
        
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
    console.log('[Flo UI] DOMContentLoaded fired. Initializing elements and event listeners...');
    
    // Resolve UI Elements
    searchInput = document.getElementById('search-input');
    resultsBodyDesktop = document.getElementById('results-body-desktop');
    resultsBodyMobile = document.getElementById('results-body-mobile');
    btnScan = document.getElementById('btn-scan');

    console.log('[Flo UI] Element resolution status:', {
        searchInput: !!searchInput,
        resultsBodyDesktop: !!resultsBodyDesktop,
        resultsBodyMobile: !!resultsBodyMobile,
        btnScan: !!btnScan
    });

    // Clear results on load
    if (resultsBodyMobile) resultsBodyMobile.innerHTML = '';
    if (resultsBodyDesktop) resultsBodyDesktop.innerHTML = '';
    
    // Bind Search Input Events
    if (searchInput) {
        searchInput.addEventListener('input', () => {
            console.log('[Flo UI] Search Input "input" event fired.');
            debouncedSearch();
        });
        searchInput.addEventListener('change', () => {
            console.log('[Flo UI] Search Input "change" event fired.');
            if (searchTimeout) clearTimeout(searchTimeout);
            performSearch(true);
        });
        searchInput.addEventListener('paste', () => {
            console.log('[Flo UI] Search Input "paste" event fired.');
            if (searchTimeout) clearTimeout(searchTimeout);
            setTimeout(() => performSearch(true), 50);
        });
        searchInput.addEventListener('keydown', (e) => {
            if (e.key === 'Enter') {
                console.log('[Flo UI] Search Input "Enter" key pressed.');
                e.preventDefault();
                if (searchTimeout) clearTimeout(searchTimeout);
                performSearch(true);
                e.target.blur();
            }
        });
    } else {
        console.error('[Flo UI] CRITICAL: search-input element not found in DOM!');
    }

    // Bind Scanner Buttons
    if (btnScan) {
        btnScan.addEventListener('click', (e) => {
            e.preventDefault();
            console.log('[Flo UI] Scan button clicked.');
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
    
    // Setup Print Modal Events
    const btnClosePrintModal = document.getElementById('btn-close-print-modal');
    const btnCancelPrint = document.getElementById('btn-cancel-print');
    const btnConfirmPrint = document.getElementById('btn-confirm-print');
    const btnQtyMinus = document.getElementById('btn-qty-minus');
    const btnQtyPlus = document.getElementById('btn-qty-plus');
    const qtyInput = document.getElementById('print-qty-input');
    const printModal = document.getElementById('print-modal');

    if (btnClosePrintModal) btnClosePrintModal.addEventListener('click', closePrintModal);
    if (btnCancelPrint) btnCancelPrint.addEventListener('click', closePrintModal);
    
    if (btnQtyMinus && qtyInput) {
        btnQtyMinus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            if (val > 1) qtyInput.value = val - 1;
        });
    }
    
    if (btnQtyPlus && qtyInput) {
        btnQtyPlus.addEventListener('click', () => {
            let val = parseInt(qtyInput.value) || 1;
            if (val < 99) qtyInput.value = val + 1;
        });
    }
    
    if (btnConfirmPrint) {
        btnConfirmPrint.addEventListener('click', async () => {
            if (!currentPrintJob) return;
            
            const quantity = parseInt(qtyInput.value, 10);
            if (isNaN(quantity) || quantity <= 0) {
                showToast("QUANTITÉ INVALIDE", "error");
                return;
            }
            
            const { btn, gencod, ref, formattedPrice } = currentPrintJob;
            
            // Close modal immediately
            closePrintModal();
            
            console.log(`[Flo UI] Printing article: Gencod: ${gencod}, Ref: ${ref}, Price: ${formattedPrice}, Qty: ${quantity}`);
            
            const originalContent = btn.innerHTML;
            btn.disabled = true;
            btn.innerHTML = `<svg class="animate-spin -ml-1 mr-2 h-4 w-4 text-white inline-block" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg> ENVOI...`;
            
            try {
                const res = await fetch(`${window.SUPABASE_URL}/rest/v1/print_queue_flo`, {
                    method: 'POST',
                    headers: {
                        'apikey': window.SUPABASE_KEY,
                        'Authorization': `Bearer ${window.SUPABASE_KEY}`,
                        'Content-Type': 'application/json',
                        'Prefer': 'return=minimal'
                    },
                    body: JSON.stringify({
                        price: formattedPrice,
                        reference: ref,
                        quantity: quantity,
                        status: 'pending'
                    })
                });
                
                if (!res.ok) throw new Error(`Status: ${res.status}`);
                
                showToast(`${quantity} TICKET(S) ENVOYÉ(S) : ${ref}`, 'success');
            } catch (err) {
                console.error('[Flo UI] Print error:', err);
                showToast('ÉCHEC DE L\'ENVOI D\'IMPRESSION', 'error');
            } finally {
                btn.disabled = false;
                btn.innerHTML = originalContent;
            }
        });
    }
    
    // Close modal on click outside
    if (printModal) {
        printModal.addEventListener('click', (e) => {
            if (e.target === printModal) {
                closePrintModal();
            }
        });
    }
    
    updateLocalCountBadge();
    setInterval(updateLocalCountBadge, 5000);
    
    console.log('[Flo UI] Initialized with shared database and camera barcode scanner.');
});

async function updateLocalCountBadge() {
    const badge = document.getElementById('local-db-count-badge');
    if (!badge) return;
    try {
        if (typeof db !== 'undefined' && db.catalogue_articles) {
            const count = await db.catalogue_articles.count();
            if (count > 0) {
                badge.textContent = `${count.toLocaleString()} articles chargés`;
                badge.className = "text-[11px] text-green-400 font-bold uppercase tracking-wider bg-green-950/20 px-3 py-1 rounded border border-green-500/20";
            } else {
                badge.textContent = "Base vide - Veuillez synchroniser";
                badge.className = "text-[11px] text-red-400 font-bold uppercase tracking-wider bg-red-950/20 px-3 py-1 rounded border border-red-500/20";
            }
        } else {
            badge.textContent = "Base de données indisponible";
            badge.className = "text-[11px] text-yellow-400 font-bold uppercase tracking-wider bg-yellow-950/20 px-3 py-1 rounded border border-yellow-500/20";
        }
    } catch (err) {
        console.error('[Flo UI] Failed to count database articles:', err);
        badge.textContent = "Erreur de base de données";
        badge.className = "text-[11px] text-red-500 font-bold uppercase tracking-wider bg-red-950/30 px-3 py-1 rounded border border-red-500/40";
    }
}

