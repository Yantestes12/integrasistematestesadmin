-- ==========================================
-- SCRIPT PARA CRIAR E POPULAR AS TABELAS DE LIMITES DE MODALIDADES 
-- PARA TODOS OS INSTITUTOS NO SUPABASE
-- ==========================================

-- ==========================================
-- 1. INSTITUTO: GASCTPNA
-- ==========================================
CREATE TABLE IF NOT EXISTS public."GASCTPNA_projeto_modalidade_limites" (
    id SERIAL PRIMARY KEY,
    projeto_id INT NOT NULL,
    modalidade_id INT NOT NULL,
    limite INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Limpando para não duplicar caso rode duas vezes
TRUNCATE TABLE public."GASCTPNA_projeto_modalidade_limites" RESTART IDENTITY;

INSERT INTO public."GASCTPNA_projeto_modalidade_limites" (projeto_id, modalidade_id, limite, created_by, created_at) VALUES 
(3, 5, 4, 81, '2026-06-26 14:35:56'),
(3, 6, 4, 81, '2026-06-26 14:35:56'),
(4, 5, 4, 81, '2026-06-26 14:36:20'),
(4, 7, 5, 81, '2026-06-26 14:36:20'),
(5, 8, 3, 85, '2026-07-22 12:04:57'),
(5, 5, 4, 85, '2026-07-22 12:04:57'),
(5, 7, 3, 85, '2026-07-22 12:04:57');


-- ==========================================
-- 2. INSTITUTO: IBRASE
-- ==========================================
CREATE TABLE IF NOT EXISTS public."IBRASE_projeto_modalidade_limites" (
    id SERIAL PRIMARY KEY,
    projeto_id INT NOT NULL,
    modalidade_id INT NOT NULL,
    limite INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Limpando para não duplicar caso rode duas vezes
TRUNCATE TABLE public."IBRASE_projeto_modalidade_limites" RESTART IDENTITY;

INSERT INTO public."IBRASE_projeto_modalidade_limites" (projeto_id, modalidade_id, limite, created_by, created_at) VALUES 
(2, 3, 9, 51, '2026-07-07 10:47:39'),
(2, 1, 9, 51, '2026-07-07 10:47:39'),
(2, 2, 4, 51, '2026-07-07 10:47:39'),
(1, 1, 7, 51, '2026-07-07 10:51:04'),
(1, 2, 7, 51, '2026-07-07 10:51:04'),
(3, 1, 7, 51, '2026-07-07 10:56:06'),
(3, 2, 3, 51, '2026-07-07 10:56:06'),
(5, 1, 4, 51, '2026-07-07 10:57:29'),
(5, 2, 5, 51, '2026-07-07 10:57:29'),
(6, 1, 5, 51, '2026-07-07 10:58:39'),
(6, 2, 4, 51, '2026-07-07 10:58:39'),
(4, 2, 6, 51, '2026-07-07 10:59:27');


-- ==========================================
-- 3. INSTITUTO: AUNI
-- ==========================================
CREATE TABLE IF NOT EXISTS public."AUNI_projeto_modalidade_limites" (
    id SERIAL PRIMARY KEY,
    projeto_id INT NOT NULL,
    modalidade_id INT NOT NULL,
    limite INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Limpando para não duplicar caso rode duas vezes
TRUNCATE TABLE public."AUNI_projeto_modalidade_limites" RESTART IDENTITY;

INSERT INTO public."AUNI_projeto_modalidade_limites" (projeto_id, modalidade_id, limite, created_by, created_at) VALUES 
(3, 5, 3, 81, '2026-06-26 14:59:16'),
(3, 6, 5, 81, '2026-06-26 14:59:16');


-- ==========================================
-- 4. INSTITUTO: IVEM
-- ==========================================
CREATE TABLE IF NOT EXISTS public."IVEM_projeto_modalidade_limites" (
    id SERIAL PRIMARY KEY,
    projeto_id INT NOT NULL,
    modalidade_id INT NOT NULL,
    limite INT DEFAULT 0,
    created_by INT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Limpando para não duplicar caso rode duas vezes
TRUNCATE TABLE public."IVEM_projeto_modalidade_limites" RESTART IDENTITY;

INSERT INTO public."IVEM_projeto_modalidade_limites" (projeto_id, modalidade_id, limite, created_by, created_at) VALUES 
(3, 5, 7, 81, '2026-06-26 14:55:16');
