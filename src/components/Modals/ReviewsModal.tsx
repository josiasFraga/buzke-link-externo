import React, { useEffect, useState, useRef, useCallback } from 'react';
import { Star, User } from 'lucide-react';
import Modal from '../Modal';
import { Company } from '../../types';
import moment from 'moment';
import { buildPublicApiUrl } from '../../lib/public-api';

interface ReviewsModalProps {
  isOpen: boolean;
  onClose: () => void;
  company: Company;
}

interface Review {
    id: number;
    created: string;
    avaliacao: number;
    comentario: string;
    servico: {
        id: number;
        nome: string;
    };
    usuario: {
        id: number;
        nome: string;
        img: string;
    };
}

const ReviewsModal = ({ isOpen, onClose, company }: ReviewsModalProps) => {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const [offset, setOffset] = useState(0);
  const limit = 10;
  const observer = useRef<IntersectionObserver | null>(null);
  const averageRating = company.media_avaliacoes ?? 0;

  const lastReviewElementRef = useCallback((node: HTMLDivElement) => {
    if (loading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore) {
        setOffset(prevOffset => prevOffset + limit);
      }
    });
    if (node) observer.current.observe(node);
  }, [loading, hasMore]);

  useEffect(() => {
    if (isOpen) {
      setReviews([]);
      setOffset(0);
      setHasMore(true);
    }
  }, [isOpen]);

  const fetchReviews = useCallback(async () => {
    setLoading(true);
    try {
      const response = await fetch(buildPublicApiUrl(`/service-reviews/from-business?limit=${limit}&offset=${offset}&businessId=${company.id}`));
      const data = await response.json();
      
      if (data.length < limit) {
        setHasMore(false);
      }
      
      setReviews(prev => offset === 0 ? data : [...prev, ...data]);
    } catch (error) {
      console.error("Error fetching reviews:", error);
    } finally {
      setLoading(false);
    }
  }, [company.id, limit, offset]);

  useEffect(() => {
    if (isOpen && hasMore) {
        fetchReviews();
    }
  }, [fetchReviews, hasMore, isOpen]);

  if (!isOpen) return null;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Avaliações dos Clientes"
    >
      {/* Summary Section */}
      {company.media_avaliacoes !== null && (
        <div className="flex flex-col md:flex-row items-center md:items-start gap-6 mb-8 p-4 bg-indigo-50 rounded-xl">
          <div className="text-center">
            <div className="text-5xl font-bold text-indigo-600">{averageRating}</div>
            <div className="flex items-center justify-center mt-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={18} 
                  className={`${star <= Math.round(averageRating) ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                />
              ))}
            </div>
            <div className="text-sm text-gray-600 mt-1">{company.total_avaliacoes} avaliações</div>
          </div>
        </div>
      )}

      {/* Reviews List */}
      <div className="space-y-4 max-h-[60vh] overflow-y-auto pr-2">
        {reviews.map((review, index) => {
            const isLastElement = reviews.length === index + 1;
            return (
                <div 
                    key={review.id} 
                    ref={isLastElement ? lastReviewElementRef : null}
                    className="border-b border-gray-100 pb-4 last:border-0"
                >
                    <div className="flex justify-between items-start mb-2">
                        <div className="flex items-center gap-3">
                            {review.usuario.img ? (
                                <img 
                                    src={review.usuario.img} 
                                    alt={review.usuario.nome} 
                                    className="w-10 h-10 rounded-full object-cover"
                                />
                            ) : (
                                <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center">
                                    <User size={20} className="text-gray-500" />
                                </div>
                            )}
                            <div>
                                <h4 className="font-semibold text-gray-900">{review.usuario.nome}</h4>
                                <p className="text-xs text-gray-500">{moment(review.created).format('DD/MM/YYYY')}</p>
                            </div>
                        </div>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                    key={star} 
                                    size={14} 
                                    className={`${star <= review.avaliacao ? 'text-yellow-400 fill-yellow-400' : 'text-gray-300'}`} 
                                />
                            ))}
                        </div>
                    </div>
                    <p className="text-gray-700 mb-2">{review.comentario}</p>
                    {review.servico && (
                        <div className="text-xs text-indigo-600 bg-indigo-50 inline-block px-2 py-1 rounded">
                            Serviço: {review.servico.nome}
                        </div>
                    )}
                </div>
            );
        })}
        
        {loading && (
            <div className="text-center py-4">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600 mx-auto"></div>
            </div>
        )}

        {!loading && reviews.length === 0 && company.media_avaliacoes === null && (
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
        )}
      </div>
    </Modal>
  );
};

export default ReviewsModal;