import { initializeApp } from "firebase/app";
import { getAuth, GoogleAuthProvider, signInWithPopup, signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut } from "firebase/auth";
import { getFirestore, doc, setDoc, getDoc, addDoc, collection, query, where, getDocs, updateDoc, deleteDoc } from "firebase/firestore";

const firebaseConfig = {
    apiKey: import.meta.env.VITE_FIREBASE_API_KEY,
    authDomain: import.meta.env.VITE_FIREBASE_AUTH_DOMAIN,
    projectId: import.meta.env.VITE_FIREBASE_PROJECT_ID,
    storageBucket: import.meta.env.VITE_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: import.meta.env.VITE_FIREBASE_MESSAGING_SENDER_ID,
    appId: import.meta.env.VITE_FIREBASE_APP_ID
};

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);
export const googleProvider = new GoogleAuthProvider();

// ─── AUTH ────────────────────────────────────────────────
export const signInWithGoogle = async () => {
    const result = await signInWithPopup(auth, googleProvider);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    const userSnap = await getDoc(userRef);

    if (!userSnap.exists()) {
        await setDoc(userRef, {
            uid: user.uid,
            name: user.displayName,
            email: user.email,
            photoURL: user.photoURL,
            createdAt: new Date(),
            honeyScore: 50,
        });
    }

    return user;
};

export const signInEmail = async (email, password) => {
    return await signInWithEmailAndPassword(auth, email, password);
};

export const signUpEmail = async (email, password, name) => {
    const result = await createUserWithEmailAndPassword(auth, email, password);
    const user = result.user;

    const userRef = doc(db, "users", user.uid);
    await setDoc(userRef, {
        uid: user.uid,
        name: name || email.split('@')[0],
        email: user.email,
        photoURL: null,
        createdAt: new Date(),
        honeyScore: 50,
    });

    return user;
}


export const logOut = () => signOut(auth);

// ─── TRANSACTIONS ────────────────────────────────────────
export const addTransaction = async (uid, { label, amount, type }) => {
    await addDoc(collection(db, "transactions"), {
        uid,
        label,
        amount: parseFloat(amount),
        type,
        createdAt: new Date(),
    });
};

export const getTransactions = async (uid) => {
    const q = query(collection(db, "transactions"), where("uid", "==", uid));
    const snap = await getDocs(q);
    return snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .sort((a, b) => b.createdAt.toDate() - a.createdAt.toDate());
};

// ─── GOALS ───────────────────────────────────────────────
export const addGoal = async (uid, { label, target }) => {
    await addDoc(collection(db, "goals"), {
        uid,
        label,
        target: parseFloat(target),
        current: 0,
        createdAt: new Date(),
    });
};

export const getGoals = async (uid) => {
    const q = query(collection(db, "goals"), where("uid", "==", uid));
    const snap = await getDocs(q);
    return snap.docs.map(d => ({ id: d.id, ...d.data() }));
};

export const fundGoal = async (goalId, amount) => {
    const goalRef = doc(db, "goals", goalId);
    const snap = await getDoc(goalRef);
    const current = snap.data().current + parseFloat(amount);
    await updateDoc(goalRef, { current });
};

export const deleteGoal = async (goalId) => {
    await deleteDoc(doc(db, "goals", goalId));
};

// ─── HONEY SCORE ─────────────────────────────────────────
export const updateHoneyScore = async (uid, transactions) => {
    const nectar = transactions.filter(t => t.type === "nectar").reduce((s, t) => s + t.amount, 0);
    const burn = transactions.filter(t => t.type === "burn").reduce((s, t) => s + t.amount, 0);
    const savings = nectar - burn;

    let score = 50;
    if (nectar > 0) {
        score = Math.min(100, Math.round(
            ((savings / nectar) * 60) +
            (burn < nectar ? 40 : 0)
        ));
    }

    await updateDoc(doc(db, "users", uid), { honeyScore: Math.max(0, score) });
    return Math.max(0, score);
};
