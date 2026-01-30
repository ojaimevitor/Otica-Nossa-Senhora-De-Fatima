/**
 * Exams.jsx - Agendamento de exames de vista
 * Exames a cada 15 dias em Araripe-CE
 */
import React, { useState, useEffect, useContext } from 'react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { AppContext } from '@/Layout';
import {
  Calendar, Clock, MapPin, Phone, Check, AlertCircle, ChevronLeft, ChevronRight
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Separator } from '@/components/ui/separator';
import { format, addDays, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isAfter, getDay } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { toast } from 'sonner';
import AssistantWidget from '@/components/assistant/AssistantWidget';
import { motion } from 'framer-motion';

// Tipos de exame
const examTypes = [
  { id: 'refraction', name: 'Refração', description: 'Exame de grau', duration: '30 min' },
  { id: 'tonometry', name: 'Tonometria', description: 'Medição da pressão ocular', duration: '15 min' },
  { id: 'fundoscopy', name: 'Fundoscopia', description: 'Exame de fundo de olho', duration: '20 min' },
  { id: 'complete', name: 'Exame Completo', description: 'Avaliação oftalmológica completa', duration: '45 min' }
];

// Horários disponíveis
const timeSlots = [
  '08:00', '08:30', '09:00', '09:30', '10:00', '10:30',
  '14:00', '14:30', '15:00', '15:30', '16:00', '16:30'
];

// Gerar datas de atendimento (quinzenais - dias específicos)
const getAvailableDates = () => {
  const dates = [];
  const today = new Date();
  let currentDate = new Date(today);
  
  // Começar do próximo dia de atendimento (assumindo que são nos dias 1 e 15 de cada mês, ou ajustar)
  // Aqui vamos gerar datas a cada 15 dias a partir de hoje
  for (let i = 0; i < 8; i++) {
    const nextDate = addDays(today, 7 + (i * 15)); // Próxima semana + 15 em 15 dias
    if (getDay(nextDate) !== 0) { // Excluir domingos
      dates.push(nextDate);
    }
  }
  
  return dates;
};

export default function Exams() {
  const context = useContext(AppContext);
  const theme = context?.theme || 'light';
  const user = context?.user;

  const [step, setStep] = useState(1);
  const [selectedExam, setSelectedExam] = useState('');
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedTime, setSelectedTime] = useState('');
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [formData, setFormData] = useState({
    name: '',
    phone: ''
  });
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);

  const availableDates = getAvailableDates();

  // Preencher dados do usuário logado
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.full_name || '',
        phone: user.phone || ''
      });
    }
  }, [user]);

  // Verificar se uma data está disponível
  const isDateAvailable = (date) => {
    return availableDates.some(d => isSameDay(d, date));
  };

  // Dias do mês atual
  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });

  // Navegação do calendário
  const prevMonth = () => {
    setCurrentMonth(prev => addDays(startOfMonth(prev), -1));
  };
  const nextMonth = () => {
    setCurrentMonth(prev => addDays(endOfMonth(prev), 1));
  };

  // Submeter agendamento
  const handleSubmit = async () => {
    if (!selectedExam || !selectedDate || !selectedTime || !formData.name || !formData.phone) {
      toast.error('Preencha todos os campos');
      return;
    }

    setSubmitting(true);

    try {
      await base44.entities.Appointment.create({
        user_email: user?.email || formData.phone,
        user_name: formData.name,
        user_phone: formData.phone,
        appointment_date: format(selectedDate, 'yyyy-MM-dd'),
        appointment_time: selectedTime,
        exam_type: selectedExam,
        status: 'scheduled'
      });

      setSuccess(true);
      toast.success('Agendamento realizado com sucesso!');
    } catch (e) {
      toast.error('Erro ao agendar. Tente novamente.');
    }

    setSubmitting(false);
  };

  if (success) {
    return (
      <div className={cn(
        "min-h-screen flex items-center justify-center px-4",
        theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'
      )}>
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="text-center max-w-md"
        >
          <div className={cn(
            "h-20 w-20 rounded-full flex items-center justify-center mx-auto mb-6",
            theme === 'dark' ? 'bg-green-500' : 'bg-green-100'
          )}>
            <Check className={cn(
              "h-10 w-10",
              theme === 'dark' ? 'text-white' : 'text-green-600'
            )} />
          </div>
          <h2 className={cn(
            "text-2xl font-bold mb-4",
            theme === 'dark' ? 'text-white' : 'text-zinc-900'
          )}>
            Agendamento Confirmado!
          </h2>
          <div className={cn(
            "p-4 rounded-xl mb-6",
            theme === 'dark' ? 'bg-zinc-800' : 'bg-white shadow-sm'
          )}>
            <p className="font-medium mb-2">{examTypes.find(e => e.id === selectedExam)?.name}</p>
            <p className={cn(
              "text-sm",
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
            )}>
              {format(selectedDate, "EEEE, d 'de' MMMM 'de' yyyy", { locale: ptBR })}
            </p>
            <p className={cn(
              "text-sm",
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
            )}>
              às {selectedTime}
            </p>
          </div>
          <p className={cn(
            "text-sm mb-6",
            theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
          )}>
            Entraremos em contato para confirmar seu agendamento.
            <br />
            Endereço: Centro, Araripe-CE
          </p>
          <Button
            onClick={() => {
              setSuccess(false);
              setStep(1);
              setSelectedExam('');
              setSelectedDate(null);
              setSelectedTime('');
            }}
            variant="outline"
          >
            Fazer Novo Agendamento
          </Button>
        </motion.div>
        <AssistantWidget />
      </div>
    );
  }

  return (
    <div className={cn(
      "min-h-screen py-8 px-4",
      theme === 'dark' ? 'bg-zinc-950' : 'bg-zinc-50'
    )}>
      <div className="max-w-3xl mx-auto">
        <h1 className={cn(
          "text-2xl md:text-3xl font-bold mb-2",
          theme === 'dark' ? 'text-white' : 'text-zinc-900'
        )}>
          Agendar Exame de Vista
        </h1>
        <p className={cn(
          "text-sm mb-8",
          theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
        )}>
          Atendimento quinzenal em Araripe-CE
        </p>

        {/* Steps */}
        <div className="flex items-center gap-2 mb-8 overflow-x-auto pb-2">
          {['Exame', 'Data', 'Horário', 'Dados'].map((label, idx) => {
            const stepNum = idx + 1;
            return (
              <React.Fragment key={label}>
                <div className="flex items-center gap-2">
                  <div className={cn(
                    "h-8 w-8 rounded-full flex items-center justify-center text-sm font-medium",
                    step >= stepNum
                      ? theme === 'dark' ? 'bg-amber-500 text-zinc-900' : 'bg-zinc-900 text-white'
                      : theme === 'dark' ? 'bg-zinc-800 text-zinc-500' : 'bg-zinc-200 text-zinc-500'
                  )}>
                    {step > stepNum ? <Check className="h-4 w-4" /> : stepNum}
                  </div>
                  <span className={cn(
                    "text-sm whitespace-nowrap",
                    step >= stepNum
                      ? theme === 'dark' ? 'text-white' : 'text-zinc-900'
                      : theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                  )}>
                    {label}
                  </span>
                </div>
                {idx < 3 && (
                  <div className={cn(
                    "w-8 h-0.5 flex-shrink-0",
                    step > stepNum
                      ? theme === 'dark' ? 'bg-amber-500' : 'bg-zinc-900'
                      : theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-200'
                  )} />
                )}
              </React.Fragment>
            );
          })}
        </div>

        <div className={cn(
          "rounded-xl p-6",
          theme === 'dark' ? 'bg-zinc-900' : 'bg-white shadow-sm'
        )}>
          {/* Step 1: Tipo de exame */}
          {step === 1 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-semibold mb-4">Selecione o tipo de exame</h2>
              <RadioGroup value={selectedExam} onValueChange={setSelectedExam}>
                <div className="space-y-3">
                  {examTypes.map((exam) => (
                    <div
                      key={exam.id}
                      className={cn(
                        "flex items-center gap-4 p-4 rounded-lg border cursor-pointer transition-colors",
                        selectedExam === exam.id
                          ? theme === 'dark' ? 'border-amber-500 bg-amber-500/10' : 'border-zinc-900 bg-zinc-50'
                          : theme === 'dark' ? 'border-zinc-700 hover:border-zinc-600' : 'border-zinc-200 hover:border-zinc-300'
                      )}
                      onClick={() => setSelectedExam(exam.id)}
                    >
                      <RadioGroupItem value={exam.id} id={exam.id} />
                      <Label htmlFor={exam.id} className="flex-1 cursor-pointer">
                        <p className="font-medium">{exam.name}</p>
                        <p className={cn(
                          "text-sm",
                          theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'
                        )}>
                          {exam.description} · {exam.duration}
                        </p>
                      </Label>
                    </div>
                  ))}
                </div>
              </RadioGroup>
              <Button
                className={cn(
                  "w-full mt-6",
                  theme === 'dark' ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400' : ''
                )}
                onClick={() => setStep(2)}
                disabled={!selectedExam}
              >
                Continuar
              </Button>
            </motion.div>
          )}

          {/* Step 2: Data */}
          {step === 2 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-semibold mb-4">Escolha a data</h2>
              
              {/* Info sobre datas */}
              <div className={cn(
                "p-3 rounded-lg mb-4 flex items-start gap-2",
                theme === 'dark' ? 'bg-amber-500/10' : 'bg-amber-50'
              )}>
                <AlertCircle className={cn(
                  "h-5 w-5 flex-shrink-0",
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
                )} />
                <p className={cn(
                  "text-sm",
                  theme === 'dark' ? 'text-amber-400' : 'text-amber-700'
                )}>
                  Atendimento quinzenal. Datas disponíveis destacadas em amarelo.
                </p>
              </div>

              {/* Calendário */}
              <div className={cn(
                "rounded-lg p-4",
                theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-50'
              )}>
                {/* Header do calendário */}
                <div className="flex items-center justify-between mb-4">
                  <Button variant="ghost" size="icon" onClick={prevMonth}>
                    <ChevronLeft className="h-4 w-4" />
                  </Button>
                  <span className="font-medium">
                    {format(currentMonth, 'MMMM yyyy', { locale: ptBR })}
                  </span>
                  <Button variant="ghost" size="icon" onClick={nextMonth}>
                    <ChevronRight className="h-4 w-4" />
                  </Button>
                </div>

                {/* Dias da semana */}
                <div className="grid grid-cols-7 gap-1 mb-2">
                  {['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'].map(day => (
                    <div key={day} className={cn(
                      "text-center text-xs font-medium py-2",
                      theme === 'dark' ? 'text-zinc-500' : 'text-zinc-500'
                    )}>
                      {day}
                    </div>
                  ))}
                </div>

                {/* Dias do mês */}
                <div className="grid grid-cols-7 gap-1">
                  {/* Espaços vazios no início */}
                  {Array.from({ length: getDay(monthStart) }).map((_, i) => (
                    <div key={`empty-${i}`} />
                  ))}
                  
                  {monthDays.map(day => {
                    const available = isDateAvailable(day);
                    const isPast = !isAfter(day, new Date());
                    const isSelected = selectedDate && isSameDay(day, selectedDate);

                    return (
                      <button
                        key={day.toISOString()}
                        onClick={() => available && !isPast && setSelectedDate(day)}
                        disabled={!available || isPast}
                        className={cn(
                          "aspect-square rounded-lg text-sm font-medium transition-all",
                          isPast && 'opacity-30 cursor-not-allowed',
                          !available && !isPast && 'opacity-50 cursor-not-allowed',
                          available && !isPast && !isSelected && (
                            theme === 'dark'
                              ? 'bg-amber-500/20 text-amber-400 hover:bg-amber-500/30'
                              : 'bg-amber-100 text-amber-800 hover:bg-amber-200'
                          ),
                          isSelected && (
                            theme === 'dark'
                              ? 'bg-amber-500 text-zinc-900'
                              : 'bg-zinc-900 text-white'
                          )
                        )}
                      >
                        {format(day, 'd')}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(1)} className="flex-1">
                  Voltar
                </Button>
                <Button
                  className={cn(
                    "flex-1",
                    theme === 'dark' ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400' : ''
                  )}
                  onClick={() => setStep(3)}
                  disabled={!selectedDate}
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 3: Horário */}
          {step === 3 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-semibold mb-4">Escolha o horário</h2>
              <p className={cn(
                "text-sm mb-4",
                theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
              )}>
                {selectedDate && format(selectedDate, "EEEE, d 'de' MMMM", { locale: ptBR })}
              </p>

              <div className="grid grid-cols-3 md:grid-cols-4 gap-3">
                {timeSlots.map(time => (
                  <Button
                    key={time}
                    variant={selectedTime === time ? 'default' : 'outline'}
                    className={cn(
                      selectedTime === time && (theme === 'dark' ? 'bg-amber-500 text-zinc-900' : '')
                    )}
                    onClick={() => setSelectedTime(time)}
                  >
                    {time}
                  </Button>
                ))}
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(2)} className="flex-1">
                  Voltar
                </Button>
                <Button
                  className={cn(
                    "flex-1",
                    theme === 'dark' ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400' : ''
                  )}
                  onClick={() => setStep(4)}
                  disabled={!selectedTime}
                >
                  Continuar
                </Button>
              </div>
            </motion.div>
          )}

          {/* Step 4: Dados */}
          {step === 4 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
              <h2 className="text-lg font-semibold mb-4">Seus dados</h2>

              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Nome completo</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                  />
                </div>
                <div>
                  <Label htmlFor="phone">Telefone</Label>
                  <Input
                    id="phone"
                    placeholder="(00) 00000-0000"
                    value={formData.phone}
                    onChange={(e) => setFormData(prev => ({ ...prev, phone: e.target.value }))}
                    className={theme === 'dark' ? 'bg-zinc-800 border-zinc-700' : ''}
                  />
                </div>
              </div>

              <Separator className={cn("my-6", theme === 'dark' ? 'bg-zinc-800' : '')} />

              {/* Resumo */}
              <div className={cn(
                "p-4 rounded-lg",
                theme === 'dark' ? 'bg-zinc-800' : 'bg-zinc-50'
              )}>
                <h3 className="font-medium mb-3">Resumo do agendamento</h3>
                <div className="space-y-2 text-sm">
                  <p>
                    <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}>Exame: </span>
                    {examTypes.find(e => e.id === selectedExam)?.name}
                  </p>
                  <p>
                    <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}>Data: </span>
                    {selectedDate && format(selectedDate, "d 'de' MMMM 'de' yyyy", { locale: ptBR })}
                  </p>
                  <p>
                    <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}>Horário: </span>
                    {selectedTime}
                  </p>
                  <p>
                    <span className={theme === 'dark' ? 'text-zinc-400' : 'text-zinc-500'}>Local: </span>
                    Centro, Araripe-CE
                  </p>
                </div>
              </div>

              <div className="flex gap-3 mt-6">
                <Button variant="outline" onClick={() => setStep(3)} className="flex-1">
                  Voltar
                </Button>
                <Button
                  className={cn(
                    "flex-1",
                    theme === 'dark' ? 'bg-amber-500 text-zinc-900 hover:bg-amber-400' : ''
                  )}
                  onClick={handleSubmit}
                  disabled={submitting || !formData.name || !formData.phone}
                >
                  {submitting ? 'Agendando...' : 'Confirmar Agendamento'}
                </Button>
              </div>
            </motion.div>
          )}
        </div>

        {/* Info adicional */}
        <div className={cn(
          "mt-6 p-4 rounded-xl flex items-start gap-3",
          theme === 'dark' ? 'bg-zinc-800/50' : 'bg-zinc-100'
        )}>
          <MapPin className={cn(
            "h-5 w-5 flex-shrink-0",
            theme === 'dark' ? 'text-amber-400' : 'text-amber-600'
          )} />
          <div>
            <p className="font-medium">Nosso endereço</p>
            <p className={cn(
              "text-sm",
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
            )}>
              Centro, Araripe-CE
            </p>
            <p className={cn(
              "text-sm mt-2",
              theme === 'dark' ? 'text-zinc-400' : 'text-zinc-600'
            )}>
              Telefone: (88) 9999-9999
            </p>
          </div>
        </div>
      </div>

      <AssistantWidget />
    </div>
  );
}