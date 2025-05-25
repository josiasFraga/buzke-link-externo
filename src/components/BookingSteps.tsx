import React from 'react';
import { BookingStep } from '../types';
import { Check } from 'lucide-react';

interface BookingStepsProps {
  steps: BookingStep[];
  currentStep: number;
}

const BookingSteps: React.FC<BookingStepsProps> = ({ steps, currentStep }) => {
  return (
    <div className="mb-8">
      <div className="flex items-center justify-between">
        {steps.map((step, index) => (
          <React.Fragment key={step.id}>
            {/* Step Circle */}
            <div className="flex flex-col items-center">
              <div 
                className={`
                  w-10 h-10 rounded-full flex items-center justify-center
                  ${currentStep > step.id 
                    ? 'bg-green-500 text-white' 
                    : currentStep === step.id 
                      ? 'bg-indigo-600 text-white' 
                      : 'bg-gray-200 text-gray-500'
                  }
                `}
              >
                {currentStep > step.id ? (
                  <Check size={20} />
                ) : (
                  <span>{step.id}</span>
                )}
              </div>
              <div className="text-center mt-2">
                <div className={`text-sm font-medium ${currentStep === step.id ? 'text-indigo-600' : 'text-gray-700'}`}>
                  {step.title}
                </div>
                <div className="text-xs text-gray-500 hidden md:block">
                  {step.description}
                </div>
              </div>
            </div>
            
            {/* Connector Line */}
            {index < steps.length - 1 && (
              <div 
                className={`
                  flex-1 h-1 mx-2
                  ${currentStep > step.id ? 'bg-green-500' : 'bg-gray-200'}
                `}
              />
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

export default BookingSteps;