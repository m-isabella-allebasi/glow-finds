import { createClient } from '@supabase/supabase-js';
import { StorefrontClient } from '@/components/StorefrontClient';
import { Product } from '@/types/database';

export const dynamic = 'force-dynamic';
export const revalidate = 0;

async function getProducts(): Promise<Product[]> {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

  if (!supabaseUrl || !supabaseAnonKey) {
    return [];
  }

  const supabase = createClient(supabaseUrl, supabaseAnonKey, {
    auth: { persistSession: false },
  });

  const { data, error } = await supabase
    .from('products')
    .select('*')
    .order('is_featured', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    console.error('Erro ao carregar produtos:', error.message);
    return [];
  }

  return (data as Product[]) || [];
}

export default async function HomePage() {
  const products = await getProducts();

  return <StorefrontClient initialProducts={products} />;
}
