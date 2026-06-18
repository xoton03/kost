// 3D Perspective Grid Background Animation
window.initBg3D = function() {
    let animationId;
    const canvas = document.createElement('canvas');
    canvas.id = 'bg-canvas';
    document.body.insertBefore(canvas, document.body.firstChild);
    const ctx = canvas.getContext('2d');

    const BG_COLOR  = '#0A0A0A';
    const GRID_COLOR = '59, 130, 246'; // #3B82F6 blue in RGB

    // Vanishing-point target (follows mouse on desktop)
    let targetVpX = 0.5, targetVpY = 0.42;
    let currentVpX = 0.5, currentVpY = 0.42;

    const isTouchDevice = ('ontouchstart' in window) || (navigator.maxTouchPoints > 0);

    if (!isTouchDevice) {
        document.addEventListener('mousemove', (e) => {
            // Map mouse to a narrow range around center for subtle parallax
            targetVpX = 0.38 + (e.clientX / window.innerWidth) * 0.24;
            targetVpY = 0.35 + (e.clientY / window.innerHeight) * 0.14;
        });
    }

    let W, H;
    function resize() {
        W = canvas.width  = window.innerWidth;
        H = canvas.height = window.innerHeight;
    }
    resize();
    window.addEventListener('resize', resize);

    const COLS = 14;   // vertical fan lines
    const ROWS = 10;   // horizontal floor lines
    const SPEED = 0.25; // px per frame for floor animation
    let floorOffset = 0;

    function draw() {
        // Smooth VP tracking
        currentVpX += (targetVpX - currentVpX) * 0.04;
        currentVpY += (targetVpY - currentVpY) * 0.04;

        const vpX = W * currentVpX;
        const vpY = H * currentVpY;

        // Fill background
        ctx.fillStyle = BG_COLOR;
        ctx.fillRect(0, 0, W, H);

        // Animate floor offset
        floorOffset = (floorOffset + SPEED) % (H / ROWS);

        // --- Draw radial fan lines (vertical perspective) ---
        for (let i = 0; i <= COLS; i++) {
            const t = i / COLS;
            const startX = t * W;
            // Lines near center edges are brighter
            const edgeness = Math.abs(t - 0.5) * 2; // 0=center, 1=edge
            const alpha = 0.018 + edgeness * 0.022;
            ctx.beginPath();
            ctx.moveTo(vpX, vpY);
            ctx.lineTo(startX, H);
            ctx.strokeStyle = `rgba(${GRID_COLOR}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
        }

        // --- Draw receding horizontal floor lines ---
        for (let i = 0; i <= ROWS + 1; i++) {
            // Perspective: lines compress toward VP (power curve)
            const progress = i / ROWS;
            const perspY = vpY + (H - vpY) * Math.pow(progress, 0.55) + floorOffset * Math.pow(progress, 0.55);
            if (perspY > H || perspY < vpY) continue;

            // Horizontal spread at this depth
            const perspT = Math.min(1, (perspY - vpY) / (H - vpY));
            const xLeft  = vpX + (0 - vpX) * perspT;
            const xRight = vpX + (W - vpX) * perspT;

            const alpha = perspT * 0.055;
            ctx.beginPath();
            ctx.moveTo(xLeft, perspY);
            ctx.lineTo(xRight, perspY);
            ctx.strokeStyle = `rgba(${GRID_COLOR}, ${alpha})`;
            ctx.lineWidth = 0.6;
            ctx.stroke();
        }

        // Subtle radial vignette to fade edges gracefully
        const vignette = ctx.createRadialGradient(vpX, vpY, 0, vpX, vpY, Math.max(W, H) * 0.9);
        vignette.addColorStop(0, 'rgba(10,10,10,0)');
        vignette.addColorStop(1, 'rgba(10,10,10,0.55)');
        ctx.fillStyle = vignette;
        ctx.fillRect(0, 0, W, H);

        animationId = requestAnimationFrame(draw);
    }

    document.addEventListener('visibilitychange', () => {
        if (document.hidden) {
            cancelAnimationFrame(animationId);
        } else {
            animationId = requestAnimationFrame(draw);
        }
    });

    draw();
};

// Barcode Waiting Animated Placeholder
window.initBarcodeWaiting = function() {
    const barcodeInput = document.getElementById('barcode');
    const dots = ['', '.', '..', '...'];
    let step = 0;
    setInterval(() => {
        if (barcodeInput && !barcodeInput.value && document.activeElement !== barcodeInput) {
            barcodeInput.placeholder = 'WAITING' + dots[step];
            step = (step + 1) % dots.length;
        }
    }, 500);
};
