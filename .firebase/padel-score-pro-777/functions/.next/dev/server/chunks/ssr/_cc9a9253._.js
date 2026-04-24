module.exports = [
"[project]/node_modules/react-signature-canvas/dist/index.mjs [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.all([
  "server/chunks/ssr/node_modules_a77eaf28._.js"
].map((chunk) => __turbopack_context__.l(chunk))).then(() => {
        return parentImport("[project]/node_modules/react-signature-canvas/dist/index.mjs [app-ssr] (ecmascript)");
    });
});
}),
"[project]/src/lib/legal/uploadLegalVault.ts [app-ssr] (ecmascript, async loader)", ((__turbopack_context__) => {

__turbopack_context__.v((parentImport) => {
    return Promise.resolve().then(() => {
        return parentImport("[project]/src/lib/legal/uploadLegalVault.ts [app-ssr] (ecmascript)");
    });
});
}),
];