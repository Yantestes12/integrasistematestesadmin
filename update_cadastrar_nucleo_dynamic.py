import re

def update_cadastrar_nucleo():
    with open('Interno_integra/app/routes/admin/CadastrarNucleo.tsx', 'r', encoding='utf-8') as f:
        content = f.read()

    # Replace the totalSlots logic
    old_logic = "const totalSlots = proj?.limite_nucleos ? Number(proj.limite_nucleos) : 20;"
    new_logic = """let totalSlots = 20;
                if (proj) {
                  const limStr = proj.limites_modalidades || proj.limitesModalidades || proj.limites_modalidade;
                  if (limStr && limStr !== '[]') {
                    try {
                      const limArr = typeof limStr === 'string' ? JSON.parse(limStr) : limStr;
                      if (Array.isArray(limArr) && limArr.length > 0) {
                        totalSlots = limArr.reduce((acc, curr) => acc + (Number(curr.limite) || 0), 0);
                      }
                    } catch (e) { console.warn("Erro ao ler limites_modalidades:", e); }
                  }
                }"""
                
    content = content.replace(old_logic, new_logic)

    with open('Interno_integra/app/routes/admin/CadastrarNucleo.tsx', 'w', encoding='utf-8') as f:
        f.write(content)
    print("CadastrarNucleo dynamic sum updated successfully!")

update_cadastrar_nucleo()
