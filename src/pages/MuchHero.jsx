import React from 'react';

export default function MuchHero() {
  return (
    <section dir="rtl" className="relative min-h-screen overflow-hidden text-white">
      <div className="absolute inset-0 bg-[linear-gradient(180deg,#032846_0%,#05456e_38%,#0e7f7f_68%,#16a085_100%)]" />
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_22%_20%,rgba(52,211,153,0.24),transparent_34%),radial-gradient(circle_at_84%_12%,rgba(56,189,248,0.22),transparent_36%),radial-gradient(circle_at_78%_78%,rgba(16,185,129,0.24),transparent_35%),radial-gradient(circle_at_40%_90%,rgba(74,222,128,0.18),transparent_28%)]" />

      <div className="relative z-10 mx-auto flex min-h-screen w-full max-w-7xl flex-col px-5 pb-8 pt-4 sm:px-8">
        <header className="mx-auto flex w-full max-w-5xl items-center justify-between">
          <div className="text-2xl font-extrabold tracking-tight">much<span className="opacity-70">.</span></div>
          <div className="flex items-center gap-2">
            <button className="rounded-full border border-white/40 bg-indigo-950/60/15 px-5 py-1.5 text-sm font-medium">
              لوحة التحكم ←
            </button>
            <button className="rounded-full border border-white/30 bg-indigo-950/60/10 px-2.5 py-1 text-xs font-medium">AR</button>
          </div>
          <button className="text-2xl leading-none">☰</button>
        </header>

        <div className="mx-auto mt-10 w-full max-w-5xl text-center sm:mt-14">
          <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/35 bg-indigo-950/60/10 px-5 py-2 text-sm backdrop-blur">
            <span className="h-2 w-2 rounded-full bg-emerald-400" />
            <span>ابقَ على اتصال</span>
          </div>

          <h1 className="text-5xl font-extrabold leading-[1.15] sm:text-6xl md:text-7xl">
            المنصة الكاملة
            <br />
            <span className="relative inline-block">
              لمبيعات
              <span className="absolute -bottom-1 left-0 right-0 mx-auto h-3 w-[105%] -rotate-1 bg-emerald-200/85" />
            </span>
          </h1>

          <p className="mx-auto mt-5 max-w-2xl text-base text-slate-200/90 sm:text-lg">
            كل ما تحتاجه لتوسيع نطاق مبيعاتك، في مكان واحد.
          </p>

          <div className="mt-7 flex flex-wrap items-center justify-center gap-3 sm:gap-4">
            <a href="/register" className="rounded-full bg-indigo-950/60 px-7 py-3 text-sm font-bold text-slate-900 sm:text-base">
              ابدأ التجربة المجانية ←
            </a>
            <a href="#" className="rounded-full border border-white/75 bg-transparent px-7 py-3 text-sm font-semibold text-white sm:text-base">
              شاهد العرض
            </a>
          </div>
        </div>

        <div className="relative mx-auto mt-10 w-full max-w-5xl flex-1">
          <div className="pointer-events-none absolute inset-0">
            {[
              { cls: 'left-4 top-16', icon: '🪪' },
              { cls: 'left-8 top-52', icon: '💳' },
              { cls: 'left-14 top-[25rem]', icon: '👥' },
              { cls: 'right-4 top-20', icon: '🔳' },
              { cls: 'right-7 top-56', icon: '🔗' },
              { cls: 'right-12 top-[24rem]', icon: '📁' }
            ].map((item) => (
              <div key={item.cls} className={`absolute ${item.cls} hidden sm:block`}>
                <div className="flex h-16 w-16 items-center justify-center rounded-full border border-white/30 bg-indigo-950/60/5 text-xl shadow-[0_0_0_8px_rgba(255,255,255,0.04)] backdrop-blur">
                  {item.icon}
                </div>
              </div>
            ))}
          </div>

          <div className="mx-auto w-[280px] rounded-[2.6rem] border border-white/55 bg-[#0f1d34]/85 p-2.5 shadow-[0_25px_80px_rgba(0,0,0,0.5)] sm:w-[320px]">
            <div className="rounded-[2.2rem] border border-white/30 bg-[#c9c9c9] p-3">
              <div className="mx-auto mb-3 h-5 w-24 rounded-full bg-black/90" />

              <div className="space-y-2 rounded-xl bg-indigo-950/60/70 p-3 text-left text-slate-700">
                <div className="h-4 w-20 rounded bg-slate-300/70" />
                <div className="rounded-lg border border-slate-300 bg-indigo-950/60 p-3">
                  <div className="text-xs font-medium">our website</div>
                </div>
              </div>

              <div className="mt-3 space-y-2 rounded-xl bg-indigo-950/60/55 p-3 text-left text-slate-700">
                <div className="h-4 w-20 rounded bg-slate-300/70" />
                <div className="rounded-lg bg-emerald-400 p-3 text-white">
                  <div className="text-sm font-semibold">WhatsApp</div>
                  <div className="text-[11px] opacity-90">Any help? Contact me any time</div>
                </div>
                <div className="rounded-lg bg-indigo-950/60/85 p-3">
                  <div className="text-sm font-semibold text-slate-700">Instagram</div>
                </div>
              </div>

              <div className="mt-3 space-y-2 rounded-xl bg-indigo-950/60/60 p-3 text-slate-700">
                <div className="h-4 w-16 rounded bg-slate-300/70" />
                <div className="rounded-md bg-indigo-950/60 px-3 py-1.5 text-xs">omran@much.cards</div>
                <div className="rounded-md bg-indigo-950/60 px-3 py-1.5 text-xs">+966590992271</div>
              </div>
            </div>
          </div>

          <div className="mt-8 text-center text-[11px] uppercase tracking-[0.2em] text-white/60">
            Scroll
            <div className="mx-auto mt-2 flex h-8 w-5 items-start justify-center rounded-full border border-white/40 p-1">
              <div className="h-2 w-1 rounded-full bg-indigo-950/60/70" />
            </div>
          </div>
        </div>

        <div className="mx-auto mt-6 grid w-full max-w-5xl grid-cols-3 border-t border-white/20 pt-5 text-center">
          <div>
            <div className="text-3xl font-bold leading-none">+10,000</div>
            <div className="mt-1 text-xs text-white/80">مستخدم نشط</div>
          </div>
          <div>
            <div className="text-3xl font-bold leading-none">95%</div>
            <div className="mt-1 text-xs text-white/80">رضا العملاء</div>
          </div>
          <div>
            <div className="text-3xl font-bold leading-none">24/7</div>
            <div className="mt-1 text-xs text-white/80">مدعوم بالذكاء الاصطناعي</div>
          </div>
        </div>
      </div>
    </section>
  );
}
