/** Extrae el ID de carpeta de Google Drive desde ID suelto o URL. */
export function parseGoogleDriveFolderId(input: string): string | null {
    const t = input.trim();
    if (!t) return null;
    if (/^[a-zA-Z0-9_-]{20,80}$/.test(t)) return t;
    const folders = /\/folders\/([a-zA-Z0-9_-]+)/.exec(t);
    if (folders?.[1]) return folders[1];
    const idParam = /[?&]id=([a-zA-Z0-9_-]+)/.exec(t);
    if (idParam?.[1]) return idParam[1];
    return null;
}

export function driveDossierUrls(folderId: string) {
    const id = encodeURIComponent(folderId);
    return {
        open: `https://drive.google.com/drive/folders/${id}`,
        embed: `https://drive.google.com/embeddedfolderview?id=${id}`,
    };
}
