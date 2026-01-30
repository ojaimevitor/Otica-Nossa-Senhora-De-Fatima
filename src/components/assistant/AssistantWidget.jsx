/**
 * AssistantWidget.jsx - Assistente de suporte guiado
 * Sem diagnóstico médico, apenas orientações gerais
 * Agendamento de exames em Araripe-CE (15 em 15 dias)
 */
import React, { useState, useContext, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Calendar, HelpCircle, ChevronRight, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import { motion, AnimatePresence } from 'framer-motion';

// Opções de menu guiado
const menuOptions = [
  {
    id: 'schedule',
    icon: Calendar,
    label: 'Agendar Exame de Vista',
    description: 'Marque seu exame em Araripe-CE'
  },
  {
    id: 'help_choose',
    icon: HelpCircle,
    label: 'Ajuda para Escolher',
    description: 'Dicas para escolher seus óculos'
  },
  {
    id: 'order',
    icon: ChevronRight,
    label: 'Dúvidas sobre Pedidos',
    description: 'Acompanhe ou tire dúvidas'
  },
  {
    id: 'contact',
    icon: ChevronRight,
    label: 'Falar com Atendente',
    description: 'Horário: Seg-Sex 9h às 17h'
  }
];

// Respostas guiadas
const responses = {
  schedule: `Para agendar seu exame de vista, você pode:

• Ligar para (88) 9999-9999
• Acessar a página de Agendamento de Exames
• Visitar nossa loja em Araripe-CE

Os exames são realizados quinzenalmente (a cada 15 dias). Confira as datas disponíveis na página de agendamento.`,
  
  help_choose: `Algumas dicas para escolher seus óculos:

• Formato do rosto: Rostos redondos combinam com armações angulares, e vice-versa
• Estilo de vida: Para esportes, prefira armações resistentes e leves
• Proteção: Óculos de sol devem ter proteção UV400
• Conforto: A armação não deve apertar as têmporas

Para uma avaliação completa, recomendamos consultar um oftalmologista.`,
  
  order: `Para acompanhar seu pedido:

• Acesse "Meus Pedidos" no menu
• Use o código de rastreamento enviado por e-mail
• Prazo médio de entrega: 5-10 dias úteis

Dúvidas? Entre em contato: (88) 9999-9999`,
  
  contact: `Nossos canais de atendimento:

• Telefone: (88) 9999-9999
• Horário: Segunda a Sexta, 9h às 17h
• Endereço: Araripe-CE

Fora do horário, deixe sua mensagem que retornaremos assim que possível.`
};

export default function AssistantWidget() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState([
    {
      id: 1,
      type: 'assistant',
      content: 'Olá! Sou o assistente virtual da Ótica Fátima. Como posso ajudar você hoje?'
    }
  ]);
  const [showMenu, setShowMenu] = useState(true);
  const messagesEndRef = useRef(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleOptionClick = (option) => {
    // Adiciona mensagem do usuário
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'user',
      content: option.label
    }]);

    // Adiciona resposta do assistente
    setTimeout(() => {
      setMessages(prev => [...prev, {
        id: Date.now() + 1,
        type: 'assistant',
        content: responses[option.id]
      }]);
      setShowMenu(false);
    }, 500);
  };

  const handleBackToMenu = () => {
    setMessages(prev => [...prev, {
      id: Date.now(),
      type: 'assistant',
      content: 'Como mais posso ajudar?'
    }]);
    setShowMenu(true);
  };

  return (
    <>
      {/* Botão flutuante */}
      <motion.button
        initial={{ scale: 0 }}
        animate={{ scale: 1 }}
        className={cn(
          "fixed bottom-6 right-6 z-50 h-14 w-14 rounded-full shadow-lg flex items-center justify-center",
          theme === 'dark' ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-900 text-white',
          isOpen && 'hidden'
        )}
        onClick={() => setIsOpen(true)}
      >
        <MessageCircle className="h-6 w-6" />
      </motion.button>

      {/* Widget de chat */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            className={cn(
              "fixed bottom-6 right-6 z-50 w-[360px] max-w-[calc(100vw-2rem)] rounded-2xl shadow-2xl overflow-hidden flex flex-col",
              theme === 'dark' ? 'bg-zinc-900 border border-zinc-800' : 'bg-white border border-zinc-200'
            )}
            style={{ height: '500px', maxHeight: 'calc(100vh - 6rem)' }}
          >
            {/* Header */}
            <div className={cn(
              "flex items-center justify-between px-4 py-3 border-b",
              theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : 'bg-zinc-50 border-zinc-200'
            )}>
              <div className="flex items-center gap-3">
                <div className={cn(
                  "h-10 w-10 rounded-full flex items-center justify-center",
                  theme === 'dark' ? 'bg-amber-500' : 'bg-zinc-900'
                )}>
                  <MessageCircle className={cn(
                    "h-5 w-5",
                    theme === 'dark' ? 'text-zinc-900' : 'text-white'
                  )} />
                </div>
                <div>
                  <p className="font-semibold">Assistente Ótica Fátima</p>
                  <p className={cn(
                    "text-xs",
                    theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                  )}>
                    Online
                  </p>
                </div>
              </div>
              <Button variant="ghost" size="icon" onClick={() => setIsOpen(false)}>
                <X className="h-5 w-5" />
              </Button>
            </div>

            {/* Disclaimer */}
            <div className={cn(
              "px-4 py-2 flex items-start gap-2 text-xs",
              theme === 'dark' ? 'bg-amber-500/10 text-amber-400' : 'bg-amber-50 text-amber-700'
            )}>
              <AlertTriangle className="h-4 w-4 flex-shrink-0 mt-0.5" />
              <span>
                Este assistente não fornece diagnósticos médicos. Para avaliação de saúde ocular, consulte um oftalmologista.
              </span>
            </div>

            {/* Mensagens */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((msg) => (
                <div
                  key={msg.id}
                  className={cn(
                    "flex",
                    msg.type === 'user' ? 'justify-end' : 'justify-start'
                  )}
                >
                  <div className={cn(
                    "max-w-[85%] rounded-2xl px-4 py-3",
                    msg.type === 'user'
                      ? theme === 'dark' ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-900 text-white'
                      : theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'
                  )}>
                    <p className="text-sm whitespace-pre-line">{msg.content}</p>
                  </div>
                </div>
              ))}

              {/* Menu de opções */}
              {showMenu && (
                <div className="space-y-2 mt-4">
                  {menuOptions.map((option) => (
                    <button
                      key={option.id}
                      onClick={() => handleOptionClick(option)}
                      className={cn(
                        "w-full flex items-center gap-3 p-3 rounded-xl text-left transition-colors",
                        theme === 'dark'
                          ? 'bg-zinc-800 hover:bg-zinc-700'
                          : 'bg-zinc-50 hover:bg-zinc-100',
                        "border",
                        theme === 'dark' ? 'border-zinc-700' : 'border-zinc-200'
                      )}
                    >
                      <div className={cn(
                        "h-10 w-10 rounded-lg flex items-center justify-center",
                        theme === 'dark' ? 'bg-zinc-700' : 'bg-white'
                      )}>
                        <option.icon className={cn(
                          "h-5 w-5",
                          theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                        )} />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm">{option.label}</p>
                        <p className={cn(
                          "text-xs truncate",
                          theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                        )}>
                          {option.description}
                        </p>
                      </div>
                      <ChevronRight className={cn(
                        "h-4 w-4 flex-shrink-0",
                        theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
                      )} />
                    </button>
                  ))}
                </div>
              )}

              {/* Botão voltar ao menu */}
              {!showMenu && (
                <div className="flex justify-center pt-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleBackToMenu}
                    className={theme === 'dark' ? 'border-zinc-700' : ''}
                  >
                    Voltar ao menu
                  </Button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Footer info */}
            <div className={cn(
              "px-4 py-3 border-t text-center",
              theme === 'dark' ? 'border-zinc-800 bg-zinc-800/50' : 'border-zinc-200 bg-zinc-50'
            )}>
              <p className={cn(
                "text-xs",
                theme === 'dark' ? 'text-zinc-500' : 'text-zinc-400'
              )}>
                Atendimento humano: Seg-Sex 9h às 17h | (88) 9999-9999
              </p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}