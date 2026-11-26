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
import { CopyPresellButton } from '@/components/CopyPresellButton';

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
  const [lastSavedProduct, setLastSavedProduct] = useState<{ id: string; title: string } | null>(null);
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

  // 1.5 Receber dados capturados pelo Atalho / Bookmarklet
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
        showToast('