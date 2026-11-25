'use client';

import React, { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { Session } from '@supabase/supabase-js';
import {
  LogOut,
  Plus,
  Sparkles,
  Link2,
  Upload,
  Check,
  Pencil,
  Trash2,
  Star,
  Bell,
  MessageCircle,
  Loader2,
  ExternalLink,
  Search,
  Package,
  X,
  ClipboardPaste,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Product, StockAlert } from '@/types/database';
import { BrandLogo } from '@/components/BrandLogo';

const CATEGORY_SUGGESTIONS = [
  'Beleza & Make',
  'Skincare',
  'Cabelos',
  'Moda & Acessórios',
  'Casa & Decor',
  'Perfumaria',
];

const BADGE_SUGGESTIONS = [
  'Alerta Gem',
  'Achadinho',
  'Cupom Ativo',
  'Viral',
];

export default function AdminPage() {
  const [session, setSession] = useState<Session | null>(null);
  const [authLoading, setAuthLoading] = useState(true);

  // Login state
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loginError, setLoginError] = useState('');
  const [loggingIn, setLoggingIn] = useState(false);

  // Dashboard tabs
  const [activeTab, setActiveTab] = useState<'products' | 'waitlist'>('products');

  // Data state
  const [products, setProducts] = useState<Product[]>([]);
  const [alerts, setAlerts] = useState<StockAlert[]>([]);
  const [loadingData, setLoadingData] = useState(false);
  const [adminSearch, setAdminSearch] = useState('');

  // Form state
  const formRef = useRef<HTMLDivElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const capturedHandledRef = useRef(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [tiktokUrl, setTiktokUrl] = useState('');
  const [title, setTitle] = useState('');
  const [price, setPrice] = useState('');
  const [category, setCategory] = useState('');
  const [badgeTag, setBadgeTag] = useState('');
  const [curatorNote, setCuratorNote] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [inStock, setInStock] = useState(true);
  const [isFeatured, setIsFeatured] = useState(false);

  // Status feedback
  const [scraping, setScraping] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);
  const [savingProduct, setSavingProduct] = useState(false);
  const [toast, setToast] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

  const showToast = useCallback((type: 'success' | 'error', text: string) => {
    setToast({ type, text });
    setTimeout(() => {
      setToast(null);
    }, 4500);
  }, []);

  // 1. Verificar autenticação Supabase
  useEffect(() => {
    supabase.auth.getSession().then(({ data }) => {
      setSession(data.session);
      setAuthLoading(false);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, currentSession) => {
      setSession(currentSession);
    });

    return () => subscription.unsubscribe();
  }, []);

  // 1.5 Receber dados capturados pelo botão de favoritos (Bookmarklet)
  useEffect(() => {
    if (capturedHandledRef.current || typeof window === 'undefined') return;

    const params = new URLSearchParams(window.location.search);
    const capturedTitle = params.get('title');
    const capturedPrice = params.get('price');
    const capturedImage = params.get('image');
    const capturedUrl = params.get('url');

    if (capturedTitle || capturedPrice || capturedImage || capturedUrl) {
      capturedHandledRef.current = true;

      if (capturedTitle) {
        const cleanTitle = capturedTitle
          .replace(/\s*[|\-–]\s*TikTok.*$/i, '')
          .trim();
        setTitle(cleanTitle);
      }
      if (capturedPrice) setPrice(capturedPrice.trim());
      if (capturedUrl) setTiktokUrl(capturedUrl.trim());
      if (capturedImage) setImageUrl(capturedImage.trim());

      window.history.replaceState({}, '', '/admin');
      showToast('success', 'Dados capturados! Confira os campos e publique.');
    }
  }, [showToast]);

  // 2. Carregar Produtos e Lista de Espera
  const fetchAllData = useCallback(async () => {
    setLoadingData(true);
    try {
      const [productsRes, alertsRes] = await Promise.all([
        supabase
          .from('products')
          .select('*')
          .order('is_featured', { ascending: false })
          .order('created_at', { ascending: false }),
        supabase
          .from('stock_alerts')
          .select('*, products(id, title, price, image_url, tiktok_url, in_stock)')
          .order('created_at', { ascending: false }),
      ]);

      if (productsRes.data) setProducts(productsRes.data as Product[]);
      if (alertsRes.data) setAlerts(alertsRes.data as StockAlert[]);
    } catch (err) {
      console.error('Erro ao buscar dados do admin:', err);
    } finally {
      setLoadingData(false);
    }
  }, []);

  useEffect(() => {
    if (session) {
      fetchAllData();
    }
  }, [session, fetchAllData]);

  // 3. Upload de Arquivo/Blob (usado tanto no input quanto no Ctrl+V)
  const uploadImageFile = useCallback(
    async (file: File) => {
      if (!file.type.startsWith('image/')) {
        showToast('error', 'Selecione ou cole apenas arquivos de imagem.');
        return;
      }

      setUploadingImg(true);
      try {
        const ext = file.type.split('/')[1] || 'jpg';
        const fileName = `manual-${Date.now()}-${Math.random()
          .toString(36)
          .slice(2, 8)}.${ext}`;

        const { error: uploadError } = await supabase.storage
          .from('product-images')
          .upload(fileName, file, {
            contentType: file.type,
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data } = supabase.storage
          .from('product-images')
          .getPublicUrl(fileName);

        setImageUrl(data.publicUrl);
        showToast('success', 'Imagem enviada com sucesso!');
      } catch (err) {
        console.error(err);
        showToast('error', 'Erro ao subir imagem. Verifique sua conexão.');
      } finally {
        setUploadingImg(false);
      }
    },
    [showToast]
  );

  // Listener global de Ctrl+V / Cmd+V quando logado na aba de produtos
  useEffect(() => {
    if (!session || activeTab !== 'products') return;

    const handleGlobalPaste = (e: ClipboardEvent) => {
      const items = e.clipboardData?.items;
      if (!items) return;

      for (let i = 0; i < items.length; i++) {
        if (items[i].type.startsWith('image/')) {
          const blob = items[i].getAsFile();
          if (blob) {
            e.preventDefault();
            uploadImageFile(blob);
            break;
          }
        }
      }
    };

    window.addEventListener('paste', handleGlobalPaste);
    return () => window.removeEventListener('paste', handleGlobalPaste);
  }, [session, activeTab, uploadImageFile]);

  // Login & Logout
  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoggingIn(true);
    setLoginError('');

    const { error } = await supabase.auth.signInWithPassword({
      email: email.trim(),
      password,
    });

    if (error) {
      setLoginError('E-mail ou senha inválidos.');
    }
    setLoggingIn(false);
  };

  const handleLogout = async () => {
    await supabase.auth.signOut();
  };

  // Separador automático quando colar texto compartilhado do app TikTok
  const handleSmartLinkChange = (rawValue: string) => {
    const urlMatch = rawValue.match(/https?:\/\/[^\s]+/i);
    if (urlMatch && rawValue.trim() !== urlMatch[0]) {
      const extractedUrl = urlMatch[0];
      const remainingText = rawValue
        .replace(extractedUrl, '')
        .replace(/^(confira|olha|veja|achei)[^:]*:\s*/i, '')
        .replace(/\s+/g, ' ')
        .trim();

      setTiktokUrl(extractedUrl);
      if (remainingText && !title.trim()) {
        setTitle(remainingText);
        showToast('success', 'Link e nome do produto separados automaticamente!');
      }
    } else {
      setTiktokUrl(rawValue);
    }
  };

  // Importar dados do link do TikTok Shop
  const handleScrapeLink = async () => {
    if (!tiktokUrl.trim()) {
      showToast('error', 'Cole primeiro o link do TikTok Shop.');
      return;
    }

    setScraping(true);
    try {
      const res = await fetch('/api/scrape-product', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: tiktokUrl.trim() }),
      });

      const data = await res.json();

      if (data.title && !title) {
        setTitle(data.title);
      }
      if (data.imageUrl) {
        setImageUrl(data.imageUrl);
      }

      showToast(data.imageUrl ? 'success' : 'error', data.message);
    } catch {
      showToast('error', 'Falha ao conectar com o importador. Use Ctrl+V para a foto.');
    } finally {
      setScraping(false);
    }
  };

  const resetForm = () => {
    setEditingId(null);
    setTiktokUrl('');
    setTitle('');
    setPrice('');
    setCategory('');
    setBadgeTag('');
    setCuratorNote('');
    setImageUrl('');
    setInStock(true);
    setIsFeatured(false);
  };

  const startEditing = (product: Product) => {
    setEditingId(product.id);
    setTiktokUrl(product.tiktok_url);
    setTitle(product.title);
    setPrice(product.price);
    setCategory(product.category);
    setBadgeTag(product.badge_tag || '');
    setCuratorNote(product.curator_note || '');
    setImageUrl(product.image_url);
    setInStock(product.in_stock);
    setIsFeatured(product.is_featured);
    setActiveTab('products');
    formRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  // Salvar ou Atualizar Produto
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!title.trim() || !price.trim() || !category.trim() || !tiktokUrl.trim() || !imageUrl.trim()) {
      showToast('error', 'Preencha foto, título, preço, categoria e link do TikTok.');
      return;
    }

    setSavingProduct(true);
    try {
      const payload = {
        title: title.trim(),
        price: price.trim(),
        category: category.trim(),
        tiktok_url: tiktokUrl.trim(),
        image_url: imageUrl.trim(),
        badge_tag: badgeTag.trim() || null,
        curator_note: curatorNote.trim() || null,
        in_stock: inStock,
        is_featured: isFeatured,
      };

      if (editingId) {
        const { error } = await supabase
          .from('products')
          .update(payload)
          .eq('id', editingId);

        if (error) throw error;
        showToast('success', 'Produto atualizado na vitrine!');
      } else {
        const { error } = await supabase.from('products').insert(payload);
        if (error) throw error;
        showToast('success', 'Novo achadinho publicado na vitrine!');
      }

      resetForm();
      await fetchAllData();
    } catch (err: unknown) {
      console.error(err);
      const detail =
        err && typeof err === 'object' && 'message' in err
          ? String((err as { message: string }).message)
          : 'Erro ao salvar produto.';
      showToast('error', `Erro: ${detail}`);
    } finally {
      setSavingProduct(false);
    }
  };

  // Alternar Estoque em 1 clique
  const toggleStockStatus = async (product: Product) => {
    const nextStock = !product.in_stock;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, in_stock: nextStock } : p))
    );

    const { error } = await supabase
      .from('products')
      .update({ in_stock: nextStock })
      .eq('id', product.id);

    if (error) {
      showToast('error', 'Erro ao atualizar estoque.');
      fetchAllData();
    } else {
      const pendingForProduct = alerts.filter(
        (a) => a.product_id === product.id && !a.notified
      ).length;

      if (nextStock && pendingForProduct > 0) {
        showToast(
          'success',
          `Estoque reativado! Há ${pendingForProduct} pessoa(s) aguardando na Lista de Espera.`
        );
      } else {
        showToast(
          'success',
          nextStock ? 'Marcado como Em Estoque!' : 'Marcado como Esgotado.'
        );
      }
      fetchAllData();
    }
  };

  // Alternar Destaque
  const toggleFeatured = async (product: Product) => {
    const nextFeatured = !product.is_featured;
    setProducts((prev) =>
      prev.map((p) => (p.id === product.id ? { ...p, is_featured: nextFeatured } : p))
    );

    const { error } = await supabase
      .from('products')
      .update({ is_featured: nextFeatured })
      .eq('id', product.id);

    if (error) {
      showToast('error', 'Erro ao destacar produto.');
      fetchAllData();
    }
  };

  // Excluir Produto
  const handleDeleteProduct = async (product: Product) => {
    const confirmed = window.confirm(
      `Tem certeza que deseja excluir "${product.title}"?`
    );
    if (!confirmed) return;

    const { error } = await supabase.from('products').delete().eq('id', product.id);
    if (error) {
      showToast('error', 'Erro ao excluir produto.');
    } else {
      showToast('success', 'Produto removido.');
      if (editingId === product.id) resetForm();
      fetchAllData();
    }
  };

  // Marcar alerta como avisado no Supabase
  const markAlertNotified = async (alertId: string) => {
    setAlerts((prev) =>
      prev.map((a) => (a.id === alertId ? { ...a, notified: true } : a))
    );

    const { error } = await supabase
      .from('stock_alerts')
      .update({ notified: true })
      .eq('id', alertId);

    if (error) {
      showToast('error', 'Erro ao atualizar status do aviso.');
      fetchAllData();
    }
  };

  // Disparar WhatsApp + marcar como avisado
  const handleNotifyWhatsApp = async (alert: StockAlert) => {
    const productTitle = alert.products?.title || 'produto desejado';
    const productLink = alert.products?.tiktok_url || '';
    const greetingName = alert.customer_name?.trim()
      ? `Oi ${alert.customer_name.trim()}!`
      : 'Oi!';

    const message = `${greetingName} ✨ Passando pra avisar que o *${productTitle}* que você pediu na Glow Finds acabou de voltar pro estoque! Garante o seu antes que acabe de novo: ${productLink}`;

    const cleanDigits = alert.whatsapp.replace(/\D/g, '');
    const phoneWithCountry = cleanDigits.startsWith('55')
      ? cleanDigits
      : `55${cleanDigits}`;

    const waUrl = `https://wa.me/${phoneWithCountry}?text=${encodeURIComponent(
      message
    )}`;

    window.open(waUrl, '_blank', 'noopener,noreferrer');

    if (!alert.notified) {
      await markAlertNotified(alert.id);
    }
  };

  // Contagem de pendentes por produto
  const pendingCountByProduct = useMemo(() => {
    const map: Record<string, number> = {};
    alerts.forEach((a) => {
      if (!a.notified) {
        map[a.product_id] = (map[a.product_id] || 0) + 1;
      }
    });
    return map;
  }, [alerts]);

  // Agrupamento da Lista de Espera por produto (priorizando itens que voltaram ao estoque)
  const groupedWaitlist = useMemo(() => {
    const groupsMap = new Map<
      string,
      {
        product: StockAlert['products'];
        productId: string;
        items: StockAlert[];
        pendingCount: number;
      }
    >();

    alerts.forEach((alert) => {
      const existing = groupsMap.get(alert.product_id);
      if (existing) {
        existing.items.push(alert);
        if (!alert.notified) existing.pendingCount += 1;
      } else {
        groupsMap.set(alert.product_id, {
          product: alert.products,
          productId: alert.product_id,
          items: [alert],
          pendingCount: alert.notified ? 0 : 1,
        });
      }
    });

    return Array.from(groupsMap.values()).sort((a, b) => {
      const aReady = (a.product?.in_stock ? 1 : 0) * (a.pendingCount > 0 ? 10 : 1);
      const bReady = (b.product?.in_stock ? 1 : 0) * (b.pendingCount > 0 ? 10 : 1);
      if (bReady !== aReady) return bReady - aReady;
      return b.pendingCount - a.pendingCount;
    });
  }, [alerts]);

  // Total de clientes prontos para avisar (produto em estoque + não notificado)
  const readyToNotifyTotal = useMemo(() => {
    return alerts.filter((a) => !a.notified && a.products?.in_stock).length;
  }, [alerts]);

  const filteredAdminProducts = useMemo(() => {
    const q = adminSearch.trim().toLowerCase();
    if (!q) return products;
    return products.filter(
      (p) =>
        p.title.toLowerCase().includes(q) ||
        p.category.toLowerCase().includes(q)
    );
  }, [products, adminSearch]);

  // Tela de Carregamento Inicial
  if (authLoading) {
    return (
      <div className="min-h-screen bg-pearl flex items-center justify-center">
        <Loader2 className="w-7 h-7 text-burgundy animate-spin" />
      </div>
    );
  }

  // Tela de Login
  if (!session) {
    return (
      <div className="min-h-screen bg-pearl flex flex-col items-center justify-center p-4">
        <div className="w-full max-w-sm bg-white rounded-3xl border border-subtle p-8 shadow-editorial">
          <div className="flex flex-col items-center mb-6">
            <BrandLogo size="md" />
            <span className="text-[11px] uppercase tracking-[0.22em] text-muted font-semibold mt-2">
              Acesso Administrativo
            </span>
          </div>

          <form onSubmit={handleLogin} className="space-y-4">
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-noir mb-1.5">
                E-mail
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seuemail@glowfinds.com"
                className="w-full px-4 py-3 rounded-xl border border-subtle bg-pearl/50 text-sm focus:outline-none focus:bg-white focus:border-burgundy"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-noir mb-1.5">
                Senha
              </label>
              <input
                type="password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-3 rounded-xl border border-subtle bg-pearl/50 text-sm focus:outline-none focus:bg-white focus:border-burgundy"
              />
            </div>

            {loginError && (
              <p className="text-xs text-red-600 font-medium">{loginError}</p>
            )}

            <button
              type="submit"
              disabled={loggingIn}
              className="w-full py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-hover text-white text-sm font-medium transition-colors flex items-center justify-center gap-2"
            >
              {loggingIn ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                'Entrar no Painel'
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <Link
              href="/"
              className="text-xs text-muted hover:text-burgundy underline underline-offset-4"
            >
              ← Voltar para a vitrine pública
            </Link>
          </div>
        </div>
      </div>
    );
  }

  // Painel Autenticado
  return (
    <div className="min-h-screen bg-pearl text-noir pb-16">
      {/* Notificação Flutuante (Toast) */}
      {toast && (
        <div
          className={`fixed bottom-5 right-5 z-50 max-w-sm px-4 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-medium flex items-center gap-2.5 ${
            toast.type === 'success'
              ? 'bg-noir text-white border-noir'
              : 'bg-red-600 text-white border-red-700'
          }`}
        >
          <Sparkles className="w-4 h-4 shrink-0 text-blush" />
          <span>{toast.text}</span>
        </div>
      )}

      {/* Header Admin */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-subtle">
        <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <BrandLogo size="sm" />
            <span className="hidden sm:inline-block text-[10px] uppercase tracking-[0.2em] bg-blush-soft text-burgundy font-bold px-2.5 py-1 rounded-full border border-blush/50">
              Admin
            </span>
          </div>

          <div className="flex items-center gap-2">
            <Link
              href="/"
              target="_blank"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-subtle text-xs font-medium text-noir hover:border-burgundy hover:text-burgundy transition-colors"
            >
              <span>Ver Vitrine</span>
              <ExternalLink className="w-3.5 h-3.5" />
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              title="Sair"
              className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl bg-pearl hover:bg-red-50 text-muted hover:text-red-600 border border-subtle text-xs font-medium transition-colors"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Sair</span>
            </button>
          </div>
        </div>

        {/* Navegação por Abas */}
        <div className="max-w-5xl mx-auto px-4 flex gap-2 pb-3">
          <button
            type="button"
            onClick={() => setActiveTab('products')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'products'
                ? 'bg-burgundy text-white shadow-sm'
                : 'bg-pearl text-muted hover:text-noir border border-subtle'
            }`}
          >
            <Package className="w-3.5 h-3.5" />
            <span>Catálogo ({products.length})</span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab('waitlist')}
            className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-xs font-semibold transition-all ${
              activeTab === 'waitlist'
                ? 'bg-burgundy text-white shadow-sm'
                : 'bg-pearl text-muted hover:text-noir border border-subtle'
            }`}
          >
            <Bell className="w-3.5 h-3.5" />
            <span>Lista de Espera</span>
            {readyToNotifyTotal > 0 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500 text-white">
                {readyToNotifyTotal} prontos
              </span>
            )}
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 pt-6">
        {activeTab === 'products' ? (
          <div className="space-y-8">
            {/* Formulário de Cadastro / Edição */}
            <section
              ref={formRef}
              className="bg-white rounded-3xl border border-subtle p-5 sm:p-7 shadow-card"
            >
              <div className="flex items-center justify-between mb-5">
                <div>
                  <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-burgundy">
                    ✦ Curadoria Glow Finds
                  </span>
                  <h1 className="font-serif text-xl sm:text-2xl font-semibold text-noir">
                    {editingId ? 'Editar Produto' : 'Adicionar Novo Achadinho'}
                  </h1>
                </div>

                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="inline-flex items-center gap-1 text-xs text-muted hover:text-noir px-3 py-1.5 rounded-full border border-subtle"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Cancelar edição</span>
                  </button>
                )}
              </div>

              {/* Passo 1: Link do TikTok Shop + Importação */}
              <div className="p-4 rounded-2xl bg-blush-soft/70 border border-blush/50 mb-6">
                <label className="block text-xs font-bold uppercase tracking-wider text-burgundy mb-2">
                  1. Cole o link de afiliada do TikTok Shop
                </label>
                <div className="flex flex-col sm:flex-row gap-2">
                  <div className="relative flex-1">
                    <Link2 className="w-4 h-4 text-burgundy/70 absolute left-3.5 top-1/2 -translate-y-1/2" />
                    <input
                      type="text"
                      value={tiktokUrl}
                      onChange={(e) => handleSmartLinkChange(e.target.value)}
                      placeholder="https://vt.tiktok.com/... ou cole o texto compartilhado"
                      className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-white border border-subtle text-sm focus:outline-none focus:border-burgundy"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleScrapeLink}
                    disabled={scraping}
                    className="px-4 py-2.5 rounded-xl bg-burgundy hover:bg-burgundy-hover disabled:opacity-60 text-white text-xs font-semibold uppercase tracking-wider inline-flex items-center justify-center gap-2 shrink-0 transition-colors"
                  >
                    {scraping ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Puxando...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4" />
                        <span>Puxar Dados</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

              <form onSubmit={handleSaveProduct} className="grid grid-cols-1 md:grid-cols-12 gap-6">
                {/* Coluna da Imagem (Upload + Ctrl+V) */}
                <div className="md:col-span-4">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-noir mb-2">
                    Foto do Produto *
                  </label>

                  <div
                    onClick={() => fileInputRef.current?.click()}
                    onDragOver={(e) => e.preventDefault()}
                    onDrop={(e) => {
                      e.preventDefault();
                      const file = e.dataTransfer.files?.[0];
                      if (file) uploadImageFile(file);
                    }}
                    className="relative aspect-[4/5] w-full rounded-2xl border-2 border-dashed border-burgundy/35 hover:border-burgundy bg-pearl/70 flex flex-col items-center justify-center p-4 text-center cursor-pointer overflow-hidden transition-all group"
                  >
                    {uploadingImg ? (
                      <div className="flex flex-col items-center gap-2 text-burgundy">
                        <Loader2 className="w-7 h-7 animate-spin" />
                        <span className="text-xs font-medium">Enviando foto...</span>
                      </div>
                    ) : imageUrl ? (
                      <>
                        <img
                          src={imageUrl}
                          alt="Preview"
                          className="w-full h-full object-cover absolute inset-0"
                        />
                        <div className="absolute inset-0 bg-noir/45 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center text-white p-3">
                          <Upload className="w-6 h-6 mb-1" />
                          <span className="text-xs font-medium">
                            Clique ou dê Ctrl+V para trocar
                          </span>
                        </div>
                      </>
                    ) : (
                      <div className="space-y-2 text-muted">
                        <div className="w-11 h-11 rounded-full bg-white border border-subtle flex items-center justify-center mx-auto text-burgundy shadow-xs">
                          <ClipboardPaste className="w-5 h-5" />
                        </div>
                        <p className="text-xs font-semibold text-noir">
                          Cole um print com <kbd className="px-1.5 py-0.5 bg-white border border-subtle rounded text-[11px]">Ctrl+V</kbd>
                        </p>
                        <p className="text-[11px] leading-relaxed">
                          ou clique aqui para selecionar uma foto do celular/PC
                        </p>
                      </div>
                    )}

                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => {
                        const file = e.target.files?.[0];
                        if (file) uploadImageFile(file);
                      }}
                    />
                  </div>
                </div>

                {/* Coluna dos Campos */}
                <div className="md:col-span-8 space-y-4">
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-noir mb-1.5">
                      Nome do Produto *
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ex: Lip Oil Hidratante Glow Berry"
                      className="w-full px-4 py-2.5 rounded-xl border border-subtle bg-pearl/40 text-sm focus:outline-none focus:bg-white focus:border-burgundy"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-noir mb-1.5">
                        Preço *
                      </label>
                      <input
                        type="text"
                        required
                        value={price}
                        onChange={(e) => setPrice(e.target.value)}
                        placeholder="Ex: R$ 49,90"
                        className="w-full px-4 py-2.5 rounded-xl border border-subtle bg-pearl/40 text-sm focus:outline-none focus:bg-white focus:border-burgundy"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold uppercase tracking-wider text-noir mb-1.5">
                        Categoria *
                      </label>
                      <input
                        type="text"
                        required
                        value={category}
                        onChange={(e) => setCategory(e.target.value)}
                        placeholder="Ex: Beleza & Make"
                        className="w-full px-4 py-2.5 rounded-xl border border-subtle bg-pearl/40 text-sm focus:outline-none focus:bg-white focus:border-burgundy"
                      />
                      <div className="flex flex-wrap gap-1.5 mt-2">
                        {CATEGORY_SUGGESTIONS.map((cat) => (
                          <button
                            key={cat}
                            type="button"
                            onClick={() => setCategory(cat)}
                            className="text-[11px] px-2.5 py-0.5 rounded-full bg-pearl hover:bg-blush-soft text-muted hover:text-burgundy border border-subtle transition-colors"
                          >
                            {cat}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-noir mb-1.5">
                      Selo de Destaque <span className="text-muted font-normal">(opcional)</span>
                    </label>
                    <input
                      type="text"
                      value={badgeTag}
                      onChange={(e) => setBadgeTag(e.target.value)}
                      placeholder="Ex: Alerta Gem"
                      className="w-full px-4 py-2.5 rounded-xl border border-subtle bg-pearl/40 text-sm focus:outline-none focus:bg-white focus:border-burgundy"
                    />
                    <div className="flex flex-wrap gap-1.5 mt-2">
                      {BADGE_SUGGESTIONS.map((tag) => (
                        <button
                          key={tag}
                          type="button"
                          onClick={() => setBadgeTag(tag)}
                          className="text-[11px] px-2.5 py-0.5 rounded-full bg-blush-soft text-burgundy border border-blush/50 hover:bg-burgundy hover:text-white transition-colors"
                        >
                          ✦ {tag}
                        </button>
                      ))}
                      {badgeTag && (
                        <button
                          type="button"
                          onClick={() => setBadgeTag('')}
                          className="text-[11px] px-2.5 py-0.5 rounded-full bg-pearl text-muted border border-subtle"
                        >
                          Limpar selo
                        </button>
                      )}
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wider text-noir mb-1.5">
                      Comentário da Curadoria <span className="text-muted font-normal">(opcional)</span>
                    </label>
                    <textarea
                      rows={2}
                      value={curatorNote}
                      onChange={(e) => setCuratorNote(e.target.value)}
                      placeholder="Ex: Testei e dura o dia inteiro sem deixar pegajoso!"
                      className="w-full px-4 py-2.5 rounded-xl border border-subtle bg-pearl/40 text-sm focus:outline-none focus:bg-white focus:border-burgundy"
                    />
                  </div>

                  {/* Switches */}
                  <div className="flex flex-wrap items-center gap-6 pt-1">
                    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={inStock}
                        onChange={(e) => setInStock(e.target.checked)}
                        className="w-4 h-4 accent-burgundy rounded"
                      />
                      <span className="text-sm font-medium text-noir">Em Estoque</span>
                    </label>

                    <label className="inline-flex items-center gap-2.5 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={isFeatured}
                        onChange={(e) => setIsFeatured(e.target.checked)}
                        className="w-4 h-4 accent-burgundy rounded"
                      />
                      <span className="text-sm font-medium text-noir">
                        Fixar no topo (Destaque)
                      </span>
                    </label>
                  </div>

                  <div className="pt-2">
                    <button
                      type="submit"
                      disabled={savingProduct || uploadingImg}
                      className="w-full sm:w-auto px-7 py-3.5 rounded-xl bg-burgundy hover:bg-burgundy-hover disabled:opacity-60 text-white text-sm font-semibold inline-flex items-center justify-center gap-2 shadow-sm transition-all"
                    >
                      {savingProduct ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Salvando...</span>
                        </>
                      ) : (
                        <>
                          <Plus className="w-4 h-4" />
                          <span>
                            {editingId ? 'Salvar Alterações' : 'Publicar no Catálogo'}
                          </span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            </section>

            {/* Lista de Produtos Cadastrados */}
            <section className="space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <h2 className="font-serif text-xl font-semibold text-noir">
                  Produtos Cadastrados ({products.length})
                </h2>

                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 text-muted absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="text"
                    value={adminSearch}
                    onChange={(e) => setAdminSearch(e.target.value)}
                    placeholder="Filtrar produtos..."
                    className="w-full pl-9 pr-4 py-2 rounded-xl bg-white border border-subtle text-xs focus:outline-none focus:border-burgundy"
                  />
                </div>
              </div>

              {loadingData ? (
                <div className="py-12 flex justify-center">
                  <Loader2 className="w-6 h-6 text-burgundy animate-spin" />
                </div>
              ) : filteredAdminProducts.length === 0 ? (
                <div className="bg-white rounded-2xl border border-subtle p-8 text-center text-sm text-muted">
                  Nenhum produto cadastrado ainda.
                </div>
              ) : (
                <div className="space-y-3">
                  {filteredAdminProducts.map((product) => {
                    const waitingCount = pendingCountByProduct[product.id] || 0;
                    return (
                      <div
                        key={product.id}
                        className="bg-white rounded-2xl border border-subtle p-3.5 sm:p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-card"
                      >
                        <div className="flex items-center gap-3.5 min-w-0">
                          <img
                            src={product.image_url}
                            alt={product.title}
                            className={`w-14 h-16 rounded-xl object-cover shrink-0 border border-subtle ${
                              !product.in_stock ? 'grayscale opacity-70' : ''
                            }`}
                          />

                          <div className="min-w-0">
                            <div className="flex flex-wrap items-center gap-1.5 mb-1">
                              <span className="text-[10px] uppercase tracking-wider text-muted font-semibold">
                                {product.category}
                              </span>
                              {product.badge_tag && (
                                <span className="text-[10px] px-2 py-0.5 rounded-full bg-blush-soft text-burgundy font-semibold">
                                  ✦ {product.badge_tag}
                                </span>
                              )}
                              {waitingCount > 0 && (
                                <button
                                  type="button"
                                  onClick={() => setActiveTab('waitlist')}
                                  className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-900 font-bold inline-flex items-center gap-1"
                                >
                                  <Bell className="w-2.5 h-2.5" />
                                  {waitingCount} aguardando
                                </button>
                              )}
                            </div>

                            <h3 className="font-serif text-sm sm:text-base font-semibold text-noir truncate">
                              {product.title}
                            </h3>
                            <p className="text-xs font-bold text-burgundy mt-0.5">
                              {product.price}
                            </p>
                          </div>
                        </div>

                        {/* Controles Rápidos */}
                        <div className="flex items-center justify-between sm:justify-end gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-subtle">
                          {/* Toggle Em Estoque / Esgotado */}
                          <button
                            type="button"
                            onClick={() => toggleStockStatus(product)}
                            className={`px-3 py-1.5 rounded-full text-xs font-semibold transition-all ${
                              product.in_stock
                                ? 'bg-emerald-50 text-emerald-700 border border-emerald-200 hover:bg-emerald-100'
                                : 'bg-zinc-100 text-zinc-700 border border-zinc-300 hover:bg-zinc-200'
                            }`}
                          >
                            {product.in_stock ? '● Em Estoque' : '○ Esgotado'}
                          </button>

                          {/* Destacar */}
                          <button
                            type="button"
                            onClick={() => toggleFeatured(product)}
                            title={
                              product.is_featured
                                ? 'Remover destaque'
                                : 'Fixar no topo'
                            }
                            className={`p-2 rounded-xl border transition-colors ${
                              product.is_featured
                                ? 'bg-blush-soft border-blush text-burgundy'
                                : 'bg-pearl border-subtle text-muted hover:text-noir'
                            }`}
                          >
                            <Star
                              className={`w-4 h-4 ${
                                product.is_featured ? 'fill-burgundy' : ''
                              }`}
                            />
                          </button>

                          {/* Editar */}
                          <button
                            type="button"
                            onClick={() => startEditing(product)}
                            title="Editar produto"
                            className="p-2 rounded-xl bg-pearl border border-subtle text-noir hover:border-burgundy hover:text-burgundy transition-colors"
                          >
                            <Pencil className="w-4 h-4" />
                          </button>

                          {/* Excluir */}
                          <button
                            type="button"
                            onClick={() => handleDeleteProduct(product)}
                            title="Excluir produto"
                            className="p-2 rounded-xl bg-pearl border border-subtle text-muted hover:bg-red-50 hover:border-red-200 hover:text-red-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </section>
          </div>
        ) : (
          /* ABA: LISTA DE ESPERA & DISPARO WHATSAPP */
          <section className="space-y-6">
            <div>
              <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-burgundy">
                ✦ Central de Reposição
              </span>
              <h1 className="font-serif text-2xl font-semibold text-noir">
                Lista de Espera &amp; Avisos WhatsApp
              </h1>
              <p className="text-xs sm:text-sm text-muted mt-1">
                Quando você reativar o estoque de um produto, ele sobe para o topo desta lista para disparo rápido.
              </p>
            </div>

            {groupedWaitlist.length === 0 ? (
              <div className="bg-white rounded-3xl border border-subtle p-10 text-center shadow-card">
                <Bell className="w-8 h-8 text-burgundy/60 mx-auto mb-2" />
                <p className="font-serif text-lg text-noir">
                  Nenhuma solicitação na lista de espera ainda
                </p>
                <p className="text-xs text-muted mt-1">
                  Quando um produto estiver marcado como Esgotado, as clientes poderão deixar o WhatsApp na vitrine.
                </p>
              </div>
            ) : (
              <div className="space-y-5">
                {groupedWaitlist.map((group) => {
                  const isBackInStock = Boolean(group.product?.in_stock);
                  const hasReadyCustomers = isBackInStock && group.pendingCount > 0;

                  return (
                    <div
                      key={group.productId}
                      className={`bg-white rounded-3xl border overflow-hidden shadow-card ${
                        hasReadyCustomers
                          ? 'border-emerald-400 ring-2 ring-emerald-500/15'
                          : 'border-subtle'
                      }`}
                    >
                      {/* Cabeçalho do Produto no Grupo */}
                      <div
                        className={`p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b ${
                          hasReadyCustomers
                            ? 'bg-emerald-50/70 border-emerald-200'
                            : 'bg-pearl/70 border-subtle'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {group.product?.image_url && (
                            <img
                              src={group.product.image_url}
                              alt={group.product.title}
                              className="w-12 h-14 rounded-xl object-cover border border-subtle shrink-0"
                            />
                          )}
                          <div>
                            <div className="flex flex-wrap items-center gap-2">
                              <span
                                className={`text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full ${
                                  isBackInStock
                                    ? 'bg-emerald-600 text-white'
                                    : 'bg-zinc-200 text-zinc-700'
                                }`}
                              >
                                {isBackInStock
                                  ? '● Voltou ao Estoque!'
                                  : '○ Ainda Esgotado'}
                              </span>
                              <span className="text-xs text-muted">
                                {group.pendingCount} pendente(s) de {group.items.length}
                              </span>
                            </div>
                            <h3 className="font-serif text-base font-semibold text-noir mt-1">
                              {group.product?.title || 'Produto removido'}
                            </h3>
                          </div>
                        </div>
                      </div>

                      {/* Lista de Clientes Aguardando este Produto */}
                      <div className="divide-y divide-subtle">
                        {group.items.map((alert) => (
                          <div
                            key={alert.id}
                            className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3"
                          >
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-sm font-semibold text-noir">
                                  {alert.customer_name || 'Cliente VIP'}
                                </span>
                                <span
                                  className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                                    alert.notified
                                      ? 'bg-zinc-100 text-zinc-500'
                                      : 'bg-blush-soft text-burgundy'
                                  }`}
                                >
                                  {alert.notified ? 'Avisado' : 'Pendente'}
                                </span>
                              </div>
                              <p className="text-xs text-muted mt-0.5">
                                {alert.whatsapp} •{' '}
                                {new Date(alert.created_at).toLocaleDateString('pt-BR')}
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              <button
                                type="button"
                                onClick={() => handleNotifyWhatsApp(alert)}
                                className="flex-1 sm:flex-initial inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold transition-colors shadow-xs"
                              >
                                <MessageCircle className="w-3.5 h-3.5" />
                                <span>Notificar no WhatsApp</span>
                              </button>

                              {!alert.notified && (
                                <button
                                  type="button"
                                  onClick={() => markAlertNotified(alert.id)}
                                  title="Marcar manualmente como avisado"
                                  className="p-2 rounded-xl border border-subtle text-muted hover:text-emerald-700 hover:border-emerald-300 transition-colors"
                                >
                                  <Check className="w-4 h-4" />
                                </button>
                              )}
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </section>
        )}
      </main>
    </div>
  );
}