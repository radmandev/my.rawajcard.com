import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { CreditCard, AlertTriangle, PackageCheck, RotateCcw } from 'lucide-react';
import Seo from '@/components/shared/Seo';

export default function PaymentsPolicy() {
  return (
    <div className="min-h-screen bg-[#060D1F]">
      <Seo
        title="Payments Policy | Rawajcard"
        description="Accepted payment methods, billing timing, and payment terms for Rawajcard's smart NFC business cards."
        path="/PaymentsPolicy"
      />
      <Navbar />

      {/* Hero */}
      <div className="relative public-subpage-offset pb-16 text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C1429] via-[#0D1B3E] to-[#060D1F] pointer-events-none" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-6">
            <CreditCard className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Payments Policy</h1>
          <p className="text-slate-400 text-lg">Last updated: April 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pb-24 space-y-6">

        {/* Payment Timing notice */}
        <div className="rounded-2xl border border-sky-500/30 bg-sky-500/10 p-7">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-9 h-9 rounded-lg bg-sky-500/20 flex items-center justify-center">
              <CreditCard className="w-5 h-5 text-sky-400" />
            </div>
            <h2 className="text-xl font-semibold text-sky-300">Payment Timing</h2>
          </div>
          <p className="text-sky-200/80 text-sm leading-relaxed">
            Payments are made before customizing items or shipping them to customers.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-red-500/15 flex items-center justify-center">
              <AlertTriangle className="w-5 h-5 text-red-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Customizable Products</h2>
          </div>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>No return for customizable items.</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>No refund for customizable products after being sent to printing.</li>
            <li className="flex items-start gap-2"><span className="text-red-400 mt-1">•</span>Please review all customization details carefully before confirming payment.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-fuchsia-500/15 flex items-center justify-center">
              <PackageCheck className="w-5 h-5 text-fuchsia-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Non-Customized Products</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Return is only accepted for non-customized items, subject to our return eligibility rules and condition checks.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-sky-500/15 flex items-center justify-center">
              <RotateCcw className="w-5 h-5 text-sky-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Refund Processing</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            Approved refunds are processed to the original payment method after return inspection. Processing times may vary
            based on your payment provider.
          </p>
        </div>

      </div>

      <Footer />
    </div>
  );
}
