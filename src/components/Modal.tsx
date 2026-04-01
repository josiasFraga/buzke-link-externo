import React, { ReactNode, useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: ReactNode;
  modalRef?: React.RefObject<HTMLDivElement>;
}

const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, children, modalRef }) => {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'auto';
    }
    
    return () => {
      document.body.style.overflow = 'auto';
    };
  }, [isOpen]);
  
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div 
        className="fixed inset-0 bg-black/55 backdrop-blur-sm transition-opacity"
        onClick={onClose}
      ></div>
      
      <div className="theme-card animate-fadeIn z-10 mx-4 w-full max-w-3xl overflow-hidden transform transition-all">
        <div className="flex items-center justify-between border-b border-[var(--color-border)] p-5">
          <div className="flex items-center">
            <div className="theme-gradient-accent mr-2 rounded-full p-1">
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M12 2C6.48 2 2 6.48 2 12C2 17.52 6.48 22 12 22C17.52 22 22 17.52 22 12C22 6.48 17.52 2 12 2Z" fill="white"/>
                <path d="M16 13H13V16C13 16.55 12.55 17 12 17C11.45 17 11 16.55 11 16V13H8C7.45 13 7 12.55 7 12C7 11.45 7.45 11 8 11H11V8C11 7.45 11.45 7 12 7C12.55 7 13 7.45 13 8V11H16C16.55 11 17 11.45 17 12C17 12.55 16.55 13 16 13Z" fill="#4F46E5"/>
              </svg>
            </div>
            <h3 className="theme-text-primary text-xl font-bold">{title}</h3>
          </div>
          <button 
            onClick={onClose}
            className="theme-secondary-btn rounded-full p-2"
          >
            <X size={20} />
          </button>
        </div>
        
        <div ref={modalRef} className="p-6 max-h-[80vh] overflow-y-auto">
          {children}
        </div>
      </div>
    </div>
  );
};

export default Modal;