import React from 'react';
import { BookOpen } from 'lucide-react';
import { LessonType } from '../types';

interface LessonTypeSelectorProps {
  lessonTypes: LessonType[];
  selectedLessonTypeId: number | null;
  onSelectLessonType: (id: number) => void;
  isLoading?: boolean;
  stickyTitle?: boolean;
  stickyTopClassName?: string;
}

const LessonTypeSelector: React.FC<LessonTypeSelectorProps> = ({
  lessonTypes,
  selectedLessonTypeId,
  onSelectLessonType,
  isLoading = false,
  stickyTitle = false,
  stickyTopClassName = '',
}) => {
  return (
    <div className="mt-6" id="lesson-type-selector-section">
      <div className={stickyTitle ? `sticky z-20 bg-[var(--color-background)] py-2 ${stickyTopClassName}` : 'mb-4'}>
        <h3 className="theme-text-primary flex items-center text-lg font-semibold">
          <BookOpen size={20} className="theme-text-accent mr-2" />
          Selecione o tipo de aula
        </h3>
      </div>

      {isLoading ? (
        <div className="grid gap-4 sm:grid-cols-2">
          {[1, 2].map((item) => (
            <div key={item} className="rounded-lg border border-[var(--color-border)] p-4">
              <div className="mb-3 h-4 w-1/2 animate-pulse rounded bg-[var(--color-surface-secondary)]" />
              <div className="mb-2 h-3 w-full animate-pulse rounded bg-[var(--color-surface-secondary)]" />
              <div className="h-3 w-2/3 animate-pulse rounded bg-[var(--color-surface-secondary)]" />
            </div>
          ))}
        </div>
      ) : lessonTypes.length === 0 ? (
        <div className="theme-panel-warning p-4 text-center">
          <p className="theme-text-secondary text-sm">Nenhum tipo de aula disponível para esse esporte.</p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2">
          {lessonTypes.map((lessonType) => {
            const isSelected = selectedLessonTypeId === lessonType.id;

            return (
              <button
                key={lessonType.id}
                type="button"
                onClick={() => onSelectLessonType(lessonType.id)}
                className={`rounded-lg border p-4 text-left transition-all ${
                  isSelected
                    ? 'border-[var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)]'
                    : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)] hover:bg-[color:color-mix(in_srgb,var(--color-primary)_12%,transparent)]'
                }`}
              >
                <p className="theme-text-primary font-semibold">{lessonType.nome}</p>
                <p className="theme-text-secondary mt-1 line-clamp-2 text-sm">{lessonType.descricao}</p>
                <div className="mt-3 flex items-center justify-between">
                  <span className="theme-text-muted text-xs uppercase tracking-wide">Preço por professor</span>
                  <span className="theme-text-secondary text-sm">Definido no próximo passo</span>
                </div>
              </button>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default LessonTypeSelector;
