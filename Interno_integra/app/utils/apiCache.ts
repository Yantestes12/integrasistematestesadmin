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

const MEMORY_CACHE_TTL = 10 * 60 * 1000; // 10 minutos em memória viva

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
 * Remove fotos base64 gigantes e campos pesados de matrículas para não estourar os 5MB do sessionStorage
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
      // Se for matrícula, compacta campos essenciais para caber no sessionStorage com facilidade (<1.2MB)
      if (item.aluno_nome !== undefined || item.aluno_cpf !== undefined) {
        return {
          id: item.id,
          aluno_nome: item.aluno_nome || item.nome || '',
          aluno_cpf: item.aluno_cpf || item.cpf || '',
          nucleo_id: item.nucleo_id || item.id_nucleo || item.espaco_id || '',
          nucleo_nome: item.nucleo_nome || '',
          projeto_id: item.projeto_id || item.id_projeto || '',
          cidade_id: item.cidade_id || '',
          cidade: item.cidade || item.cidade_nome || item.aluno_cidade || item.municipio || '',
          bairro_id: item.bairro_id || '',
          bairro: item.bairro || '',
          modalidade_id: item.modalidade_id || '',
          turma: item.turma || '',
          turno: item.turno || item.turno_label || '',
          sexo: item.sexo || '',
          idade: item.idade || '',
          tamanho_calcado: item.tamanho_calcado || '',
          tamanho_camisa: item.tamanho_camisa || '',
          tamanho_calca: item.tamanho_calca || '',
          status: item.status || 'Aprovada',
          created_at: item.created_at || '',
          telefone_conta: item.telefone_conta || item.whatsapp || '',
          origem_cadastro: item.origem_cadastro || '',
          resp_nome: item.resp_nome || '',
          resp_cpf: item.resp_cpf || '',
          resp_whatsapp: item.resp_whatsapp || '',
        };
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
  // Sempre armazena na memória viva primeiro (0ms garantido)
  memoryCache.set(key, { data, timestamp: Date.now() });

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
      // Tenta salvar novamente com dados sanitizados
      const sanitized = sanitizeForStorage(data);
      sessionStorage.setItem(key, JSON.stringify(sanitized));
    } catch (retryErr) {
      // Se ainda assim não couber no sessionStorage, fica garantido em memoryCache
      console.warn(`[safeSetSession] Mantido apenas em memória viva para ${key}.`);
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
 * Fetch com desduplicação automática e timeout de segurança (30s)
 * Se vários componentes requisitarem o mesmo endpoint ao mesmo tempo,
 * apenas 1 requisição HTTP real vai para o servidor e todos recebem a mesma resposta!
 */
export const fetchWithDedupe = async (url: string, timeoutMs: number = 30000): Promise<any> => {
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
        console.warn(`[fetchWithDedupe] Requisição abortada por timeout (${timeoutMs}ms): ${url}`);
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

/**
 * Invalida caches em memória viva e no sessionStorage para entidades específicas (ex: 'espacos', 'nucleos').
 * Garante que alterações em Espaços e Núcleos reflitam instantaneamente sem dados fantasmas.
 */
export const clearEntityCache = (entities: string[] = ['espacos', 'nucleos']): void => {
  if (typeof window === 'undefined') return;
  try {
    // 1. Limpa memória viva
    memoryCache.forEach((_, key) => {
      if (entities.some(e => key.toLowerCase().includes(e.toLowerCase()))) {
        memoryCache.delete(key);
      }
    });

    // 2. Limpa sessionStorage
    const toRemove: string[] = [];
    for (let i = 0; i < sessionStorage.length; i++) {
      const key = sessionStorage.key(i);
      if (key && entities.some(e => key.toLowerCase().includes(e.toLowerCase()))) {
        toRemove.push(key);
      }
    }
    toRemove.forEach(k => sessionStorage.removeItem(k));
  } catch (e) {
    console.warn("[clearEntityCache] Erro ao limpar caches:", e);
  }
};
