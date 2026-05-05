import React from'react';
import { motion } from'framer-motion';

// Wraps the embed HTML in a minimal HTML document for the iframe srcdoc.
// Scripts inside run in a sandboxed origin — completely isolated from the
// parent page, so they cannot access cookies, localStorage, or the DOM.
function buildSrcdoc(html) {
 return `<!DOCTYPE html><html><head><meta charset="utf-8"><style>body{margin:0;padding:0;font-family:sans-serif;}</style></head><body>${html}</body></html>`;
}

export default function CustomFormEmbed({ card, isRTL }) {
 const settings = card.custom_form_embed;
 const design = card.design || {};
 const accentColor = design.accent_color ||'#00B4D8';

 if (!settings?.enabled || !settings?.html_code) {
 return null;
 }

 return (
 <motion.div
 initial={{ opacity: 0, y: 10 }}
 animate={{ opacity: 1, y: 0 }}
 className="px-6 pb-6"
 >
 <div
 className="bg-indigo-950/60 backdrop-blur-sm rounded-2xl p-6 border-2"
 style={{ borderColor:`${accentColor}30` }}
 >
 {(settings.title || settings.title_ar) && (
 <h3
 className="font-semibold mb-4"
 style={{ color: design.text_color ||'#1F2937' }}
 >
 {isRTL && settings.title_ar ? settings.title_ar : settings.title}
 </h3>
 )}
 {/*
 sandbox="allow-scripts allow-forms" lets the embed run its own scripts
 and submit forms, but blocks access to the parent page, cookies, and
 same-origin resources. Remove allow-scripts if scripts are not needed.
 */}
 <iframe
 title="Custom embed"
 srcDoc={buildSrcdoc(settings.html_code)}
 sandbox="allow-scripts allow-forms allow-popups"
 className="w-full border-0 rounded-lg"
 style={{ minHeight: 200 }}
 onLoad={(e) => {
 // Auto-resize to content height when possible
 try {
 const h = e.target.contentDocument?.body?.scrollHeight;
 if (h) e.target.style.height = h + 'px';
 } catch (_) { /* cross-origin — ignore */ }
 }}
 />
 </div>
 </motion.div>
 );
}