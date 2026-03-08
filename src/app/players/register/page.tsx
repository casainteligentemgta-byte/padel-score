'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
    ArrowLeft,
    Camera,
    User,
    Instagram,
    Phone,
    ArrowRight,
    Shirt,
    Footprints,
    Upload,
    X,
    HeartPulse,
    AlertCircle,
    Stethoscope,
    Save,
    RefreshCw,
    Star,
    Target,
    Award,
    CheckCircle2
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/AuthContext';
import { formatDNI } from '@/lib/formatters';
import Sidebar from '@/components/Sidebar';

function RegistrationFormContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const editId = searchParams.get('edit');
    const fromMisDatos = searchParams.get('mis-datos') === '1';
    const { user, loading: authLoading } = useAuth();

    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(false);
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);

    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const scrollAreaRef = useRef<HTMLDivElement>(null);

    const [acceptedTerms, setAcceptedTerms] = useState(false);
    const [showTermsModal, setShowTermsModal] = useState(false);

    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        gender: 'MALE' as 'MALE' | 'FEMALE',
        level: 4,
        position: 'Drive',
        birthDate: '',
        bloodType: 'O+',
        allergies: '',
        medicalConditions: '',
        phone: '',
        email: '',
        instagram: '',
        dni: '',
        suitSize: 'M',
        shortSize: 'M',
        shoeSize: '',
        photo: ''
    });

    // Load data if editing
    useEffect(() => {
        const loadPlayerData = async () => {
            if (!editId) return;
            setFetching(true);
            try {
                const player = await dataService.getParticipant(editId);
                if (player) {
                    setFormData({
                        name: player.name || '',
                        lastName: player.lastName || '',
                        gender: (player.gender as 'MALE' | 'FEMALE') || 'MALE',
                        level: player.level || 4,
                        position: player.position || 'Drive',
                        birthDate: player.birthDate || '',
                        bloodType: player.bloodType || 'O+',
                        allergies: player.allergies || '',
                        medicalConditions: player.medicalConditions || '',
                        phone: player.phone || '',
                        email: player.email || '',
                        instagram: player.instagram || '',
                        dni: player.dni || '',
                        suitSize: player.suitSize || 'M',
                        shortSize: player.shortSize || 'M',
                        shoeSize: player.shoeSize || '',
                        photo: player.photo || ''
                    });
                }
            } catch (error) {
                console.error('Error loading player:', error);
            } finally {
                setFetching(false);
            }
        };

        if (!authLoading) loadPlayerData();
    }, [editId, authLoading]);

    const updateField = (field: string, value: any) => {
        if (field === 'dni') {
            setFormData(prev => ({ ...prev, [field]: formatDNI(value) }));
        } else {
            setFormData(prev => ({ ...prev, [field]: value }));
        }
    };

    // --- PHOTO LOGIC ---
    const startCamera = async () => {
        setIsCameraActive(true);
        setShowPhotoOptions(false);
        try {
            const stream = await navigator.mediaDevices.getUserMedia({
                video: { facingMode: 'user' },
                audio: false
            });
            if (videoRef.current) {
                videoRef.current.srcObject = stream;
            }
        } catch (err) {
            console.error("Camera error:", err);
            alert("No se pudo acceder a la cámara");
            setIsCameraActive(false);
        }
    };

    const stopCamera = () => {
        if (videoRef.current && videoRef.current.srcObject) {
            const tracks = (videoRef.current.srcObject as MediaStream).getTracks();
            tracks.forEach(track => track.stop());
        }
        setIsCameraActive(false);
    };

    const capturePhoto = () => {
        if (videoRef.current && canvasRef.current) {
            const video = videoRef.current;
            const canvas = canvasRef.current;
            canvas.width = video.videoWidth;
            canvas.height = video.videoHeight;
            const context = canvas.getContext('2d');
            if (context) {
                context.drawImage(video, 0, 0, canvas.width, canvas.height);
                const imageData = canvas.toDataURL('image/jpeg', 0.8);
                updateField('photo', imageData);
                stopCamera();
            }
        }
    };

    const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                updateField('photo', reader.result as string);
                setShowPhotoOptions(false);
            };
            reader.readAsDataURL(file);
        }
    };

    // --- SAVE LOGIC ---
    const handleSave = async () => {
        if (!user) {
            alert('Debes iniciar sesión para registrar jugadores');
            return;
        }

        if (!formData.name) {
            alert('El nombre es obligatorio');
            return;
        }

        if (!acceptedTerms) {
            alert('Debes aceptar los términos y condiciones para continuar');
            return;
        }

        setLoading(true);
        try {
            console.log('[Registration] Intentando guardar con:', { userId: user.uid, editId });

            if (editId) {
                await dataService.updateParticipant(editId, {
                    ...formData,
                    fullName: `${formData.name} ${formData.lastName}`.trim(),
                    updatedAt: new Date()
                });
                alert('¡Perfil actualizado con éxito!');
                router.push(`/players/${editId}`);
            } else {
                const result = await dataService.addParticipant({
                    ...formData,
                    fullName: `${formData.name} ${formData.lastName}`.trim(),
                    registeredAt: new Date(),
                    status: 'Activo'
                }, user.uid);
                alert('¡Jugador registrado con éxito!');
                router.push(`/players/${result.id}`);
            }
        } catch (error: any) {
            console.error('Error saving player:', error);
            const detail = error.message || error.code || JSON.stringify(error);
            alert(`Error al guardar: ${detail}. Por favor, verifica que las tablas en Supabase existan y que tengas permisos.`);
        } finally {
            setLoading(false);
        }
    };

    const levels = [1, 2, 3, 4, 5, 6, 7];
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

    if (fetching) {
        return (
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-padel-primary/20 border-t-padel-primary rounded-full animate-spin" />
                    <RefreshCw className="w-6 h-6 text-padel-primary absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
            </div>
        );
    }

    return (
        <div className="ipad-screen-container bg-[#080808] text-white font-outfit relative overflow-hidden">
            <Sidebar />

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-padel-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div ref={scrollAreaRef} className="ipad-scroll-area !pr-0">
                <header className="sticky top-0 z-50 bg-[#080808]/80 backdrop-blur-md border-b border-white/5 ml-20 md:ml-24">
                    <div className="max-w-md mx-auto px-6 py-5 flex items-center justify-between">
                        <button
                            onClick={() => router.back()}
                            className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 hover:bg-white/10 border border-white/5 transition-all active:scale-95 group"
                        >
                            <ArrowLeft className="w-5 h-5 text-zinc-400 group-hover:text-white" />
                        </button>
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <h1 className="text-lg font-black italic uppercase tracking-tighter text-center text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                                {editId ? (
                                    <span className="text-padel-primary drop-shadow-[0_0_20px_rgba(204,255,0,0.6)]">Actualizar Ficha</span>
                                ) : (
                                    <>REGISTRATE <span className="text-padel-primary drop-shadow-[0_0_20px_rgba(204,255,0,0.6)]">PRO</span></>
                                )}
                            </h1>
                            <p className="text-[9px] font-black text-white/40 uppercase tracking-[0.5em] italic mt-1 drop-shadow-[0_0_10px_rgba(204,255,0,0.2)]">SISTEMA OFICIAL SMART PADEL</p>
                        </div>
                        <div className="w-12 h-12 flex items-center justify-center rounded-2xl bg-white/5 border border-white/5">
                            <Star className="w-5 h-5 text-padel-primary" />
                        </div>
                    </div>
                    {/* Progress Bar Visual Only */}
                    <div className="w-full h-1 bg-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "33%" }}
                            className="h-full bg-padel-primary shadow-[0_0_10px_#ccff00]"
                        />
                    </div>
                </header>

                <main className="max-w-2xl mx-auto px-6 py-10 space-y-12 pb-32 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-12"
                    >
                        {/* Paso 1. Foto de Perfil Header Style */}
                        <section className="flex flex-col items-center bg-zinc-900/20 p-8 rounded-[40px] border border-white/5">
                            <div className="flex items-center gap-3 mb-8 bg-black/40 px-6 py-2.5 rounded-full border border-padel-primary/40 shadow-[0_0_15px_rgba(204,255,0,0.2)]">
                                <span className="text-[10px] font-black bg-padel-primary text-black px-4 py-1 rounded-full italic shadow-[0_0_10px_#ccff00]">PASO 1</span>
                                <span className="text-[11px] font-black uppercase text-white tracking-widest italic drop-shadow-[0_0_8px_rgba(255,255,255,0.5)]">Tu Foto Oficial</span>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-10 bg-padel-primary/10 rounded-full blur-3xl group-hover:bg-padel-primary/20 transition-all duration-700 pointer-events-none" />

                                <div className="relative z-10">
                                    <button
                                        type="button"
                                        onClick={() => setShowPhotoOptions(true)}
                                        className="relative w-48 h-48 rounded-[60px] border-4 border-zinc-800 p-1.5 bg-zinc-800 shadow-3xl overflow-hidden flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 group focus:outline-none ring-1 ring-white/10"
                                    >
                                        <div className="w-full h-full rounded-[48px] overflow-hidden bg-zinc-900 border border-white/5 relative">
                                            {formData.photo ? (
                                                <img src={formData.photo} alt="Vista previa" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a]">
                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] opacity-50" />
                                                    <User className="w-24 h-24 text-zinc-800 relative z-10" />
                                                    <span className="text-[8px] font-black uppercase text-zinc-700 tracking-[0.5em] relative z-10">SUBIR FOTO</span>
                                                </div>
                                            )}

                                            <div className="absolute inset-0 bg-padel-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <Camera className="w-12 h-12 text-black drop-shadow-xl" />
                                            </div>
                                        </div>
                                    </button>

                                    <button
                                        onClick={() => setShowPhotoOptions(true)}
                                        className="absolute -bottom-3 -right-3 w-16 h-16 rounded-[24px] bg-padel-primary flex items-center justify-center text-black border-[6px] border-[#0c0c0c] shadow-[0_15px_30px_rgba(204,255,0,0.4)] hover:scale-110 active:scale-90 transition-all group"
                                    >
                                        <Camera className="w-8 h-8 group-hover:rotate-12 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-12 text-center space-y-4">
                                <h2 className="text-xl md:text-2xl font-black italic uppercase tracking-tighter leading-none text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.3)]">
                                    {formData.name || 'Bienvenido'} <span className="text-padel-primary drop-shadow-[0_0_25px_rgba(204,255,0,0.5)]">{formData.lastName || 'Jugador'}</span>
                                </h2>
                                <p className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.5em] max-w-xs mx-auto drop-shadow-[0_0_10px_rgba(204,255,0,0.2)]">DATOS DEL JUGADOR <span className="text-white italic">SMART</span></p>
                            </div>
                        </section>

                        {/* Paso 2. Información General - Card Style */}
                        <section className="bg-zinc-900/40 border border-white/5 p-10 rounded-[50px] backdrop-blur-3xl space-y-12 relative overflow-hidden group/card shadow-[0_40px_100px_rgba(0,0,0,0.4)]">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-padel-primary/5 rounded-full blur-[80px] pointer-events-none" />

                            <div className="flex flex-col items-center justify-center space-y-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-8 bg-padel-primary rounded-full shadow-[0_0_20px_rgba(204,255,0,0.6)]" />
                                    <h3 className="text-xl font-black uppercase italic tracking-tighter text-white drop-shadow-[0_0_25px_rgba(255,255,255,0.8)]">Ficha de Identidad</h3>
                                </div>
                                <span className="text-[9px] font-black bg-padel-primary/20 text-padel-primary border border-padel-primary/30 px-6 py-1.5 rounded-full uppercase tracking-[0.3em] block shadow-[0_0_15px_rgba(204,255,0,0.2)] w-fit italic">PASO 2</span>
                            </div>

                            <div className="space-y-8">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest pl-1">Nombre</label>
                                        <div className="relative group/input">
                                            <input
                                                type="text"
                                                placeholder="Nombre del jugador"
                                                className="w-full bg-black/50 border-2 border-white/5 rounded-3xl px-8 py-6 text-base font-bold focus:border-padel-primary focus:bg-black/80 ring-0 outline-none transition-all italic text-white placeholder:text-zinc-800"
                                                value={formData.name}
                                                onChange={e => updateField('name', e.target.value)}
                                            />
                                            <User className="absolute right-6 top-1/2 -translate-y-1/2 w-5 h-5 text-zinc-800 group-focus-within/input:text-padel-primary transition-colors" />
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-1">Apellido</label>
                                        <input
                                            type="text"
                                            placeholder="Ej. Pérez"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:border-padel-primary focus:bg-black/60 outline-none transition-all italic text-white placeholder:text-zinc-800"
                                            value={formData.lastName}
                                            onChange={e => updateField('lastName', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-1">Cédula / DNI</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="V-00.000.000"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:border-padel-primary focus:bg-black/60 outline-none transition-all text-white placeholder:text-zinc-800"
                                                value={formData.dni}
                                                onChange={e => updateField('dni', e.target.value)}
                                            />
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none group-focus-within:text-padel-primary group-focus-within:opacity-100 transition-all">
                                                <Award className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-1">Nacimiento</label>
                                        <input
                                            type="date"
                                            className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:border-padel-primary focus:bg-black/60 outline-none transition-all h-[64px] [color-scheme:dark] text-white"
                                            value={formData.birthDate}
                                            onChange={e => updateField('birthDate', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-1">WhatsApp</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="+58 412 0000000"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl px-6 py-5 text-sm font-bold focus:border-padel-primary focus:bg-black/60 outline-none transition-all text-white placeholder:text-zinc-800"
                                                value={formData.phone}
                                                onChange={e => updateField('phone', e.target.value)}
                                            />
                                            <div className="absolute right-5 top-1/2 -translate-y-1/2 opacity-20 pointer-events-none group-focus-within:text-emerald-500 group-focus-within:opacity-100 transition-all">
                                                <Phone className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-1">Instagram</label>
                                        <div className="relative group">
                                            <span className="absolute left-6 top-1/2 -translate-y-1/2 text-zinc-600 font-black text-sm group-focus-within:text-padel-primary transition-colors">@</span>
                                            <input
                                                type="text"
                                                placeholder="usuario"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-6 py-5 text-sm font-bold focus:border-padel-primary focus:bg-black/60 outline-none transition-all italic text-white placeholder:text-zinc-800"
                                                value={formData.instagram}
                                                onChange={e => updateField('instagram', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="pt-8 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-10">
                                    <div className="space-y-4">
                                        <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] pl-1 flex justify-between items-center">
                                            <span>NIVEL DE JUEGO</span>
                                            <span className="text-padel-primary bg-padel-primary/10 px-3 py-1 rounded-full italic text-[9px]">CAT. {formData.level}</span>
                                        </label>
                                        <div className="grid grid-cols-4 md:grid-cols-7 gap-2">
                                            {levels.map(lvl => (
                                                <button
                                                    key={lvl}
                                                    type="button"
                                                    onClick={() => updateField('level', lvl)}
                                                    className={`h-11 rounded-xl flex items-center justify-center font-black text-xs transition-all duration-300 ${formData.level === lvl
                                                        ? 'bg-padel-primary text-black scale-105 shadow-[0_0_15px_rgba(204,255,0,0.4)]'
                                                        : 'bg-white/5 border border-white/5 text-zinc-600 hover:text-zinc-400 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {lvl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] text-center block">SEXO</label>
                                            <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                                                <button
                                                    type="button"
                                                    onClick={() => updateField('gender', 'MALE')}
                                                    className={`h-10 rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${formData.gender === 'MALE'
                                                        ? 'bg-padel-primary text-black shadow-lg scale-105'
                                                        : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'
                                                        }`}
                                                >
                                                    MASC
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateField('gender', 'FEMALE')}
                                                    className={`h-10 rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${formData.gender === 'FEMALE'
                                                        ? 'bg-padel-primary text-black shadow-lg scale-105'
                                                        : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'
                                                        }`}
                                                >
                                                    FEM
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-[0.2em] text-center block">POSICIÓN</label>
                                            <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                                                <button
                                                    type="button"
                                                    onClick={() => updateField('position', 'Drive')}
                                                    className={`h-10 rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${formData.position === 'Drive'
                                                        ? 'bg-padel-primary text-black shadow-lg scale-105'
                                                        : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'
                                                        }`}
                                                >
                                                    DRIVE
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateField('position', 'Revés')}
                                                    className={`h-10 rounded-xl flex items-center justify-center text-[9px] font-black uppercase tracking-widest transition-all duration-300 ${formData.position === 'Revés'
                                                        ? 'bg-padel-primary text-black shadow-lg scale-105'
                                                        : 'text-zinc-600 hover:text-zinc-400 hover:bg-white/5'
                                                        }`}
                                                >
                                                    REVÉS
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Información Médica y Equipación */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                            {/* Protocolo Médico */}
                            <section className="bg-zinc-900/40 border border-red-500/10 p-10 rounded-[50px] backdrop-blur-2xl space-y-8 relative overflow-hidden">
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-red-500/5 rounded-full blur-[50px] pointer-events-none" />

                                <div className="flex items-center justify-center gap-4">
                                    <div className="w-2.5 h-10 bg-red-500 rounded-full shadow-[0_0_30px_rgba(239,68,68,1)] animate-pulse" />
                                    <h3 className="text-lg font-black uppercase italic tracking-widest text-red-500 drop-shadow-[0_0_25px_rgba(239,68,68,0.9)]">Protocolo Médico</h3>
                                </div>

                                <div className="space-y-6">
                                    <div className="space-y-3">
                                        <label className="text-[9px] font-black uppercase text-zinc-600 tracking-widest pl-1">Grupo Sanguíneo</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {bloodTypes.map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => updateField('bloodType', type)}
                                                    className={`h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all duration-300 ${formData.bloodType === type
                                                        ? 'bg-red-500 text-white shadow-[0_0_15px_rgba(239,68,68,0.3)]'
                                                        : 'bg-white/5 border border-white/5 text-zinc-600 hover:text-white hover:bg-white/10'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-1">Alergias</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="Ej. Penicilina (o dejar vacío)"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-6 py-5 text-xs font-bold focus:border-red-500/50 outline-none transition-all italic text-white placeholder:text-zinc-800"
                                                value={formData.allergies}
                                                onChange={e => updateField('allergies', e.target.value)}
                                            />
                                            <AlertCircle className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500/30 group-focus-within:text-red-500 transition-colors" />
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-1">Padecimientos / Lesiones</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="Ej. Lesión en hombro..."
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-6 py-5 text-xs font-bold focus:border-red-500/50 outline-none transition-all italic text-white placeholder:text-zinc-800"
                                                value={formData.medicalConditions}
                                                onChange={e => updateField('medicalConditions', e.target.value)}
                                            />
                                            <Stethoscope className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-red-500/30 group-focus-within:text-red-500 transition-colors" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Tallas del Jugador */}
                            <section className="bg-zinc-900/40 border border-padel-primary/10 p-10 rounded-[50px] backdrop-blur-2xl space-y-8 relative overflow-hidden">
                                <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-padel-primary/5 rounded-full blur-[50px] pointer-events-none" />

                                <div className="flex items-center justify-center gap-4">
                                    <div className="w-2.5 h-10 bg-padel-primary rounded-full shadow-[0_0_30px_rgba(204,255,0,1)]" />
                                    <h3 className="text-lg font-black uppercase italic tracking-widest text-[#ccff00] drop-shadow-[0_0_25px_rgba(204,255,0,0.8)]">Tallas del Jugador</h3>
                                </div>

                                <div className="space-y-8">
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-1">Franela</label>
                                            <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                                                <select
                                                    className="col-span-2 w-full bg-transparent text-center font-black uppercase text-xs outline-none py-2 appearance-none text-white cursor-pointer"
                                                    value={formData.suitSize}
                                                    onChange={e => updateField('suitSize', e.target.value)}
                                                >
                                                    {sizes.map(s => <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-1">Short / Falda</label>
                                            <div className="grid grid-cols-2 gap-2 bg-black/40 p-1.5 rounded-2xl border border-white/5">
                                                <select
                                                    className="col-span-2 w-full bg-transparent text-center font-black uppercase text-xs outline-none py-2 appearance-none text-white cursor-pointer"
                                                    value={formData.shortSize}
                                                    onChange={e => updateField('shortSize', e.target.value)}
                                                >
                                                    {sizes.map(s => <option key={s} value={s} className="bg-[#1a1a1a]">{s}</option>)}
                                                </select>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-3">
                                        <label className="text-[10px] font-black uppercase text-zinc-600 tracking-widest pl-1">Calzado (Talla EU)</label>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                placeholder="Ej. 42"
                                                className="w-full bg-black/40 border border-white/5 rounded-2xl pl-12 pr-6 py-5 text-sm font-black focus:border-padel-primary/40 outline-none transition-all text-white placeholder:text-zinc-800"
                                                value={formData.shoeSize}
                                                onChange={e => updateField('shoeSize', e.target.value)}
                                            />
                                            <Footprints className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-padel-primary/30 group-focus-within:text-padel-primary transition-colors" />
                                        </div>
                                    </div>

                                    <p className="text-[9px] text-zinc-600 text-center italic font-bold tracking-widest uppercase py-2 leading-relaxed">
                                        Garantizamos tu equipación oficial para eventos pro.
                                    </p>
                                </div>
                            </section>
                        </div>

                        {/* Terms and Conditions Checkbox */}
                        <div className="pt-10 px-6">
                            <label className="flex items-center gap-4 cursor-pointer group">
                                <div className="relative">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={acceptedTerms}
                                        onChange={e => setAcceptedTerms(e.target.checked)}
                                    />
                                    <div className={`w-8 h-8 rounded-xl border-2 transition-all flex items-center justify-center ${acceptedTerms ? 'bg-padel-primary border-padel-primary shadow-[0_0_15px_rgba(204,255,0,0.4)]' : 'bg-white/5 border-white/10 group-hover:border-padel-primary/40'}`}>
                                        {acceptedTerms && <CheckCircle2 className="w-5 h-5 text-black" />}
                                    </div>
                                </div>
                                <span className="text-[11px] font-black uppercase text-zinc-500 tracking-widest leading-relaxed">
                                    Acepto el <button type="button" onClick={(e) => { e.stopPropagation(); setShowTermsModal(true); }} className="text-padel-primary hover:underline underline-offset-4">Contrato de Competición</button> y la <button type="button" onClick={(e) => { e.stopPropagation(); setShowTermsModal(true); }} className="text-padel-primary hover:underline underline-offset-4">Política de Privacidad</button>
                                </span>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-10 pb-20 px-4">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={loading || !acceptedTerms}
                                className={`w-full h-28 rounded-[40px] font-black text-3xl uppercase italic flex items-center justify-center gap-6 transition-all group relative overflow-hidden ${loading || !acceptedTerms ? 'bg-zinc-800 text-zinc-600 grayscale cursor-not-allowed opacity-50' : 'bg-gradient-to-r from-[#ccff00] via-[#defa00] to-[#aacc00] text-black hover:scale-[1.03] active:scale-95 shadow-[0_30px_90px_rgba(204,255,0,0.4)]'}`}
                            >
                                {!loading && acceptedTerms && <div className="absolute inset-0 bg-white/30 translate-x-[-100%] group-hover:translate-x-[100%] transition-transform duration-1000 skew-x-[45deg]" />}

                                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity bg-[radial-gradient(circle_at_center,_white_0%,_transparent_70%)] pointer-events-none" />

                                {loading ? (
                                    <div className="w-12 h-12 border-[6px] border-black border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <div className="flex flex-col items-center leading-none">
                                            <span className="text-[10px] font-black tracking-[0.3em] opacity-40 mb-1">FINALIZAR</span>
                                            {editId ? 'GUARDAR' : 'CREAR FICHA'}
                                        </div>
                                        {editId ? <Save className="w-10 h-10 group-hover:rotate-12 transition-transform" /> : <Award className="w-10 h-10 group-hover:scale-125 transition-transform" />}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </main>

                {/* Terms and Conditions Modal */}
                <AnimatePresence mode="wait">
                    {showTermsModal && (
                        <div className="fixed inset-0 z-[120] flex items-center justify-center px-6">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/95 backdrop-blur-2xl"
                                onClick={() => setShowTermsModal(false)}
                            />
                            <motion.div
                                initial={{ scale: 0.9, opacity: 0, y: 20 }}
                                animate={{ scale: 1, opacity: 1, y: 0 }}
                                exit={{ scale: 0.9, opacity: 0, y: 20 }}
                                className="bg-[#111111] w-full max-w-lg rounded-[40px] p-10 border border-white/10 relative z-[130] flex flex-col max-h-[80vh] shadow-3xl overflow-hidden"
                            >
                                <div className="flex items-center justify-between mb-8 flex-shrink-0">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-8 bg-padel-primary rounded-full shadow-[0_0_20px_#ccff00]" />
                                        <h3 className="text-2xl font-black italic uppercase tracking-tighter">Contrato Pro <span className="text-padel-primary">Smart</span></h3>
                                    </div>
                                    <button onClick={() => setShowTermsModal(false)} className="w-10 h-10 rounded-full bg-white/5 flex items-center justify-center hover:bg-white/10 transition-colors">
                                        <X className="w-5 h-5 text-zinc-400" />
                                    </button>
                                </div>

                                <div className="overflow-y-auto pr-4 custom-scrollbar space-y-8 flex-1">
                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black uppercase text-padel-primary tracking-widest italic">1. Exoneración de Responsabilidad</h4>
                                        <p className="text-[11px] text-zinc-400 font-bold leading-relaxed uppercase tracking-wide">
                                            El participante declara estar en condiciones físicas óptimas para la alta competencia. Liberas irrevocablemente a Smart Padel, sus organizadores y patrocinadores de toda responsabilidad por lesiones, accidentes o percances médicos ocurridos durante la competencia o en las instalaciones.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black uppercase text-padel-primary tracking-widest italic">2. Uso de Imagen y Marca</h4>
                                        <p className="text-[11px] text-zinc-400 font-bold leading-relaxed uppercase tracking-wide">
                                            Autorizas el uso de tu nombre e imagen (fotos/videos) en redes sociales, transmisiones en vivo (Broadcasting PRO) y material publicitario de Smart Padel con fines promocionales globales.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black uppercase text-padel-primary tracking-widest italic">3. Protección de Datos (Privacidad)</h4>
                                        <p className="text-[11px] text-zinc-400 font-bold leading-relaxed uppercase tracking-wide">
                                            Tus datos personales y médicos se almacenan exclusivamente para tu seguridad y la gestión operativa de los torneos. Smart Padel garantiza la confidencialidad total y no compartirá tu información con terceros sin consentimiento explícito.
                                        </p>
                                    </div>

                                    <div className="space-y-4">
                                        <h4 className="text-xs font-black uppercase text-padel-primary tracking-widest italic">4. Conducta Deportiva</h4>
                                        <p className="text-[11px] text-zinc-400 font-bold leading-relaxed uppercase tracking-wide">
                                            Te comprometes a mantener un espíritu de Fair Play. Conductas antideportivas pueden resultar en la expulsión inmediata del sistema oficial de Smart Padel.
                                        </p>
                                    </div>
                                </div>

                                <button
                                    onClick={() => {
                                        setAcceptedTerms(true);
                                        setShowTermsModal(false);
                                    }}
                                    className="mt-10 w-full py-6 bg-padel-primary text-black rounded-3xl font-black uppercase italic text-sm tracking-widest hover:scale-105 transition-all shadow-[0_15px_30px_rgba(204,255,0,0.3)] flex-shrink-0"
                                >
                                    ¡ACEPTO Y QUIERO JUGAR!
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Photo Selection Modal */}
                <AnimatePresence>
                    {showPhotoOptions && (
                        <div className="fixed inset-0 z-[110] flex items-end justify-center px-6 pb-16">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/80 backdrop-blur-xl"
                                onClick={() => setShowPhotoOptions(false)}
                            />
                            <motion.div
                                initial={{ y: 200, opacity: 0 }}
                                animate={{ y: 0, opacity: 1 }}
                                exit={{ y: 200, opacity: 0 }}
                                className="bg-[#111111] w-full max-w-sm rounded-[40px] p-8 border border-white/10 relative z-[120] space-y-8 shadow-3xl"
                            >
                                <div className="space-y-2 text-center">
                                    <h3 className="text-2xl font-black italic uppercase tracking-tighter">Captura tu Perfil</h3>
                                    <p className="text-[10px] text-zinc-600 font-bold uppercase tracking-widest">¿Cómo quieres subir tu foto?</p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={startCamera}
                                        className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/5 hover:bg-padel-primary/10 border border-white/5 hover:border-padel-primary/30 transition-all group"
                                    >
                                        <Camera className="w-10 h-10 text-zinc-600 group-hover:text-padel-primary group-hover:scale-110 transition-all" />
                                        <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-white">CÁMARA</span>
                                    </button>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex flex-col items-center gap-4 p-8 rounded-3xl bg-white/5 hover:bg-padel-primary/10 border border-white/5 hover:border-padel-primary/30 transition-all group"
                                    >
                                        <Upload className="w-10 h-10 text-zinc-600 group-hover:text-padel-primary group-hover:scale-110 transition-all" />
                                        <span className="text-[9px] font-black uppercase tracking-widest group-hover:text-white">GALERÍA</span>
                                    </button>
                                </div>

                                <input
                                    type="file"
                                    ref={fileInputRef}
                                    className="hidden"
                                    accept="image/*"
                                    onChange={handleFileUpload}
                                />

                                <button
                                    onClick={() => setShowPhotoOptions(false)}
                                    className="w-full py-4 text-zinc-600 font-black uppercase text-[10px] tracking-[0.3em] hover:text-white transition-colors"
                                >
                                    VOLVER
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Camera Overlay */}
                <AnimatePresence>
                    {isCameraActive && (
                        <div className="fixed inset-0 z-[150] bg-black flex flex-col items-center justify-center p-6 md:p-12">
                            <motion.div
                                initial={{ opacity: 0, scale: 0.9 }}
                                animate={{ opacity: 1, scale: 1 }}
                                className="relative w-full max-w-4xl aspect-[4/3] rounded-[60px] overflow-hidden border-4 border-white/10 bg-zinc-900 shadow-3xl"
                            >
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay Frame */}
                                <div className="absolute inset-0 border-[60px] border-black/60 flex items-center justify-center">
                                    <div className="w-80 h-80 rounded-full border-4 border-padel-primary border-dashed shadow-[0_0_80px_rgba(204,255,0,0.5)] relative">
                                        <div className="absolute top-0 left-1/2 -translate-x-1/2 -translate-y-[150%] flex flex-col items-center gap-2">
                                            <span className="text-padel-primary font-black italic uppercase tracking-tighter text-xl bg-black/80 px-4 py-1 rounded-xl">POSICIONA TU ROSTRO</span>
                                        </div>
                                    </div>
                                </div>

                                <button
                                    onClick={stopCamera}
                                    className="absolute top-8 right-8 w-14 h-14 bg-black/60 hover:bg-black rounded-full flex items-center justify-center backdrop-blur-xl border border-white/20 transition-all active:scale-95"
                                >
                                    <X className="w-8 h-8 text-white" />
                                </button>

                                <div className="absolute bottom-12 left-1/2 -translate-x-1/2">
                                    <button
                                        onClick={capturePhoto}
                                        className="w-24 h-24 rounded-full bg-white border-[10px] border-white/20 active:scale-90 transition-all shadow-[0_0_50px_rgba(255,255,255,0.4)] flex items-center justify-center group"
                                    >
                                        <div className="w-14 h-14 rounded-full border-4 border-black/10 group-hover:scale-95 transition-transform" />
                                    </button>
                                </div>
                            </motion.div>
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                    )}
                </AnimatePresence>
            </div>
        </div>
    );
}

export default function PlayerRegistrationPage() {
    return (
        <Suspense fallback={
            <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
                <RefreshCw className="w-8 h-8 text-padel-primary animate-spin" />
            </div>
        }>
            <RegistrationFormContent />
        </Suspense>
    );
}
