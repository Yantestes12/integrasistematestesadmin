import re

def clean_cadastrar_nucleo():
    with open('Interno_integra/app/routes/admin/CadastrarNucleo.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove schema additions
    content = re.sub(r'numeroVaga:\s*z\.string\(\)\.optional\(\),\s*', '', content)
    content = re.sub(r'vagas:\s*z\.string\(\)\.optional\(\),\s*', '', content)
    
    # 2. Remove defaultValues
    content = re.sub(r'numeroVaga:\s*"1",\s*', '', content)
    content = re.sub(r'vagas:\s*"100",\s*', '', content)

    # 3. Remove vagasOcupadasNoProjeto logic
    ocupadas_regex = r'// Vagas ocupadas do projeto selecionado\s*const vagasOcupadasNoProjeto = useMemo\(\(\) => \{.*?\},\s*\[projetoIdWatch,\s*nucleosExistentes\]\);\s*'
    content = re.sub(ocupadas_regex, '', content, flags=re.DOTALL)

    # 4. Remove mapping in data prep
    content = re.sub(r'numeroVaga:\s*String\(nucleo\.numero_vaga \|\| nucleo\.vaga_numero \|\| "1"\),\s*', '', content)
    content = re.sub(r'vagas:\s*String\(nucleo\.vagas \|\| "100"\),\s*', '', content)

    # 5. Remove N8N form data appending
    append_regex = r'// Passa os campos específicos explícitos para o N8N\s*if\s*\(data\.numeroVaga\)\s*\{\s*formData\.append\("numero_vaga",\s*data\.numeroVaga\);\s*\}\s*if\s*\(data\.vagas\)\s*\{\s*formData\.append\("vagas",\s*data\.vagas\);\s*\}\s*'
    content = re.sub(append_regex, '', content, flags=re.DOTALL)
    
    append_regex2 = r'// Passa o campo numero_vaga explícito para salvar na coluna do Supabase\s*if\s*\(data\.numeroVaga\)\s*\{\s*formData\.append\("numero_vaga",\s*data\.numeroVaga\);\s*\}\s*'
    content = re.sub(append_regex2, '', content, flags=re.DOTALL)

    # 6. Remove the UI inputs
    ui_vagas_regex = r'\{/\* CAMPO NUMERO DA VAGA ALOCADA NO PROJETO \*/\}.*?\{/\* CARD DE INFORMAÇÕES AUTOMÁTICAS HERDADAS DO ESPAÇO \*/\}'
    content = re.sub(ui_vagas_regex, '{/* CARD DE INFORMAÇÕES AUTOMÁTICAS HERDADAS DO ESPAÇO */}', content, flags=re.DOTALL)

    with open('Interno_integra/app/routes/admin/CadastrarNucleo.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("Cleaned CadastrarNucleo!")

clean_cadastrar_nucleo()
