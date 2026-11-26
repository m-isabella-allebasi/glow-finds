'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/database';

export default function LinksBioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Atualize com seus links oficiais
  const SOCIAL_LINKS = {
    instagram: 'https://instagram.com/seuusuario',
    tiktok: 'https://tiktok.com/@seuusuario',
    vipGroup: 'https://chat.whatsapp.com/SEU_LINK_VIP',
    catalog: '/',
  };

  useEffect(() => {
    async function loadLatestProducts() {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('created_at', { ascending: false })
          .limit(12);

        if (error) {
          console.error('Erro Supabase /links:', error);
          return;
        }

        if (data) {
          // Mantém todos os disponíveis (ignora apenas os marcados como false)
          const available = (data as Product[])
            .filter((item) => item.in_stock !== false)
            .slice(0, 8);
          setProducts(available);
        }
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadLatestProducts();
  }, []);

  const scrollCarousel = (direction: 'left' | 'right') => {
    if (!carouselRef.current) return;
    const scrollAmount = 200;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <main className="font-sans min-h-screen bg-[#0A0A0A] text-[#F8F4EF] flex flex-col items-center px-5 py-11 relative overflow-x-hidden selection:bg-[#E8B4BC]/30">
      {/* Luz ambiente Burgundy + Soft Pink */}
      <div className="pointer-events-none fixed top-[-140px] left-1/2 -translate-x-1/2 w-[420px] h-[420px] rounded-full bg-[#5C1224]/35 blur-[120px]" />
      <div className="pointer-events-none fixed top-[40px] left-1/2 -translate-x-1/2 w-[240px] h-[240px] rounded-full bg-[#E8B4BC]/10 blur-[90px]" />

      <div className="w-full max-w-[430px] flex flex-col items-center z-10">
        {/* 1. LOGO SVG GLOW FINDS */}
        <header className="flex flex-col items-center text-center mb-5">
          <div className="h-16 flex items-center justify-center">
            <img
              src="/logo.svg"
              alt="Glow Finds"
              className="h-full w-auto max-w-[230px] object-contain"
            />
          </div>
          <p className="text-xs text-[#F8F4EF]/70 mt-3 max-w-[270px] leading-relaxed">
            Curadoria de beleza, moda &amp; achados virais selecionados ✦
          </p>
        </header>

        {/* 2. BOLINHAS SOCIAIS (INSTAGRAM & TIKTOK) */}
        <div className="flex items-center justify-center gap-3.5 mb-8">
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Glow Finds"
            className="w-11 h-11 rounded-full bg-[#160B0E] border border-[#E8B4BC]/35 flex items-center justify-center text-[#F8F4EF] hover:border-[#E8B4BC] hover:bg-[#4A0E1C] hover:scale-105 transition-all duration-300 shadow-[0_4px_20px_rgba(92,18,36,0.35)]"
          >
            <svg
              className="w-5 h-5"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.7"
            >
              <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
              <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
              <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
            </svg>
          </a>

          <a
            href={SOCIAL_LINKS.tiktok}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="TikTok Glow Finds"
            className="w-11 h-11 rounded-full bg-[#160B0E] border border-[#E8B4BC]/35 flex items-center justify-center text-[#F8F4EF] hover:border-[#E8B4BC] hover:bg-[#4A0E1C] hover:scale-105 transition-all duration-300 shadow-[0_4px_20px_rgba(92,18,36,0.35)]"
          >
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
          </a>
        </div>

        {/* 3. BOTÕES PRINCIPAIS (GRUPO VIP & CATÁLOGO) */}
        <div className="w-full flex flex-col gap-3.5 mb-9">
          <a
            href={SOCIAL_LINKS.vipGroup}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full rounded-2xl p-[1px] bg-gradient-to-r from-[#6E162B] via-[#E8B4BC] to-[#F8F4EF] shadow-[0_10px_32px_rgba(92,18,36,0.45)] hover:scale-[1.015] transition-all duration-300"
          >
            <div className="w-full bg-gradient-to-r from-[#2A0810] via-[#1C0A0F] to-[#140B0E] group-hover:from-[#380B16] group-hover:to-[#1B0E12] rounded-[15px] px-5 py-4 flex items-center justify-between transition-all">
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#E8B4BC] font-semibold">
                  Alerta Gem ✦ Acesso VIP
                </span>
                <span className="font-serif text-base font-medium text-[#F8F4EF] mt-0.5">
                  Entrar no Grupo VIP de Ofertas
                </span>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#E8B4BC]/15 border border-[#E8B4BC]/30 text-[#F8F4EF] flex items-center justify-center text-sm group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
          </a>

          <Link
            href={SOCIAL_LINKS.catalog}
            className="group w-full rounded-2xl bg-[#121011] border border-[#F8F4EF]/15 hover:border-[#E8B4BC]/60 px-5 py-4 flex items-center justify-between hover:scale-[1.015] transition-all duration-300"
          >
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-[0.22em] text-[#F8F4EF]/55">
                Vitrine Oficial
              </span>
              <span className="font-serif text-base font-medium text-[#F8F4EF] mt-0.5">
                Acessar Catálogo Completo
              </span>
            </div>
            <span className="w-8 h-8 rounded-full bg-[#F8F4EF]/5 text-[#F8F4EF]/80 group-hover:bg-[#4A0E1C] group-hover:text-[#F8F4EF] flex items-center justify-center text-sm group-hover:translate-x-0.5 transition-all">
              →
            </span>
          </Link>
        </div>

        {/* 4. CARROSSEL AUTOMÁTICO: ÚLTIMOS ACHADINHOS */}
        <section className="w-full">
          <div className="flex items-end justify-between mb-3.5 px-0.5">
            <div>
              <span className="text-[10px] uppercase tracking-[0.24em] text-[#E8B4BC] block">
                Curadoria Recente
              </span>
              <h2 className="font-serif text-lg text-[#F8F4EF] font-medium">
                Últimos Achadinhos <span className="text-[#E8B4BC]">✦</span>
              </h2>
            </div>

            {products.length > 2 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  aria-label="Anterior"
                  className="w-7 h-7 rounded-full bg-[#160B0E] border border-[#E8B4BC]/25 hover:border-[#E8B4BC] flex items-center justify-center text-xs text-[#F8F4EF]"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  aria-label="Próximo"
                  className="w-7 h-7 rounded-full bg-[#160B0E] border border-[#E8B4BC]/25 hover:border-[#E8B4BC] flex items-center justify-center text-xs text-[#F8F4EF]"
                >
                  ›
                </button>
              </div>
            )}
          </div>

          {loading ? (
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="min-w-[168px] h-[240px] rounded-2xl bg-[#160B0E] border border-[#E8B4BC]/10 animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-[#140D0F] border border-[#E8B4BC]/15 p-6 text-center text-xs text-[#F8F4EF]/60">
              Novos achadinhos chegando em breve na vitrine.
            </div>
          ) : (
            <div
              ref={carouselRef}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {products.map((item) => (
                <Link
                  key={item.id}
                  href={`/produto/${item.id}`}
                  className="snap-start shrink-0 w-[168px] rounded-2xl bg-[#130C0E] border border-[#F8F4EF]/10 hover:border-[#E8B4BC]/65 overflow-hidden flex flex-col justify-between group transition-all duration-300"
                >
                  <div>
                    <div className="relative w-full aspect-square bg-[#1C1114] overflow-hidden">
                      <img
                        src={item.image_url}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 px-2.5 py-0.5 rounded-full bg-[#4A0E1C]/90 backdrop-blur-md text-[9px] uppercase tracking-wider text-[#F8F4EF] border border-[#E8B4BC]/35">
                        Novo
                      </span>
                    </div>

                    <div className="p-3">
                      <h3 className="text-xs text-[#F8F4EF]/90 font-normal line-clamp-2 leading-snug min-h-[32px]">
                        {item.title}
                      </h3>
                      {item.price && (
                        <p className="text-sm font-semibold text-[#E8B4BC] mt-1.5">
                          {item.price}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-3 pb-3">
                    <span className="w-full py-1.5 rounded-lg bg-[#4A0E1C]/70 group-hover:bg-[#6E162B] border border-[#E8B4BC]/25 text-[#F8F4EF] text-[11px] font-medium flex items-center justify-center transition-colors">
                      Ver achadinho
                    </span>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </section>

        <footer className="mt-8 text-[10px] tracking-[0.24em] uppercase text-[#F8F4EF]/35">
          Glow Finds ✦ Curadoria Oficial
        </footer>
      </div>
    </main>
  );
}