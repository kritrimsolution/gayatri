'use client';

import React, { useState, useEffect } from 'react';
import { Shield, Sparkles, Send, Award, ArrowRight, Clock } from 'lucide-react';
import Link from 'next/link';

const MedicalLogo = ({ className = "w-6 h-6" }) => (
  <svg 
    className={className} 
    viewBox="0 0 24 24" 
    fill="none" 
    stroke="currentColor" 
    strokeWidth="2.2" 
    strokeLinecap="round" 
    strokeLinejoin="round"
  >
    <rect x="3" y="3" width="18" height="18" rx="5.5" strokeWidth="2" />
    <path d="M12 7V17M7 12H17" stroke="currentColor" strokeWidth="2.5" />
  </svg>
);

export default function LandingPage() {
  const [activeSlide, setActiveSlide] = useState(0);

  const slides = [
    {
      title: "Buy 10 Paracetamol 650mg Get 1 Free!",
      subtitle: "Stock up for the monsoon season. Applicable on Micro Labs stock.",
      badge: "Fast Moving",
      expiry: "Valid till June 30"
    },
    {
      title: "Buy 20 Azithral 500mg Get 2 Free!",
      subtitle: "Exclusive scheme on Alembic stock. Limit 5 bookings per shop.",
      badge: "High Demand",
      expiry: "Valid till June 30"
    },
    {
      title: "Cofsil Cough Syrup - Special PTS Discount",
      subtitle: "Get an extra 5% trade discount on orders above 100 bottles.",
      badge: "Seasonal Offer",
      expiry: "Valid till July 15"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  return (
    <div className="min-h-screen bg-[#fbfaf7] text-[#0f172a] font-sans flex flex-col justify-between">
      {/* Navigation */}
      <header className="bg-white border-b border-[#e2f0e8] sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 bg-gradient-to-tr from-[#0c4a43] to-[#10b981] rounded-xl flex items-center justify-center shadow-md shadow-[#0c4a43]/15">
              <MedicalLogo className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="font-extrabold text-lg text-[#0c4a43] tracking-tight leading-none">
                GAYATRI PHARMA
              </h1>
              <span className="text-[10px] text-[#10b981] font-bold uppercase tracking-widest block mt-0.5">
                B2B Distribution
              </span>
            </div>
          </div>
          
          <nav className="flex items-center gap-6">
            <span className="text-xs text-[#0f766e] font-semibold flex items-center gap-1 bg-[#e6f7ef] px-3 py-1.5 rounded-full">
              <Clock className="w-3.5 h-3.5" /> Support 24/7
            </span>
            <Link 
              href="/admin" 
              className="px-5 py-2.5 bg-[#0c4a43] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl transition-all shadow-md shadow-[#0c4a43]/10 flex items-center gap-1.5 hover:translate-y-[-1px]"
            >
              Distributor Login <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </nav>
        </div>
      </header>

      {/* Hero Section */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-6 py-12 space-y-16">
        
        {/* Banner with layout style */}
        <section className="bg-white border border-[#e2f0e8] rounded-3xl overflow-hidden shadow-sm grid grid-cols-1 lg:grid-cols-12">
          <div className="p-8 sm:p-12 lg:col-span-7 flex flex-col justify-between space-y-8">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e6f7ef] text-[#0f766e] text-xs font-bold uppercase tracking-wider">
                <Shield className="w-3.5 h-3.5 stroke-[2.5]" /> Authorized Wholesale Distributor
              </div>
              <h2 className="text-4xl sm:text-5xl font-black text-[#0c4a43] leading-tight">
                Experts in Medication Management
              </h2>
              <p className="text-sm sm:text-base text-[#475569] leading-relaxed max-w-xl">
                Empowering retail medical shops across Gujarat with real-time stock information, automated B2B WhatsApp campaigns, and seamless invoice communication.
              </p>
            </div>

            {/* Quick stats */}
            <div className="grid grid-cols-3 gap-6 pt-4 border-t border-[#f1f5f9]">
              <div>
                <span className="text-2xl font-extrabold text-[#0c4a43] block">1,500+</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Active Medicines</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-[#0c4a43] block">450+</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Medical Shops</span>
              </div>
              <div>
                <span className="text-2xl font-extrabold text-[#0c4a43] block">100%</span>
                <span className="text-[10px] text-slate-500 uppercase font-semibold">Marg ERP Synced</span>
              </div>
            </div>
          </div>

          <div className="lg:col-span-5 bg-slate-100 min-h-[320px] relative overflow-hidden">
            <img 
              src="/hero_pharmacist.png" 
              alt="Hexapar Pharmacist Management" 
              className="w-full h-full object-cover"
            />
          </div>
        </section>

        {/* Portal Options Section */}
        <section className="grid grid-cols-1 md:grid-cols-2 gap-8">
          
          {/* Admin Control Center Card */}
          <div className="bg-white border border-[#e2f0e8] rounded-3xl p-8 shadow-sm flex flex-col justify-between space-y-6 hover:border-[#10b981]/40 transition-all group">
            <div className="space-y-3">
              <div className="w-12 h-12 bg-[#e6f7ef] rounded-xl flex items-center justify-center text-[#0c4a43] group-hover:scale-105 transition-all">
                <Shield className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-[#0c4a43]">Distributor Admin Portal</h3>
              <p className="text-xs text-slate-600 leading-relaxed">
                Log in as a distributor administrator to sync Marg ERP ledgers, launch WhatsApp broadcasts, check license expirations, and view outstanding dues dashboards.
              </p>
            </div>
            <div>
              <Link 
                href="/admin" 
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#0c4a43] hover:bg-[#0f766e] text-white text-xs font-bold rounded-xl transition-all shadow-sm"
              >
                Access Admin Dashboard <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </div>

          {/* Customer Portal Card */}
          <div className="bg-white/60 border border-[#e2f0e8] border-dashed rounded-3xl p-8 flex flex-col justify-between space-y-6 relative overflow-hidden">
            <div className="absolute top-4 right-4 px-2.5 py-0.5 rounded-full bg-slate-200 text-slate-600 text-[9px] font-bold uppercase tracking-wider">
              Phase 2 Preview
            </div>
            
            <div className="space-y-3">
              <div className="w-12 h-12 bg-slate-100 rounded-xl flex items-center justify-center text-slate-400">
                <Sparkles className="w-6 h-6 stroke-[2]" />
              </div>
              <h3 className="text-xl font-bold text-slate-500">Customer Web Portal</h3>
              <p className="text-xs text-slate-400 leading-relaxed">
                Self-service catalog for medical shops to search compositions, check trade prices, place direct cart orders, repeat last purchases, and check payment accounts.
              </p>
            </div>
            <div>
              <span className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-slate-100 text-slate-400 text-xs font-bold rounded-xl cursor-not-allowed">
                Under Development (Coming Soon)
              </span>
            </div>
          </div>
        </section>

        {/* Offers Carousel / Schemes Section */}
        <section className="bg-white border border-[#e2f0e8] rounded-3xl p-8 shadow-sm space-y-6">
          <div className="flex items-center justify-between border-b border-[#f1f5f9] pb-4">
            <div className="flex items-center gap-2">
              <Award className="w-5 h-5 text-[#10b981]" />
              <h3 className="font-bold text-base text-[#0c4a43] uppercase tracking-wider">Active B2B Schemes & Offers</h3>
            </div>
            <div className="flex gap-1.5">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`w-2.5 h-2.5 rounded-full transition-all ${
                    activeSlide === i ? 'bg-[#0c4a43] w-6' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>
          </div>

          <div className="relative overflow-hidden min-h-[140px] flex items-center">
            {slides.map((slide, index) => (
              <div
                key={index}
                className={`absolute w-full space-y-3 transition-all duration-500 transform ${
                  activeSlide === index ? 'opacity-100 translate-x-0 relative' : 'opacity-0 translate-x-8 pointer-events-none'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-md bg-[#e6f7ef] text-[#0f766e] text-[9px] font-bold uppercase tracking-wider">
                    {slide.badge}
                  </span>
                  <span className="text-[10px] text-amber-500 font-semibold">{slide.expiry}</span>
                </div>
                <h4 className="text-xl sm:text-2xl font-extrabold text-[#0c4a43] uppercase leading-snug">
                  {slide.title}
                </h4>
                <p className="text-xs sm:text-sm text-slate-500 leading-relaxed font-medium">
                  {slide.subtitle}
                </p>
              </div>
            ))}
          </div>
        </section>

      </main>

      {/* Footer */}
      <footer className="bg-white border-t border-[#e2f0e8] py-8 text-center text-xs text-[#0f766e] font-semibold">
        <div className="max-w-7xl mx-auto px-6 flex flex-col sm:flex-row items-center justify-between gap-4">
          <span>&copy; {new Date().getFullYear()} Gayatri Pharma wholesale distribution platform. All rights reserved.</span>
          <div className="flex items-center gap-2 text-[10px] uppercase font-bold tracking-wider text-slate-400 bg-[#f4fbf7] px-3 py-1.5 rounded-lg border border-[#e2f0e8]">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            Marg Sync Link: Operational
          </div>
        </div>
      </footer>
    </div>
  );
}
