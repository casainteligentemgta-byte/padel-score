import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { getPodiumDisplayLines } from '@/lib/tournamentPodium';
import { buildEventPodiumRows } from '@/lib/buildEventPodiumRows';

function safeFilenamePart(s: string, maxLen: number) {
    return s.replace(/[^\w\s\-áéíóúñüÁÉÍÓÚÑÜ]/gi, '').replace(/\s+/g, '_').slice(0, maxLen) || 'Podio';
}

export async function exportEventPodiumPdf(tournaments: Record<string, any>, eventTitle: string) {
    const rows = buildEventPodiumRows(tournaments);
    const doc = new jsPDF() as any;

    doc.setFillColor(10, 10, 10);
    doc.rect(0, 0, 210, 24, 'F');
    doc.setTextColor(204, 255, 0);
    doc.setFontSize(15);
    doc.setFont('helvetica', 'bold');
    const titleLine = `PODIO — ${String(eventTitle || 'Evento').toUpperCase()}`;
    doc.text(titleLine, 14, 12);
    doc.setTextColor(140, 140, 140);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Generado: ${new Date().toLocaleString('es-ES')}`, 14, 20);

    const tableBody: string[][] = [];
    for (const r of rows) {
        if (!r.podium) {
            tableBody.push([r.title, 'Pendiente', '—', '']);
            continue;
        }
        const champ = getPodiumDisplayLines(r.podium.first).join('\n');
        const sub = r.podium.second ? getPodiumDisplayLines(r.podium.second).join('\n') : '—';
        const note = r.podium.source === 'standings' ? 'Clasificación general' : '';
        tableBody.push([r.title, champ, sub, note]);
    }

    autoTable(doc, {
        startY: 28,
        head: [['Categoría', 'Campeón', 'Subcampeón', 'Notas']],
        body: tableBody,
        styles: { fontSize: 9, font: 'helvetica', cellPadding: 5, valign: 'top', textColor: [40, 40, 40] },
        headStyles: {
            fillColor: [0, 0, 0],
            textColor: [204, 255, 0],
            fontStyle: 'bold',
            minCellHeight: 10,
        },
        alternateRowStyles: { fillColor: [248, 250, 252] },
        margin: { left: 14, right: 14 },
        theme: 'striped',
    });

    const base = safeFilenamePart(eventTitle, 50);
    const fileName = `Podio_${base}.pdf`;
    const blob = doc.output('blob') as Blob;
    const file = new File([blob], fileName, { type: 'application/pdf' });

    if (
        typeof navigator !== 'undefined' &&
        typeof navigator.share === 'function' &&
        typeof navigator.canShare === 'function' &&
        navigator.canShare({ files: [file] })
    ) {
        try {
            await navigator.share({
                files: [file],
                title: 'Podio',
                text: String(eventTitle || 'Evento'),
            });
            return;
        } catch (e) {
            if ((e as DOMException)?.name === 'AbortError') return;
        }
    }

    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = fileName;
    a.click();
    URL.revokeObjectURL(url);
}
