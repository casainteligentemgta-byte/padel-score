'use client';

import { ShieldCheck } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { BouncingBall } from '@/components/BouncingBall';

export default function PoliticaPrivacidadPage() {
    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />

            <div className="flex items-center gap-3 mb-8 flex-shrink-0 pl-20 md:pl-24 pr-4 pt-6">
                <BouncingBall size={28} />
                <div>
                    <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">Política de Privacidad</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Información sobre el tratamiento de datos</p>
                </div>
            </div>

            <main className="ipad-scroll-area pl-20 md:pl-24 pr-4 pb-12">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-[#111] border border-white/10 rounded-3xl p-6 md:p-10 space-y-8">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-padel-primary/10 border border-padel-primary/20">
                            <ShieldCheck className="w-10 h-10 text-padel-primary shrink-0" />
                            <p className="text-sm text-gray-300">En Smart Padel nos comprometemos a proteger tu información personal. Esta política describe cómo recogemos, usamos y guardamos tus datos.</p>
                        </div>

                        <section>
                            <h2 className="text-sm font-black uppercase tracking-wider text-padel-primary mb-2">1. Responsable del tratamiento</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">El responsable del tratamiento de los datos es la entidad que gestiona la plataforma Smart Padel y el club o organización que la utiliza para torneos y eventos.</p>
                        </section>

                        <section>
                            <h2 className="text-sm font-black uppercase tracking-wider text-padel-primary mb-2">2. Datos que recogemos</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">Podemos recoger: nombre, correo electrónico, datos de perfil (rol, canchas asignadas si aplica), y datos de participación en torneos (resultados, partidos). El inicio de sesión puede realizarse mediante correo y contraseña o proveedores externos (por ejemplo Google).</p>
                        </section>

                        <section>
                            <h2 className="text-sm font-black uppercase tracking-wider text-padel-primary mb-2">3. Finalidad y uso</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">Los datos se utilizan para gestionar tu cuenta, organizar torneos, mostrar resultados, pizarras en vivo y funcionalidades de la aplicación. No vendemos tus datos a terceros.</p>
                        </section>

                        <section>
                            <h2 className="text-sm font-black uppercase tracking-wider text-padel-primary mb-2">4. Base legal y conservación</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">El tratamiento se basa en la ejecución del servicio y, cuando corresponda, en tu consentimiento. Conservamos los datos mientras mantengas una cuenta activa y según lo exija la normativa aplicable.</p>
                        </section>

                        <section>
                            <h2 className="text-sm font-black uppercase tracking-wider text-padel-primary mb-2">5. Derechos</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">Puedes ejercer tus derechos de acceso, rectificación, supresión, limitación y portabilidad contactando al responsable o mediante los ajustes de tu cuenta cuando estén disponibles.</p>
                        </section>

                        <p className="text-[10px] text-gray-600 pt-4 border-t border-white/5">Última actualización: 2025. Para dudas específicas, contacta al administrador de tu club o organización.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
