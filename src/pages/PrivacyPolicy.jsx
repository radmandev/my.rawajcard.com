import React from 'react';
import Navbar from '@/components/landing/Navbar';
import Footer from '@/components/landing/Footer';
import { Shield, Database, Share2, Clock } from 'lucide-react';

export default function PrivacyPolicy() {
  return (
    <div className="min-h-screen bg-[#060D1F]">
      <Navbar />

      {/* Hero */}
      <div className="relative public-subpage-offset pb-16 text-center px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-[#0C1429] via-[#0D1B3E] to-[#060D1F] pointer-events-none overflow-hidden" />
        <div className="absolute top-20 left-1/2 -translate-x-1/2 w-[500px] h-[200px] bg-sky-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 max-w-3xl mx-auto">
          <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/10 border border-sky-500/20 text-sky-400 text-sm font-medium mb-6">
            <Shield className="w-4 h-4" />
            Legal
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-white mb-4">Privacy Policy</h1>
          <p className="text-slate-400 text-lg">Last updated: April 2026</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-3xl mx-auto px-4 pb-24 space-y-6">

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-sky-500/15 flex items-center justify-center">
              <Database className="w-5 h-5 text-sky-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Information We Collect</h2>
          </div>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-start gap-2"><span className="text-sky-400 mt-1">•</span>Account and profile data (name, email, phone, business details).</li>
            <li className="flex items-start gap-2"><span className="text-sky-400 mt-1">•</span>Order and payment metadata (excluding full card details).</li>
            <li className="flex items-start gap-2"><span className="text-sky-400 mt-1">•</span>Card interactions and analytics (views, scans, clicks).</li>
            <li className="flex items-start gap-2"><span className="text-sky-400 mt-1">•</span>Support and contact form submissions.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-fuchsia-500/15 flex items-center justify-center">
              <Shield className="w-5 h-5 text-fuchsia-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">How We Use Information</h2>
          </div>
          <ul className="space-y-2 text-slate-300 text-sm">
            <li className="flex items-start gap-2"><span className="text-fuchsia-400 mt-1">•</span>To provide and improve Rawajcard services.</li>
            <li className="flex items-start gap-2"><span className="text-fuchsia-400 mt-1">•</span>To process orders and deliver products/services.</li>
            <li className="flex items-start gap-2"><span className="text-fuchsia-400 mt-1">•</span>To send important updates related to your account or orders.</li>
            <li className="flex items-start gap-2"><span className="text-fuchsia-400 mt-1">•</span>To protect platform security and prevent fraud.</li>
          </ul>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-sky-500/15 flex items-center justify-center">
              <Share2 className="w-5 h-5 text-sky-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Data Sharing</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            We do not sell personal data. We only share information with trusted service providers when needed
            to operate payments, hosting, analytics, and support.
          </p>
        </div>

        <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-7">
          <div className="flex items-center gap-3 mb-4">
            <div className="w-9 h-9 rounded-lg bg-fuchsia-500/15 flex items-center justify-center">
              <Clock className="w-5 h-5 text-fuchsia-400" />
            </div>
            <h2 className="text-xl font-semibold text-white">Data Retention &amp; Rights</h2>
          </div>
          <p className="text-slate-300 text-sm leading-relaxed">
            We retain data only as needed for service delivery, legal compliance, and security. You may request
            access, correction, or deletion of your personal data by contacting support.
          </p>
        </div>

        <p className="text-center text-slate-500 text-sm pt-2">
          By using Rawajcard, you agree to this Privacy Policy.
        </p>
      </div>

      <Footer />
    </div>
  );
}
