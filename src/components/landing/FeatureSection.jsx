import React from'react';
import { Button } from"@/components/ui/button";
import { Check } from'lucide-react';
import { api } from'@/api/supabaseAPI';

export default function FeatureSection({ 
 title, 
 subtitle, 
 description, 
 features, 
 primaryCta, 
 secondaryCta, 
 imagePosition ="right",
 bgColor ="white",
 image
}) {
 const isLeft = imagePosition ==="left";
 
 return (
 <section className={`py-20 ${bgColor ==='gray' ?'bg-slate-50' :'bg-indigo-950/60'}`}>
 <div className="container mx-auto px-4 md:px-6">
 <div className={`grid lg:grid-cols-2 gap-12 lg:gap-20 items-center ${isLeft ?'lg:flex-row-reverse' :''}`}>
 {/* Content */}
 <div className={isLeft ?'lg:order-2' :''}>
 {subtitle && (
 <span className="text-sm text-cyan-600 font-semibold tracking-wider uppercase mb-4 block">
 {subtitle}
 </span>
 )}
 
 <h2 className="text-3xl md:text-4xl font-bold text-slate-900 mb-4 leading-tight">
 {title}
 </h2>
 
 {description && (
 <p className="text-lg text-slate-600 mb-8">{description}</p>
 )}
 
 <ul className="space-y-4 mb-8">
 {features.map((feature, index) => (
 <li key={index} className="flex gap-3">
 <div className="flex-shrink-0 w-6 h-6 rounded-full bg-cyan-100 flex items-center justify-center mt-0.5">
 <Check className="w-4 h-4 text-cyan-600" />
 </div>
 <div>
 <span className="font-semibold text-slate-900">{feature.title}</span>
 {feature.description && (
 <span className="text-slate-600"> – {feature.description}</span>
 )}
 </div>
 </li>
 ))}
 </ul>
 
 <div className="flex flex-wrap gap-4">
 {primaryCta && (
 <Button 
 size="lg"
 className="bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white rounded-full px-8"
 onClick={() => api.auth.redirectToLogin()}
 >
 {primaryCta}
 </Button>
 )}
 {secondaryCta && (
 <Button 
 size="lg"
 variant="outline"
 className="rounded-full px-8 border-2"
 >
 {secondaryCta}
 </Button>
 )}
 </div>
 </div>
 
 {/* Image */}
 <div className={isLeft ?'lg:order-1' :''}>
 <div className="relative">
 <div className="absolute inset-0 bg-gradient-to-br from-cyan-500/20 to-blue-500/20 rounded-3xl transform rotate-3 scale-105" />
 <div className="relative bg-indigo-950/60 rounded-2xl shadow-2xl shadow-slate-200/50 overflow-hidden">
 {image ? (
 <img src={image} alt={title} className="w-full h-auto" />
 ) : (
 <div className="aspect-[4/3] bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
 <div className="w-full max-w-sm p-6">
 {/* Mockup UI */}
 <div className="space-y-4">
 <div className="h-4 bg-slate-200 rounded w-3/4" />
 <div className="h-4 bg-slate-200 rounded w-1/2" />
 <div className="h-32 bg-slate-100 rounded-lg mt-6" />
 <div className="flex gap-2">
 <div className="h-10 bg-cyan-500 rounded-lg flex-1" />
 <div className="h-10 bg-slate-200 rounded-lg flex-1" />
 </div>
 </div>
 </div>
 </div>
 )}
 </div>
 </div>
 </div>
 </div>
 </div>
 </section>
 );
}