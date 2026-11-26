'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';

interface Product {
  id: string;
  title: string;
  price: string;
  image: string;
  url: string;
  createdAt?: string;
}

export default function LinksBioPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const carouselRef = useRef<HTMLDivElement>(null);

  // Links oficiais — atualize com seus URLs reais
  const SOCIAL_LINKS = {
    instagram: 'https://instagram.com/seuusuario',
    tiktok: 'https://tiktok.com/@seuusuario',
    vipGroup: 'https://chat.whatsapp.com/SEU_LINK_VIP',
    catalog: '/',
  };

  useEffect(() => {
    async function loadLatestProducts() {
      try {
        // Troque '/api/products' pela mesma rota/função que sua vitrine usa
        const res = await fetch('/api/products', { cache: 'no-store' });
        if (!res.ok) throw new Error('Falha ao carregar achadinhos');
        const data = await res.json();

        const list: Product[] = Array.isArray(data) ? data : data.products || [];

        // Ordena pelos mais recentes e pega os últimos 8 adicionados
        const latest = [...list]
          .sort((a, b) => {
            if (a.createdAt && b.createdAt) {
              return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
            }
            return 0;
          })
          .slice(0, 8);

        setProducts(latest);
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
    const scrollAmount = 210;
    carouselRef.current.scrollBy({
      left: direction === 'left' ? -scrollAmount : scrollAmount,
      behavior: 'smooth',
    });
  };

  return (
    <main className="min-h-screen bg-[#0A0A0A] text-[#F5F0EB] flex flex-col items-center px-5 py-10 relative overflow-x-hidden selection:bg-[#CCAB75]/30">
      {/* Brilho sutil de fundo (Quiet Luxury) */}
      <div className="pointer-events-none fixed top-[-120px] left-1/2 -translate-x-1/2 w-[380px] h-[380px] rounded-full bg-[#CCAB75]/10 blur-[110px]" />

      <div className="w-full max-w-[430px] flex flex-col items-center z-10">
        {/* 1. LOGO GLOW FINDS */}
        <header className="flex flex-col items-center text-center mb-5">
          <div className="inline-flex items-center gap-1.5">
            <span className="font-serif italic text-4xl tracking-tight text-[#F5F0EB]">
              Glow
            </span>
            <span className="text-[#CCAB75] text-xl leading-none">✦</span>
          </div>
          <span className="text-[10px] uppercase tracking-[0.38em] text-[#CCAB75]/90 mt-1 font-medium">
            Finds
          </span>
          <p className="text-xs text-[#F5F0EB]/65 mt-3 max-w-[260px] leading-relaxed">
            Curadoria de beleza, moda & achados virais selecionados.
          </p>
        </header>

        {/* 2. BOLINHAS SOCIAIS (INSTAGRAM & TIKTOK) */}
        <div className="flex items-center justify-center gap-3.5 mb-7">
          <a
            href={SOCIAL_LINKS.instagram}
            target="_blank"
            rel="noopener noreferrer"
            aria-label="Instagram Glow Finds"
            className="w-11 h-11 rounded-full bg-[#141414] border border-[#CCAB75]/30 flex items-center justify-center text-[#F5F0EB] hover:border-[#CCAB75] hover:text-[#CCAB75] hover:scale-105 transition-all duration-300 shadow-lg"
          >
            {/* Ícone Instagram */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7">
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
            className="w-11 h-11 rounded-full bg-[#141414] border border-[#CCAB75]/30 flex items-center justify-center text-[#F5F0EB] hover:border-[#CCAB75] hover:text-[#CCAB75] hover:scale-105 transition-all duration-300 shadow-lg"
          >
            {/* Ícone TikTok */}
            <svg className="w-5 h-5" viewBox="0 0 24 24" fill="currentColor">
              <path d="M19.59 6.69a4.83 4.83 0 0 1-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 0 1-5.2 1.74 2.89 2.89 0 0 1 2.31-4.64 2.93 2.93 0 0 1 .88.13V9.4a6.84 6.84 0 0 0-1-.05A6.33 6.33 0 0 0 5 20.1a6.34 6.34 0 0 0 10.86-4.43v-7a8.16 8.16 0 0 0 4.77 1.52v-3.4a4.85 4.85 0 0 1-1-.1z" />
            </svg>
          </a>
        </div>

        {/* 3. BOTÕES PRINCIPAIS (GRUPO VIP & CATÁLOGO) */}
        <div className="w-full flex flex-col gap-3.5 mb-9">
          {/* Botão Grupo VIP */}
          <a
            href={SOCIAL_LINKS.vipGroup}
            target="_blank"
            rel="noopener noreferrer"
            className="group relative w-full rounded-2xl p-[1px] bg-gradient-to-r from-[#A17B3E] via-[#FFE1B2] to-[#CCAB75] shadow-[0_8px_30px_rgba(204,171,117,0.16)] hover:scale-[1.015] transition-all duration-300"
          >
            <div className="w-full bg-[#121212] group-hover:bg-[#161513] rounded-[15px] px-5 py-4 flex items-center justify-between transition-colors">
              <div className="flex flex-col text-left">
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#CCAB75] font-semibold">
                  Alerta Gem ✦ Acesso Gratuito
                </span>
                <span className="text-sm font-medium text-[#F5F0EB] mt-0.5">
                  Entrar no Grupo VIP de Ofertas
                </span>
              </div>
              <span className="w-8 h-8 rounded-full bg-[#CCAB75]/15 text-[#FFE1B2] flex items-center justify-center text-sm group-hover:translate-x-0.5 transition-transform">
                →
              </span>
            </div>
          </a>

          {/* Botão Catálogo */}
          <Link
            href={SOCIAL_LINKS.catalog}
            className="group w-full rounded-2xl bg-[#141414] border border-white/10 hover:border-[#CCAB75]/50 px-5 py-4 flex items-center justify-between hover:scale-[1.015] transition-all duration-300"
          >
            <div className="flex flex-col text-left">
              <span className="text-[10px] uppercase tracking-[0.2em] text-[#F5F0EB]/50">
                Vitrine Oficial
              </span>
              <span className="text-sm font-medium text-[#F5F0EB] mt-0.5">
                Explorar Catálogo Completo
              </span>
            </div>
            <span className="w-8 h-8 rounded-full bg-white/5 text-[#F5F0EB]/80 group-hover:text-[#CCAB75] flex items-center justify-center text-sm group-hover:translate-x-0.5 transition-all">
              →
            </span>
          </Link>
        </div>

        {/* 4. CARROSSEL AUTOMÁTICO: ÚLTIMOS ACHADINHOS */}
        <section className="w-full">
          <div className="flex items-center justify-between mb-3.5 px-0.5">
            <div>
              <h2 className="text-xs uppercase tracking-[0.22em] text-[#CCAB75] font-semibold">
                Últimos Achadinhos ✦
              </h2>
              <p className="text-[11px] text-[#F5F0EB]/50 mt-0.5">
                Recém-adicionados à vitrine
              </p>
            </div>

            {/* Setas de navegação (úteis no desktop e toque rápido) */}
            {products.length > 2 && (
              <div className="flex items-center gap-1.5">
                <button
                  type="button"
                  onClick={() => scrollCarousel('left')}
                  aria-label="Anterior"
                  className="w-7 h-7 rounded-full bg-[#141414] border border-white/10 hover:border-[#CCAB75]/50 flex items-center justify-center text-xs text-[#F5F0EB]/80"
                >
                  ‹
                </button>
                <button
                  type="button"
                  onClick={() => scrollCarousel('right')}
                  aria-label="Próximo"
                  className="w-7 h-7 rounded-full bg-[#141414] border border-white/10 hover:border-[#CCAB75]/50 flex items-center justify-center text-xs text-[#F5F0EB]/80"
                >
                  ›
                </button>
              </div>
            )}
          </div>

          {loading ? (
            /* Skeleton enquanto carrega */
            <div className="flex gap-3 overflow-hidden">
              {[1, 2, 3].map((n) => (
                <div
                  key={n}
                  className="min-w-[165px] h-[235px] rounded-2xl bg-[#141414] border border-white/5 animate-pulse"
                />
              ))}
            </div>
          ) : products.length === 0 ? (
            <div className="rounded-2xl bg-[#141414] border border-white/5 p-6 text-center text-xs text-[#F5F0EB]/50">
              Novos achadinhos chegando em breve.
            </div>
          ) : (
            /* Carrossel com Snap Scroll suave para mobile */
            <div
              ref={carouselRef}
              className="flex gap-3 overflow-x-auto snap-x snap-mandatory pb-3 [-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
            >
              {products.map((item) => (
                <a
                  key={item.id}
                  href={item.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="snap-start shrink-0 w-[168px] rounded-2xl bg-[#121212] border border-white/10 hover:border-[#CCAB75]/60 overflow-hidden flex flex-col justify-between group transition-all duration-300"
                >
                  <div>
                    <div className="relative w-full aspect-square bg-[#1A1A1A] overflow-hidden">
                      <img
                        src={item.image}
                        alt={item.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                      />
                      <span className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/75 backdrop-blur-md text-[9px] uppercase tracking-wider text-[#FFE1B2] border border-[#CCAB75]/30">
                        Novo
                      </span>
                    </div>

                    <div className="p-3">
                      <h3 className="text-xs text-[#F5F0EB]/90 font-normal line-clamp-2 leading-snug min-h-[32px]">
                        {item.title}
                      </h3>
                      {item.price && (
                        <p className="text-sm font-semibold text-[#CCAB75] mt-1.5">
                          {item.price}
                        </p>
                      )}
                    </div>
                  </div>

                  <div className="px-3 pb-3">
                    <span className="w-full py-1.5 rounded-lg bg-white/5 group-hover:bg-[#CCAB75] text-[#F5F0EB] group-hover:text-[#0A0A0A] text-[11px] font-medium flex items-center justify-center transition-colors">
                      Ver achadinho
                    </span>
                  </div>
                </a>
              ))}
            </div>
          )}
        </section>

        {/* Rodapé discreto */}
        <footer className="mt-8 text-[10px] tracking-[0.2em] uppercase text-[#F5F0EB]/30">
          Glow Finds ✦ Curadoria Oficial
        </footer>
      </div>
    </main>
  );
}