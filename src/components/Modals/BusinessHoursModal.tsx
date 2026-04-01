import React from 'react';
import Modal from '../Modal';

interface BusinessHoursModalProps {
  isOpen: boolean;
  onClose: () => void;
  businessHours: Array<{ day: string; hours: string; }>;
}

const BusinessHoursModal = ({ isOpen, onClose, businessHours }: BusinessHoursModalProps) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Horários de Funcionamento"
    >
      <div className="space-y-4">
        {businessHours.map((item, index) => (
          <div 
            key={index} 
            className={`flex justify-between items-center p-3 rounded-lg ${
              item.day === 'Domingo' 
                ? 'theme-panel-error theme-text-danger' 
                : index % 2 === 0 
                  ? 'theme-card-soft theme-text-primary' 
                  : 'theme-card theme-text-primary'
            }`}
          >
            <div className="font-medium">{item.day}</div>
            <div className={`${item.day === 'Domingo' ? 'font-bold' : ''}`}>{item.hours}</div>
          </div>
        ))}
      </div>
      
      <div className="theme-panel-accent mt-6 p-4">
        <div className="flex items-start">
          <div className="mr-3 rounded-full bg-[color:color-mix(in_srgb,var(--color-primary)_18%,transparent)] p-2">
            <svg className="theme-text-accent h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="theme-text-primary font-medium">Observações</h4>
            <p className="theme-text-secondary mt-1 text-sm">
              Em feriados nacionais, nosso estabelecimento permanece fechado. Agendamentos podem ser feitos online 24 horas por dia, 7 dias por semana.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BusinessHoursModal;