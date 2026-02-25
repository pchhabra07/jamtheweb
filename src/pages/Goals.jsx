import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowLeft, PlusCircle, Target, Trash2, CheckCircle } from 'lucide-react';
import { auth, db, getGoals, addGoal, fundGoal, addTransaction, getTransactions, updateHoneyScore, deleteGoal, updateTutorialStep } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import TutorialPopup from '../components/TutorialPopup';
import './Goals.css';

function Goals() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [goals, setGoals] = useState([]);
    const [netBalance, setNetBalance] = useState(0);
    const [loading, setLoading] = useState(true);

    // Form State
    const [label, setLabel] = useState('');
    const [target, setTarget] = useState('');
    const [fundAmount, setFundAmount] = useState('');

    // Selection
    const [selectedGoalId, setSelectedGoalId] = useState(null);

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchData(currentUser.uid);

                // Listen to user document for tutorial step
                const unsubUser = onSnapshot(doc(db, "users", currentUser.uid), (doc) => {
                    if (doc.exists()) {
                        setUserData(doc.data());
                    }
                });

                return () => unsubUser();
            } else {
                navigate('/auth');
            }
        });

        return () => unsubscribeAuth();
    }, [navigate]);

    const fetchData = async (uid) => {
        try {
            const [fetchedGoals, txs] = await Promise.all([
                getGoals(uid),
                getTransactions(uid)
            ]);

            setGoals(fetchedGoals);

            const nectar = txs.filter(t => t.type === 'nectar').reduce((s, t) => s + t.amount, 0);
            const burn = txs.filter(t => t.type === 'burn').reduce((s, t) => s + t.amount, 0);
            setNetBalance(nectar - burn);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddGoal = async (e) => {
        e.preventDefault();
        if (!label || !target || isNaN(target) || target <= 0) return;

        try {
            await addGoal(user.uid, { label, target });

            // Tutorial logic: Step 4
            if (userData?.tutorialStep === 4) {
                await updateTutorialStep(user.uid, 5);
            }

            await fetchData(user.uid);
            setLabel('');
            setTarget('');
        } catch (error) {
            console.error("Error adding goal:", error);
        }
    };

    const handleSidebarFund = async (e) => {
        e.preventDefault();
        if (!selectedGoalId || !fundAmount || isNaN(fundAmount) || fundAmount <= 0) return;

        const amountNum = parseFloat(fundAmount);
        if (amountNum > netBalance) {
            alert(`Insufficient funds! Your net balance is $${netBalance.toFixed(2)}.`);
            return;
        }

        try {
            const targetGoal = goals.find(g => g.id === selectedGoalId);

            await fundGoal(selectedGoalId, fundAmount);

            if (targetGoal) {
                await addTransaction(user.uid, {
                    label: `Funded Goal: ${targetGoal.label}`,
                    amount: amountNum,
                    type: 'burn'
                });
            }

            // Tutorial logic: Step 5 (Final)
            if (userData?.tutorialStep === 5) {
                await updateTutorialStep(user.uid, 'finished');
            }

            const updatedTxs = await getTransactions(user.uid);
            await updateHoneyScore(user.uid, updatedTxs);
            await fetchData(user.uid);

            setFundAmount('');
            setSelectedGoalId(null);
        } catch (error) {
            console.error("Error funding goal:", error);
        }
    };

    const handleDeleteGoal = async (goal) => {
        if (!window.confirm(`Are you sure you want to delete "${goal.label}"? Your funds will be returned to your net balance.`)) return;

        try {
            await deleteGoal(goal.id);

            if (goal.current > 0) {
                await addTransaction(user.uid, {
                    label: `Refunded Goal: ${goal.label}`,
                    amount: goal.current,
                    type: 'nectar'
                });
            }

            if (selectedGoalId === goal.id) setSelectedGoalId(null);

            const updatedTxs = await getTransactions(user.uid);
            await updateHoneyScore(user.uid, updatedTxs);
            await fetchData(user.uid);
        } catch (error) {
            console.error("Error deleting goal:", error);
        }
    };

    if (loading) {
        return <div className="loading-screen">Aligning planets...</div>;
    }

    // Warm neon orange-yellow palette
    const planetColors = [
        '#f59e0b', // amber
        '#f97316', // orange
        '#fbbf24', // yellow-amber
        '#fb923c', // light orange
        '#fde68a', // pale yellow
        '#ea580c', // deep orange
    ];

    const activeGoals = goals.filter(g => g.current < g.target);
    const completedGoals = goals.filter(g => g.current >= g.target);
    const tutorialStep = userData?.tutorialStep;

    return (
        <div className="goals-container">
            <header className="goals-header">
                <Link to="/dashboard" className="btn-back">
                    <ArrowLeft size={20} /> Go to Dashboard
                </Link>
                <h2>Where money orbits the hive</h2>
                <div className="net-balance-indicator">
                    Available Balance: <strong>${netBalance.toFixed(2)}</strong>
                </div>
            </header>

            <main className="goals-content">
                <div className="goals-grid">

                    {/* Orbit Visualizer — ONLY ACTIVE GOALS */}
                    <div className="panel orbit-visualizer-panel">
                        <div className="orbit-system">

                            {/* Central Sun */}
                            <div className="sun">
                                <div className="sun-glow"></div>
                            </div>

                            {/* Planets */}
                            {activeGoals.map((goal, index) => {
                                const percent = Math.min(100, (goal.current / goal.target) * 100);

                                const minOrbitSize = 140 + (index * 60);
                                const maxOrbitSize = 320 + (index * 80);
                                const orbitSize = maxOrbitSize - ((percent / 100) * (maxOrbitSize - minOrbitSize));

                                const color = planetColors[index % planetColors.length];
                                const duration = 15 + (index * 10);
                                const isSelected = selectedGoalId === goal.id;

                                return (
                                    <div
                                        key={goal.id}
                                        className={`orbit-ring ${isSelected ? 'paused' : ''}`}
                                        style={{
                                            width: `${orbitSize}px`,
                                            height: `${orbitSize}px`,
                                            animationDuration: `${duration}s`
                                        }}
                                    >
                                        <svg viewBox="0 0 100 100" className="orbit-svg-trail">
                                            <circle
                                                cx="50" cy="50" r="49"
                                                fill="none"
                                                stroke={color}
                                                strokeWidth="2"
                                                strokeDasharray="307.87"
                                                strokeDashoffset={307.87 * (1 - percent / 100)}
                                                strokeLinecap="round"
                                                style={{ transition: 'stroke-dashoffset 1s ease-in-out' }}
                                            />
                                        </svg>

                                        <div
                                            className={`planet-container ${isSelected ? 'active' : ''}`}
                                            onClick={(e) => {
                                                e.stopPropagation();
                                                setSelectedGoalId(isSelected ? null : goal.id);
                                            }}
                                        >
                                            <div className="planet" style={{ backgroundColor: color }} />

                                            <div className="planet-label" style={{ animationDuration: `${duration}s` }}>
                                                <span className="name">{goal.label}</span>
                                                <span className="percent">{Math.round(percent)}%</span>
                                            </div>

                                            {isSelected && (
                                                <div
                                                    className="planet-actions"
                                                    style={{ animationDuration: `${duration}s` }}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        handleDeleteGoal(goal);
                                                    }}
                                                >
                                                    <button className="btn-delete-planet" title="Delete & Refund">
                                                        <Trash2 size={14} />
                                                    </button>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}

                            {activeGoals.length === 0 && (
                                <div className="empty-orbit">
                                    <p>No active planets in your orbit.</p>
                                    <p>Add a goal to build your solar system.</p>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Sidebar */}
                    <div className="goals-sidebar">
                        <div className="panel add-goal-panel" style={{
                            border: tutorialStep === 4 ? '2px solid #f59e0b' : '1px solid rgba(245, 158, 11, 0.3)',
                            boxShadow: tutorialStep === 4 ? '0 0 20px rgba(245, 158, 11, 0.2)' : ''
                        }}>
                            <h3><Target size={18} /> Add New Planet</h3>
                            <form onSubmit={handleAddGoal} className="goal-form">
                                <div className="input-group">
                                    <input
                                        type="text"
                                        placeholder="Goal Name (e.g., Vacation)"
                                        value={label}
                                        onChange={(e) => setLabel(e.target.value)}
                                        required
                                    />
                                </div>
                                <div className="input-group amount-group">
                                    <span className="currency-symbol">$</span>
                                    <input
                                        type="number"
                                        step="1"
                                        min="1"
                                        placeholder="Target Amount"
                                        value={target}
                                        onChange={(e) => setTarget(e.target.value)}
                                        required
                                    />
                                </div>
                                <button type="submit" className="btn-secondary add-submit">
                                    <PlusCircle size={18} /> Launch Goal
                                </button>
                            </form>
                        </div>

                        {activeGoals.length > 0 && (
                            <div className="panel fund-goal-panel" style={{
                                border: tutorialStep === 5 ? '2px solid #f59e0b' : '1px solid rgba(245, 158, 11, 0.3)',
                                boxShadow: tutorialStep === 5 ? '0 0 20px rgba(245, 158, 11, 0.2)' : ''
                            }}>
                                <h3>Fuel Your Orbit</h3>
                                <form onSubmit={handleSidebarFund} className="goal-form">
                                    <div className="input-group">
                                        <select
                                            className="goal-select"
                                            value={selectedGoalId || ''}
                                            onChange={(e) => setSelectedGoalId(e.target.value)}
                                            required
                                        >
                                            <option value="" disabled>Select a destination...</option>
                                            {activeGoals.map(g => (
                                                <option key={g.id} value={g.id}>
                                                    {g.label} (${g.current.toFixed(0)} / ${g.target.toFixed(0)})
                                                </option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="input-group amount-group">
                                        <span className="currency-symbol">$</span>
                                        <input
                                            type="number"
                                            step="0.01"
                                            min="0.01"
                                            max={netBalance}
                                            placeholder="Amount to inject"
                                            value={fundAmount}
                                            onChange={(e) => setFundAmount(e.target.value)}
                                            required
                                        />
                                    </div>
                                    <button type="submit" className="btn-primary add-submit">
                                        Send Funds
                                    </button>
                                </form>
                            </div>
                        )}
                    </div>

                </div>

                {/* Completed Goals */}
                {completedGoals.length > 0 && (
                    <div className="completed-goals-section panel">
                        <h3><CheckCircle size={20} className="text-nectar" /> Fulfilled Goals</h3>
                        <div className="completed-goals-grid">
                            {completedGoals.map(goal => (
                                <div key={goal.id} className="completed-goal-card">
                                    <div className="completed-goal-info">
                                        <h4>{goal.label}</h4>
                                        <span className="completed-amount">${goal.target.toFixed(2)}</span>
                                    </div>
                                    <button
                                        className="btn-delete-completed"
                                        onClick={() => handleDeleteGoal(goal)}
                                        title="Delete completely"
                                    >
                                        <Trash2 size={16} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>

            {/* Tutorial Popups */}
            <TutorialPopup
                step={4}
                isVisible={tutorialStep === 4}
                content="Welcome to the Orbit! Let's add your first Goal planet. For example, add 'Vacation' with a target of $20000."
            />
            <TutorialPopup
                step={5}
                isVisible={tutorialStep === 5}
                content="A new planet has entered your system! Now, use your net balance to fuel it. Inject some funds, e.g., $3000, into your 'Vacation' goal."
            />
        </div>
    );
}

export default Goals;

