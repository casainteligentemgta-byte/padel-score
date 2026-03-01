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
    serverTimestamp,
    deleteField
} from 'firebase/firestore';
import { storage } from './firebase';
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

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
    },

    /** Elimina el campo password de todos los perfiles en Firestore (seguridad, una sola vez). */
    async removePasswordsFromAllUsers(): Promise<number> {
        const snapshot = await getDocs(collection(db, 'users'));
        let count = 0;
        for (const d of snapshot.docs) {
            const data = d.data();
            if (data && 'password' in data) {
                await updateDoc(doc(db, 'users', d.id), { password: deleteField() });
                count++;
            }
        }
        return count;
    },

    // Publicidad / Ads
    async createAd(data: any, ownerId: string) {
        return await addDoc(collection(db, 'ads'), {
            ...data,
            ownerId,
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    },

    async getAds() {
        const q = query(collection(db, 'ads'));
        const snapshot = await getDocs(q);
        return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    },

    async deleteAd(id: string) {
        return await deleteDoc(doc(db, 'ads', id));
    },

    async uploadFile(file: File, path: string) {
        const fileRef = ref(storage, path);
        await uploadBytes(fileRef, file);
        return await getDownloadURL(fileRef);
    },

    /** Configuración global del club (admin). Firestore: admin/settings */
    async getAdminSettings(): Promise<AdminSettings | null> {
        const docRef = doc(db, 'admin', 'settings');
        const snap = await getDoc(docRef);
        return snap.exists() ? (snap.data() as AdminSettings) : null;
    },

    async setAdminSettings(data: Partial<AdminSettings>): Promise<void> {
        const docRef = doc(db, 'admin', 'settings');
        await setDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        }, { merge: true });
    },

    // ── Inscripciones y comprobantes de pago (OCR + validación) ─────────────────────────
    async addInscription(data: InscriptionData, ownerId: string) {
        return await addDoc(collection(db, 'inscriptions'), {
            ...data,
            ownerId,
            paymentStatus: data.paymentStatus ?? 'pending',
            createdAt: serverTimestamp(),
            updatedAt: serverTimestamp()
        });
    },

    async getInscriptionsByTournament(tournamentId: string) {
        const q = query(
            collection(db, 'inscriptions'),
            where('tournamentId', '==', tournamentId)
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async getInscriptionsWithAlerts() {
        const q = query(
            collection(db, 'inscriptions'),
            where('paymentStatus', '==', 'alert')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(d => ({ id: d.id, ...d.data() }));
    },

    async updateInscription(id: string, data: Partial<InscriptionData>) {
        const docRef = doc(db, 'inscriptions', id);
        await updateDoc(docRef, {
            ...data,
            updatedAt: serverTimestamp()
        });
    }
};

export type InscriptionData = {
    tournamentId: string;
    tournamentName?: string;
    categoryKey?: string;
    categoryPrice: number;           // Precio de la categoría (regla de validación)
    participantName?: string;
    participantEmail?: string;
    participantId?: string;
    amountExtracted?: number | null; // Monto extraído por OCR
    receiptUrl?: string | null;
    paymentStatus: 'pending' | 'paid' | 'alert';
    alertMessage?: string | null;
};

export type AdminSettings = {
    clubName?: string;
    appTitle?: string;
    timezone?: string;
    updatedAt?: any;
};

export const ROLES = {
    ADMIN: 'admin',
    PLAYER: 'player',
    MARKER: 'marker'
};
