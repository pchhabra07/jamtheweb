import React, { useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Target, Hexagon, ShieldAlert } from 'lucide-react';
import './Landing.css';

function Landing() {
    const canvasRef = useRef(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');

        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
            draw();
        };

        const drawHexagon = (x, y, size, strokeColor, fillColor) => {
            ctx.beginPath();
            for (let i = 0; i < 6; i++) {
                const angle = (Math.PI / 3) * i;
                const hx = x + size * Math.cos(angle);
                const hy = y + size * Math.sin(angle);
                if (i === 0) {
                    ctx.moveTo(hx, hy);
                } else {
                    ctx.lineTo(hx, hy);
                }
            }
            ctx.closePath();

            if (fillColor) {
                ctx.fillStyle = fillColor;
                ctx.fill();
            }

            if (strokeColor) {
                ctx.strokeStyle = strokeColor;
                ctx.lineWidth = 1;
                ctx.stroke();
            }
        };

        // Use a time value for simple animation
        let time = 0;

        const draw = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Deep dark background
            ctx.fillStyle = '#111111';
            ctx.fillRect(0, 0, canvas.width, canvas.height);

            const hexSize = 40;
            const hexWidth = Math.sqrt(3) * hexSize;
            const hexHeight = 2 * hexSize;

            const cols = Math.ceil(canvas.width / hexWidth) + 1;
            const rows = Math.ceil(canvas.height / (hexHeight * 0.75)) + 1;

            time += 0.01;

            for (let r = 0; r < rows; r++) {
                for (let c = 0; c < cols; c++) {

                    let x = c * hexWidth;
                    // Offset odd rows
                    if (r % 2 !== 0) {
                        x += hexWidth / 2;
                    }
                    const y = r * hexHeight * 0.75;

                    // Create a wave effect based on position and time
                    const wave = Math.sin(x * 0.01 + time) * Math.cos(y * 0.01 + time);

                    // Only light up some hexagons
                    let fillColor = null;
                    let strokeColor = 'rgba(245, 158, 11, 0.05)'; // subtle orange stroke

                    if (wave > 0.8) {
                        fillColor = `rgba(245, 158, 11, ${(wave - 0.8) * 0.5})`; // Glow
                        strokeColor = `rgba(245, 158, 11, ${(wave - 0.8) * 1.5})`;
                    } else if (wave < -0.9) {
                        fillColor = `rgba(255, 255, 255, 0.02)`;
                    }

                    drawHexagon(x, y, hexSize, strokeColor, fillColor);
                }
            }

            animationFrameId = requestAnimationFrame(draw);
        };

        window.addEventListener('resize', resize);
        resize();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div className="landing-container">
            <canvas ref={canvasRef} className="honeycomb-canvas"></canvas>

            <nav className="landing-nav">
                <div className="logo">🍯 Hivesto</div>
                <Link to="/auth" className="btn-secondary">Log In</Link>
            </nav>

            <main className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">Your money, <span className="text-honey">in the hive</span></h1>
                    <p className="hero-subtitle">
                        Manage your nectar, track your burn, and watch your savings grow in your personal honeycomb.
                        A stunning financial tracker to keep your hive healthy.
                    </p>
                    <div className="hero-cta">
                        <Link to="/auth" className="btn-primary btn-large">Enter the Hive</Link>
                    </div>
                </div>
            </main>

            <section className="features-section">
                <div className="features-grid">
                    <div className="feature-card">
                        <div className="feature-icon"><Hexagon size={32} /></div>
                        <h3>Build Your Cells</h3>
                        <p>Visualize your savings as connected honeycomb cells. Every drop of nectar is tracked perfectly.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><Target size={32} /></div>
                        <h3>Track Your Nectar</h3>
                        <p>Easily log your income and expenses to keep your Honey Score flying high and healthy.</p>
                    </div>
                    <div className="feature-card">
                        <div className="feature-icon"><ShieldAlert size={32} /></div>
                        <h3>Secure & Private</h3>
                        <p>Powered by Firebase. Your financial data is securely stored within your personal hive.</p>
                    </div>
                </div>
            </section>
        </div>
    );
}

export default Landing;
