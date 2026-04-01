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
        <div className="theme-panel-accent mb-8 flex flex-col items-center gap-6 p-4 md:flex-row md:items-start">
          <div className="text-center">
            <div className="theme-text-accent text-5xl font-bold">{averageRating}</div>
            <div className="flex items-center justify-center mt-2">
              {[1, 2, 3, 4, 5].map(star => (
                <Star 
                  key={star} 
                  size={18} 
                  className={`${star <= Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--color-border-strong)]'}`} 
                />
              ))}
            </div>
            <div className="theme-text-secondary mt-1 text-sm">{company.total_avaliacoes} avaliações</div>
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
                  className="border-b border-[var(--color-border)] pb-4 last:border-0"
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
                              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-[var(--color-surface-secondary)]">
                                <User size={20} className="theme-text-secondary" />
                                </div>
                            )}
                            <div>
                              <h4 className="theme-text-primary font-semibold">{review.usuario.nome}</h4>
                              <p className="theme-text-muted text-xs">{moment(review.created).format('DD/MM/YYYY')}</p>
                            </div>
                        </div>
                        <div className="flex">
                            {[1, 2, 3, 4, 5].map(star => (
                                <Star 
                                    key={star} 
                                    size={14} 
                                className={`${star <= review.avaliacao ? 'fill-yellow-400 text-yellow-400' : 'text-[var(--color-border-strong)]'}`} 
                                />
                            ))}
                        </div>
                    </div>
                        <p className="theme-text-secondary mb-2">{review.comentario}</p>
                    {review.servico && (
                          <div className="theme-panel-accent theme-text-accent inline-block px-2 py-1 text-xs">
                            Serviço: {review.servico.nome}
                        </div>
                    )}
                </div>
            );
        })}
        
        {loading && (
            <div className="text-center py-4">
                <div className="mx-auto h-8 w-8 animate-spin rounded-full border-b-2 border-[var(--color-primary)]"></div>
            </div>
        )}

        {!loading && reviews.length === 0 && company.media_avaliacoes === null && (
             <div className="text-center py-8">
                <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-[var(--color-surface-secondary)]">
                  <Star size={24} className="theme-text-muted" />
                </div>
                <h3 className="theme-text-primary mb-2 text-xl font-bold">Nenhuma Avaliação</h3>
                <p className="theme-text-secondary">
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