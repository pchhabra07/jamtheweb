import React, { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { ArrowRight, PlusCircle, LogOut, Activity, ClipboardList, Send, History } from 'lucide-react';
import { auth, db, getTransactions, addTransaction, updateHoneyScore, logOut } from '../firebase';
import { onAuthStateChanged } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';
import './Dashboard.css';

function Dashboard() {
    const [user, setUser] = useState(null);
    const [userData, setUserData] = useState(null);
    const [transactions, setTransactions] = useState([]);
    const [loading, setLoading] = useState(true);

    // Form state
    const [label, setLabel] = useState('');
    const [amount, setAmount] = useState('');
    const [type, setType] = useState('nectar');

    const navigate = useNavigate();

    useEffect(() => {
        const unsubscribeAuth = onAuthStateChanged(auth, async (currentUser) => {
            if (currentUser) {
                setUser(currentUser);
                await fetchData(currentUser.uid);

                // Listen to user document for real-time Honey Score updates
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
            const txs = await getTransactions(uid);
            setTransactions(txs);
        } catch (error) {
            console.error("Error fetching data:", error);
        } finally {
            setLoading(false);
        }
    };

    const handleAddTransaction = async (e) => {
        e.preventDefault();
        if (!label || !amount || isNaN(amount) || amount <= 0) return;

        try {
            await addTransaction(user.uid, { label, amount, type });

            // Refresh transactions
            const updatedTxs = await getTransactions(user.uid);
            setTransactions(updatedTxs);

            // Update honey score
            await updateHoneyScore(user.uid, updatedTxs);

            // Reset form
            setLabel('');
            setAmount('');
        } catch (error) {
            console.error("Error adding transaction:", error);
        }
    };

    const handleLogout = async () => {
        try {
            await logOut();
            navigate('/');
        } catch (error) {
            console.error("Error logging out:", error);
        }
    };

    // Calculations
    const totalNectar = transactions.filter(t => t.type === 'nectar').reduce((sum, t) => sum + t.amount, 0);
    const totalBurn = transactions.filter(t => t.type === 'burn').reduce((sum, t) => sum + t.amount, 0);
    const netBalance = totalNectar - totalBurn;

    const honeyScore = userData?.honeyScore || 0;

    // Calculate stroke dasharray for the circular progress (circumference = 2 * Math.PI * r, r=45, C=282.7)
    const circumference = 282.7;
    const strokeDashoffset = circumference - (honeyScore / 100) * circumference;

    if (loading) {
        return <div className="loading-screen">Loading your hive...</div>;
    }

    return (
        <div className="dashboard-container">
            <header className="dashboard-header">
                <div className="header-user">
                    <div className="avatar">{userData?.name?.charAt(0) || 'A'}</div>
                    <h2>Welcome, Astronaut {userData?.name}</h2>
                </div>
                <button onClick={handleLogout} className="btn-logout" title="Log out">
                    <LogOut size={20} />
                </button>
            </header>

            <main className="dashboard-content">
                <div className="dashboard-grid">

                    {/* Honey Score Panel */}
                    <div className="panel honey-score-panel">
                        <h3><Activity size={18} /> Honey Score</h3>
                        <div className="honey-score-meter">
                            <svg className="honey-progress-ring" width="120" height="120">
                                <circle className="ring-bg" stroke="rgba(255,255,255,0.1)" strokeWidth="8" fill="transparent" r="45" cx="60" cy="60" />
                                <circle
                                    className="ring-progress"
                                    stroke="#f59e0b"
                                    strokeWidth="8"
                                    fill="transparent"
                                    r="45" cx="60" cy="60"
                                    style={{ strokeDasharray: circumference, strokeDashoffset }}
                                />
                            </svg>
                            <div className="honey-score-value">{honeyScore}</div>
                        </div>
                        <p className="score-desc">Financial Health</p>
                        <Link to="/goals" className="btn-secondary goals-link">
                            View Goals Orbit <ArrowRight size={16} />
                        </Link>
                    </div>

                    {/* Summary Cards */}
                    <div className="panel summary-panel">
                        <h3><ClipboardList size={18} /> Ship Manifest</h3>
                        <div className="summary-cards">
                            <div className="summary-card nectar">
                                <div className="label">Total Nectar</div>
                                <div className="value">${totalNectar.toFixed(2)}</div>
                            </div>
                            <div className="summary-card burn">
                                <div className="label">Total Burn</div>
                                <div className="value">-${totalBurn.toFixed(2)}</div>
                            </div>
                            <div className={`summary-card net ${netBalance >= 0 ? 'positive' : 'negative'}`}>
                                <div className="label">Net Balance</div>
                                <div className="value">${netBalance.toFixed(2)}</div>
                            </div>
                        </div>
                    </div>

                    {/* Quick Add Form */}
                    <div className="panel add-tx-panel">
                        <h3><Send size={18} /> Log Transaction</h3>
                        <form onSubmit={handleAddTransaction} className="add-tx-form">
                            <div className="tx-type-toggle">
                                <button
                                    type="button"
                                    className={`type-btn ${type === 'nectar' ? 'active-nectar' : ''}`}
                                    onClick={() => setType('nectar')}
                                >
                                    + Nectar
                                </button>
                                <button
                                    type="button"
                                    className={`type-btn ${type === 'burn' ? 'active-burn' : ''}`}
                                    onClick={() => setType('burn')}
                                >
                                    - Burn
                                </button>
                            </div>

                            <div className="input-group">
                                <input
                                    type="text"
                                    placeholder="Label (e.g., Salary, Groceries)"
                                    value={label}
                                    onChange={(e) => setLabel(e.target.value)}
                                    required
                                />
                            </div>

                            <div className="input-group amount-group">
                                <span className="currency-symbol">$</span>
                                <input
                                    type="number"
                                    step="0.01"
                                    min="0.01"
                                    placeholder="Amount"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    required
                                />
                            </div>

                            <button type="submit" className="btn-primary add-submit">
                                <PlusCircle size={18} /> Add Entry
                            </button>
                        </form>
                    </div>

                    {/* Recent Transactions */}
                    <div className="panel recent-tx-panel">
                        <h3><History size={18} /> Recent Log</h3>
                        {transactions.length === 0 ? (
                            <p className="empty-state">No flight logs recorded yet.</p>
                        ) : (
                            <div className="tx-list">
                                {transactions.slice(0, 5).map(tx => (
                                    <div key={tx.id} className="tx-item">
                                        <div className="tx-info">
                                            <span className={`tx-dot ${tx.type}`}></span>
                                            <span className="tx-label">{tx.label}</span>
                                        </div>
                                        <span className={`tx-amount ${tx.type}`}>
                                            {tx.type === 'nectar' ? '+' : '-'}${tx.amount.toFixed(2)}
                                        </span>
                                    </div>
                                ))}
                            </div>
                        )}
                        {transactions.length > 5 && (
                            <div className="view-more">Showing latest 5 entries</div>
                        )}
                    </div>

                </div>
            </main>
        </div>
    );
}

export default Dashboard;
