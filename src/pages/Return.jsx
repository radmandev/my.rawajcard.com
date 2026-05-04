import React from'react';

const ReturnPolicy = () => {
 return (
 <div className="max-w-4xl mx-auto px-4 py-12 space-y-8">
 <div className="space-y-3">
 <h1 className="text-3xl md:text-4xl font-bold text-slate-900">Return Policy</h1>
 <p className="text-slate-600">Last updated: April 2026</p>
 </div>

 <section className="rounded-2xl border border-red-200/60 bg-red-50/60 p-6">
 <h2 className="text-xl font-semibold text-red-800 mb-3">Important Special Cases</h2>
 <ul className="list-disc pl-6 space-y-2 text-red-700">
 <li>No returns for customizable items.</li>
 <li>No refund for customizable products once they are sent to printing.</li>
 <li>Return is accepted only for non-customized items.</li>
 </ul>
 </section>

 <section className="space-y-4">
 <h2 className="text-2xl font-semibold text-slate-900">Eligibility for Return</h2>
 <ul className="list-disc pl-6 space-y-2 text-slate-700">
 <li>Only non-customized physical products are eligible for return.</li>
 <li>Return requests must be submitted within 14 days of delivery.</li>
 <li>Items must be unused and in original packaging.</li>
 <li>Shipping fees are non-refundable unless the item is defective or incorrect.</li>
 </ul>
 </section>

 <section className="space-y-4">
 <h2 className="text-2xl font-semibold text-slate-900">Return Process</h2>
 <ol className="list-decimal pl-6 space-y-2 text-slate-700">
 <li>Contact support with your order number and reason for return.</li>
 <li>Wait for return approval and shipping instructions.</li>
 <li>Ship the item back in original condition.</li>
 <li>After inspection, the approved refund is processed to the original payment method.</li>
 </ol>
 </section>

 <p className="text-sm text-slate-500">
 If a policy term conflicts with local consumer law, applicable law will prevail.
 </p>
 </div>
 );
};

export default ReturnPolicy;