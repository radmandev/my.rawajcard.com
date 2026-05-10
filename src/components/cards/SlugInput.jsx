import React, { useState, useEffect } from'react';
import { cn } from'@/lib/utils';
import { useLanguage } from'@/components/shared/LanguageContext';
import { api } from'@/api/supabaseAPI';
import { Input } from'@/components/ui/input';
import { Label } from'@/components/ui/label';
import { Check, X, Loader2, Link2 } from'lucide-react';

export default function SlugInput({ value, onChange, currentCardId, onValidation }) {
 const { t, isRTL } = useLanguage();
 const [checking, setChecking] = useState(false);
 const [isAvailable, setIsAvailable] = useState(null);
 const [error, setError] = useState('');

 const baseUrl ='rawajcard.com/c/';

 useEffect(() => {
 if (!value) {
 setIsAvailable(null);
 setError('');
 onValidation?.(false);
 return;
 }

 const timer = setTimeout(async () => {
 setChecking(true);
 setError('');
 onValidation?.(false);

 // Validate slug format
 const slugRegex = /^[a-z0-9-]+$/;
 if (!slugRegex.test(value)) {
 setIsAvailable(false);
 setError(isRTL ?'يُسمح فقط بالأحرف الصغيرة والأرقام والشرطات' :'Only lowercase letters, numbers, and hyphens allowed');
 setChecking(false);
 onValidation?.(false);
 return;
 }

 // Check if slug is taken
 try {
 const existingCards = await api.entities.BusinessCard.filter({ slug: value });
 const isTaken = existingCards.some(card => card.id !== currentCardId);

 setIsAvailable(!isTaken);
 if (isTaken) {
 setError(t('slugTaken'));
 onValidation?.(false);
 } else {
 onValidation?.(true);
 }
 } catch (err) {
 console.error('Slug availability check failed:', err);
 // Assume available on error so the user is not blocked
 setIsAvailable(true);
 onValidation?.(true);
 } finally {
 setChecking(false);
 }
 }, 500);

 return () => clearTimeout(timer);
 }, [value, currentCardId, isRTL, t]);

 const handleChange = (e) => {
 const newValue = e.target.value
 .toLowerCase()
 .replace(/\s+/g,'-')
 .replace(/[^a-z0-9-]/g,'');
 onChange(newValue);
 };

 return (
 <div className="space-y-5">
 <div className="space-y-1">
 <Label className="flex items-center gap-2 text-slate-200 font-medium">
 <Link2 className="h-4 w-4 text-cyan-400" />
 {t('customLink')}
 </Label>
 <p className="text-sm text-slate-400">
 {t('yourCardLink')}
 </p>
 </div>

 <div className={cn(
 "flex items-center rounded-xl overflow-hidden border-2 transition-all duration-200 bg-slate-800/60",
 isAvailable === true && "border-emerald-500 shadow-[0_0_12px_rgba(52,211,153,0.2)]",
 isAvailable === false && "border-red-500 shadow-[0_0_12px_rgba(239,68,68,0.2)]",
 isAvailable === null && "border-white/10 hover:border-cyan-500/40"
 )}>
 <div className="px-4 py-3 bg-slate-700/60 text-cyan-400 text-sm font-mono whitespace-nowrap border-r border-white/10">
 {baseUrl}
 </div>
 <Input
 value={value || ''}
 onChange={handleChange}
 placeholder={t('slugPlaceholder')}
 className="border-0 focus-visible:ring-0 text-base font-mono text-slate-100 bg-transparent placeholder:text-slate-500"
 />
 <div className="px-4">
 {checking && <Loader2 className="h-5 w-5 animate-spin text-slate-400" />}
 {!checking && isAvailable === true && <Check className="h-5 w-5 text-emerald-400" />}
 {!checking && isAvailable === false && <X className="h-5 w-5 text-red-400" />}
 </div>
 </div>

 {error && (
 <p className="text-sm text-red-400 flex items-center gap-1.5">
 <X className="h-3.5 w-3.5" />{error}
 </p>
 )}

 {isAvailable && !error && (
 <p className="text-sm text-emerald-400 flex items-center gap-1.5">
 <Check className="h-3.5 w-3.5" />{t('slugAvailable')}
 </p>
 )}

 <div className="flex items-start gap-3 p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
 <Link2 className="h-4 w-4 text-cyan-400 mt-0.5 shrink-0" />
 <p className="text-sm text-slate-300">
 {isRTL
 ? 'سيتمكن الأشخاص من الوصول إلى بطاقتك عبر هذا الرابط الدائم. اختر رابطاً سهل التذكر!'
 : 'People will access your card through this permanent link. Choose something memorable!'}
 </p>
 </div>
 </div>
 );
}