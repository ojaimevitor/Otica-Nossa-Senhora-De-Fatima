/**
 * HowItWorks.jsx - Seção de passo a passo
 * Como ter seu óculos completo
 */
import React, { useContext } from 'react';
import { Glasses, Layers, FileText, CreditCard } from 'lucide-react';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import { motion } from 'framer-motion';

const steps = [
  {
    id: 1,
    icon: Glasses,
    title: '01 - Sua Armação',
    description: 'Escolha sua armação de acordo com seu gosto.',
  },
  {
    id: 2,
    icon: Layers,
    title: '02 - Suas Lentes',
    description: 'Selecione a lente, a espessura e o tratamento.',
  },
  {
    id: 3,
    icon: FileText,
    title: '03 - Receita',
    description: 'Prepare e envie a receita médica.',
  },
  {
    id: 4,
    icon: CreditCard,
    title: '04 - Finalize',
    description: 'Adicione seu cupom e finalize a compra.',
  },
];

export default function HowItWorks() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';

  return (
    <section className={cn(
      "py-12 px-4 md:px-6",
      theme === 'dark' ? 'bg-zinc-800/30' : 'bg-zinc-50'
    )}>
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-10">
          <h2 className={cn(
            "text-2xl md:text-3xl font-bold mb-3",
            theme === 'dark' ? 'text-white' : 'text-zinc-900'
          )}>
            Ter seu óculos completo nunca foi tão fácil
          </h2>
          <p className={cn(
            "text-sm md:text-base",
            theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
          )}>
            Siga os passos abaixo e receba seu óculos em casa
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {steps.map((step, idx) => (
            <motion.div
              key={step.id}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ delay: idx * 0.1 }}
              viewport={{ once: true }}
              className="text-center"
            >
              <div className={cn(
                "w-16 h-16 md:w-20 md:h-20 rounded-2xl flex items-center justify-center mx-auto mb-4",
                theme === 'dark' ? 'bg-zinc-800' : 'bg-white shadow-md'
              )}>
                <step.icon className={cn(
                  "h-8 w-8 md:h-10 md:w-10",
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                )} />
              </div>
              <h3 className={cn(
                "font-semibold mb-2",
                theme === 'dark' ? 'text-white' : 'text-zinc-900'
              )}>
                {step.title}
              </h3>
              <p className={cn(
                "text-sm",
                theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
              )}>
                {step.description}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}