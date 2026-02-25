import React, { useState, useEffect, useRef } from 'react';
import { Link } from 'react-router-dom';
import { Target, Hexagon, ShieldAlert, Sparkles } from 'lucide-react';
import './Landing.css';

function Landing() {
    const [mousePos, setMousePos] = useState({ x: 50, y: 50 });
    const [score, setScore] = useState(0);
    const canvasRef = useRef(null);

    // Mouse Tracking for the glowing background gradient
    useEffect(() => {
        const handleMouseMove = (e) => {
            const x = (e.clientX / window.innerWidth) * 100;
            const y = (e.clientY / window.innerHeight) * 100;
            setMousePos({ x, y });
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    // Gamified "Catch the Nectar" Canvas Logic
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        let animationFrameId;

        const resize = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;
        };

        window.addEventListener('resize', resize);
        resize();

        let nectars = [];
        let mouseX = 0;
        let mouseY = 0;

        const trackMouse = (e) => {
            mouseX = e.clientX;
            mouseY = e.clientY;

            // Add a small splash effect cursor class to the body on mousemove
            // We use the CSS cursor on landing-container, so this isn't strictly necessary for the icon itself
        };
        window.addEventListener('mousemove', trackMouse);

        class NectarDrop {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = -20;
                // Bigger prominent hexes
                this.size = Math.random() * 12 + 10;
                this.speed = Math.random() * 2 + 1;
                this.color = `hsla(${Math.random() * 30 + 35}, 100%, 60%, 0.9)`; // Golden hues
                this.isCaught = false;
                this.catchAnim = 0;     // Animation frame counter
                this.done = false;      // Flag to remove from array
            }

            update() {
                if (this.isCaught) {
                    this.catchAnim++;
                    if (this.catchAnim > 25) {
                        this.done = true; // Animation complete, mark for deletion
                    }
                } else {
                    this.y += this.speed;

                    // Collision logic: "Catching" the nectar
                    const dx = this.x - mouseX;
                    const dy = this.y - mouseY;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    // If cursor touches the nectar drop
                    if (distance < this.size + 40 && !this.isCaught) {
                        this.isCaught = true;
                        setScore(prev => prev + 10);
                    }
                }
            }

            draw() {
                if (this.done) return;

                ctx.save();

                // Animation logic: burst and fade out
                if (this.isCaught) {
                    const progress = this.catchAnim / 25;
                    const scale = 1 + (progress * 2.5); // Explode outwards more
                    ctx.globalAlpha = Math.max(0, 1 - progress);
                    ctx.translate(this.x, this.y);
                    ctx.scale(scale, scale);
                    ctx.rotate(progress * Math.PI); // Spin while bursting
                    ctx.translate(-this.x, -this.y);
                }

                // Draw Hexagon (more honeycomb-like)
                ctx.beginPath();
                for (let i = 0; i < 6; i++) {
                    const angle = i * Math.PI / 3; // 60 degrees
                    const px = this.x + this.size * Math.cos(angle);
                    const py = this.y + this.size * Math.sin(angle);
                    if (i === 0) ctx.moveTo(px, py);
                    else ctx.lineTo(px, py);
                }
                ctx.closePath();

                // Fill glowing honey
                ctx.fillStyle = this.color;
                ctx.shadowBlur = this.isCaught ? 40 : 20;
                ctx.shadowColor = this.color;
                ctx.fill();

                // Bright prominent outline
                ctx.strokeStyle = 'rgba(255, 255, 255, 0.7)';
                ctx.lineWidth = 1.5;
                ctx.stroke();

                ctx.restore();
            }
        }

        // Spawn drops periodically
        const spawnInterval = setInterval(() => {
            if (document.hidden) return; // don't spawn when tab inactive
            nectars.push(new NectarDrop());
            // arbitrary limit to prevent lag (increased for better effect)
            if (nectars.length > 80) {
                nectars = nectars.filter(n => n.y < canvas.height && !n.done);
            }
        }, 600);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            // Cleanup caught/completed drops
            nectars = nectars.filter(n => !n.done && n.y < canvas.height + 50);

            nectars.forEach((drop) => {
                drop.update();
                drop.draw();
            });

            animationFrameId = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resize);
            window.removeEventListener('mousemove', trackMouse);
            clearInterval(spawnInterval);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <div
            className="landing-container"
            style={{
                '--mouse-x': `${mousePos.x}%`,
                '--mouse-y': `${mousePos.y}%`
            }}
        >
            <div className="gradient-bg-layer"></div>
            {/* Gamification Canvas Layer */}
            <canvas
                ref={canvasRef}
                className="gamification-canvas"
                style={{ position: 'absolute', top: 0, left: 0, width: '100%', height: '100%', zIndex: 1, pointerEvents: 'none' }}
            />

            <nav className="landing-nav">
                <div className="logo">🍯 Hivesto</div>
                <div className="hackathon-score">
                    <Sparkles className="score-icon text-honey" size={20} />
                    <span>Nectar Caught: <strong>{score}</strong></span>
                </div>
                <Link to="/auth" className="btn-secondary">Log In</Link>
            </nav>

            <main className="hero">
                <div className="hero-content">
                    <h1 className="hero-title">Invest your honey into the <span className="text-honey">right hive</span></h1>
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
