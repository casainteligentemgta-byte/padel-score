'use client';

import Link from 'next/link';

/** Texto legal de inscripción (alineado con /terminos-inscripcion). */
export function LegalTermsInscriptionBody() {
    return (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400 [text-wrap:pretty] text-justify">
            <p>
                Al inscribirte en un torneo aceptas los siguientes términos. Lee con atención la información sobre
                comprobantes de pago y el uso de tus datos personales.
            </p>
            <section>
                <h3 className="mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]">1. Aceptación de los términos</h3>
                <p>
                    La inscripción en cualquier torneo o evento gestionado a través de esta plataforma implica la aceptación
                    íntegra de estos Términos y Condiciones. Si no estás de acuerdo, abstente de inscribirte.
                </p>
            </section>
            <section>
                <h3 className="mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]">2. Veracidad de los comprobantes de pago</h3>
                <p>Al adjuntar un comprobante declaras bajo tu responsabilidad que:</p>
                <ul className="mt-2 list-disc space-y-1 pl-5 marker:text-[#ccff00]">
                    <li>El comprobante es auténtico y corresponde a un pago real realizado por ti o en tu nombre.</li>
                    <li>El monto y la referencia corresponden a la inscripción en la categoría seleccionada.</li>
                    <li>No has alterado ni falsificado el documento presentado.</li>
                </ul>
                <p className="mt-2">
                    La organización podrá verificar los comprobantes. La presentación de comprobantes falsos o manipulados puede
                    anular la inscripción y excluirte de futuros eventos.
                </p>
            </section>
            <section>
                <h3 className="mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]">3. Datos personales y privacidad (Venezuela)</h3>
                <p>
                    Los datos que proporciones serán tratados para gestionar tu participación, comunicarte información del evento y,
                    cuando la normativa lo permita, fines estadísticos o promocionales del deporte. No vendemos tus datos a terceros.
                </p>
            </section>
            <section>
                <h3 className="mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]">4. Reglas deportivas y conducta</h3>
                <p>Te comprometes a respetar el reglamento del torneo y la conducta deportiva.</p>
            </section>
            <section>
                <h3 className="mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]">5. Modificaciones</h3>
                <p>La versión vigente es la publicada en la app. Consulta antes de cada inscripción.</p>
            </section>
            <p className="text-xs text-zinc-500">
                Más detalle:{' '}
                <Link href="/terminos-inscripcion" className="font-bold text-[#ccff00] underline" target="_blank" rel="noreferrer">
                    Términos completos
                </Link>
                .
            </p>
        </div>
    );
}

/** Contrato Pro Smart (registro jugador). */
export function LegalTermsProPlayerBody() {
    return (
        <div className="space-y-4 text-sm leading-relaxed text-zinc-400 [text-wrap:pretty] text-justify">
            <section>
                <h3 className="mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]">1. Exoneración de responsabilidad</h3>
                <p>
                    Declaras estar en condiciones físicas óptimas para la alta competencia. Liberas irrevocablemente a Smart Padel,
                    sus organizadores y patrocinadores de toda responsabilidad por lesiones, accidentes o percances médicos durante
                    la competencia o en las instalaciones.
                </p>
            </section>
            <section>
                <h3 className="mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]">2. Uso de imagen y marca</h3>
                <p>
                    Autorizas el uso de tu nombre e imagen (fotos/videos) en redes sociales, transmisiones en vivo (Broadcasting PRO)
                    y material publicitario de Smart Padel con fines promocionales globales.
                </p>
            </section>
            <section>
                <h3 className="mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]">3. Protección de datos</h3>
                <p>
                    Tus datos personales y médicos se almacenan para tu seguridad y la gestión operativa de los torneos. Smart Padel
                    garantiza confidencialidad y no compartirá tu información con terceros sin consentimiento explícito.
                </p>
            </section>
            <section>
                <h3 className="mb-1 text-xs font-black uppercase tracking-wider text-[#ccff00]">4. Conducta deportiva</h3>
                <p>
                    Te comprometes al fair play. Conductas antideportivas pueden resultar en la expulsión inmediata del sistema oficial
                    de Smart Padel.
                </p>
            </section>
        </div>
    );
}
