import React from 'react';
import { Clock } from 'lucide-react';
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
                ? 'bg-red-50 text-red-800' 
                : index % 2 === 0 
                  ? 'bg-gray-50' 
                  : 'bg-white'
            }`}
          >
            <div className="font-medium">{item.day}</div>
            <div className={`${item.day === 'Domingo' ? 'font-bold' : ''}`}>{item.hours}</div>
          </div>
        ))}
      </div>
      
      <div className="mt-6 bg-indigo-50 p-4 rounded-lg">
        <div className="flex items-start">
          <div className="bg-indigo-100 rounded-full p-2 mr-3">
            <svg className="w-5 h-5 text-indigo-600" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <div>
            <h4 className="font-medium text-indigo-800">Observações</h4>
            <p className="text-sm text-indigo-600 mt-1">
              Em feriados nacionais, nosso estabelecimento permanece fechado. Agendamentos podem ser feitos online 24 horas por dia, 7 dias por semana.
            </p>
          </div>
        </div>
      </div>
    </Modal>
  );
};

export default BusinessHoursModal;