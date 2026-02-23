'use client';

import React, { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
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
    Stethoscope
} from 'lucide-react';
import { dataService } from '@/lib/dataService';
import { useAuth } from '@/lib/AuthContext';
import { formatDNI } from '@/lib/formatters';
import Sidebar from '@/components/Sidebar';
import BottomNav from '@/components/BottomNav';

export default function PlayerRegistrationPage() {
    const router = useRouter();
    const { user } = useAuth();
    const [step, setStep] = useState(1);
    const [loading, setLoading] = useState(false);

    // UI states for photo handling
    const [showPhotoOptions, setShowPhotoOptions] = useState(false);
    const [isCameraActive, setIsCameraActive] = useState(false);
    const videoRef = useRef<HTMLVideoElement>(null);
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);

    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
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

        setLoading(true);
        try {
            await dataService.addParticipant({
                ...formData,
                fullName: `${formData.name} ${formData.lastName}`.trim(),
                registeredAt: new Date(),
                status: 'Activo'
            }, user.uid);

            alert('¡Jugador registrado con éxito!');
            router.push('/players');
        } catch (error: any) {
            console.error('Error saving player:', error);
            alert(`Error al registrar jugador: ${error.message}`);
        } finally {
            setLoading(false);
        }
    };

    const levels = [1, 2, 3, 4, 5, 6, 7];
    const positions = ['Drive', 'Revés', 'Ambos'];
    const sizes = ['S', 'M', 'L', 'XL', 'XXL'];
    const bloodTypes = ['O+', 'O-', 'A+', 'A-', 'B+', 'B-', 'AB+', 'AB-'];

    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />

            <div className="ipad-scroll-area !pr-0">
                <header className="sticky top-0 z-50 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 ml-20 md:ml-24">
                    <div className="max-w-md mx-auto px-4 py-4 flex items-center justify-between">
                        <button
                            onClick={() => step > 1 ? setStep(step - 1) : router.back()}
                            className="w-10 h-10 flex items-center justify-center rounded-full bg-white/5 hover:bg-white/10 transition-colors"
                        >
                            <ArrowLeft className="w-5 h-5 text-gray-400" />
                        </button>
                        <h1 className="text-lg font-black italic uppercase tracking-tighter">Registro <span className="text-[#ccff00]">Atleta</span></h1>
                        <div className="w-10"></div>
                    </div>

                    <div className="max-w-md mx-auto px-6 pb-4">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[10px] font-black uppercase tracking-widest text-[#ccff00]">Paso {step} de 3</span>
                            <span className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">
                                {step === 1 ? 'Personal y Técnica' : step === 2 ? 'Médico y Equipación' : 'Contacto y Perfil'}
                            </span>
                        </div>
                        <div className="flex w-full h-1 gap-2">
                            <div className={`flex-1 rounded-full transition-all duration-500 ${step >= 1 ? 'bg-[#ccff00]' : 'bg-white/10'}`}></div>
                            <div className={`flex-1 rounded-full transition-all duration-500 ${step >= 2 ? 'bg-[#ccff00]' : 'bg-white/10'}`}></div>
                            <div className={`flex-1 rounded-full transition-all duration-500 ${step >= 3 ? 'bg-[#ccff00]' : 'bg-white/10'}`}></div>
                        </div>
                    </div>
                </header>

                <main className="max-w-md mx-auto px-4 py-8 space-y-10">
                    <AnimatePresence mode="wait">
                        {step === 1 && (
                            <motion.section
                                key="step1"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                {/* Profile Picture */}
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative group">
                                        <div className="w-32 h-32 rounded-full border-4 border-[#ccff00]/20 bg-white/5 flex items-center justify-center overflow-hidden">
                                            {formData.photo ? (
                                                <img src={formData.photo} alt="Profile" className="w-full h-full object-cover" />
                                            ) : (
                                                <User className="w-12 h-12 text-gray-700" />
                                            )}
                                        </div>
                                        <button
                                            onClick={() => setShowPhotoOptions(true)}
                                            className="absolute bottom-0 right-0 w-10 h-10 bg-[#ccff00] rounded-full flex items-center justify-center shadow-lg border-2 border-[#0a0a0a] text-black hover:scale-110 transition-transform"
                                        >
                                            <Camera className="w-5 h-5" />
                                        </button>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Nombre</label>
                                            <input
                                                type="text"
                                                placeholder="Juan"
                                                className="w-full bg-white/10 border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold focus:border-[#ccff00] outline-none transition-all italic"
                                                value={formData.name}
                                                onChange={e => updateField('name', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Apellido</label>
                                            <input
                                                type="text"
                                                placeholder="Pérez"
                                                className="w-full bg-white/10 border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold focus:border-[#ccff00] outline-none transition-all italic"
                                                value={formData.lastName}
                                                onChange={e => updateField('lastName', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Cédula / DNI</label>
                                            <input
                                                type="text"
                                                placeholder="V-28.847.234"
                                                className="w-full bg-white/10 border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold focus:border-[#ccff00] outline-none transition-all"
                                                value={formData.dni}
                                                onChange={e => updateField('dni', e.target.value)}
                                            />
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Nacimiento</label>
                                            <input
                                                type="date"
                                                className="w-full bg-white/10 border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold focus:border-[#ccff00] outline-none transition-all"
                                                value={formData.birthDate}
                                                onChange={e => updateField('birthDate', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="pt-4 border-t border-white/5 space-y-6">
                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1 flex justify-between">
                                                <span>Nivel de Juego</span>
                                                <span className="text-[#ccff00]">Cat. {formData.level}</span>
                                            </label>
                                            <div className="grid grid-cols-7 gap-2">
                                                {levels.map(lvl => (
                                                    <button
                                                        key={lvl}
                                                        type="button"
                                                        onClick={() => updateField('level', lvl)}
                                                        className={`h-11 rounded-xl flex items-center justify-center font-black text-xs transition-all ${formData.level === lvl
                                                            ? 'bg-[#ccff00] text-black scale-105 shadow-[0_0_15px_rgba(204,255,0,0.3)]'
                                                            : 'bg-white/5 border border-white/5 text-gray-500'
                                                            }`}
                                                    >
                                                        {lvl}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>

                                        <div className="space-y-3">
                                            <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1 text-center block">Posición Habitual</label>
                                            <div className="grid grid-cols-3 gap-2 bg-white/5 p-1 rounded-2xl border border-white/5">
                                                {positions.map(pos => (
                                                    <button
                                                        key={pos}
                                                        type="button"
                                                        onClick={() => updateField('position', pos)}
                                                        className={`h-11 rounded-xl flex items-center justify-center text-xs font-black uppercase tracking-widest transition-all ${formData.position === pos
                                                            ? 'bg-[#ccff00] text-black'
                                                            : 'text-gray-500 hover:text-white'
                                                            }`}
                                                    >
                                                        {pos}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </motion.section>
                        )}

                        {step === 2 && (
                            <motion.section
                                key="step2"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-10"
                            >
                                {/* Medical Information */}
                                <div className="bg-red-500/5 p-6 rounded-3xl border border-red-500/10 space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-red-500 flex items-center gap-2">
                                        <HeartPulse className="w-4 h-4" /> Información Médica
                                    </h4>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest pl-1">Grupo Sanguíneo</label>
                                        <div className="grid grid-cols-4 gap-2">
                                            {bloodTypes.map(type => (
                                                <button
                                                    key={type}
                                                    type="button"
                                                    onClick={() => updateField('bloodType', type)}
                                                    className={`h-10 rounded-xl flex items-center justify-center text-[10px] font-black transition-all ${formData.bloodType === type
                                                        ? 'bg-red-500 text-white'
                                                        : 'bg-white/5 border border-white/5 text-gray-500'
                                                        }`}
                                                >
                                                    {type}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest pl-1 flex items-center gap-2">
                                            <AlertCircle className="w-3 h-3" /> Alergias Conocidas
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej. Penicilina, polen..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-red-500 outline-none transition-all"
                                            value={formData.allergies}
                                            onChange={e => updateField('allergies', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest pl-1 flex items-center gap-2">
                                            <Stethoscope className="w-3 h-3" /> Padecimientos / Lesiones
                                        </label>
                                        <input
                                            type="text"
                                            placeholder="Ej. Asma, lesión de rodilla..."
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-bold focus:border-red-500 outline-none transition-all"
                                            value={formData.medicalConditions}
                                            onChange={e => updateField('medicalConditions', e.target.value)}
                                        />
                                    </div>
                                </div>

                                {/* Equipment Sizes */}
                                <div className="bg-[#ccff00]/5 p-6 rounded-3xl border border-[#ccff00]/10 space-y-6">
                                    <h4 className="text-xs font-black uppercase tracking-widest text-[#ccff00] flex items-center gap-2">
                                        <Shirt className="w-4 h-4" /> Tallas de Equipación
                                    </h4>

                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest pl-1">Franela</label>
                                            <select
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-black outline-none focus:border-[#ccff00] appearance-none"
                                                value={formData.suitSize}
                                                onChange={e => updateField('suitSize', e.target.value)}
                                            >
                                                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                        <div className="space-y-2">
                                            <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest pl-1">Short</label>
                                            <select
                                                className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-black outline-none focus:border-[#ccff00] appearance-none"
                                                value={formData.shortSize}
                                                onChange={e => updateField('shortSize', e.target.value)}
                                            >
                                                {sizes.map(s => <option key={s} value={s}>{s}</option>)}
                                            </select>
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-600 tracking-widest pl-1 flex items-center gap-2">
                                            <Footprints className="w-3 h-3" /> Talla Zapato (EU)
                                        </label>
                                        <input
                                            type="number"
                                            placeholder="Ej. 42"
                                            className="w-full bg-black/40 border border-white/10 rounded-xl px-4 py-3 text-xs font-black focus:border-[#ccff00] outline-none transition-all"
                                            value={formData.shoeSize}
                                            onChange={e => updateField('shoeSize', e.target.value)}
                                        />
                                    </div>
                                    <p className="text-[9px] text-gray-600 text-center italic font-bold">Información necesaria para uniformes y dotación del club.</p>
                                </div>
                            </motion.section>
                        )}

                        {step === 3 && (
                            <motion.section
                                key="step3"
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -20 }}
                                className="space-y-8"
                            >
                                <div className="space-y-4">
                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1 flex items-center gap-2">
                                            <Phone className="w-3 h-3 text-[#ccff00]" /> WhatsApp de Contacto
                                        </label>
                                        <input
                                            type="tel"
                                            placeholder="+58 412 000 0000"
                                            className="w-full bg-white/10 border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold focus:border-[#ccff00] outline-none transition-all"
                                            value={formData.phone}
                                            onChange={e => updateField('phone', e.target.value)}
                                        />
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1 flex items-center gap-2">
                                            <Instagram className="w-3 h-3 text-[#ccff00]" /> Perfil de Instagram
                                        </label>
                                        <div className="relative">
                                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-600 font-black">@</span>
                                            <input
                                                type="text"
                                                placeholder="usuario"
                                                className="w-full bg-white/10 border border-white/5 rounded-2xl pl-10 pr-4 py-4 text-sm font-bold focus:border-[#ccff00] outline-none transition-all italic"
                                                value={formData.instagram}
                                                onChange={e => updateField('instagram', e.target.value)}
                                            />
                                        </div>
                                    </div>

                                    <div className="space-y-2 pt-4">
                                        <label className="text-[10px] font-black uppercase text-gray-500 tracking-widest pl-1">Correo Electrónico (Opcional)</label>
                                        <input
                                            type="email"
                                            placeholder="jugador@email.com"
                                            className="w-full bg-white/10 border border-white/5 rounded-2xl px-4 py-4 text-sm font-bold focus:border-[#ccff00] outline-none transition-all"
                                            value={formData.email}
                                            onChange={e => updateField('email', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="p-8 rounded-3xl bg-gradient-to-br from-[#ccff00]/10 to-transparent border border-[#ccff00]/20 flex flex-col items-center text-center space-y-4">
                                    <div className="w-20 h-20 rounded-full border-2 border-[#ccff00] bg-white/5 overflow-hidden">
                                        {formData.photo ? (
                                            <img src={formData.photo} className="w-full h-full object-cover" />
                                        ) : (
                                            <User className="w-8 h-8 text-gray-700 m-auto mt-5" />
                                        )}
                                    </div>
                                    <div>
                                        <h4 className="font-black italic uppercase tracking-tighter text-xl">{formData.name || 'Nuevo'} {formData.lastName || 'Atleta'}</h4>
                                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Listo para el alta en PADEL SMART</p>
                                    </div>
                                </div>
                            </motion.section>
                        )}
                    </AnimatePresence>
                </main>

                {/* Photo Selection Modal */}
                <AnimatePresence>
                    {showPhotoOptions && (
                        <div className="fixed inset-0 z-[110] flex items-end justify-center px-4 pb-12">
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="fixed inset-0 bg-black/60 backdrop-blur-sm"
                                onClick={() => setShowPhotoOptions(false)}
                            />
                            <motion.div
                                initial={{ y: 100 }}
                                animate={{ y: 0 }}
                                exit={{ y: 100 }}
                                className="bg-[#1a1a1a] w-full max-w-md rounded-3xl p-8 border border-white/10 relative z-[120] space-y-6"
                            >
                                <h3 className="text-xl font-bold text-center tracking-tight">Elegir Foto</h3>
                                <div className="grid grid-cols-2 gap-4">
                                    <button
                                        onClick={startCamera}
                                        className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/5 hover:bg-[#ccff00]/10 hover:text-[#ccff00] border border-white/5 transition-all"
                                    >
                                        <Camera className="w-8 h-8" />
                                        <span className="text-xs font-bold uppercase tracking-widest">CÁMARA</span>
                                    </button>
                                    <button
                                        onClick={() => fileInputRef.current?.click()}
                                        className="flex flex-col items-center gap-2 p-6 rounded-2xl bg-white/5 hover:bg-[#ccff00]/10 hover:text-[#ccff00] border border-white/5 transition-all"
                                    >
                                        <Upload className="w-8 h-8" />
                                        <span className="text-xs font-bold uppercase tracking-widest">GALERIA</span>
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
                                    className="w-full py-2 text-gray-500 font-bold uppercase text-[10px] tracking-widest"
                                >
                                    Cancelar
                                </button>
                            </motion.div>
                        </div>
                    )}
                </AnimatePresence>

                {/* Camera Overlay */}
                <AnimatePresence>
                    {isCameraActive && (
                        <div className="fixed inset-0 z-[150] bg-black flex flex-col">
                            <div className="relative flex-1 flex items-center justify-center">
                                <video
                                    ref={videoRef}
                                    autoPlay
                                    playsInline
                                    className="w-full h-full object-cover"
                                />
                                {/* Overlay Frame */}
                                <div className="absolute inset-0 border-[40px] border-black/40 flex items-center justify-center">
                                    <div className="w-64 h-64 rounded-full border-2 border-[#ccff00] border-dashed shadow-[0_0_50px_rgba(204,255,0,0.3)]" />
                                </div>

                                <button
                                    onClick={stopCamera}
                                    className="absolute top-8 right-8 w-12 h-12 bg-white/10 rounded-full flex items-center justify-center backdrop-blur-md"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                            <div className="p-12 flex items-center justify-center bg-black gap-12">
                                <button
                                    onClick={capturePhoto}
                                    className="w-20 h-20 rounded-full bg-white border-8 border-white/20 active:scale-90 transition-all shadow-[0_0_30px_rgba(255,255,255,0.3)]"
                                />
                            </div>
                            <canvas ref={canvasRef} className="hidden" />
                        </div>
                    )}
                </AnimatePresence>

                {/* Bottom Floating Bar */}
                <footer className="absolute bottom-0 left-0 right-0 bg-black/80 backdrop-blur-xl border-t border-white/10 p-6 pb-20 z-[100] ml-20 md:ml-24">
                    <div className="max-w-md mx-auto">
                        <button
                            onClick={step < 3 ? () => setStep(step + 1) : handleSave}
                            disabled={loading}
                            className="w-full h-16 bg-[#ccff00] text-black rounded-2xl font-black text-lg uppercase italic flex items-center justify-center gap-3 transition-all hover:scale-[1.02] active:scale-95 shadow-[0_10px_30px_rgba(204,255,0,0.2)]"
                        >
                            {loading ? (
                                <div className="w-6 h-6 border-4 border-black border-t-transparent rounded-full animate-spin" />
                            ) : (
                                <>
                                    {step < 3 ? 'Siguiente Paso' : 'Finalizar Registro'}
                                    <ArrowRight className="w-6 h-6" />
                                </>
                            )}
                        </button>
                    </div>
                </footer>
            </div>
        </div>
    );
}
