import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { RefreshCw, AlertTriangle, CheckCircle, ListOrdered } from 'lucide-react';

export default function ReturnPolicy() {
  return (
    <div className="min-h-screen bg-[#060D1F]">
      <Navbar />

      {/* Hero */}
      <div className="relative public-subpage-offset pb-16 text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C1429] via-[#0D1B3E] to-[#060D1F] pointer-events-none overflow-hidden" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-fuchsia-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 text-sm font-medium mb-6">
            <RefreshCw className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Return Policy</h1>
          <p className="text-slate-400 text-lg">Last updated: April 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pb-24 space-y-6">

        {/* Important notice */}
        <div className="rounded-2xl border border-red-500/30 bg-red-500/10 p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-red-500/20 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-red-300">Important Special Cases</h2>
          </div>
          <ul className="space-y-2 text-red-200/80 text-sm">
            <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>No returns for customizable items.</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>No refund for customizable products once they are sent to printing.</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>Return is accepted only for non-customized items.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-sky-500/15 flex items-center justify-center">
              <CheckCircle className="w-5 h-5 text-sky-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Eligibility for Return</h2>
          </div>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-start gap-2"><span className="text-sky-400 mt-1">•</span>Only non-customized physical products are eligible for return.</li>
            <li className="flex items-start gap-2"><span className="text-sky-400 mt-1">•</span>Return requests must be submitted within 14 days of delivery.</li>
            <li className="flex items-start gap-2"><span className="text-sky-400 mt-1">•</span>Items must be unused and in original packaging.</li>
            <li className="flex items-start gap-2"><span className="text-sky-400 mt-1">•</span>Shipping fees are non-refundable unless the item is defective or incorrect.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-fuchsia-500/15 flex items-center justify-center">
              <ListOrdered className="w-5 h-5 text-fuchsia-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Return Process</h2>
          </div>
          <ol className="space-y-3 text-slate-300 text-sm">
            {[
              'Contact support with your order number and reason for return.',
              'Wait for return approval and shipping instructions.',
              'Ship the item back in original condition.',
              'After inspection, the approved refund is processed to the original payment method.',
            ].map((step, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className="flex-shrink-0 w-6 h-6 rounded-full bg-fuchsia-500/20 text-fuchsia-400 text-xs font-bold flex items-center justify-center mt-0.5">{i + 1}</span>
                {step}
              </li>
            ))}
          </ol>
        </div>

        <p className="text-center text-slate-500 text-sm pt-2">
          If a policy term conflicts with local consumer law, applicable law will prevail.
        </p>
      </div>

      <Footer />
    </div>
  );
}