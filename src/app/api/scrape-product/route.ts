import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

function decodeHtmlEntities(str: string): string {
  return str
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .trim();
}

function extractMetaTag(html: string, property: string): string | null {
  const patterns = [
    new RegExp(
      `<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']+)["']`,
      'i'
    ),
    new RegExp(
      `<meta[^>]+content=["']([^"']+)["'][^>]+(?:property|name)=["']${property}["']`,
      'i'
    ),
  ];

  for (const regex of patterns) {
    const match = html.match(regex);
    if (match && match[1]) {
      return decodeHtmlEntities(match[1]);
    }
  }
  return null;
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const rawUrl = typeof body?.url === 'string' ? body.url.trim() : '';

    if (!rawUrl || !rawUrl.startsWith('http')) {
      return NextResponse.json(
        { error: 'Cole uma URL válida começando com http:// ou https://' },
        { status: 400 }
      );
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

    if (!supabaseUrl || !serviceRoleKey) {
      return NextResponse.json(
        { error: 'Variáveis de ambiente do Supabase não configuradas no servidor.' },
        { status: 500 }
      );
    }

    // 1. Buscar HTML seguindo redirecionamentos (ex: vm.tiktok.com -> tiktok.com)
    const response = await fetch(rawUrl, {
      redirect: 'follow',
      headers: {
        'User-Agent':
          'Mozilla/5.0 (iPhone; CPU iPhone OS 17_4 like Mac OS X) AppleWebKit/605.1.15 (KHTML, like Gecko) Version/17.4 Mobile/15E148 Safari/604.1',
        Accept:
          'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
        'Accept-Language': 'pt-BR,pt;q=0.9,en-US;q=0.8,en;q=0.7',
      },
    });

    const html = await response.text();
    const resolvedUrl = response.url || rawUrl;

    // 2. Extrair título e imagem Open Graph
    let title =
      extractMetaTag(html, 'og:title') ||
      extractMetaTag(html, 'twitter:title') ||
      null;

    if (!title) {
      const titleTagMatch = html.match(/<title[^>]*>([^<]+)<\/title>/i);
      if (titleTagMatch?.[1]) {
        title = decodeHtmlEntities(titleTagMatch[1]);
      }
    }

    // Limpar sufixos padrão do TikTok no título
    if (title) {
      title = title
        .replace(/\s*\|\s*TikTok.*$/i, '')
        .replace(/\s*-\s*TikTok Shop.*$/i, '')
        .trim();
      if (title.toLowerCase() === 'tiktok' || title.toLowerCase() === 'tiktok - make your day') {
        title = null;
      }
    }

    const ogImage =
      extractMetaTag(html, 'og:image') ||
      extractMetaTag(html, 'twitter:image') ||
      null;

    let storedImageUrl: string | null = null;

    // 3. Baixar imagem no servidor e salvar no Supabase Storage
    if (ogImage && ogImage.startsWith('http')) {
      try {
        const imgRes = await fetch(ogImage, {
          headers: {
            'User-Agent':
              'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 Chrome/124.0.0.0 Safari/537.36',
            Referer: 'https://www.tiktok.com/',
          },
        });

        if (imgRes.ok) {
          const contentType = imgRes.headers.get('content-type') || 'image/jpeg';
          const ext = contentType.includes('png')
            ? 'png'
            : contentType.includes('webp')
            ? 'webp'
            : 'jpg';

          const arrayBuffer = await imgRes.arrayBuffer();
          const buffer = Buffer.from(arrayBuffer);

          // Evitar salvar placeholders minúsculos (< 2KB)
          if (buffer.byteLength > 2048) {
            const supabaseAdmin = createClient(supabaseUrl, serviceRoleKey, {
              auth: { persistSession: false },
            });

            const fileName = `tiktok-${Date.now()}-${Math.random()
              .toString(36)
              .slice(2, 8)}.${ext}`;

            const { error: uploadError } = await supabaseAdmin.storage
              .from('product-images')
              .upload(fileName, buffer, {
                contentType,
                upsert: false,
              });

            if (!uploadError) {
              const { data: publicUrlData } = supabaseAdmin.storage
                .from('product-images')
                .getPublicUrl(fileName);
              storedImageUrl = publicUrlData.publicUrl;
            }
          }
        }
      } catch (imgErr) {
        console.warn('Falha ao baixar og:image do TikTok:', imgErr);
      }
    }

    return NextResponse.json({
      title,
      imageUrl: storedImageUrl,
      resolvedUrl,
      partial: !storedImageUrl,
      message: storedImageUrl
        ? 'Dados e foto importados com sucesso!'
        : 'Link lido! Caso a foto tenha sido bloqueada pelo TikTok, cole um print com Ctrl+V na área de imagem.',
    });
  } catch (error) {
    console.error('Erro na rota scrape-product:', error);
    return NextResponse.json(
      {
        partial: true,
        title: null,
        imageUrl: null,
        message:
          'O TikTok bloqueou a leitura automática deste link. Preencha os dados e cole a foto com Ctrl+V.',
      },
      { status: 200 }
    );
  }
}
