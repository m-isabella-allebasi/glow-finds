'use client';

import React, { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useParams } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { Product } from '@/types/database';

interface TrackingWindow extends Window {
  fbq?: (...args: unknown[]) => void;
  ttq?: {
    track: (event: string, data?: Record<string, unknown>) => void;
  };
}

function parsePriceToNumber(priceStr?: string): number {
  if (!priceStr) return 0;
  const cleaned = priceStr.replace(/[^\d,]/g, '').replace(',', '.');
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? 0 : parsed;
}

export default function ProductPresellPage() {
  const params = useParams();
  const id = Array.isArray(params?.id) ? params.id[0] : params?.id;

  const [product, setProduct] = useState<Product | null>(null);
  const [related, setRelated] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [redirecting, setRedirecting] = useState(false);
  const viewTrackedRef = useRef(false);

  const VIP_GROUP_URL = 'https://chat.whatsapp.com/SEU_LINK_VIP';

  useEffect(() => {
    if (!id) return;

    async function loadProduct() {
      try {
        const [{ data: current }, { data: others }] = await Promise.all([
          supabase.from('products').select('*').eq('id', id).single(),
          supabase
            .from('products')
            .select('*')
            .neq('id', id)
            .eq('in_stock', true)
            .order('created_at', { ascending: false })
            .limit(3),
        ]);

        if (current) setProduct(current as Product);
        if (others) setRelated(others as Product[]);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }

    loadProduct();
  }, [id]);

  // Dispara ViewContent ao abrir a presell
  useEffect(() => {
    if (!product || viewTrackedRef.current || typeof window === 'undefined') return;
    viewTrackedRef.current = true;

    const win = window as TrackingWindow;
    const numericValue = parsePriceToNumber(product.price);

    if (win.fbq) {
      win.fbq('track', 'ViewContent', {
        content_ids: [String(product.id)],
        content_name: product.title,
        content_type: 'product',
        currency: 'BRL',
        value: numericValue,
      });
    }

    if (win.ttq) {
      win.ttq.track('ViewContent', {
        content_id: String(product.id),
        content_name: product.title,
        content_type: 'product',
        currency: 'BRL',
        value: numericValue,
      });
    }
  }, [product]);

  // Dispara InitiateCheckout no clique e redireciona para o TikTok Shop
  const handleBuyClick = () => {
    if (!product || redirecting) return;
    setRedirecting(true);

    if (typeof window !== 'undefined') {
      const win = window as TrackingWindow;
      const numericValue = parsePriceToNumber(product.price);

      if (win.fbq) {
        win.fbq('track', 'InitiateCheckout', {
          content_ids: [String(product.id)],
          content_name: product.title,
          content_type: 'product',
          num_items: 1,
          currency: 'BRL',
          value: numericValue,
        });
      }

      if (win.ttq) {
        win.ttq.track('InitiateCheckout', {
          content_id: String(product.id),
          content_name: product.title,
          content_type: 'product',
          currency: 'BRL',
          value: numericValue,
        });
      }
    }

    setTimeout(() => {
      window.location.href = product.tiktok_url;
    }, 150);
  };

  return (
    <main className="font-sans min-h-screen bg-[#0A0A0A] text-[#F8F4EF] flex flex-col items-center px-4 py-6 relative overflow-x-hidden selection:bg-[#E8B4BC]/30">
      <div className="pointer-events-none fixed top-[-140px] left-1/2 -translate-x-1/2 w-[400px] h-[400px] rounded-full bg-[#5C1224]/35 blur-[120px]" />

      <div className="w-full max-w-[460px] flex flex-col items-center z-10">
        {/* TOPO COM LOGO */}
        <header className="w-full flex items-center justify-between py-2 mb-5 border-b border-[#F8F4EF]/10">
          <Link href="/" className="h-9 flex items-center">
            <img
              src="/logo.svg"
              alt="Glow Finds"
              className="h-full w-auto max-w-[140px] object-contain"
            />
          </Link>

          <span className="text-[10px] uppercase tracking-[0.22em] text-[#E8B4BC] bg-[#4A0E1C]/50 border border-[#E8B4BC]/25 px-3 py-1 rounded-full">
            {product?.badge_tag || 'Curadoria Oficial'} ✦
          </span>
        </header>

        {loading ? (
          <div className="w-full rounded-3xl bg-[#140C0E] border border-[#E8B4BC]/15 p-5 animate-pulse">
            <div className="w-full aspect-square rounded-2xl bg-[#1F1216] mb-5" />
            <div className="h-4 w-28 bg-[#1F1216] rounded mb-3" />
            <div className="h-6 w-3/4 bg-[#1F1216] rounded mb-4" />
            <div className="h-12 w-full bg-[#1F1216] rounded-2xl" />
          </div>
        ) : !product ? (
          <div className="w-full rounded-3xl bg-[#140C0E] border border-[#E8B4BC]/20 p-8 text-center my-6">
            <span className="text-xs uppercase tracking-[0.22em] text-[#E8B4BC]">
              Oferta Encerrada
            </span>
            <h1 className="font-serif text-2xl text-[#F8F4EF] mt-2 mb-3">
              Esse achadinho esgotou ou mudou de link
            </h1>
            <p className="text-xs text-[#F8F4EF]/65 mb-6 leading-relaxed">
              Explore nossa vitrine atualizada com os melhores achados disponíveis agora no TikTok Shop.
            </p>
            <Link
              href="/"
              className="inline-flex items-center justify-center w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#6E162B] to-[#4A0E1C] border border-[#E8B4BC]/40 text-sm font-medium text-[#F8F4EF]"
            >
              Ver Vitrine Completa →
            </Link>
          </div>
        ) : (
          <>
            {/* CARD PRINCIPAL DE CONVERSÃO */}
            <article className="w-full rounded-3xl bg-[#130B0D] border border-[#E8B4BC]/20 p-4 sm:p-5 shadow-[0_14px_45px_rgba(0,0,0,0.65)]">
              <div className="relative w-full aspect-square rounded-2xl bg-[#1B1013] overflow-hidden mb-5 border border-white/5">
                <img
                  src={product.image_url}
                  alt={product.title}
                  className="w-full h-full object-cover"
                />
                <div className="absolute top-3 left-3 px-3 py-1 rounded-full bg-[#0A0A0A]/80 backdrop-blur-md border border-[#E8B4BC]/35 flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#E8B4BC] animate-pulse" />
                  <span className="text-[10px] uppercase tracking-[0.18em] text-[#F8F4EF] font-medium">
                    {product.category}
                  </span>
                </div>
              </div>

              <div className="px-1">
                <span className="text-[10px] uppercase tracking-[0.22em] text-[#E8B4BC]/90 font-medium">
                  Selecionado pela curadoria Glow Finds
                </span>

                <h1 className="font-serif text-xl sm:text-2xl text-[#F8F4EF] font-medium leading-snug mt-1.5">
                  {product.title}
                </h1>

                {product.curator_note && (
                  <p className="mt-2.5 text-xs italic text-[#F8F4EF]/80 bg-[#1C0E12] border-l-2 border-[#E8B4BC] px-3 py-2 rounded-r-xl">
                    “{product.curator_note}”
                  </p>
                )}

                {product.price && (
                  <div className="mt-3 flex items-baseline gap-2.5">
                    <span className="text-2xl font-semibold text-[#E8B4BC]">
                      {product.price}
                    </span>
                    <span className="text-[11px] text-[#F8F4EF]/50">
                      valor sujeito à disponibilidade no app
                    </span>
                  </div>
                )}

                <button
                  type="button"
                  onClick={handleBuyClick}
                  disabled={redirecting}
                  className="mt-5 w-full rounded-2xl p-[1px] bg-gradient-to-r from-[#6E162B] via-[#E8B4BC] to-[#F8F4EF] shadow-[0_10px_30px_rgba(92,18,36,0.55)] active:scale-[0.99] transition-all cursor-pointer"
                >
                  <div className="w-full rounded-[15px] bg-gradient-to-r from-[#5C1224] via-[#4A0E1C] to-[#2E0811] hover:from-[#6E162B] hover:to-[#3D0B17] py-4 px-5 flex items-center justify-center gap-2 transition-all">
                    <span className="text-sm sm:text-base font-semibold tracking-wide text-[#F8F4EF]">
                      {redirecting
                        ? 'Abrindo oferta oficial...'
                        : 'Garantir Oferta no TikTok Shop'}
                    </span>
                    <span className="text-[#E8B4BC] text-base">→</span>
                  </div>
                </button>

                <div className="mt-3.5 flex items-center justify-center gap-4 text-[11px] text-[#F8F4EF]/55">
                  <span>✦ Link oficial verificado</span>
                  <span>•</span>
                  <span>Compra segura no TikTok</span>
                </div>
              </div>
            </article>

            {/* BLOCO EDITORIAL ANTI-BLOQUEIO */}
            <section className="w-full mt-5 rounded-2xl bg-[#120B0D]/80 border border-[#F8F4EF]/10 p-5">
              <h2 className="font-serif text-base text-[#F8F4EF] font-medium mb-3">
                Por que entrou na curadoria <span className="text-[#E8B4BC]">✦</span>
              </h2>
              <ul className="space-y-2.5 text-xs text-[#F8F4EF]/75 leading-relaxed">
                <li className="flex items-start gap-2.5">
                  <span className="text-[#E8B4BC] mt-0.5">✦</span>
                  <span>
                    <strong className="text-[#F8F4EF] font-medium">Filtro real de qualidade:</strong>{' '}
                    avaliado pelo custo-benefício, reputação da loja e feedback real de quem comprou.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#E8B4BC] mt-0.5">✦</span>
                  <span>
                    <strong className="text-[#F8F4EF] font-medium">Direto na fonte oficial:</strong>{' '}
                    você finaliza a compra dentro do próprio ambiente seguro do TikTok Shop.
                  </span>
                </li>
                <li className="flex items-start gap-2.5">
                  <span className="text-[#E8B4BC] mt-0.5">✦</span>
                  <span>
                    <strong className="text-[#F8F4EF] font-medium">Alerta de oportunidade:</strong>{' '}
                    itens virais costumam ter estoque limitado ou variação rápida de cupom.
                  </span>
                </li>
              </ul>
            </section>

            {/* BANNER GRUPO VIP */}
            <a
              href={VIP_GROUP_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full mt-5 rounded-2xl bg-gradient-to-r from-[#260910] to-[#140B0E] border border-[#E8B4BC]/30 hover:border-[#E8B4BC]/60 p-4 flex items-center justify-between transition-all"
            >
              <div>
                <span className="text-[10px] uppercase tracking-[0.2em] text-[#E8B4BC] font-semibold block">
                  Alerta Gem ✦ Clube VIP
                </span>
                <p className="text-xs text-[#F8F4EF]/90 mt-0.5">
                  Receba cupons e achados antes de esgotarem
                </p>
              </div>
              <span className="text-xs font-medium text-[#E8B4BC] shrink-0 ml-3">
                Entrar →
              </span>
            </a>

            {/* OUTROS ACHADINHOS */}
            {related.length > 0 && (
              <section className="w-full mt-7">
                <div className="flex items-center justify-between mb-3 px-0.5">
                  <h3 className="font-serif text-base text-[#F8F4EF]">
                    Outros Achadinhos <span className="text-[#E8B4BC]">✦</span>
                  </h3>
                  <Link
                    href="/"
                    className="text-[11px] text-[#E8B4BC] hover:underline"
                  >
                    Ver tudo
                  </Link>
                </div>

                <div className="grid grid-cols-3 gap-2.5">
                  {related.map((item) => (
                    <Link
                      key={item.id}
                      href={`/produto/${item.id}`}
                      className="rounded-xl bg-[#130B0D] border border-white/10 hover:border-[#E8B4BC]/50 overflow-hidden flex flex-col transition-all"
                    >
                      <div className="w-full aspect-square bg-[#1C1114]">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                      <div className="p-2">
                        <p className="text-[10px] text-[#F8F4EF]/85 line-clamp-2 leading-tight">
                          {item.title}
                        </p>
                        {item.price && (
                          <span className="text-[11px] font-semibold text-[#E8B4BC] block mt-1">
                            {item.price}
                          </span>
                        )}
                      </div>
                    </Link>
                  ))}
                </div>
              </section>
            )}
          </>
        )}

        <footer className="mt-9 pb-4 text-center text-[10px] tracking-[0.22em] uppercase text-[#F8F4EF]/35">
          Glow Finds ✦ Curadoria Independente
        </footer>
      </div>
    </main>
  );
}