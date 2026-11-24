'use client';

import React, { useMemo, useState } from 'react';
import {
  Search,
  ExternalLink,
  Bell,
  Sparkles,
  X,
  CheckCircle2,
  Loader2,
  Quote,
} from 'lucide-react';
import { Product } from '@/types/database';
import { BrandLogo } from '@/components/BrandLogo';
import { supabase } from '@/lib/supabase';

interface StorefrontClientProps {
  initialProducts: Product[];
}

function formatWhatsAppMask(value: string): string {
  const digits = value.replace(/\D/g, '').slice(0, 11);
  if (digits.length === 0) return '';
  if (digits.length <= 2) return `(${digits}`;
  if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
  if (digits.length <= 10) {
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
  }
  return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
}

export function StorefrontClient({ initialProducts }: StorefrontClientProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('Todos');

  // Estado do Modal "Avise-me quando voltar"
  const [alertProduct, setAlertProduct] = useState<Product | null>(null);
  const [customerName, setCustomerName] = useState('');
  const [whatsapp, setWhatsapp] = useState('');
  const [submittingAlert, setSubmittingAlert] = useState(false);
  const [alertSuccess, setAlertSuccess] = useState(false);
  const [alertError, setAlertError] = useState('');

  // Categorias dinâmicas extraídas dos produtos
  const categories = useMemo(() => {
    const unique = Array.from(
      new Set(initialProducts.map((p) => p.category.trim()).filter(Boolean))
    );
    return ['Todos', ...unique];
  }, [initialProducts]);

  // Filtro por busca e categoria
  const filteredProducts = useMemo(() => {
    return initialProducts.filter((product) => {
      const matchesCategory =
        selectedCategory === 'Todos' ||
        product.category.toLowerCase() === selectedCategory.toLowerCase();

      const q = searchQuery.trim().toLowerCase();
      const matchesSearch =
        !q ||
        product.title.toLowerCase().includes(q) ||
        product.category.toLowerCase().includes(q) ||
        (product.badge_tag && product.badge_tag.toLowerCase().includes(q)) ||
        (product.curator_note && product.curator_note.toLowerCase().includes(q));

      return matchesCategory && matchesSearch;
    });
  }, [initialProducts, selectedCategory, searchQuery]);

  const openAlertModal = (product: Product) => {
    setAlertProduct(product);
    setCustomerName('');
    setWhatsapp('');
    setAlertSuccess(false);
    setAlertError('');
  };

  const closeAlertModal = () => {
    setAlertProduct(null);
    setAlertSuccess(false);
    setAlertError('');
  };

  const handleAlertSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertProduct) return;

    const cleanDigits = whatsapp.replace(/\D/g, '');
    if (cleanDigits.length < 10) {
      setAlertError('Digite um número de WhatsApp válido com DDD.');
      return;
    }

    setSubmittingAlert(true);
    setAlertError('');

    try {
      const { error } = await supabase.from('stock_alerts').insert({
        product_id: alertProduct.id,
        customer_name: customerName.trim() || null,
        whatsapp: whatsapp.trim(),
      });

      if (error) throw error;

      setAlertSuccess(true);
    } catch (err) {
      console.error(err);
      setAlertError('Não foi possível salvar seu aviso agora. Tente novamente.');
    } finally {
      setSubmittingAlert(false);
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-pearl text-noir">
      {/* Barra superior decorativa bordô */}
      <div className="bg-burgundy text-pearl text-center py-2 px-4 text-[11px] tracking-[0.2em] uppercase font-medium">
        ✦ Links oficiais TikTok Shop • Curadoria Atualizada Diariamente ✦
      </div>

      {/* Cabeçalho Editorial */}
      <header className="sticky top-0 z-30 bg-pearl/95 backdrop-blur-md border-b border-subtle">
        <div className="max-w-6xl mx-auto px-4 pt-4 pb-3 flex flex-col items-center">
          <BrandLogo size="md" />

          <p className="font-script text-2xl sm:text-3xl text-burgundy/90 mt-0.5 mb-3 text-center">
            curadoria de achadinhos &amp; desejos
          </p>

          {/* Barra de Busca */}
          <div className="w-full max-w-md relative mb-3">
            <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Buscar gloss, skincare, acessórios..."
              className="w-full pl-10 pr-9 py-2.5 bg-white border border-subtle rounded-full text-sm text-noir placeholder:text-muted/70 focus:outline-none focus:border-burgundy focus:ring-2 focus:ring-blush/40 transition-all shadow-card"
            />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                aria-label="Limpar busca"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-muted hover:text-noir"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Pílulas de Categorias */}
          <nav
            aria-label="Categorias"
            className="w-full flex items-center justify-start sm:justify-center gap-2 overflow-x-auto no-scrollbar pb-1"
          >
            {categories.map((category) => {
              const isActive = selectedCategory === category;
              return (
                <button
                  key={category}
                  type="button"
                  onClick={() => setSelectedCategory(category)}
                  className={`whitespace-nowrap px-4 py-1.5 rounded-full text-xs font-medium tracking-wide transition-all ${
                    isActive
                      ? 'bg-burgundy text-white shadow-sm'
                      : 'bg-white text-muted border border-subtle hover:border-burgundy/40 hover:text-burgundy'
                  }`}
                >
                  {category}
                </button>
              );
            })}
          </nav>
        </div>
      </header>

      {/* Grade de Produtos */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-3.5 sm:px-6 py-6 sm:py-10">
        {filteredProducts.length === 0 ? (
          <div className="text-center py-20 px-4 bg-white rounded-3xl border border-subtle max-w-lg mx-auto shadow-card">
            <Sparkles className="w-8 h-8 text-burgundy mx-auto mb-3 opacity-80" />
            <h2 className="font-serif text-xl text-noir mb-1">
              Nenhum achadinho encontrado
            </h2>
            <p className="text-sm text-muted mb-5">
              Tente buscar por outro termo ou explore todas as categorias da nossa curadoria.
            </p>
            {(searchQuery || selectedCategory !== 'Todos') && (
              <button
                type="button"
                onClick={() => {
                  setSearchQuery('');
                  setSelectedCategory('Todos');
                }}
                className="px-5 py-2.5 rounded-full bg-burgundy text-white text-xs font-medium tracking-wider uppercase hover:bg-burgundy-hover transition-colors"
              >
                Ver catálogo completo
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3.5 sm:gap-6">
            {filteredProducts.map((product) => (
              <article
                key={product.id}
                className="group bg-white rounded-2xl border border-subtle overflow-hidden flex flex-col justify-between shadow-card hover:shadow-editorial transition-all duration-300"
              >
                <div>
                  {/* Imagem 4:5 */}
                  <div className="relative aspect-[4/5] w-full overflow-hidden bg-blush-soft">
                    <img
                      src={product.image_url}
                      alt={product.title}
                      loading="lazy"
                      className={`w-full h-full object-cover transition-transform duration-500 ${
                        product.in_stock
                          ? 'group-hover:scale-105'
                          : 'grayscale-[30%] opacity-80'
                      }`}
                    />

                    {/* Selo / Badge Tag */}
                    {product.badge_tag && (
                      <div className="absolute top-2.5 left-2.5 z-10 inline-flex items-center gap-1 bg-burgundy text-white text-[10px] sm:text-[11px] font-semibold uppercase tracking-wider px-2.5 py-1 rounded-full shadow-sm">
                        <span>✦</span>
                        <span>{product.badge_tag}</span>
                      </div>
                    )}

                    {/* Tarja de Esgotado */}
                    {!product.in_stock && (
                      <div className="absolute inset-0 z-10 bg-noir/35 backdrop-blur-[1.5px] flex items-center justify-center p-3">
                        <span className="bg-white/95 text-noir border border-subtle px-4 py-1.5 rounded-full text-[11px] sm:text-xs font-bold tracking-[0.22em] uppercase shadow-md">
                          ESGOTADO
                        </span>
                      </div>
                    )}
                  </div>

                  {/* Informações do Card */}
                  <div className="p-3 sm:p-4 pb-2">
                    <span className="block text-[10px] uppercase tracking-[0.18em] text-muted font-medium mb-1">
                      {product.category}
                    </span>

                    <h2 className="font-serif text-sm sm:text-base font-semibold text-noir leading-snug line-clamp-2 mb-1.5">
                      {product.title}
                    </h2>

                    <p className="text-base sm:text-lg font-bold text-burgundy tracking-tight">
                      {product.price}
                    </p>

                    {/* Comentário da Curadora */}
                    {product.curator_note && (
                      <div className="mt-2.5 p-2.5 rounded-xl bg-blush-soft border border-blush/40 flex items-start gap-1.5">
                        <Quote className="w-3.5 h-3.5 text-burgundy shrink-0 mt-0.5 opacity-70" />
                        <p className="text-[11px] sm:text-xs text-noir/85 italic leading-relaxed line-clamp-3">
                          &ldquo;{product.curator_note}&rdquo;
                        </p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Botão de Ação */}
                <div className="p-3 sm:p-4 pt-2">
                  {product.in_stock ? (
                    <a
                      href={product.tiktok_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-burgundy hover:bg-burgundy-hover active:scale-[0.99] text-white text-xs sm:text-sm font-medium py-2.5 px-3 rounded-xl transition-all shadow-sm"
                    >
                      <span>Ver no TikTok Shop</span>
                      <ExternalLink className="w-3.5 h-3.5 shrink-0" />
                    </a>
                  ) : (
                    <button
                      type="button"
                      onClick={() => openAlertModal(product)}
                      className="w-full inline-flex items-center justify-center gap-1.5 bg-white hover:bg-blush-soft text-burgundy border border-burgundy text-xs sm:text-sm font-medium py-2.5 px-3 rounded-xl transition-all"
                    >
                      <Bell className="w-3.5 h-3.5 shrink-0" />
                      <span>Avise-me quando voltar</span>
                    </button>
                  )}
                </div>
              </article>
            ))}
          </div>
        )}
      </main>

      {/* Rodapé Minimalista */}
      <footer className="border-t border-subtle bg-white py-8 px-4 text-center">
        <BrandLogo size="sm" />
        <p className="text-xs text-muted mt-2 max-w-md mx-auto leading-relaxed">
          Os preços e a disponibilidade podem sofrer alterações diretamente no TikTok Shop sem aviso prévio.
        </p>
      </footer>

      {/* Modal: Avise-me quando voltar */}
      {alertProduct && (
        <div
          className="fixed inset-0 z-50 bg-noir/50 backdrop-blur-xs flex items-end sm:items-center justify-center p-0 sm:p-4"
          onClick={closeAlertModal}
        >
          <div
            className="w-full sm:max-w-md bg-white rounded-t-3xl sm:rounded-3xl border border-subtle p-6 shadow-2xl animate-in fade-in slide-in-from-bottom-4 duration-200"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3 mb-4">
              <div>
                <span className="text-[11px] font-semibold uppercase tracking-[0.2em] text-burgundy">
                  ✦ Lista VIP de Reposição
                </span>
                <h3 className="font-serif text-xl font-semibold text-noir mt-0.5">
                  Avise-me quando voltar
                </h3>
              </div>
              <button
                type="button"
                onClick={closeAlertModal}
                aria-label="Fechar"
                className="p-1.5 rounded-full text-muted hover:text-noir hover:bg-pearl transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Resumo do Produto */}
            <div className="flex items-center gap-3 p-3 rounded-2xl bg-pearl border border-subtle mb-5">
              <img
                src={alertProduct.image_url}
                alt={alertProduct.title}
                className="w-14 h-16 rounded-xl object-cover shrink-0 border border-subtle"
              />
              <div className="min-w-0">
                <p className="font-serif text-sm font-semibold text-noir line-clamp-2">
                  {alertProduct.title}
                </p>
                <p className="text-xs font-semibold text-burgundy mt-1">
                  {alertProduct.price}
                </p>
              </div>
            </div>

            {alertSuccess ? (
              <div className="text-center py-4">
                <div className="w-12 h-12 rounded-full bg-blush-soft text-burgundy flex items-center justify-center mx-auto mb-3">
                  <CheckCircle2 className="w-7 h-7" />
                </div>
                <h4 className="font-serif text-lg font-semibold text-noir mb-1">
                  Você está na lista!
                </h4>
                <p className="text-sm text-muted mb-6 leading-relaxed">
                  Assim que esse achadinho voltar ao estoque no TikTok Shop, enviaremos um aviso direto no seu WhatsApp.
                </p>
                <button
                  type="button"
                  onClick={closeAlertModal}
                  className="w-full py-3 rounded-xl bg-burgundy text-white text-sm font-medium hover:bg-burgundy-hover transition-colors"
                >
                  Continuar explorando
                </button>
              </div>
            ) : (
              <form onSubmit={handleAlertSubmit} className="space-y-4">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-noir mb-1.5">
                    Seu WhatsApp *
                  </label>
                  <input
                    type="tel"
                    required
                    value={whatsapp}
                    onChange={(e) => setWhatsapp(formatWhatsAppMask(e.target.value))}
                    placeholder="(11) 99999-9999"
                    className="w-full px-4 py-3 rounded-xl border border-subtle bg-pearl/50 text-sm text-noir focus:outline-none focus:bg-white focus:border-burgundy focus:ring-2 focus:ring-blush/40 transition-all"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-noir mb-1.5">
                    Seu Nome <span className="text-muted font-normal">(opcional)</span>
                  </label>
                  <input
                    type="text"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Ex: Maria Clara"
                    className="w-full px-4 py-3 rounded-xl border border-subtle bg-pearl/50 text-sm text-noir focus:outline-none focus:bg-white focus:border-burgundy focus:ring-2 focus:ring-blush/40 transition-all"
                  />
                </div>

                {alertError && (
                  <p className="text-xs text-red-600 font-medium">{alertError}</p>
                )}

                <button
                  type="submit"
                  disabled={submittingAlert}
                  className="w-full py-3.5 px-4 rounded-xl bg-burgundy hover:bg-burgundy-hover disabled:opacity-60 text-white text-sm font-medium inline-flex items-center justify-center gap-2 transition-all shadow-sm"
                >
                  {submittingAlert ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Salvando aviso...</span>
                    </>
                  ) : (
                    <>
                      <Bell className="w-4 h-4" />
                      <span>Quero ser avisada no WhatsApp</span>
                    </>
                  )}
                </button>
              </form>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
