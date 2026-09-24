/**
 * apiCache.ts
 * Utilitário centralizado para:
 * 1. Desduplicação de requisições de rede em andamento (in-flight request pooling)
 * 2. Prevenção de QuotaExceededError no sessionStorage com sanitização de fotos base64
 * 3. Cache em memória ultra-rápido (0ms) compartilhado entre componentes
 */

// Pool de promessas em andamento para evitar requisições HTTP duplicadas
const inFlightRequests = new Map<string, Promise<any>>();

// Cache em memória para acesso síncrono ultra-rápido durante a sessão
const memoryCache = new Map<string, { data: any; timestamp: number }>();

const MEMORY_CACHE_TTL = 30 * 1000; // 30 segundos em memória viva

/**
 * Achata respostas do N8N / Supabase para array simples
 */
export const flattenResponse = (rawData: any): any[] => {
  if (!rawData) return [];
  let list: any[] = [];
  if (Array.isArray(rawData)) {
    list = rawData;
  } else if (typeof rawData === 'object') {
    if (Array.isArray(rawData.data)) list = rawData.data;
    else if (Array.isArray(rawData.items)) list = rawData.items;
    else if (Array.isArray(rawData.value)) list = rawData.value;
    else if (rawData.json) list = Array.isArray(rawData.json) ? rawData.json : [rawData.json];
    else list = [rawData];
  }
  let flat: any[] = [];
  list.forEach((entry: any) => {
    if (!entry) return;
    if (entry.json) {
      Array.isArray(entry.json) ? flat.push(...entry.json) : flat.push(entry.json);
    } else if (Array.isArray(entry)) {
      flat.push(...entry);
    } else {
      flat.push(entry);
    }
  });
  return flat.filter(item => item !== null && item !== undefined);
};

/**
 * Remove fotos base64 gigantes (que podem ter 1MB cada) para não estourar os 5MB do sessionStorage
 */
export const sanitizeForStorage = (data: any): any => {
  if (!data) return data;
  if (Array.isArray(data)) {
    return data.map(item => {
      if (!item || typeof item !== 'object') return item;
      // Se for espaço com foto_url base64 gigante
      if (item.foto_url && typeof item.foto_url === 'string' && item.foto_url.length > 500) {
        const copy = { ...item };
        delete copy.foto_url;
        return copy;
      }
      return item;
    });
  }
  return data;
};

/**
 * Gravação blindada no sessionStorage que nunca quebra a aplicação com QuotaExceededError
 */
export const safeSetSession = (key: string, data: any): void => {
  if (typeof window === 'undefined') return;
  try {
    const sanitized = sanitizeForStorage(data);
    const jsonStr = JSON.stringify(sanitized);
    sessionStorage.setItem(key, jsonStr);
  } catch (err: any) {
    // Se estourar a cota (QuotaExceededError), limpa chaves antigas e tenta de novo
    console.warn(`[safeSetSession] Alerta de cota ao salvar ${key}. Limpando chaves antigas...`);
    try {
      // Remove caches grandes anteriores de matrículas ou espaços crus
      Object.keys(sessionStorage).forEach(k => {
        if (k.startsWith('cache_raw_matriculas_') || k.startsWith('cache_raw_espacos_') || k.startsWith('cache_matriculas_v2_')) {
          sessionStorage.removeItem(k);
        }
      });
      // Tenta salvar novamente
      const sanitized = sanitizeForStorage(data);
      sessionStorage.setItem(key, JSON.stringify(sanitized));
    } catch (retryErr) {
      // Se ainda assim não couber, falha silenciosamente sem quebrar a execução
      console.warn(`[safeSetSession] Não foi possível persistir ${key} no sessionStorage. Mantendo apenas em memória.`);
    }
  }
};

/**
 * Leitura segura do sessionStorage com fallback para memória
 */
export const safeGetSession = <T = any>(key: string): T | null => {
  if (typeof window === 'undefined') return null;
  // 1. Tenta memória viva
  const mem = memoryCache.get(key);
  if (mem && (Date.now() - mem.timestamp < MEMORY_CACHE_TTL)) {
    return mem.data as T;
  }

  // 2. Tenta sessionStorage
  try {
    const raw = sessionStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    memoryCache.set(key, { data: parsed, timestamp: Date.now() });
    return parsed as T;
  } catch (e) {
    return null;
  }
};

/**
 * Fetch com desduplicação automática e timeout de segurança (12s)
 * Se 5 componentes requisitarem o mesmo endpoint ao mesmo tempo,
 * apenas 1 requisição HTTP real vai para o servidor e os 5 recebem a mesma resposta!
 */
export const fetchWithDedupe = async (url: string, timeoutMs: number = 12000): Promise<any> => {
  // Verifica se já existe uma requisição em andamento para esta URL exata
  if (inFlightRequests.has(url)) {
    return inFlightRequests.get(url);
  }

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  const requestPromise = (async () => {
    try {
      const res = await fetch(url, { 
        cache: 'no-store',
        signal: controller.signal 
      });
      clearTimeout(timer);

      if (!res.ok) {
        throw new Error(`HTTP Error ${res.status}: ${res.statusText}`);
      }

      const text = await res.text();
      let data: any = null;
      try {
        data = JSON.parse(text);
      } catch (parseErr) {
        console.warn(`[fetchWithDedupe] Erro de parsing JSON em ${url}:`, parseErr);
        data = [];
      }

      const flattened = flattenResponse(data);
      return flattened;
    } catch (err: any) {
      clearTimeout(timer);
      if (err.name === 'AbortError') {
        console.warn(`[fetchWithDedupe] Requisição abortada por timeout (12s): ${url}`);
      } else {
        console.warn(`[fetchWithDedupe] Falha na requisição: ${url}`, err);
      }
      return [];
    } finally {
      // Remove do pool de requisições ativas assim que concluir
      inFlightRequests.delete(url);
    }
  })();

  inFlightRequests.set(url, requestPromise);
  return requestPromise;
};
