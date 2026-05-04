import React from'react';
import { cn } from'@/lib/utils';
import { motion } from'framer-motion';

export default function StatsCard({ title, value, icon: Icon, trend, trendUp, gradient, delay = 0 }) {
 return (
 <motion.div
 initial={{ opacity: 0, y: 20 }}
 animate={{ opacity: 1, y: 0 }}
 transition={{ duration: 0.5, delay }}
 className={cn(
"relative overflow-hidden rounded-2xl p-6",
 "bg-[linear-gradient(135deg,#0C1429_0%,#1E1B4B_52%,#0C1429_100%)]",
 "border border-white/15",
 "shadow-[0_24px_80px_rgba(12,20,41,0.35)]",
"backdrop-blur-xl"
 )}
 >
 {/* Background Gradient */}
 <div className={cn(
"absolute -top-12 -right-12 w-32 h-32 rounded-full opacity-20 blur-2xl",
 gradient
 )} />

 <div className="relative flex items-start justify-between">
 <div>
 <p className="text-sm font-medium text-slate-300 mb-1">
 {title}
 </p>
 <p className="text-3xl font-bold text-white">
 {value}
 </p>
 {trend && (
 <p className={cn(
"text-sm mt-2 flex items-center gap-1",
 trendUp ?"text-emerald-600" :"text-red-500"
 )}>
 <span>{trendUp ?'↑' :'↓'}</span>
 <span>{trend}</span>
 </p>
 )}
 </div>
 <div className={cn(
"p-3 rounded-xl",
 gradient
 )}>
 <Icon className="h-6 w-6 text-white" />
 </div>
 </div>
 </motion.div>
 );
}