const fs = require('fs');

// 1. GERAR SQL PARA ADICIONAR COLUNAS NAS TABELAS DE NÚCLEOS
const sqlContent = `-- ==============================================================================
-- GARANTIR COLUNAS DE GRADE HORÁRIA E TURNOS NAS TABELAS DE NÚCLEOS (4 INSTITUTOS)
-- ==============================================================================
-- Adiciona as colunas grade_horaria e turnos_calculados em:
-- GASCTPNA_nucleos, IBRASE_nucleos, AUNI_nucleos, IVEM_nucleos

DO $$
DECLARE
  inst TEXT;
  institutos TEXT[] := ARRAY['GASCTPNA', 'IBRASE', 'AUNI', 'IVEM'];
  tbl TEXT;
BEGIN
  FOREACH inst IN ARRAY institutos LOOP
    tbl := inst || '_nucleos';

    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS grade_horaria TEXT;', tbl);
    EXECUTE format('ALTER TABLE public.%I ADD COLUMN IF NOT EXISTS turnos_calculados TEXT;', tbl);
  END LOOP;
END $$;

-- Recarregar cache de esquema do Supabase / PostgREST
NOTIFY pgrst, 'reload schema';
`;

fs.writeFileSync('13_garantir_grade_horaria_nucleos.sql', sqlContent);
console.log('SQL 13 gerado com sucesso!');

// 2. GERAR N8N_NUCLEOS_PUT_COM_GRADE.json
const rawNucleosPut = JSON.parse(fs.readFileSync('N8N_NUCLEOS_PUT.json', 'utf8'));

for (let node of rawNucleosPut.nodes) {
  if (node.name && node.name.startsWith('SB ') && node.name.endsWith(' PUT')) {
    if (node.parameters && node.parameters.fieldsUi && node.parameters.fieldsUi.fieldValues) {
      const fields = node.parameters.fieldsUi.fieldValues;
      
      // Adicionar grade_horaria se não existir
      if (!fields.some(f => f.fieldId === 'grade_horaria')) {
        fields.push({ fieldId: 'grade_horaria', fieldValue: '={{ $json.body.grade_horaria }}' });
      }
      
      // Adicionar turnos_calculados se não existir
      if (!fields.some(f => f.fieldId === 'turnos_calculados')) {
        fields.push({ fieldId: 'turnos_calculados', fieldValue: '={{ $json.body.turnos_calculados }}' });
      }
    }
  }
}

fs.writeFileSync('N8N_NUCLEOS_PUT_COM_GRADE.json', JSON.stringify(rawNucleosPut, null, 2));
console.log('N8N_NUCLEOS_PUT_COM_GRADE.json gerado com sucesso!');
