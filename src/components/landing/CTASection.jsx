import React from'react';
import { Button } from"@/components/ui/button";

export default function CTASection() {
 return (
 <section className="py-20 bg-indigo-950/60">
 <div className="container mx-auto px-4 md:px-6">
 <div className="max-w-4xl mx-auto text-center">
 <span className="text-cyan-600 text-sm font-semibold tracking-wider uppercase mb-4 block">
 One tap - no app
 </span>
 
 <h2 className="text-3xl md:text-5xl font-bold text-slate-900 mb-6">
 You Only Get One First Impression.
 <br />
 <span className="text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600">
 Make It Instant.
 </span>
 </h2>

 <p className="text-xl text-slate-600 mb-10 max-w-2xl mx-auto">
 Whether you're at an event, in a meeting, or closing a deal - Rawajcard helps you share your info instantly, follow up faster, and never lose a lead again.
 </p>

 <div className="flex flex-col sm:flex-row gap-4 justify-center">
 <Button 
 size="lg"
 className="bg-gradient-to-r from-fuchsia-600 to-purple-700 hover:from-fuchsia-500 hover:to-purple-600 text-white rounded-full px-10 py-6 text-lg shadow-lg shadow-cyan-500/25"
 >
 Create Your Free Digital Card
 </Button>
 <Button 
 size="lg"
 variant="outline"
 className="rounded-full px-10 py-6 text-lg border-2"
 >
 Book a Demo
 </Button>
 </div>
 </div>
 </div>
 </section>
 );
}