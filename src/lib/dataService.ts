import { db } from './firebase';
import {
    collection,
    addDoc,
    getDoc,
    getDocs,
    query,
    where,
    updateDoc,
    deleteDoc,
    doc,
    setDoc,
    serverTimestamp
} from 'firebase/firestore';

export const dataService = {
    // Torneos
    async createTournament(data: any, ownerId: string) {
        console.log(`[DataService] Creating tournament for owner: ${ownerId}`);
        console.log(`[DataService] Payload size info: ${data.teams?.length || 0} teams`);
        try {
            const result = await addDoc(collection(db, 'tournaments'), {
                ...data,
                ownerId,
                createdAt: serverTimestamp(),
                updatedAt: serverTimestamp()
            });
            console.log(`[DataService] Tournament created successfully with ID: ${result.id}`);
            return result;
        } catch (error) {
            console.error('[DataService] Error in createTournament:', error);
            throw error;
        }
    },

    async getMyTournaments(ownerId: string) {
        const q = query(collection(db, 'tournaments'), where('ownerId', '==', ownerId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async listAllTournaments() {
        const snapshot = await getDocs(collection(db, 'tournaments'));
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getTournament(id: string) {
        const docRef = doc(db, 'tournaments', id);
        const snap = await getDoc(docRef);
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },

    async deleteTournament(id: string) {
        return await deleteDoc(doc(db, 'tournaments', id));
    },

    // Gastos (Nuevo módulo solicitado)
    async addExpense(data: any, ownerId: string) {
        return await addDoc(collection(db, 'expenses'), {
            ...data,
            ownerId,
            createdAt: serverTimestamp()
        });
    },

    async getMyExpenses(ownerId: string) {
        const q = query(collection(db, 'expenses'), where('ownerId', '==', ownerId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    // Participantes / Grupos
    async addParticipant(data: any, ownerId: string) {
        return await addDoc(collection(db, 'participants'), {
            ...data,
            ownerId,
            createdAt: serverTimestamp()
        });
    },

    async getMyParticipants(ownerId: string) {
        const q = query(collection(db, 'participants'), where('ownerId', '==', ownerId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async getAllParticipants() {
        const q = query(collection(db, 'participants'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async updateParticipant(id: string, data: any) {
        const { id: _, ...rest } = data;
        const docRef = doc(db, 'participants', id);
        return await updateDoc(docRef, {
            ...rest,
            updatedAt: serverTimestamp()
        });
    },

    async getParticipant(id: string) {
        const docRef = doc(db, 'participants', id);
        const snap = await getDoc(docRef);
        return snap.exists() ? { id: snap.id, ...snap.data() } : null;
    },

    async deleteParticipant(id: string) {
        return await deleteDoc(doc(db, 'participants', id));
    },

    // Grupos
    async addGroup(data: any, ownerId: string) {
        return await addDoc(collection(db, 'groups'), {
            ...data,
            ownerId,
            createdAt: serverTimestamp()
        });
    },

    async getMyGroups(ownerId: string) {
        const q = query(collection(db, 'groups'), where('ownerId', '==', ownerId));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async deleteGroup(id: string) {
        return await deleteDoc(doc(db, 'groups', id));
    },

    // Usuarios y Roles
    async getUserProfile(uid: string) {
        const docRef = doc(db, 'users', uid);
        const snap = await getDoc(docRef);
        return snap.exists() ? snap.data() : null;
    },

    async setUserProfile(uid: string, data: any) {
        const docRef = doc(db, 'users', uid);
        return await setDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge: true });
    },

    async listAllUsersProfile() {
        const q = query(collection(db, 'users'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ uid: doc.id, ...doc.data() }));
    }
};

export const ROLES = {
    ADMIN: 'admin',
    PLAYER: 'player',
    MARKER: 'marker'
};
