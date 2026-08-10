import re

def update_cadastrar_nucleo():
    with open('Interno_integra/app/routes/admin/CadastrarNucleo.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Remove vagas from schema
    content = re.sub(r'\s*vagas:\s*z\.string\(\)\.optional\(\),', '', content)
    
    # 2. Remove vagas from defaultValues
    content = re.sub(r'\s*vagas:\s*"100",', '', content)

    # 3. Remove vagas from mapping
    content = re.sub(r'\s*vagas:\s*String\(nucleo\.vagas\s*\|\|\s*"100"\),', '', content)

    # 4. Remove append vagas
    append_regex = r'\s*if\s*\(data\.vagas\)\s*\{\s*formData\.append\("vagas",\s*data\.vagas\);\s*\}'
    content = re.sub(append_regex, '', content)

    # 5. Change dropdown logic to read limite_nucleos
    content = content.replace("const totalSlots = proj?.vagas_por_nucleo ? Number(proj.vagas_por_nucleo) : 20;", "const totalSlots = proj?.limite_nucleos ? Number(proj.limite_nucleos) : 20;")

    # 6. Remove HTML for Capacidade de Alunos
    html_regex = r'\s*\{\/\*\s*CAMPO DE CAPACIDADE DE ALUNOS DO NÚCLEO\s*\*\/\}\s*<div className="pt-2">\s*<label className="block text-xs font-semibold text-slate-700 mb-1">\s*Capacidade de Alunos\s*<\/label>\s*<input[^>]*\{\.\.\.register\("vagas"\)\}[^>]*\/>\s*<span className="text-\[11px\] text-slate-400 mt-1 block">\s*Quantos alunos no total esse núcleo comporta\.\s*<\/span>\s*<\/div>'
    
    content = re.sub(html_regex, '', content, flags=re.DOTALL)

    with open('Interno_integra/app/routes/admin/CadastrarNucleo.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("CadastrarNucleo updated successfully!")

update_cadastrar_nucleo()
