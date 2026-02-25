import { useEffect, useRef } from "react";

function LiquidEther({
    mouseForce = 20,
    cursorSize = 100,
    isViscous = false,
    viscous = 30,
    colors = ["#ffffff", "#f5a623", "#f7c948", "#de9645"],
    autoDemo = true,
    autoSpeed = 0.5,
    autoIntensity = 3.1,
    isBounce = false,
    resolution = 0.5
}) {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });

        let animationFrameId;
        let width, height;

        // Grid parameters
        let cols, rows;
        const spacing = 15; // Grid spacing
        let grid = [];

        // Interaction state
        let mouse = { x: -1000, y: -1000, vx: 0, vy: 0, isDown: false };
        let lastMouse = { x: -1000, y: -1000 };

        // Auto demo state
        let demoTime = 0;

        const rgbColors = colors.map(hex => {
            const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
            return result ? {
                r: parseInt(result[1], 16),
                g: parseInt(result[2], 16),
                b: parseInt(result[3], 16)
            } : { r: 255, g: 255, b: 255 };
        });

        const initGrid = () => {
            cols = Math.floor(width / spacing) + 1;
            rows = Math.floor(height / spacing) + 1;
            grid = new Array(cols * rows);

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    grid[i + j * cols] = {
                        x: i * spacing,
                        y: j * spacing,
                        vx: 0,
                        vy: 0,
                        density: 0,
                        colorIndex: Math.floor(Math.random() * colors.length)
                    };
                }
            }
        };

        const resize = () => {
            // Use parent dimensions if available, else window
            const parent = canvas.parentElement;
            width = canvas.width = parent ? parent.clientWidth * resolution : window.innerWidth * resolution;
            height = canvas.height = parent ? parent.clientHeight * resolution : window.innerHeight * resolution;

            // Scale canvas CSS size to 100% to match physical size vs resolution
            canvas.style.width = '100%';
            canvas.style.height = '100%';

            initGrid();
        };

        const applyForce = (x, y, dx, dy, radius, force) => {
            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const cell = grid[i + j * cols];

                    const distSq = (cell.x - x) ** 2 + (cell.y - y) ** 2;
                    const radiusSq = radius ** 2;

                    if (distSq < radiusSq) {
                        const effect = 1 - Math.sqrt(distSq) / radius;
                        cell.vx += dx * effect * force;
                        cell.vy += dy * effect * force;
                        cell.density = Math.min(1, cell.density + effect * 0.5);
                    }
                }
            }
        };

        const updateGrid = () => {
            // Very basic pseudo-fluid simulation
            const newGrid = new Array(grid.length);
            const dampening = isViscous ? (1 - viscous / 1000) : 0.95;

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const idx = i + j * cols;
                    const cell = grid[idx];

                    // Apply velocity
                    cell.x += cell.vx;
                    cell.y += cell.vy;

                    // Dampen
                    cell.vx *= dampening;
                    cell.vy *= dampening;
                    cell.density *= dampening * 0.98;

                    // Return to home position
                    const homeX = i * spacing;
                    const homeY = j * spacing;

                    const dx = homeX - cell.x;
                    const dy = homeY - cell.y;

                    cell.vx += dx * 0.05;
                    cell.vy += dy * 0.05;

                    // Boundary bounce
                    if (isBounce) {
                        if (cell.x < 0 || cell.x > width) cell.vx *= -1;
                        if (cell.y < 0 || cell.y > height) cell.vy *= -1;
                    }
                }
            }
        };

        const drawGrid = () => {
            ctx.clearRect(0, 0, width, height);
            ctx.globalCompositeOperation = 'screen';

            for (let i = 0; i < cols; i++) {
                for (let j = 0; j < rows; j++) {
                    const cell = grid[i + j * cols];
                    if (cell.density < 0.01) continue;

                    const size = cell.density * spacing * 3;
                    const color = rgbColors[cell.colorIndex];

                    ctx.beginPath();
                    ctx.arc(cell.x, cell.y, size, 0, Math.PI * 2);

                    const gradient = ctx.createRadialGradient(
                        cell.x, cell.y, 0,
                        cell.x, cell.y, size
                    );

                    gradient.addColorStop(0, `rgba(${color.r}, ${color.g}, ${color.b}, ${cell.density})`);
                    gradient.addColorStop(1, `rgba(${color.r}, ${color.g}, ${color.b}, 0)`);

                    ctx.fillStyle = gradient;
                    ctx.fill();
                }
            }
        };

        const animate = () => {
            if (autoDemo && !mouse.isDown) {
                demoTime += autoSpeed * 0.05;
                const cx = width / 2;
                const cy = height / 2;

                const px = cx + Math.cos(demoTime) * (width * 0.3) * Math.sin(demoTime * 0.5);
                const py = cy + Math.sin(demoTime * 1.3) * (height * 0.3);

                const pdx = -Math.sin(demoTime) * autoIntensity;
                const pdy = Math.cos(demoTime * 1.3) * autoIntensity;

                applyForce(px, py, pdx, pdy, cursorSize * resolution, mouseForce * 0.1);
            }

            if (mouse.isDown || (mouse.vx !== 0 || mouse.vy !== 0)) {
                applyForce(mouse.x * resolution, mouse.y * resolution, mouse.vx * resolution, mouse.vy * resolution, cursorSize * resolution, mouseForce * 0.2);
                // decay mouse velocity manually so it doesn't spin forever when still
                mouse.vx *= 0.5;
                mouse.vy *= 0.5;
            }

            updateGrid();
            drawGrid();

            animationFrameId = requestAnimationFrame(animate);
        };

        // Event Listeners
        const handleMouseMove = (e) => {
            const rect = canvas.getBoundingClientRect();
            const nx = e.clientX - rect.left;
            const ny = e.clientY - rect.top;

            mouse.vx = nx - lastMouse.x;
            mouse.vy = ny - lastMouse.y;

            mouse.x = nx;
            mouse.y = ny;

            lastMouse.x = nx;
            lastMouse.y = ny;
        };

        const handleTouchMove = (e) => {
            e.preventDefault();
            const rect = canvas.getBoundingClientRect();
            const touch = e.touches[0];
            const nx = touch.clientX - rect.left;
            const ny = touch.clientY - rect.top;

            mouse.vx = nx - lastMouse.x;
            mouse.vy = ny - lastMouse.y;
            mouse.x = nx;
            mouse.y = ny;
            lastMouse.x = nx;
            lastMouse.y = ny;
            mouse.isDown = true;
        };

        // Global mouse tracking so it works over the UI
        window.addEventListener("mousemove", handleMouseMove);
        canvas.addEventListener("touchmove", handleTouchMove, { passive: false });

        window.addEventListener("mousedown", () => mouse.isDown = true);
        window.addEventListener("mouseup", () => mouse.isDown = false);
        canvas.addEventListener("touchstart", () => mouse.isDown = true);
        canvas.addEventListener("touchend", () => mouse.isDown = false);

        window.addEventListener("resize", resize);

        // Init
        resize();
        animate();

        return () => {
            window.removeEventListener("resize", resize);
            window.removeEventListener("mousemove", handleMouseMove);
            canvas.removeEventListener("touchmove", handleTouchMove);
            window.removeEventListener("mousedown", () => mouse.isDown = true);
            window.removeEventListener("mouseup", () => mouse.isDown = false);
            cancelAnimationFrame(animationFrameId);
        };
    }, [mouseForce, cursorSize, isViscous, viscous, colors, autoDemo, autoSpeed, autoIntensity, isBounce, resolution]);

    return <canvas ref={canvasRef} style={{ display: 'block' }} />;
}

export default LiquidEther;
