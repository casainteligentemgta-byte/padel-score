'use client';

import React, { useState, useRef, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
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
    Target,
    Award,
    CircleDot
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { getAuthHeaders } from '@/lib/apiAuth';
import { useAuth } from '@/lib/AuthContext';
import { formatDNI } from '@/lib/formatters';
import Sidebar from '@/components/Sidebar';
import { BackButton } from '@/components/BackButton';
import LegalModal from '@/components/legal/LegalModal';
import { CURRENT_TERMS_VERSION } from '@/lib/legal/termsVersion';

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
        phone: '+58',
        email: '',
        instagram: '',
        dni: '',
        suitSize: 'M',
        shortSize: 'M',
        shoeSize: '',
        photo: ''
    });

    // Load data if editing or set default email
    useEffect(() => {
        const loadPlayerData = async () => {
            if (editId) {
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
            } else if (user?.email) {
                setFormData(prev => ({ ...prev, email: user.email || '' }));
            }
        };

        if (!authLoading) loadPlayerData();
    }, [editId, authLoading, user]);

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
            if (formData.dni) {
                const dniExists = await dataService.checkParticipantExistence('dni', formData.dni, editId || undefined);
                if (dniExists) {
                    alert('Esta cédula ya está registrada con otro jugador.');
                    setLoading(false);
                    return;
                }
            }

            if (acceptedTerms && user.uid) {
                try {
                    await dataService.updateProfileLegalAcceptance(user.uid, {
                        acceptedTermsVersion: CURRENT_TERMS_VERSION,
                        signaturePath: null,
                        biometricPhotoPath: null,
                    });
                } catch (legalErr) {
                    console.error('[Registration] No se pudo guardar el consentimiento legal:', legalErr);
                }
            }

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

                // --- EMAIL NOTIFICATION (aviso al club) ---
                try {
                    const profileUrl =
                        typeof window !== 'undefined'
                            ? `${window.location.origin}/players/${result.id}`
                            : '';
                    const emailRes = await fetch('/api/send-email', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            type: 'NEW_PLAYER',
                            data: {
                                name: formData.name,
                                lastName: formData.lastName,
                                dni: formData.dni,
                                phone: formData.phone,
                                email: formData.email,
                                instagram: formData.instagram,
                                level: formData.level,
                                position: formData.position,
                                profileUrl: profileUrl || undefined
                            }
                        })
                    });
                    if (!emailRes.ok) {
                        const err = await emailRes.json().catch(() => ({}));
                        console.warn('Aviso por email no enviado:', err?.error || emailRes.statusText);
                    }
                } catch (emailError) {
                    console.error('Error sending notification email:', emailError);
                }

                try {
                    const wh = await fetch('/api/admin/new-profile-alert', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json', ...(await getAuthHeaders()) },
                        body: JSON.stringify({
                            firstName: formData.name,
                            lastName: formData.lastName,
                        }),
                    });
                    if (!wh.ok) {
                        const j = await wh.json().catch(() => ({}));
                        console.warn('Aviso admin (WhatsApp) no enviado:', (j as { error?: string })?.error);
                    }
                } catch (adminErr) {
                    console.warn('Aviso admin (WhatsApp):', adminErr);
                }

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
            {/* Sidebar removed to omit from this screen as per user request */}

            {/* Background Decorative Elements */}
            <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-padel-primary/5 rounded-full blur-[120px] -translate-y-1/2 translate-x-1/2 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-[300px] h-[300px] bg-blue-500/5 rounded-full blur-[100px] translate-y-1/2 -translate-x-1/2 pointer-events-none" />

            <div ref={scrollAreaRef} className="ipad-scroll-area !pr-0">
                <header className="sticky top-0 z-50 bg-[#080808]/90 backdrop-blur-xl border-b border-white/5">
                    <div className="max-w-md mx-auto px-6 py-2 flex items-center justify-between">
                        <BackButton className="w-8 h-8 rounded-lg border-white/5" />
                        <div className="flex-1 flex flex-col items-center justify-center">
                            <h1 className="text-base font-black italic uppercase tracking-tighter text-center text-white drop-shadow-[0_0_20px_rgba(255,255,255,0.5)]">
                                {editId ? (
                                    <span className="text-padel-primary drop-shadow-[0_0_20px_rgba(204,255,0,0.6)]">Actualizar Ficha</span>
                                ) : (
                                    <>REGISTRATE <span className="text-padel-primary drop-shadow-[0_0_20px_rgba(204,255,0,0.6)]">PRO</span></>
                                )}
                            </h1>
                            <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.5em] italic mt-0.5 drop-shadow-[0_0_10px_rgba(204,255,0,0.2)]">SISTEMA OFICIAL SMART PADEL</p>
                        </div>
                    </div>
                    {/* Progress Bar Visual Only */}
                    <div className="w-full h-1 bg-white/5">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: "33%" }}
                            className="h-full bg-padel-primary shadow-[0_0_8px_#ccff00]"
                        />
                    </div>
                </header>

                <main className="max-w-2xl mx-auto px-4 py-4 space-y-4 pb-24 relative z-10">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="space-y-4"
                    >
                        {/* Bienvenido Header */}
                        <div className="flex flex-col items-center justify-center space-y-1 mb-6">
                            <h2 className="text-2xl font-black italic uppercase tracking-tighter text-white drop-shadow-[0_0_15px_rgba(255,255,255,0.2)]">
                                Bienvenido, <span className="text-padel-primary">CRACK</span>
                            </h2>
                            <p className="text-[8px] font-black text-white/40 uppercase tracking-[0.5em] italic">sistema smart padel</p>
                        </div>

                        {/* Paso 1. Foto de Perfil Header Style */}
                        <section className="flex flex-col items-center bg-zinc-900/20 p-6 rounded-3xl border border-white/5 relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-padel-primary/20 to-transparent" />

                            <div className="flex flex-col items-center gap-1.5 mb-8">
                                <span className="text-[8px] font-black bg-white text-black px-3 py-0.5 rounded-full italic">PASO 1</span>
                                <span className="text-[11px] font-black uppercase text-white tracking-[0.2em] italic">FOTO DEL JUGADOR</span>
                            </div>

                            <div className="relative group">
                                <div className="absolute -inset-10 bg-padel-primary/10 rounded-full blur-3xl group-hover:bg-padel-primary/20 transition-all duration-700 pointer-events-none" />

                                <div className="relative z-10">
                                    <button
                                        type="button"
                                        onClick={() => setShowPhotoOptions(true)}
                                        className="relative w-32 h-32 rounded-[40px] border-2 border-zinc-800 p-1 bg-zinc-800 shadow-lg overflow-hidden flex items-center justify-center transition-all duration-500 hover:scale-105 active:scale-95 group focus:outline-none ring-1 ring-white/5"
                                    >
                                        <div className="w-full h-full rounded-[30px] overflow-hidden bg-zinc-900 border border-white/5 relative">
                                            {formData.photo ? (
                                                <img src={formData.photo} alt="Vista previa" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                            ) : (
                                                <div className="w-full h-full flex flex-col items-center justify-center bg-[#0a0a0a]">
                                                    <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_transparent_0%,_#000_100%)] opacity-50" />
                                                    <User className="w-16 h-16 text-zinc-800 relative z-10" />
                                                    <span className="text-[6px] font-black uppercase text-zinc-700 tracking-[0.4em] relative z-10">SUBIR FOTO</span>
                                                </div>
                                            )}
                                            <div className="absolute inset-0 bg-padel-primary/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center backdrop-blur-sm">
                                                <Camera className="w-10 h-10 text-black" />
                                            </div>
                                        </div>
                                    </button>
                                    <button
                                        onClick={() => setShowPhotoOptions(true)}
                                        className="absolute -bottom-1 -right-1 w-11 h-11 rounded-2xl bg-padel-primary flex items-center justify-center text-black border-[3px] border-[#0c0c0c] shadow-lg hover:scale-110 active:scale-90 transition-all group"
                                    >
                                        <Camera className="w-5 h-5 group-hover:rotate-12 transition-transform" />
                                    </button>
                                </div>
                            </div>

                            <div className="mt-6 text-center">
                                <span className="text-[10px] text-zinc-500 font-bold uppercase tracking-[0.3em] italic">REGISTRO <span className="text-padel-primary">OFICIAL</span></span>
                            </div>
                        </section>

                        {/* Paso 2. Información General - Card Style */}
                        <section className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl backdrop-blur-3xl space-y-5 relative overflow-hidden group/card">
                            <div className="absolute top-0 right-0 w-24 h-24 bg-padel-primary/5 rounded-full blur-[60px] pointer-events-none" />

                            <div className="flex flex-col items-center gap-1.5 mb-4">
                                <span className="text-[8px] font-black bg-white text-black px-3 py-0.5 rounded-full italic">PASO 2</span>
                                <span className="text-[11px] font-black uppercase text-white tracking-[0.2em] italic">FICHA DEL JUGADOR</span>
                            </div>

                            <div className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-white tracking-widest pl-1">Nombres</label>
                                        <div className="relative group/input">
                                            <input
                                                type="text"
                                                placeholder="Nombres"
                                                className="w-full bg-zinc-950 border border-white/20 rounded-xl px-4 py-3 text-xs font-bold focus:border-padel-primary focus:bg-black outline-none transition-all italic text-white placeholder:text-zinc-600"
                                                value={formData.name}
                                                onChange={e => updateField('name', e.target.value)}
                                            />
                                            <User className="absolute right-4 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-600 group-focus-within/input:text-padel-primary transition-colors" />
                                        </div>
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-white tracking-widest pl-1">Apellidos</label>
                                        <input
                                            type="text"
                                            placeholder="Apellidos"
                                            className="w-full bg-zinc-950 border border-white/20 rounded-xl px-4 py-3 text-xs font-bold focus:border-padel-primary focus:bg-black outline-none transition-all italic text-white placeholder:text-zinc-600"
                                            value={formData.lastName}
                                            onChange={e => updateField('lastName', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="flex justify-between items-center pl-1">
                                        <label className="text-[8px] font-black uppercase text-white tracking-widest">Cédula</label>
                                        <span className="text-[7px] text-zinc-600 italic font-bold">Teclea "E" para Extranjero o "V" para Venezolano</span>
                                    </div>
                                    <input
                                        type="text"
                                        placeholder="V-00.000.000"
                                        className="w-full bg-zinc-950 border border-white/20 rounded-xl px-4 py-3 text-xs font-bold focus:border-padel-primary focus:bg-black outline-none transition-all text-white placeholder:text-zinc-600"
                                        value={formData.dni}
                                        onChange={e => updateField('dni', e.target.value)}
                                    />
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-white tracking-widest pl-1">Fecha de Nacimiento</label>
                                        <input
                                            type="date"
                                            className="w-full bg-zinc-950 border border-white/20 rounded-xl px-4 py-3 text-xs font-bold focus:border-padel-primary focus:bg-black outline-none transition-all h-[42px] [color-scheme:dark] text-white"
                                            value={formData.birthDate}
                                            onChange={e => updateField('birthDate', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-white tracking-widest pl-1">WhatsApp</label>
                                        <input
                                            type="text"
                                            placeholder="+58 412 0000000"
                                            className="w-full bg-zinc-950 border border-white/20 rounded-xl px-4 py-3 text-xs font-bold focus:border-padel-primary focus:bg-black outline-none transition-all text-white placeholder:text-zinc-600"
                                            value={formData.phone}
                                            onChange={e => updateField('phone', e.target.value)}
                                        />
                                    </div>
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-white tracking-widest pl-1">Instagram</label>
                                        <div className="relative group">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-zinc-600 font-black text-[10px] group-focus-within:text-padel-primary transition-colors">@</span>
                                            <input
                                                type="text"
                                                placeholder="usuario"
                                                className="w-full bg-zinc-950 border border-white/20 rounded-xl pl-9 pr-4 py-3 text-xs font-bold focus:border-padel-primary focus:bg-black outline-none transition-all italic text-white placeholder:text-zinc-600"
                                                value={formData.instagram}
                                                onChange={e => updateField('instagram', e.target.value)}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-white tracking-widest pl-1">Email</label>
                                    <input
                                        type="email"
                                        placeholder="email@ejemplo.com"
                                        className="w-full bg-zinc-950 border border-white/20 rounded-xl px-4 py-3 text-xs font-bold focus:border-padel-primary focus:bg-black outline-none transition-all text-white placeholder:text-zinc-600"
                                        value={formData.email}
                                        onChange={e => updateField('email', e.target.value)}
                                    />
                                </div>

                                <div className="pt-4 border-t border-white/5 grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <label className="text-[8px] font-black uppercase text-white tracking-widest pl-1 flex justify-between items-center">
                                            <span>NIVEL DE JUEGO</span>
                                            <span className="text-padel-primary italic text-[7px]">CAT. {formData.level}</span>
                                        </label>
                                        <div className="grid grid-cols-7 gap-1">
                                            {levels.map(lvl => (
                                                <button
                                                    key={lvl}
                                                    type="button"
                                                    onClick={() => updateField('level', lvl)}
                                                    className={`h-8 rounded-lg flex items-center justify-center font-black text-[10px] transition-all duration-300 ${formData.level === lvl
                                                        ? 'bg-padel-primary text-black shadow-[0_0_10px_rgba(204,255,0,0.3)]'
                                                        : 'bg-white/5 border border-white/5 text-zinc-600 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {lvl}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black uppercase text-white tracking-widest text-center block">SEXO</label>
                                            <div className="grid grid-cols-2 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                                                <button
                                                    key="MALE"
                                                    type="button"
                                                    onClick={() => updateField('gender', 'MALE')}
                                                    className={`h-7 rounded-lg flex items-center justify-center text-[7px] font-black uppercase tracking-widest transition-all ${formData.gender === 'MALE'
                                                        ? 'bg-padel-primary text-black'
                                                        : 'text-zinc-600 hover:bg-white/5'
                                                        }`}
                                                >
                                                    M
                                                </button>
                                                <button
                                                    key="FEMALE"
                                                    type="button"
                                                    onClick={() => updateField('gender', 'FEMALE')}
                                                    className={`h-7 rounded-lg flex items-center justify-center text-[7px] font-black uppercase tracking-widest transition-all ${formData.gender === 'FEMALE'
                                                        ? 'bg-padel-primary text-black'
                                                        : 'text-zinc-600 hover:bg-white/5'
                                                        }`}
                                                >
                                                    F
                                                </button>
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <label className="text-[8px] font-black uppercase text-white tracking-widest text-center block">POSICIÓN</label>
                                            <div className="grid grid-cols-3 gap-1 bg-black/40 p-1 rounded-xl border border-white/5">
                                                <button
                                                    type="button"
                                                    onClick={() => updateField('position', 'Drive')}
                                                    className={`h-7 rounded-lg flex items-center justify-center text-[7px] font-black uppercase tracking-widest transition-all ${formData.position === 'Drive'
                                                        ? 'bg-padel-primary text-black'
                                                        : 'text-zinc-600 hover:bg-white/5'
                                                        }`}
                                                >
                                                    DRI
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateField('position', 'Revés')}
                                                    className={`h-7 rounded-lg flex items-center justify-center text-[7px] font-black uppercase tracking-widest transition-all ${formData.position === 'Revés'
                                                        ? 'bg-padel-primary text-black'
                                                        : 'text-zinc-600 hover:bg-white/5'
                                                        }`}
                                                >
                                                    REV
                                                </button>
                                                <button
                                                    type="button"
                                                    onClick={() => updateField('position', 'Ambos')}
                                                    className={`h-7 rounded-lg flex items-center justify-center text-[7px] font-black uppercase tracking-widest transition-all ${formData.position === 'Ambos'
                                                        ? 'bg-padel-primary text-black'
                                                        : 'text-zinc-600 hover:bg-white/5'
                                                        }`}
                                                >
                                                    AMB
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </section>

                        {/* 3. Información Médica y Equipación */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Protocolo Médico */}
                            <section className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl backdrop-blur-2xl space-y-4">
                                <div className="flex flex-col items-center gap-1.5 mb-4">
                                    <span className="text-[8px] font-black bg-white text-black px-3 py-0.5 rounded-full italic">PASO 3</span>
                                    <span className="text-[11px] font-black uppercase text-red-500 tracking-[0.2em] italic">DATOS DE SALUD</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-white tracking-widest pl-1">Sangre</label>
                                        <div className="grid grid-cols-4 gap-1">
                                            {bloodTypes.map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => updateField('bloodType', type)}
                                                    className={`h-7 rounded-lg flex items-center justify-center text-[9px] font-black transition-all ${formData.bloodType === type
                                                        ? 'bg-red-500 text-white shadow-[0_0_8px_rgba(239,68,68,0.3)]'
                                                        : 'bg-white/5 border border-white/5 text-zinc-500 hover:bg-white/10'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-white tracking-widest pl-1">Alergias</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="Ej. Penicilina"
                                                className="w-full bg-zinc-950 border border-white/20 rounded-xl pl-8 pr-4 py-3 text-[10px] font-bold focus:border-red-500/50 focus:bg-black outline-none transition-all italic text-white placeholder:text-zinc-600"
                                                value={formData.allergies}
                                                onChange={e => updateField('allergies', e.target.value)}
                                            />
                                            <AlertCircle className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-800 group-focus-within:text-red-500" />
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-white tracking-widest pl-1">Observaciones</label>
                                        <div className="relative group">
                                            <input
                                                type="text"
                                                placeholder="Ej. Lesión"
                                                className="w-full bg-zinc-950 border border-white/20 rounded-xl pl-8 pr-4 py-3 text-[10px] font-bold focus:border-red-500/50 focus:bg-black outline-none transition-all italic text-white placeholder:text-zinc-600"
                                                value={formData.medicalConditions}
                                                onChange={e => updateField('medicalConditions', e.target.value)}
                                            />
                                            <Stethoscope className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-800 group-focus-within:text-red-500" />
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {/* Tallas del Jugador */}
                            <section className="bg-zinc-900/40 border border-white/5 p-5 rounded-3xl backdrop-blur-2xl space-y-4">
                                <div className="flex flex-col items-center gap-1.5 mb-4">
                                    <span className="text-[8px] font-black bg-white text-black px-3 py-0.5 rounded-full italic">PASO 4</span>
                                    <span className="text-[11px] font-black uppercase text-white tracking-[0.2em] italic">EQUIPACIÓN</span>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-white tracking-widest pl-1">Franela</label>
                                            <div className="relative group">
                                                <select
                                                    className="w-full bg-zinc-950 border border-white/20 rounded-xl pl-8 pr-2 py-2 text-[10px] font-black uppercase outline-none appearance-none text-white focus:border-padel-primary focus:bg-black transition-all"
                                                    value={formData.suitSize}
                                                    onChange={e => updateField('suitSize', e.target.value)}
                                                >
                                                    {sizes.map(s => <option key={s} value={s} className="bg-zinc-900">{s}</option>)}
                                                </select>
                                                <Shirt className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-800 group-focus-within:text-padel-primary pointer-events-none" />
                                            </div>
                                        </div>
                                        <div className="space-y-1">
                                            <label className="text-[8px] font-black uppercase text-white tracking-widest pl-1">Short</label>
                                            <div className="relative group">
                                                <select
                                                    className="w-full bg-zinc-950 border border-white/20 rounded-xl pl-8 pr-2 py-2 text-[10px] font-black uppercase outline-none appearance-none text-white focus:border-padel-primary focus:bg-black transition-all"
                                                    value={formData.shortSize}
                                                    onChange={e => updateField('shortSize', e.target.value)}
                                                >
                                                    {sizes.map(s => <option key={s} value={s} className="bg-zinc-900">{s}</option>)}
                                                </select>
                                                <Shirt className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-800 group-focus-within:text-padel-primary pointer-events-none opacity-70" />
                                            </div>
                                        </div>
                                    </div>

                                    <div className="space-y-1">
                                        <label className="text-[8px] font-black uppercase text-white tracking-widest pl-1">Calzado (EU)</label>
                                        <div className="relative group">
                                            <input
                                                type="number"
                                                placeholder="Ej. 42"
                                                className="w-full bg-zinc-950 border border-white/20 rounded-xl pl-8 pr-4 py-3 text-[10px] font-black focus:border-padel-primary/40 focus:bg-black outline-none transition-all text-white placeholder:text-zinc-600"
                                                value={formData.shoeSize}
                                                onChange={e => updateField('shoeSize', e.target.value)}
                                            />
                                            <Footprints className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-zinc-800 group-focus-within:text-padel-primary" />
                                        </div>
                                    </div>
                                    <p className="text-[7px] text-zinc-600 text-center italic font-bold tracking-widest uppercase">DATOS PARA TU EQUIPACIÓN PRO</p>
                                </div>
                            </section>
                        </div>

                        {/* Terms and Conditions Checkbox */}
                        <div className="px-4">
                            <label className="flex items-center gap-3 cursor-pointer group">
                                <div className="relative flex-shrink-0">
                                    <input
                                        type="checkbox"
                                        className="sr-only"
                                        checked={acceptedTerms}
                                        onChange={e => setAcceptedTerms(e.target.checked)}
                                    />
                                    <div className={`w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center bg-padel-primary border-padel-primary shadow-lg ${acceptedTerms ? 'shadow-padel-primary/40 scale-110' : 'shadow-padel-primary/10 opacity-90'}`}>
                                        {acceptedTerms && <CircleDot className="w-4 h-4 text-black" strokeWidth={3} />}
                                    </div>
                                </div>
                                <div className="flex-1 text-[9px] font-medium text-white tracking-tight leading-snug text-justify">
                                    Acepto en un solo acto: contrato de la plataforma, privacidad y términos de inscripción a torneos (sin firma en pantalla;{' '}
                                    <button
                                        type="button"
                                        onClick={(e) => { e.stopPropagation(); setShowTermsModal(true); }}
                                        className="bg-transparent p-0 border-none inline text-white font-bold underline transition-all"
                                    >
                                        ver documento
                                    </button>
                                    ).
                                </div>
                            </label>
                        </div>

                        {/* Submit Button */}
                        <div className="pt-2 pb-10 px-4">
                            <button
                                type="button"
                                onClick={handleSave}
                                disabled={loading || !acceptedTerms}
                                className={`w-full h-14 rounded-2xl font-black text-sm uppercase italic flex items-center justify-center gap-3 transition-all group relative overflow-hidden ${loading || !acceptedTerms ? 'bg-zinc-800/50 text-zinc-700 cursor-not-allowed' : 'bg-padel-primary text-black hover:scale-[1.01] active:scale-[0.98] shadow-lg shadow-padel-primary/10'}`}
                            >
                                {loading ? (
                                    <div className="w-5 h-5 border-[3px] border-black border-t-transparent rounded-full animate-spin" />
                                ) : (
                                    <>
                                        <span className="tracking-[0.2em]">{editId ? 'ACTUALIZAR PERFIL' : 'REGISTRAR JUGADOR'}</span>
                                        {editId ? <Save className="w-4 h-4" /> : <Award className="w-4 h-4" />}
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </main>

                <LegalModal
                    open={showTermsModal}
                    onClose={() => setShowTermsModal(false)}
                    onAccept={() => {
                        setAcceptedTerms(true);
                        setShowTermsModal(false);
                    }}
                />

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
                                className="bg-[#111111] w-full max-w-sm rounded-[32px] p-6 border border-white/10 relative z-[120] space-y-6 shadow-2xl"
                            >
                                <div className="space-y-1 text-center">
                                    <h3 className="text-xl font-black italic uppercase tracking-tighter">Captura tu Perfil</h3>
                                    <p className="text-[9px] text-zinc-600 font-bold uppercase tracking-widest">Elige cómo subir tu foto</p>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <button
                                        onClick={startCamera}
                                        className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-padel-primary/10 border border-white/5 hover:border-padel-primary/30 transition-all group"
                                    >
                                        <Camera className="w-8 h-8 text-zinc-600 group-hover:text-padel-primary group-hover:scale-110 transition-all" />
                                        <span className="text-[8px] font-black uppercase tracking-widest group-hover:text-white">CÁMARA</span>
                                    </button>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex flex-col items-center gap-3 p-6 rounded-2xl bg-white/5 hover:bg-padel-primary/10 border border-white/5 hover:border-padel-primary/30 transition-all group"
                                    >
                                        <Upload className="w-8 h-8 text-zinc-600 group-hover:text-padel-primary group-hover:scale-110 transition-all" />
                                        <span className="text-[8px] font-black uppercase tracking-widest group-hover:text-white">GALERÍA</span>
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
                                    className="w-full py-2 text-zinc-600 font-black uppercase text-[9px] tracking-[0.3em] hover:text-white transition-colors"
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
