'use client';

import { ShieldCheck, FileText } from 'lucide-react';
import Sidebar from '@/components/Sidebar';
import { BouncingBall } from '@/components/BouncingBall';

/**
 * Términos y Condiciones de inscripción (Agente Legal y de Usuario - El Protector).
 * Incluye cláusula sobre veracidad de comprobantes de pago y manejo de datos personales en Venezuela.
 */
export default function TerminosInscripcionPage() {
    return (
        <div className="ipad-screen-container bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />

            <div className="flex items-center gap-3 mb-8 flex-shrink-0 pl-20 md:pl-24 pr-4 pt-6">
                <BouncingBall size={28} />
                <div>
                    <h1 className="text-2xl md:text-3xl font-black italic uppercase tracking-tighter text-white">Términos y Condiciones de Inscripción</h1>
                    <p className="text-[10px] font-bold uppercase tracking-widest text-gray-500">Reglas de participación en torneos</p>
                </div>
            </div>

            <main className="ipad-scroll-area pl-20 md:pl-24 pr-4 pb-12">
                <div className="max-w-3xl mx-auto">
                    <div className="bg-[#111] border border-white/10 rounded-3xl p-6 md:p-10 space-y-8">
                        <div className="flex items-center gap-4 p-4 rounded-2xl bg-padel-primary/10 border border-padel-primary/20">
                            <FileText className="w-10 h-10 text-padel-primary shrink-0" />
                            <p className="text-sm text-gray-300">Al inscribirte en un torneo aceptas los siguientes términos. Lee con atención la información sobre comprobantes de pago y el uso de tus datos personales.</p>
                        </div>

                        <section>
                            <h2 className="text-sm font-black uppercase tracking-wider text-padel-primary mb-2">1. Aceptación de los términos</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">La inscripción en cualquier torneo o evento gestionado a través de esta plataforma implica la aceptación íntegra de estos Términos y Condiciones. Si no estás de acuerdo, abstente de inscribirte.</p>
                        </section>

                        <section>
                            <h2 className="text-sm font-black uppercase tracking-wider text-padel-primary mb-2">2. Veracidad de los comprobantes de pago</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">Al adjuntar un comprobante de pago (transferencia, depósito o recibo) para acreditar tu inscripción, declaras bajo tu responsabilidad que:</p>
                            <ul className="list-disc list-inside text-sm text-gray-400 mt-2 space-y-1">
                                <li>El comprobante es auténtico y corresponde a un pago real realizado por ti o en tu nombre.</li>
                                <li>El monto y la referencia indicados corresponden a la inscripción en la categoría seleccionada.</li>
                                <li>No has alterado ni falsificado el documento presentado.</li>
                            </ul>
                            <p className="text-sm text-gray-400 leading-relaxed mt-3">La organización podrá verificar los comprobantes mediante revisión manual o herramientas de validación. La presentación de comprobantes falsos o manipulados dará lugar a la anulación de la inscripción y puede implicar la exclusión de futuros eventos.</p>
                        </section>

                        <section>
                            <h2 className="text-sm font-black uppercase tracking-wider text-padel-primary mb-2">3. Datos personales y privacidad (Venezuela)</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">Los datos personales que proporciones al inscribirte (nombre, correo, teléfono, datos de salud o deportivos cuando apliquen) serán tratados con la finalidad de gestionar tu participación en el torneo, comunicarte información del evento y, cuando la normativa lo permita, fines estadísticos o promocionales del deporte.</p>
                            <p className="text-sm text-gray-400 leading-relaxed mt-2">En cumplimiento de las prácticas de protección de datos aplicables en Venezuela y de nuestra Política de Privacidad, no vendemos tus datos a terceros. Los datos se almacenan de forma segura y solo serán compartidos con la organización del torneo, autoridades cuando sea obligatorio por ley, o servicios técnicos necesarios para el funcionamiento de la plataforma.</p>
                            <p className="text-sm text-gray-400 leading-relaxed mt-2">Puedes ejercer derechos de acceso, rectificación o supresión de tus datos contactando al responsable del tratamiento indicado en la Política de Privacidad.</p>
                        </section>

                        <section>
                            <h2 className="text-sm font-black uppercase tracking-wider text-padel-primary mb-2">4. Reglas deportivas y conducta</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">Te comprometes a respetar el reglamento del torneo, las reglas de juego y la conducta deportiva. La organización se reserva el derecho de excluir a participantes que incumplan estas normas.</p>
                        </section>

                        <section>
                            <h2 className="text-sm font-black uppercase tracking-wider text-padel-primary mb-2">5. Modificaciones</h2>
                            <p className="text-sm text-gray-400 leading-relaxed">Estos términos pueden ser actualizados. La versión vigente será la publicada en esta página. Se recomienda consultarla antes de cada nueva inscripción.</p>
                        </section>

                        <div className="flex items-center gap-3 pt-4 border-t border-white/10">
                            <ShieldCheck className="w-5 h-5 text-padel-primary shrink-0" />
                            <p className="text-[10px] text-gray-600">Para el tratamiento de tus datos personales en general, consulta la <a href="/politica-privacidad" className="text-padel-primary hover:underline font-bold">Política de Privacidad</a>.</p>
                        </div>
                        <p className="text-[10px] text-gray-600 pt-2 border-t border-white/5">Última actualización: 2025. Aplicable a inscripciones realizadas en Venezuela y en los eventos gestionados por la plataforma.</p>
                    </div>
                </div>
            </main>
        </div>
    );
}
