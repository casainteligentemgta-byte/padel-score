'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@/lib/supabase/client';
import { splitRatioFromDatabase, splitRatioToDatabase } from '@/lib/displayTemplateSplitRatio';
import { saveTemplateAction, applyTemplateToCanchaAction } from './actions';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Layout,
  Save,
  Monitor,
  Clock,
  PlayCircle,
  Columns,
  Settings2,
  Trash2,
  ArrowRightCircle,
  Trello,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  PanelTop,
  Trophy,
  Image as ImageLucide,
  MessageSquare,
} from 'lucide-react';

interface DisplayTemplate {
  id: string;
  name: string;
  header_vh: number;
  score_vh: number;
  media_vh: number;
  ticker_vh: number;
  split_ratio: number;
  clock_style: 'modern' | 'classic' | 'minimal';
  clock_color: string;
}

interface Cancha {
  cancha_id: string;
  current_template_id: string | null;
}

export default function AdminDisplayTemplates() {
  const supabase = createClient();
  const [templates, setTemplates] = useState<DisplayTemplate[]>([]);
  const [canchas, setCanchas] = useState<Cancha[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<DisplayTemplate | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<{ text: string; type: 'success' | 'error' } | null>(null);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setIsLoading(true);
    const { data: tps } = await supabase.from('display_templates').select('*').order('created_at', { ascending: false });
    const { data: cns } = await supabase.from('canchas').select('*');
    if (tps) {
      setTemplates(
        tps.map((row) => ({
          ...row,
          split_ratio: splitRatioFromDatabase((row as DisplayTemplate).split_ratio),
        })) as DisplayTemplate[],
      );
    }
    if (cns) setCanchas(cns);
    setIsLoading(false);
  };

  const handleCreateTemplate = () => {
    const newTpl: DisplayTemplate = {
      id: 'new-' + Math.random().toString(36).substr(2, 9),
      name: 'Nuevo Template',
      header_vh: 10,
      score_vh: 23,
      media_vh: 59,
      ticker_vh: 8,
      split_ratio: 0.5,
      clock_style: 'modern',
      clock_color: '#ccff00'
    };
    setSelectedTemplate(newTpl);
  };

  const handleVhChange = (row: keyof DisplayTemplate, value: number) => {
    if (!selectedTemplate) return;
    
    // Simplistic balancing logic for now: adjust rows but ensure sum 100
    // In a real app, this might be more complex
    const currentSum = 100;
    const oldVal = selectedTemplate[row] as number;
    const diff = value - oldVal;
    
    // Prevent sum going over/under if possible
    // Here we'll just set it and recalculate others proportionally
    // But easier: let user adjust only if sum is handled
    
    const newTpl = { ...selectedTemplate, [row]: value };
    // Recalculate Ticker to balance the 100vh
    newTpl.ticker_vh = 100 - (newTpl.header_vh + newTpl.score_vh + newTpl.media_vh);
    
    // Bounds check
    if (newTpl.ticker_vh < 0) {
        // adjust media or score?
        newTpl.media_vh += newTpl.ticker_vh;
        newTpl.ticker_vh = 0;
    }
    
    setSelectedTemplate(newTpl);
  };

  const handleSave = async () => {
    if (!selectedTemplate) return;
    setIsSaving(true);
    setMessage(null);

    const isNew = selectedTemplate.id.startsWith('new-');
    const id = selectedTemplate.id;
    const data = selectedTemplate;

    // Aseguramos que los valores sean enteros para el CHECK constraint de la BD
    const h = Math.round(Number(data.header_vh) || 10);
    const s = Math.round(Number(data.score_vh) || 23);
    const m = Math.round(Number(data.media_vh) || 59);
    const t = 100 - (h + s + m); // El ticker absorbe el resto para sumar EXACTAMENTE 100

    // split_ratio en BD = entero 0–100 (la UI del slider sigue en 0–1)
    const payload = {
      name: data.name || 'Sin Nombre',
      header_vh: h,
      score_vh: s,
      media_vh: m,
      ticker_vh: t,
      split_ratio: splitRatioToDatabase(data.split_ratio ?? 0.5),
      clock_style: data.clock_style || 'modern',
      clock_color: data.clock_color || '#ccff00',
    };

    try {
      const res = await saveTemplateAction(id, payload);
      if (!res.ok) {
        setMessage({ text: res.error, type: 'error' });
      } else {
        setMessage({ text: 'Template guardado correctamente', type: 'success' });
        await fetchData();
        setSelectedTemplate(res.data as DisplayTemplate);
      }
    } catch {
      setMessage({
        text:
          'Error al guardar el template. Comprueba SUPABASE_SERVICE_ROLE_KEY en Vercel y que la migración display_templates esté aplicada en Supabase.',
        type: 'error',
      });
    }

    setIsSaving(false);
  };

  const templateIdMatches = (a: string | null | undefined, b: string | null | undefined) =>
    String(a ?? '') === String(b ?? '');

  const handleApplyToCancha = async (canchaId: string) => {
    if (!selectedTemplate || selectedTemplate.id.startsWith('new-')) return;
    
    try {
      const applied = await applyTemplateToCanchaAction(canchaId, selectedTemplate.id);
      if (!applied.ok) {
        setMessage({ text: applied.error, type: 'error' });
      } else {
        setMessage({ text: `Template aplicado a ${canchaId}`, type: 'success' });
        await fetchData();
      }
    } catch {
      setMessage({
        text:
          'Error al aplicar el template. Revisa SUPABASE_SERVICE_ROLE_KEY y que la tabla canchas tenga current_template_id.',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-[#08080c] text-white">
        <RefreshCw className="animate-spin w-12 h-12 text-padel-primary" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#08080c] text-white p-8 lg:p-12 font-outfit">
      <div className="max-w-[1600px] mx-auto space-y-12">
        
        {/* Header */}
        <div className="flex justify-between items-end">
          <div>
            <h1 className="text-5xl font-black italic uppercase tracking-tighter flex items-center gap-4">
              <Trello className="w-12 h-12 text-padel-primary" />
              Dynamic <span className="text-padel-primary">Studio</span>
            </h1>
            <p className="text-gray-500 font-bold uppercase tracking-[0.3em] mt-2 italic">
              Configura el layout dinámico de las pizarras TV
            </p>
          </div>
          <button 
            onClick={handleCreateTemplate}
            className="px-8 py-4 bg-padel-primary text-black font-black italic uppercase rounded-2xl hover:scale-105 transition-transform flex items-center gap-3 shadow-lg shadow-padel-primary/20"
          >
            <Settings2 className="w-5 h-5" />
            Crear Template
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
          
          {/* Templates List */}
          <div className="lg:col-span-4 space-y-6">
            <h2 className="text-2xl font-black italic uppercase tracking-widest text-white/40 mb-4">Templates</h2>
            <div className="space-y-4">
              {templates.map((tpl) => {
                const tplSelected = templateIdMatches(selectedTemplate?.id, tpl.id);
                return (
                <button
                  key={tpl.id}
                  type="button"
                  onClick={() => setSelectedTemplate(tpl)}
                  aria-pressed={tplSelected}
                  className={`w-full p-6 text-left rounded-3xl border-2 transition-all duration-200 group ${
                    tplSelected
                      ? 'bg-padel-primary/20 border-padel-primary text-white shadow-[inset_0_2px_12px_rgba(0,0,0,0.35)] ring-2 ring-padel-primary ring-offset-2 ring-offset-[#08080c]'
                      : 'bg-zinc-900/90 border-zinc-500/80 text-white hover:border-white/40 hover:bg-zinc-800/95 active:scale-[0.99]'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span
                      className={`text-xl font-black italic uppercase tracking-tight ${
                        tplSelected ? 'text-padel-primary drop-shadow-[0_0_12px_rgba(204,255,0,0.35)]' : 'text-white'
                      }`}
                    >
                      {tpl.name}
                    </span>
                    <Layout
                      className={`w-5 h-5 shrink-0 ${tplSelected ? 'text-padel-primary' : 'text-zinc-400'}`}
                      aria-hidden
                    />
                  </div>
                  <div className="mt-4 flex gap-2 overflow-hidden h-4 rounded-full bg-black/40">
                    <div style={{ width: `${tpl.header_vh}%` }} className="h-full bg-blue-500" />
                    <div style={{ width: `${tpl.score_vh}%` }} className="h-full bg-padel-primary" />
                    <div style={{ width: `${tpl.media_vh}%` }} className="h-full bg-purple-500" />
                    <div style={{ width: `${tpl.ticker_vh}%` }} className="h-full bg-white/20" />
                  </div>
                </button>
              );
              })}
            </div>
          </div>

          {/* Editor Panel */}
          <div className="lg:col-span-8">
            <AnimatePresence mode="wait">
              {selectedTemplate ? (
                <motion.div
                  key={selectedTemplate.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  className="bg-white/5 backdrop-blur-2xl rounded-[3rem] border border-white/10 p-10 pb-12 space-y-12 shadow-3xl overflow-visible"
                >
                  {/* Template Meta */}
                  <div className="flex justify-between items-start">
                    <div className="flex-1 max-w-md">
                      <label className="text-[10px] font-black uppercase tracking-[0.4em] text-white/30 italic mb-2 block">Nombre del Template</label>
                      <input 
                        value={selectedTemplate.name}
                        onChange={e => setSelectedTemplate({...selectedTemplate, name: e.target.value})}
                        className="w-full bg-black/40 border border-white/10 rounded-2xl px-6 py-4 text-2xl font-black italic text-white placeholder-white/20 outline-none focus:border-padel-primary transition-colors"
                        placeholder="Ej: Torneo Champions 10/30/50/10"
                      />
                    </div>
                    <div className="flex gap-4">
                      <button 
                        onClick={handleSave}
                        disabled={isSaving}
                        className="p-5 bg-blue-600 rounded-2xl text-white hover:bg-blue-500 transition-colors shadow-lg shadow-blue-600/20 disabled:opacity-50"
                      >
                        <Save className="w-6 h-6" />
                      </button>
                    </div>
                  </div>

                  {/* Layout Grid Sliders */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-12">
                    <div className="space-y-8">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <Monitor className="w-5 h-5 text-padel-primary" />
                        Vertical Proportions (VH)
                      </h3>
                      
                      <div className="space-y-6">
                        {[
                          { label: 'Header Row', key: 'header_vh', color: 'bg-blue-500 shadow-[0_0_15px_#3b82f640]' },
                          { label: 'Scoreboard Row', key: 'score_vh', color: 'bg-padel-primary shadow-[0_0_15px_#ccff0040]' },
                          { label: 'Media Section', key: 'media_vh', color: 'bg-purple-500 shadow-[0_0_15px_#a855f740]' },
                        ].map(row => (
                          <div key={row.key} className="space-y-2">
                            <div className="flex justify-between items-end">
                              <span className="text-sm font-bold uppercase tracking-widest text-white/50 italic">{row.label}</span>
                              <span className="text-xl font-black italic text-white">{selectedTemplate[row.key as keyof DisplayTemplate]}vh</span>
                            </div>
                            <input 
                              type="range" min="2" max="60" 
                              value={selectedTemplate[row.key as keyof DisplayTemplate] as number}
                              onChange={e => handleVhChange(row.key as keyof DisplayTemplate, parseInt(e.target.value))}
                              className="w-full h-3 bg-black/60 rounded-full appearance-none cursor-pointer accent-padel-primary hover:accent-white transition-all"
                            />
                          </div>
                        ))}
                        
                        <div className="p-4 bg-white/5 border border-white/5 rounded-2xl flex justify-between items-center opacity-60">
                          <span className="text-sm font-bold uppercase tracking-widest text-white/50 italic">Ticker Footer (Auto)</span>
                          <span className="text-xl font-black italic text-white">{selectedTemplate.ticker_vh}vh</span>
                        </div>
                      </div>
                    </div>

                    {/* Split Media & Style */}
                    <div className="space-y-10">
                      <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                        <PlayCircle className="w-5 h-5 text-padel-primary" />
                        Split-Media & Style
                      </h3>

                      <div className="space-y-6">
                        <div className="space-y-3">
                          <label className="text-sm font-bold uppercase tracking-widest text-white/50 italic flex items-center gap-2">
                            <Columns className="w-4 h-4" />
                            Split Ratio (Left Video vs Right Image)
                          </label>
                          <div className="flex items-center gap-4">
                            <span className="text-xs font-black italic text-blue-400">{Math.round(selectedTemplate.split_ratio * 100)}%</span>
                            <input 
                              type="range" min="0" max="1" step="0.05"
                              value={selectedTemplate.split_ratio}
                              onChange={e => setSelectedTemplate({...selectedTemplate, split_ratio: parseFloat(e.target.value)})}
                              className="flex-1 h-3 bg-black/60 rounded-full appearance-none accent-blue-500"
                            />
                            <span className="text-xs font-black italic text-padel-primary">{Math.round((1 - selectedTemplate.split_ratio) * 100)}%</span>
                          </div>
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                          <div className="space-y-3">
                            <label className="text-sm font-bold uppercase tracking-widest text-white/50 italic flex items-center gap-2">
                              <Clock className="w-4 h-4" />
                              Clock Style
                            </label>
                            <select 
                              value={selectedTemplate.clock_style}
                              onChange={e => setSelectedTemplate({...selectedTemplate, clock_style: e.target.value as any})}
                              className="w-full bg-black/40 border border-white/10 rounded-2xl px-4 py-3 font-bold text-white outline-none focus:border-padel-primary appearance-none cursor-pointer"
                            >
                              <option value="modern">Modern (Bold)</option>
                              <option value="classic">Classic (Digital)</option>
                              <option value="minimal">Minimal (Thin)</option>
                            </select>
                          </div>
                          <div className="space-y-3">
                            <label className="text-sm font-bold uppercase tracking-widest text-white/50 italic flex items-center gap-2">
                              <ArrowRightCircle className="w-4 h-4" />
                              Clock Color
                            </label>
                            <div className="flex items-center gap-3 bg-black/40 border border-white/10 rounded-2xl px-4 py-2">
                              <input 
                                type="color" 
                                value={selectedTemplate.clock_color}
                                onChange={e => setSelectedTemplate({...selectedTemplate, clock_color: e.target.value})}
                                className="w-8 h-8 rounded-full border-0 bg-transparent cursor-pointer"
                              />
                              <span className="font-mono text-xs uppercase opacity-60">{selectedTemplate.clock_color}</span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Visual Preview — mismo orden que la pizarra TV: cabecera → marcador → media → tira */}
                  <div className="space-y-4 min-h-0">
                    <label className="text-xs font-black uppercase tracking-[0.4em] text-white/35 italic block">
                      Vista previa pizarra (proporción vertical)
                    </label>
                    <p className="text-[10px] text-white/45 font-bold uppercase tracking-wider leading-snug -mt-2">
                      Arriba: cabecera y marcador · Centro: vídeo e imagen (split) · Abajo: tira informativa
                    </p>
                    <div className="border border-white/15 rounded-3xl overflow-hidden shadow-2xl bg-[#0a0a0c] aspect-video max-h-[min(56vh,520px)] w-full flex flex-col ring-1 ring-white/5">
                      {/* Cabecera / head */}
                      <div
                        style={{ height: `${selectedTemplate.header_vh}%` }}
                        className="w-full shrink-0 flex flex-col items-center justify-center gap-0.5 bg-gradient-to-b from-slate-900 to-slate-900/60 border-b border-slate-600/50 px-2 min-h-0"
                      >
                        <PanelTop className="w-4 h-4 text-sky-400 shrink-0" aria-hidden />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-100/95 text-center leading-tight">
                          Cabecera
                        </span>
                        <span className="text-[8px] font-mono text-sky-400/70">{selectedTemplate.header_vh}%</span>
                      </div>
                      {/* Marcador */}
                      <div
                        style={{ height: `${selectedTemplate.score_vh}%` }}
                        className="w-full shrink-0 flex flex-col items-center justify-center gap-0.5 bg-gradient-to-b from-padel-primary/18 to-padel-primary/8 border-b border-padel-primary/35 px-2 min-h-0"
                      >
                        <Trophy className="w-4 h-4 text-padel-primary shrink-0" aria-hidden />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white text-center leading-tight">
                          Marcador
                        </span>
                        <span className="text-[8px] font-mono text-padel-primary/80">{selectedTemplate.score_vh}%</span>
                      </div>
                      {/* Vídeo + imagen */}
                      <div
                        style={{ height: `${selectedTemplate.media_vh}%` }}
                        className="w-full shrink-0 flex gap-1 p-1.5 bg-zinc-950/90 min-h-0 border-b border-white/10"
                      >
                        <div
                          style={{ width: `${selectedTemplate.split_ratio * 100}%` }}
                          className="h-full min-w-0 rounded-xl border border-blue-500/35 bg-blue-950/50 flex flex-col items-center justify-center gap-1 px-1"
                        >
                          <PlayCircle className="w-5 h-5 text-blue-400 shrink-0" aria-hidden />
                          <span className="text-[9px] font-black uppercase tracking-wider text-blue-100 text-center leading-tight">
                            Vídeo
                          </span>
                          <span className="text-[7px] font-mono text-blue-400/70">
                            {Math.round(selectedTemplate.split_ratio * 100)}% ancho
                          </span>
                        </div>
                        <div
                          style={{ width: `${(1 - selectedTemplate.split_ratio) * 100}%` }}
                          className="h-full min-w-0 rounded-xl border border-padel-primary/40 bg-padel-primary/10 flex flex-col items-center justify-center gap-1 px-1"
                        >
                          <ImageLucide className="w-5 h-5 text-padel-primary shrink-0" aria-hidden />
                          <span className="text-[9px] font-black uppercase tracking-wider text-white text-center leading-tight">
                            Imagen
                          </span>
                          <span className="text-[7px] font-mono text-padel-primary/80">
                            {Math.round((1 - selectedTemplate.split_ratio) * 100)}% ancho
                          </span>
                        </div>
                      </div>
                      {/* Tira abajo */}
                      <div
                        style={{ height: `${selectedTemplate.ticker_vh}%` }}
                        className="w-full shrink-0 flex flex-col items-center justify-center gap-0.5 bg-black border-t border-white/15 px-2 min-h-0"
                      >
                        <MessageSquare className="w-3.5 h-3.5 text-zinc-400 shrink-0" aria-hidden />
                        <span className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-200 text-center leading-tight">
                          Tira informativa
                        </span>
                        <span className="text-[8px] font-mono text-zinc-500">{selectedTemplate.ticker_vh}%</span>
                      </div>
                    </div>
                  </div>

                  {/* Feedback Message (encima de «Aplicar» para no empujar ni tapar los botones) */}
                  {message && (
                    <motion.div
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      className={`p-4 rounded-2xl flex items-start gap-3 shrink-0 ${
                        message.type === 'success' ? 'bg-green-500/20 text-green-400 border border-green-500/30' : 'bg-red-500/20 text-red-400 border border-red-500/30'
                      }`}
                    >
                      {message.type === 'success' ? <CheckCircle2 className="shrink-0 mt-0.5" /> : <AlertCircle className="shrink-0 mt-0.5" />}
                      <span className="font-bold underline decoration-white/20 underline-offset-4 break-words text-left">{message.text}</span>
                    </motion.div>
                  )}

                  {/* Apply to Court Section */}
                  <div className="pt-8 border-t border-white/10 space-y-4">
                    <h3 className="text-xl font-black italic uppercase tracking-tighter flex items-center gap-3">
                      <Monitor className="w-5 h-5 text-padel-primary shrink-0" />
                      Aplicar a Canchas
                    </h3>
                    <p className="text-xs font-bold uppercase tracking-widest text-zinc-300">
                      Pulsa una cancha para asignar el template seleccionado
                    </p>
                    <div className="grid grid-cols-1 min-[480px]:grid-cols-2 xl:grid-cols-3 gap-3 w-full">
                      {canchas.map((cn) => {
                        const canchaHasThisTemplate = templateIdMatches(
                          cn.current_template_id,
                          selectedTemplate.id,
                        );
                        return (
                        <button
                          key={cn.cancha_id}
                          type="button"
                          onClick={() => handleApplyToCancha(cn.cancha_id)}
                          aria-pressed={canchaHasThisTemplate}
                          className={`min-h-[3.25rem] w-full px-4 py-3 rounded-2xl font-black italic uppercase transition-all duration-200 flex items-center justify-center gap-2 text-center text-sm sm:text-base leading-tight border-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-padel-primary focus-visible:ring-offset-2 focus-visible:ring-offset-[#08080c] active:scale-[0.98] ${
                            canchaHasThisTemplate
                              ? 'bg-padel-primary text-black border-padel-primary shadow-[inset_0_2px_8px_rgba(0,0,0,0.2)] ring-2 ring-padel-primary/90 ring-offset-2 ring-offset-[#08080c]'
                              : 'bg-zinc-900 text-white border-white/25 hover:bg-zinc-800 hover:border-padel-primary/60 hover:text-white shadow-[inset_0_1px_0_rgba(255,255,255,0.08)]'
                          }`}
                        >
                          <span className="break-all line-clamp-2">{cn.cancha_id}</span>
                          {canchaHasThisTemplate ? (
                            <CheckCircle2 className="w-5 h-5 shrink-0 text-black" aria-hidden />
                          ) : null}
                        </button>
                        );
                      })}
                    </div>
                  </div>
                </motion.div>
              ) : (
                <div className="h-full min-h-[600px] flex flex-col items-center justify-center text-center space-y-6 opacity-40">
                  <Monitor className="w-24 h-24" />
                  <p className="text-2xl font-black italic uppercase tracking-widest">Selecciona o crea un template para editar</p>
                </div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </div>
  );
}
