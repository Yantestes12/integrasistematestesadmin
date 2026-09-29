import React, { useState, useEffect, useRef } from "react";
import { Sparkles, X, Send, Bot, User, Key, Check, Loader2, HelpCircle, ChevronRight, ShieldCheck } from "lucide-react";

interface AiAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentInstitute: string;
  nucleos: any[];
  espacosDesvinculados: any[];
}

const AI_FAQS = [
  {
    q: "Como transformar um Espaço Desvinculado em Núcleo?",
    a: "Clique no botão 'Espaços Desvinculados' no topo da página de Núcleos, escolha o espaço físico desejado e clique em 'Aprovar como Núcleo'. Você irá associar o espaço a uma Proposta/Projeto e escolher uma Vaga Oficial (Slot)."
  },
  {
    q: "O que é a Vaga Oficial (Slot) do Projeto?",
    a: "Cada projeto possui um plano de trabalho cadastrado com um número de vagas determinado (ex: Vaga 1 - Futebol, Vaga 2 - Ballet). Cada núcleo operacional ativo ocupa exatamente 1 vaga do projeto."
  },
  {
    q: "Como editar o nome de um núcleo?",
    a: "Basta passar o mouse sobre o nome do núcleo na tabela e clicar no ícone de lápis que aparece ao lado. Digite o novo nome e confirme no botão verde (ou pressione Enter)."
  },
  {
    q: "Como funciona o limite de alunos e cadastro de reserva?",
    a: "Cada núcleo tem sua capacidade base (ex: 100 vagas) + 10% de cadastro de reserva (10 vagas). Quando a capacidade máxima total é atingida, o núcleo é automaticamente bloqueado no portal de alunos com o aviso 'Vagas Esgotadas'."
  },
  {
    q: "Como desativar ou reativar um núcleo?",
    a: "Na coluna 'Ações' da tabela, clique no botão de energia (Power). Ao desativar, a vaga ocupada é liberada no projeto para outro núcleo e o registro fica guardado na aba 'Desativados'."
  }
];

export default function AiAssistantModal({
  isOpen,
  onClose,
  currentInstitute,
  nucleos,
  espacosDesvinculados,
}: AiAssistantModalProps) {
  const [messages, setMessages] = useState<Array<{ sender: "user" | "bot"; text: string }>>([
    {
      sender: "bot",
      text: `Olá! Sou o Assistente de I.A. da Plataforma Integra para o instituto **${currentInstitute}**. Como posso ajudar você hoje com seus núcleos, espaços físicos ou vagas?`
    }
  ]);
  const [inputVal, setInputVal] = useState("");
  const [isThinking, setIsThinking] = useState(false);
  const [showKeyConfig, setShowKeyConfig] = useState(false);
  const [apiKey, setApiKey] = useState("");
  const [keySaved, setKeySaved] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const saved = localStorage.getItem("auth_openai_key") || "";
    setApiKey(saved);
  }, []);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, isThinking]);

  if (!isOpen) return null;

  const handleSaveKey = () => {
    localStorage.setItem("auth_openai_key", apiKey.trim());
    setKeySaved(true);
    setTimeout(() => setKeySaved(false), 2000);
  };

  const handleSend = async (userQuestion?: string) => {
    const q = (userQuestion || inputVal).trim();
    if (!q) return;

    setMessages(prev => [...prev, { sender: "user", text: q }]);
    if (!userQuestion) setInputVal("");
    setIsThinking(true);

    const savedKey = localStorage.getItem("auth_openai_key") || apiKey.trim();

    // Se houver chave OpenAI configurada, faz a chamada real à API
    if (savedKey) {
      try {
        const response = await fetch("https://api.openai.com/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${savedKey}`
          },
          body: JSON.stringify({
            model: "gpt-4o-mini",
            messages: [
              {
                role: "system",
                content: `Você é o Assistente Especializado do Sistema Integra da Rede GASCTPNA / IBRASE / AUNI / IVEM.
Atualmente atendendo o instituto: ${currentInstitute}.
Estatísticas atuais:
- Núcleos cadastrados: ${nucleos.length} (ativos: ${nucleos.filter(n => n.ativo).length})
- Espaços desvinculados disponíveis: ${espacosDesvinculados.length}

Regras do Sistema:
1. Espaços são locais físicos (com endereço, responsável e dias). Podem estar 'Desvinculados' até virarem Núcleo.
2. Núcleos são as unidades ativas vinculadas a um Projeto/Edital e a uma Vaga (Slot).
3. Cada núcleo tem turmas, grade horária e alunos matriculados.
4. Responda em português simples, direto, cordial e com formatação markdown concisa.`
              },
              ...messages.map(m => ({
                role: m.sender === "user" ? ("user" as const) : ("assistant" as const),
                content: m.text
              })),
              { role: "user", content: q }
            ],
            temperature: 0.6,
          })
        });

        if (response.ok) {
          const data = await response.json();
          const reply = data.choices?.[0]?.message?.content || "Desculpe, não consegui obter uma resposta.";
          setMessages(prev => [...prev, { sender: "bot", text: reply }]);
          setIsThinking(false);
          return;
        }
      } catch (err) {
        console.warn("Erro ao consultar OpenAI:", err);
      }
    }

    // Fallback inteligente com respostas pré-programadas do sistema
    setTimeout(() => {
      let reply = "";
      const lower = q.toLowerCase();

      if (lower.includes("desvinculad") || lower.includes("aprovar espaço") || lower.includes("virar núcleo")) {
        reply = `Para aprovar um espaço e transformá-lo em núcleo:
1. No topo da tela de Núcleos, clique no botão **Espaços Desvinculados (${espacosDesvinculados.length})**.
2. Localize o espaço físico desejado.
3. Clique em **Aprovar como Núcleo**.
4. Selecione a proposta/projeto e a vaga (slot) para ativar o núcleo.`;
      } else if (lower.includes("vaga") || lower.includes("slot")) {
        reply = `As **Vagas (Slots)** são os postos oficiais definidos no plano de trabalho da proposta/projeto.
Cada núcleo ativo deve estar alocado a uma vaga específica (ex: Vaga Nº 1 - Futebol). Duas unidades ativas não podem ocupar o mesmo slot no mesmo projeto.`;
      } else if (lower.includes("nome") || lower.includes("lápis") || lower.includes("renomear")) {
        reply = `Para renomear um núcleo:
Passe o mouse sobre o nome do núcleo na tabela e clique no **ícone de lápis** ao lado do nome. Digite o novo nome e clique no botão verde de salvar!`;
      } else if (lower.includes("erro") || lower.includes("matricula") || lower.includes("put")) {
        reply = `Se houver algum erro ao atualizar núcleos no instituto **${currentInstitute}**, certifique-se de que a trigger de transferência de alunos no banco de dados esteja apontando para a tabela singular **${currentInstitute}_matricula**.`;
      } else if (lower.includes("reserva") || lower.includes("esgotad") || lower.includes("limite")) {
        reply = `O sistema calcula automaticamente o limite de vagas:
- Vagas Base (ex: 100 vagas)
- Mais 10% de Cadastro de Reserva (10 vagas)
- Capacidade total: 110 vagas. Ao atingir este limite, a inscrição no núcleo é bloqueada com 'Vagas Esgotadas'.`;
      } else {
        reply = `Entendi sua dúvida sobre **"${q}"**! 
Você pode realizar essa operação diretamente pelo painel administrativo de Núcleos e Espaços.
Caso queira respostas mais profundas geradas diretamente pelo ChatGPT, clique no ícone de chave 🔑 no topo deste assistente e configure sua chave da OpenAI.`;
      }

      setMessages(prev => [...prev, { sender: "bot", text: reply }]);
      setIsThinking(false);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 font-sans">
      <div className="bg-white dark:bg-slate-900 rounded-2xl border border-slate-200 dark:border-slate-800 shadow-2xl max-w-xl w-full max-h-[85vh] flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-150">
        
        {/* Cabeçalho */}
        <div className="p-4 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-linear-to-r from-indigo-600 to-purple-600 text-white">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center">
              <Sparkles size={18} className="text-amber-300" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-sm sm:text-base leading-none">
                  Assistente I.A. Integra
                </h3>
                <span className="text-[10px] uppercase font-black bg-white/20 px-1.5 py-0.5 rounded text-white tracking-wider">
                  Beta
                </span>
              </div>
              <p className="text-[11px] text-white/80 mt-0.5">
                Dúvidas sobre Núcleos, Vagas e Espaços • {currentInstitute}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={() => setShowKeyConfig(!showKeyConfig)}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
              title="Configurar Chave OpenAI"
            >
              <Key size={16} />
            </button>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-white/80 hover:text-white hover:bg-white/10 transition-colors"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {/* Painel expansível de Configuração da Chave OpenAI */}
        {showKeyConfig && (
          <div className="p-3.5 bg-slate-50 dark:bg-slate-850 border-b border-slate-200 dark:border-slate-800 text-xs space-y-2 animate-in slide-in-from-top-2 duration-150">
            <div className="flex items-center justify-between">
              <span className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                <Key size={13} className="text-indigo-500" /> Chave OpenAI (Opcional)
              </span>
              <span className="text-[10px] text-slate-400">Salva no navegador</span>
            </div>
            <div className="flex gap-2">
              <input
                type="password"
                placeholder="sk-proj-..."
                value={apiKey}
                onChange={(e) => setApiKey(e.target.value)}
                className="flex-1 px-3 py-1.5 rounded-lg border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-800 text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
              />
              <button
                onClick={handleSaveKey}
                className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-700 text-white font-bold rounded-lg transition-colors flex items-center gap-1 shrink-0"
              >
                {keySaved ? <Check size={14} /> : "Salvar"}
              </button>
            </div>
          </div>
        )}

        {/* Área de Mensagens */}
        <div className="p-4 overflow-y-auto space-y-3.5 flex-1 max-h-[50vh] text-xs">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-2.5 ${m.sender === "user" ? "justify-end" : "justify-start"}`}
            >
              {m.sender === "bot" && (
                <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0 mt-0.5">
                  <Bot size={15} />
                </div>
              )}
              <div
                className={`p-3 rounded-2xl max-w-[85%] leading-relaxed whitespace-pre-line ${
                  m.sender === "user"
                    ? "bg-indigo-600 text-white rounded-tr-xs"
                    : "bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 rounded-tl-xs border border-slate-200/60 dark:border-slate-700/60"
                }`}
              >
                {m.text}
              </div>
              {m.sender === "user" && (
                <div className="w-7 h-7 rounded-lg bg-slate-200 dark:bg-slate-700 text-slate-600 dark:text-slate-300 flex items-center justify-center shrink-0 mt-0.5">
                  <User size={15} />
                </div>
              )}
            </div>
          ))}

          {isThinking && (
            <div className="flex gap-2.5 items-center text-slate-400">
              <div className="w-7 h-7 rounded-lg bg-indigo-100 dark:bg-indigo-950/80 text-indigo-600 dark:text-indigo-300 flex items-center justify-center shrink-0">
                <Bot size={15} />
              </div>
              <div className="flex items-center gap-1.5 bg-slate-100 dark:bg-slate-800 px-3 py-2 rounded-xl border border-slate-200/60 dark:border-slate-700/60">
                <Loader2 size={13} className="animate-spin text-indigo-500" />
                <span className="text-[11px] font-medium">Consultando informações...</span>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Sugestões Rápidas de Perguntas */}
        <div className="px-4 py-2 border-t border-slate-100 dark:border-slate-800 bg-slate-50/70 dark:bg-slate-850/50 flex gap-1.5 overflow-x-auto text-[11px] no-scrollbar">
          {AI_FAQS.map((faq, i) => (
            <button
              key={i}
              onClick={() => handleSend(faq.q)}
              className="px-2.5 py-1 rounded-lg bg-white dark:bg-slate-800 hover:bg-indigo-50 dark:hover:bg-slate-700 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-300 whitespace-nowrap transition-colors shrink-0"
            >
              {faq.q}
            </button>
          ))}
        </div>

        {/* Campo de Input */}
        <div className="p-3 border-t border-slate-100 dark:border-slate-800 flex gap-2 bg-white dark:bg-slate-900">
          <input
            type="text"
            placeholder="Digite sua dúvida sobre núcleos ou espaços..."
            value={inputVal}
            onChange={(e) => setInputVal(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") handleSend();
            }}
            className="flex-1 px-3.5 py-2 text-xs rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
          <button
            onClick={() => handleSend()}
            disabled={!inputVal.trim() || isThinking}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white rounded-xl text-xs font-bold transition-colors flex items-center gap-1.5 shrink-0"
          >
            <Send size={13} />
            <span className="hidden sm:inline">Enviar</span>
          </button>
        </div>

      </div>
    </div>
  );
}
