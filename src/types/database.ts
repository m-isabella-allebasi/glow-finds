export interface Product {
  id: string;
  title: string;
  price: string;
  category: string;
  tiktok_url: string;
  image_url: string;
  badge_tag: string | null;
  curator_note: string | null;
  in_stock: boolean;
  is_featured: boolean;
  created_at: string;
}

export interface StockAlert {
  id: string;
  product_id: string;
  customer_name: string | null;
  whatsapp: string;
  notified: boolean;
  created_at: string;
  products?: Pick<Product, 'id' | 'title' | 'price' | 'image_url' | 'tiktok_url' | 'in_stock'>;
}
