import re

def restore_cadastrar_nucleo():
    with open('Interno_integra/app/routes/admin/CadastrarNucleo.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # 1. Restore vagas to schema
    content = content.replace(
        "numeroVaga: z.string().optional(),",
        "numeroVaga: z.string().optional(),\n  vagas: z.string().optional(),"
    )
    
    # 2. Restore vagas to defaultValues
    content = content.replace(
        'numeroVaga: "1",',
        'numeroVaga: "1",\n      vagas: "100",'
    )

    # 3. Restore vagas to mapping
    content = content.replace(
        'numeroVaga: String(nucleo.numero_vaga || nucleo.vaga_numero || "1"),',
        'numeroVaga: String(nucleo.numero_vaga || nucleo.vaga_numero || "1"),\n                vagas: String(nucleo.vagas || "100"),'
    )

    # 4. Restore append vagas
    content = content.replace(
        'if (data.numeroVaga) {\n        formData.append("numero_vaga", data.numeroVaga);\n      }',
        'if (data.numeroVaga) {\n        formData.append("numero_vaga", data.numeroVaga);\n      }\n      if (data.vagas) {\n        formData.append("vagas", data.vagas);\n      }'
    )

    # 5. Restore HTML for Capacidade de Alunos right after numeroVaga select
    html_to_insert = """
              {/* CAMPO DE CAPACIDADE DE ALUNOS DO NÚCLEO */}
              <div className="pt-2">
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Capacidade de Alunos
                </label>
                <input
                  type="text"
                  placeholder="Ex: 100"
                  {...register("vagas")}
                  className="w-full bg-slate-50 border border-slate-200 rounded-lg p-2.5 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <span className="text-[11px] text-slate-400 mt-1 block">
                  Quantos alunos no total esse núcleo comporta.
                </span>
              </div>
"""
    
    # We want to insert it right before the "Data de Encerramento" section
    target = '<label className="block text-xs font-semibold text-slate-700 mb-1">Data de Encerramento</label>'
    content = content.replace(target, html_to_insert + "\n              " + target)

    with open('Interno_integra/app/routes/admin/CadastrarNucleo.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("CadastrarNucleo restored successfully!")

restore_cadastrar_nucleo()
