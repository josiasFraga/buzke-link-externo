import React from 'react';
import { BookingStep } from '../types';
import { Check, Calendar, User, PawPrint, ClipboardCheck } from 'lucide-react';

interface BookingStepsProps {
  steps: BookingStep[];
  currentStep: number;
}

const StepIcon = ({ title, isCompleted, isActive }: { title: string; isCompleted: boolean; isActive: boolean }) => {
  if (isCompleted) return <Check size={20} />;

  const iconProps = {
    size: 20,
    className: `transition-colors duration-300 ${isActive ? 'text-white' : 'text-gray-500'}`,
  };

  switch (title) {
    case 'Data e Hora': return <Calendar {...iconProps} />;
    case 'Login': return <User {...iconProps} />;
    case 'Pet': return <PawPrint {...iconProps} />;
    case 'Confirmação': return <ClipboardCheck {...iconProps} />;
    default: return null;
  }
};

const BookingSteps: React.FC<BookingStepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="w-full py-4 px-2">
      <div className="flex items-start">
        {steps.map((step, index) => {
          const isCompleted = currentStep > step.id;
          const isActive = currentStep === step.id;

          return (
            <React.Fragment key={step.id}>
              <div className="flex flex-col items-center w-24">
                <div
                  className={`
                    w-12 h-12 rounded-full flex items-center justify-center border-2
                    transition-all duration-300
                    ${isCompleted
                      ? 'bg-green-500 border-green-600 text-white'
                      : isActive
                        ? 'bg-indigo-600 border-indigo-700 text-white ring-4 ring-indigo-200'
                        : 'bg-gray-100 border-gray-300 text-gray-500'
                    }
                  `}
                >
                  <StepIcon title={step.title} isCompleted={isCompleted} isActive={isActive} />
                </div>
                <div className="text-center mt-3">
                  <p className={`text-sm font-bold transition-colors duration-300 ${isActive ? 'text-indigo-600' : 'text-gray-600'}`}>
                    {step.title}
                  </p>
                  <p className="text-xs text-gray-400 hidden sm:block">{step.description}</p>
                </div>
              </div>

              {index < steps.length - 1 && (
                <div className="flex-1 mt-5">
                  <div className={`h-1 w-full rounded-full transition-colors duration-500 ${isCompleted ? 'bg-green-500' : 'bg-gray-200'}`} />
                </div>
              )}
            </React.Fragment>
          );
        })}
      </div>
    </div>
  );
};

export default BookingSteps;