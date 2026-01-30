/**
 * Support.jsx - Central de suporte/atendimento
 */
import React, { useContext } from 'react';
import { Link } from 'react-router-dom';
import { createPageUrl } from '@/utils';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import {
  Phone, Mail, MapPin, Clock, MessageCircle, Package, CreditCard,
  Truck, RotateCcw, HelpCircle, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import {
  Accordion, AccordionContent, AccordionItem, AccordionTrigger
} from '@/components/ui/accordion';
import AssistantWidget from '@/components/assistant/AssistantWidget';
import { motion } from 'framer-motion';

const faqItems = [
  {
    question: 'Como faço para comprar óculos de grau online?',
    answer: 'É muito simples! Escolha a armação desejada, selecione as lentes e tratamentos, envie sua receita médica e finalize a compra. Nossos especialistas vão verificar todos os dados antes da produção.'
  },
  {
    question: 'Qual o prazo de entrega?',
    answer: 'O prazo médio é de 5 a 10 dias úteis para óculos de sol e acessórios. Para óculos de grau, o prazo é de 10 a 15 dias úteis, pois inclui a produção das lentes personalizadas.'
  },
  {
    question: 'Posso trocar ou devolver meu produto?',
    answer: 'Sim! Você tem até 7 dias após o recebimento para solicitar troca ou devolução. O produto deve estar em perfeitas condições e com a embalagem original. A primeira troca é gratuita.'
  },
  {
    question: 'Os óculos têm garantia?',
    answer: 'Todos os nossos produtos têm garantia de 12 meses contra defeitos de fabricação. Essa garantia cobre problemas nas armações, lentes e acessórios.'
  },
  {
    question: 'Como funciona o desconto no PIX?',
    answer: 'Ao escolher o pagamento via PIX, você recebe automaticamente 5% de desconto sobre o valor total da compra. O desconto é aplicado no checkout.'
  },
  {
    question: 'Preciso ter receita para comprar óculos de grau?',
    answer: 'Sim, é necessário enviar uma receita médica válida (até 1 ano) para produção dos óculos de grau. Você pode enviar a receita durante o processo de compra ou depois, pelo e-mail.'
  },
  {
    question: 'Como agendar um exame de vista?',
    answer: 'Você pode agendar pelo nosso site na página de Agendamento de Exames, ou ligar para (88) 9999-9999. Os exames são realizados quinzenalmente em nossa loja em Araripe-CE.'
  },
  {
    question: 'O frete é grátis?',
    answer: 'Sim! Para compras acima de R$299, o frete é grátis para todo o Brasil. Abaixo desse valor, o frete é calculado pelo CEP de entrega.'
  }
];

const quickLinks = [
  { icon: Package, label: 'Meus Pedidos', href: 'Orders', description: 'Acompanhe suas compras' },
  { icon: Truck, label: 'Rastrear Entrega', href: 'Orders', description: 'Veja onde está seu pedido' },
  { icon: RotateCcw, label: 'Trocas e Devoluções', href: 'Support', description: 'Política de trocas' },
  { icon: CreditCard, label: 'Formas de Pagamento', href: 'Support', description: 'PIX, cartão, boleto' }
];

export default function Support() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';

  return (
    <div className={cn(
      "min-h-screen py-8 px-4",
      theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'
    )}>
      <div className="max-w-4xl mx-auto">
        <h1 className={cn(
          "text-2xl md:text-3xl font-bold mb-2",
          theme === 'dark' ? 'text-white' : 'text-zinc-900'
        )}>
          Central de Atendimento
        </h1>
        <p className={cn(
          "text-sm mb-8",
          theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
        )}>
          Como podemos ajudar você?
        </p>

        {/* Contatos rápidos */}
        <div className="grid md:grid-cols-3 gap-4 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className={cn(
              "p-5 rounded-xl text-center",
              theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
            )}
          >
            <div className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3",
              theme === 'dark' ? 'bg-amber-500/20' : 'bg-amber-100'
            )}>
              <Phone className={cn(
                "h-6 w-6",
                theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
              )} />
            </div>
            <h3 className="font-semibold mb-1">Telefone</h3>
            <p className={cn(
              "text-lg font-bold mb-1",
              theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
            )}>
              (88) 9999-9999
            </p>
            <p className={cn(
              "text-xs",
              theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
            )}>
              Seg-Sex 9h às 17h
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className={cn(
              "p-5 rounded-xl text-center",
              theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
            )}
          >
            <div className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3",
              theme === 'dark' ? 'bg-blue-500/20' : 'bg-blue-100'
            )}>
              <Mail className={cn(
                "h-6 w-6",
                theme === 'dark' ? 'text-blue-400' : 'text-blue-600'
              )} />
            </div>
            <h3 className="font-semibold mb-1">E-mail</h3>
            <p className={cn(
              "text-sm",
              theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
            )}>
              contato@oticafatima.com.br
            </p>
            <p className={cn(
              "text-xs",
              theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
            )}>
              Resposta em até 24h
            </p>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className={cn(
              "p-5 rounded-xl text-center",
              theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
            )}
          >
            <div className={cn(
              "h-12 w-12 rounded-full flex items-center justify-center mx-auto mb-3",
              theme === 'dark' ? 'bg-green-500/20' : 'bg-green-100'
            )}>
              <MapPin className={cn(
                "h-6 w-6",
                theme === 'dark' ? 'text-green-400' : 'text-green-600'
              )} />
            </div>
            <h3 className="font-semibold mb-1">Loja Física</h3>
            <p className={cn(
              "text-sm",
              theme === 'dark' ? 'text-zinc-300' : 'text-zinc-700'
            )}>
              Centro, Araripe-CE
            </p>
            <p className={cn(
              "text-xs",
              theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
            )}>
              Seg-Sáb 8h às 18h
            </p>
          </motion.div>
        </div>

        {/* Links rápidos */}
        <div className={cn(
          "rounded-xl p-6 mb-8",
          theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
        )}>
          <h2 className="font-semibold mb-4">Acesso Rápido</h2>
          <div className="grid md:grid-cols-2 gap-3">
            {quickLinks.map((link) => (
              <Link
                key={link.label}
                to={createPageUrl(link.href)}
                className={cn(
                  "flex items-center gap-3 p-3 rounded-lg transition-colors",
                  theme === 'dark'
                    ? 'hover:bg-zinc-800'
                    : 'hover:bg-zinc-50'
                )}
              >
                <div className={cn(
                  "h-10 w-10 rounded-lg flex items-center justify-center",
                  theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-100'
                )}>
                  <link.icon className={cn(
                    "h-5 w-5",
                    theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                  )} />
                </div>
                <div className="flex-1">
                  <p className="font-medium">{link.label}</p>
                  <p className={cn(
                    "text-xs",
                    theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                  )}>
                    {link.description}
                  </p>
                </div>
                <ChevronRight className={cn(
                  "h-4 w-4",
                  theme === 'dark' ? 'text-zinc-600' : 'text-zinc-400'
                )} />
              </Link>
            ))}
          </div>
        </div>

        {/* FAQ */}
        <div className={cn(
          "rounded-xl p-6",
          theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
        )}>
          <div className="flex items-center gap-2 mb-4">
            <HelpCircle className={cn(
              "h-5 w-5",
              theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
            )} />
            <h2 className="font-semibold">Perguntas Frequentes</h2>
          </div>

          <Accordion type="single" collapsible className="w-full">
            {faqItems.map((item, idx) => (
              <AccordionItem
                key={idx}
                value={`item-${idx}`}
                className={theme === 'dark' ? 'border-zinc-800' : ''}
              >
                <AccordionTrigger className="text-left">
                  {item.question}
                </AccordionTrigger>
                <AccordionContent className={cn(
                  "text-sm",
                  theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
                )}>
                  {item.answer}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* CTA Agendamento */}
        <div className={cn(
          "mt-8 p-6 rounded-xl text-center",
          theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-50'
        )}>
          <h3 className={cn(
            "text-lg font-semibold mb-2",
            theme === 'dark' ? 'text-amber-400' : 'text-amber-800'
          )}>
            Precisa de um exame de vista?
          </h3>
          <p className={cn(
            "text-sm mb-4",
            theme === 'dark' ? 'text-amber-400/70' : 'text-amber-700'
          )}>
            Agende seu exame em nossa loja em Araripe-CE
          </p>
          <Link to={createPageUrl('Exams')}>
            <Button className={theme === 'dark' ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400' : ''}>
              Agendar Exame
            </Button>
          </Link>
        </div>
      </div>

      <AssistantWidget />
    </div>
  );
}