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
        <div className="ipad-screen-container w-full min-w-0 overflow-x-hidden bg-[#0a0a0a] text-white font-outfit relative">
            <Sidebar />

            <div className="mb-6 flex shrink-0 items-start gap-3 px-4 pb-2 pt-[max(1rem,env(safe-area-inset-top,0px))] md:pl-24 md:pr-6">
                <div className="mt-1 shrink-0">
                    <BouncingBall size={28} />
                </div>
                <div className="min-w-0 flex-1">
                    <h1 className="text-balance text-xl font-black uppercase italic tracking-tighter text-white sm:text-2xl md:text-3xl">
                        Términos y Condiciones de Inscripción
                    </h1>
                    <p className="mt-1 text-[10px] font-bold uppercase tracking-widest text-gray-500">
                        Reglas de participación en torneos
                    </p>
                </div>
            </div>

            <main className="ipad-scroll-area w-full min-w-0 px-4 pb-[max(3rem,env(safe-area-inset-bottom,0px))] md:pl-24 md:pr-6">
                <div className="mx-auto w-full max-w-3xl min-w-0">
                    <div className="space-y-6 rounded-2xl border border-white/10 bg-[#111] p-4 sm:space-y-8 sm:rounded-3xl sm:p-6 md:p-10">
                        <div className="flex gap-3 rounded-2xl border border-padel-primary/20 bg-padel-primary/10 p-3 sm:gap-4 sm:p-4">
                            <FileText className="h-8 w-8 shrink-0 text-padel-primary sm:h-10 sm:w-10" />
                            <p className="min-w-0 text-sm leading-relaxed text-gray-300 [text-wrap:pretty]">
                                Al inscribirte en un torneo aceptas los siguientes términos. Lee con atención la información sobre
                                comprobantes de pago y el uso de tus datos personales.
                            </p>
                        </div>

                        <section className="min-w-0">
                            <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-padel-primary">
                                1. Aceptación de los términos
                            </h2>
                            <p className="text-sm leading-relaxed text-gray-400 [text-wrap:pretty] [overflow-wrap:anywhere]">
                                La inscripción en cualquier torneo o evento gestionado a través de esta plataforma implica la aceptación
                                íntegra de estos Términos y Condiciones. Si no estás de acuerdo, abstente de inscribirte.
                            </p>
                        </section>

                        <section className="min-w-0">
                            <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-padel-primary">
                                2. Veracidad de los comprobantes de pago
                            </h2>
                            <p className="text-sm leading-relaxed text-gray-400 [text-wrap:pretty] [overflow-wrap:anywhere]">
                                Al adjuntar un comprobante de pago (transferencia, depósito o recibo) para acreditar tu inscripción,
                                declaras bajo tu responsabilidad que:
                            </p>
                            <ul className="mt-3 list-disc space-y-2 pl-5 text-sm leading-relaxed text-gray-400 marker:text-padel-primary [text-wrap:pretty]">
                                <li className="[overflow-wrap:anywhere]">
                                    El comprobante es auténtico y corresponde a un pago real realizado por ti o en tu nombre.
                                </li>
                                <li className="[overflow-wrap:anywhere]">
                                    El monto y la referencia indicados corresponden a la inscripción en la categoría seleccionada.
                                </li>
                                <li className="[overflow-wrap:anywhere]">No has alterado ni falsificado el documento presentado.</li>
                            </ul>
                            <p className="mt-3 text-sm leading-relaxed text-gray-400 [text-wrap:pretty] [overflow-wrap:anywhere]">
                                La organización podrá verificar los comprobantes mediante revisión manual o herramientas de validación.
                                La presentación de comprobantes falsos o manipulados dará lugar a la anulación de la inscripción y puede
                                implicar la exclusión de futuros eventos.
                            </p>
                        </section>

                        <section className="min-w-0">
                            <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-padel-primary">
                                3. Datos personales y privacidad (Venezuela)
                            </h2>
                            <p className="text-sm leading-relaxed text-gray-400 [text-wrap:pretty] [overflow-wrap:anywhere]">
                                Los datos personales que proporciones al inscribirte (nombre, correo, teléfono, datos de salud o
                                deportivos cuando apliquen) serán tratados con la finalidad de gestionar tu participación en el torneo,
                                comunicarte información del evento y, cuando la normativa lo permita, fines estadísticos o promocionales
                                del deporte.
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-gray-400 [text-wrap:pretty] [overflow-wrap:anywhere]">
                                En cumplimiento de las prácticas de protección de datos aplicables en Venezuela y de nuestra Política de
                                Privacidad, no vendemos tus datos a terceros. Los datos se almacenan de forma segura y solo serán
                                compartidos con la organización del torneo, autoridades cuando sea obligatorio por ley, o servicios
                                técnicos necesarios para el funcionamiento de la plataforma.
                            </p>
                            <p className="mt-2 text-sm leading-relaxed text-gray-400 [text-wrap:pretty] [overflow-wrap:anywhere]">
                                Puedes ejercer derechos de acceso, rectificación o supresión de tus datos contactando al responsable del
                                tratamiento indicado en la Política de Privacidad.
                            </p>
                        </section>

                        <section className="min-w-0">
                            <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-padel-primary">
                                4. Reglas deportivas y conducta
                            </h2>
                            <p className="text-sm leading-relaxed text-gray-400 [text-wrap:pretty] [overflow-wrap:anywhere]">
                                Te comprometes a respetar el reglamento del torneo, las reglas de juego y la conducta deportiva. La
                                organización se reserva el derecho de excluir a participantes que incumplan estas normas.
                            </p>
                        </section>

                        <section className="min-w-0">
                            <h2 className="mb-2 text-sm font-black uppercase tracking-wider text-padel-primary">5. Modificaciones</h2>
                            <p className="text-sm leading-relaxed text-gray-400 [text-wrap:pretty] [overflow-wrap:anywhere]">
                                Estos términos pueden ser actualizados. La versión vigente será la publicada en esta página. Se
                                recomienda consultarla antes de cada nueva inscripción.
                            </p>
                        </section>

                        <div className="flex gap-3 border-t border-white/10 pt-4">
                            <ShieldCheck className="h-5 w-5 shrink-0 text-padel-primary" />
                            <p className="min-w-0 text-[10px] leading-relaxed text-gray-600 [text-wrap:pretty] [overflow-wrap:anywhere]">
                                Para el tratamiento de tus datos personales en general, consulta la{' '}
                                <a href="/politica-privacidad" className="font-bold text-padel-primary hover:underline">
                                    Política de Privacidad
                                </a>
                                .
                            </p>
                        </div>
                        <p className="border-t border-white/5 pt-2 text-[10px] leading-relaxed text-gray-600 [text-wrap:pretty]">
                            Última actualización: 2025. Aplicable a inscripciones realizadas en Venezuela y en los eventos gestionados
                            por la plataforma.
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
