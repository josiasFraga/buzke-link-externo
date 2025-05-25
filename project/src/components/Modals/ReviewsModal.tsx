import React from 'react';
import { Star } from 'lucide-react';
import Modal from '../Modal';
import { Company } from '../../types';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
}

const ReviewsModal = ({ isOpen, onClose, company }: ReviewsModalProps) => {
  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Avaliações dos Clientes"
    >
      {company.media_avaliacoes === null ? (
        <div className="text-center py-8">
          <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center mb-4">
            <Star size={24} className="text-gray-400" />
          </div>
          <h3 className="text-xl font-bold text-gray-800 mb-2">Nenhuma Avaliação</h3>
          <p className="text-gray-600">
            Este estabelecimento ainda não recebeu avaliações.
            Seja o primeiro a avaliar após sua visita!
          </p>
        </div>
      ) : (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 p-4 bg-indigo-50 rounded-xl">
          <div className="text-center">
            <div className="text-5xl font-bold text-indigo-600">{company.media_avaliacoes}</div>
            <div className="flex items-center justify-center mt-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={18} 
                  className={`${star <= Math.round(company.media_avaliacoes) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <div className="text-sm text-gray-600 mt-1">{company.total_avaliacoes} avaliações</div>
          </div>
        </div>
      )}
    </Modal>
  );
};

export default ReviewsModal;