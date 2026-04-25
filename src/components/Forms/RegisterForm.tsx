import React from 'react';
import { User, Mail, Lock, Globe, Phone } from 'lucide-react';
import DdiPicker from './DdiPicker';

interface RegisterFormProps {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  country: string;
  phonePrefix: string;
  phone: string;
  errors: {
    name?: string;
    email?: string;
    password?: string;
    confirmPassword?: string;
    phone?: string;
  };
  onNameChange: (value: string) => void;
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
  onConfirmPasswordChange: (value: string) => void;
  onCountryChange: (value: string) => void;
  onPhonePrefixChange: (value: string) => void;
  onPhoneChange: (value: string) => void;
}

const RegisterForm: React.FC<RegisterFormProps> = ({
  name,
  email,
  password,
  confirmPassword,
  country,
  phonePrefix,
  phone,
  errors,
  onNameChange,
  onEmailChange,
  onPasswordChange,
  onConfirmPasswordChange,
  onCountryChange,
  onPhonePrefixChange,
  onPhoneChange
}) => {
  const formatPhoneNumber = (value: string) => {
    const numbers = value.replace(/\D/g, '');
    
    if (phonePrefix === '+55') {
      // Format for Brazilian numbers: (XX) XXXXX-XXXX
      if (numbers.length <= 2) return `(${numbers}`;
      if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
      if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
      return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
    } else {
      // Format for Uruguayan numbers: XXXX XXXX
      if (numbers.length <= 4) return numbers;
      if (numbers.length <= 8) return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
      return `${numbers.slice(0, 4)} ${numbers.slice(4, 8)}`;
    }
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formattedPhone = formatPhoneNumber(e.target.value);
    onPhoneChange(formattedPhone);
  };

  return (
    <>
      <div>
        <label htmlFor="country" className="theme-text-secondary mb-1 flex items-center text-sm font-medium">
          <Globe size={16} className="mr-2" />
          País
        </label>
        <select
          id="country"
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          className="theme-input px-4 py-3"
        >
          <option value="Brasil">Brasil</option>
          <option value="Uruguai">Uruguai</option>
        </select>
      </div>

      <div>
        <label htmlFor="name" className="theme-text-secondary mb-1 flex items-center text-sm font-medium">
          <User size={16} className="mr-2" />
          Nome Completo
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={`theme-input px-4 py-3 ${errors.name ? 'border-red-500' : ''}`}
          placeholder="João Silva"
        />
        {errors.name && <p className="theme-text-danger mt-1 text-sm">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="theme-text-secondary mb-1 flex items-center text-sm font-medium">
          <Phone size={16} className="mr-2" />
          Telefone
        </label>
        <div className="flex gap-2">
          <DdiPicker id="register-phone-ddi" value={phonePrefix} onChange={onPhonePrefixChange} />
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            placeholder={phonePrefix === '+55' ? '(XX) XXXXX-XXXX' : 'XXXX XXXX'}
            className={`theme-input min-w-0 flex-1 px-4 py-3 ${errors.phone ? 'border-red-500' : ''}`}
          />
        </div>
        {errors.phone && <p className="theme-text-danger mt-1 text-sm">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="email" className="theme-text-secondary mb-1 flex items-center text-sm font-medium">
          <Mail size={16} className="mr-2" />
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className={`theme-input px-4 py-3 ${errors.email ? 'border-red-500' : ''}`}
          placeholder="seu@email.com"
        />
        {errors.email && <p className="theme-text-danger mt-1 text-sm">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="theme-text-secondary mb-1 flex items-center text-sm font-medium">
          <Lock size={16} className="mr-2" />
          Senha
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className={`theme-input px-4 py-3 ${errors.password ? 'border-red-500' : ''}`}
          placeholder="••••••••"
        />
        {errors.password && <p className="theme-text-danger mt-1 text-sm">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="theme-text-secondary mb-1 flex items-center text-sm font-medium">
          <Lock size={16} className="mr-2" />
          Confirmar Senha
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          className={`theme-input px-4 py-3 ${errors.confirmPassword ? 'border-red-500' : ''}`}
          placeholder="••••••••"
        />
        {errors.confirmPassword && <p className="theme-text-danger mt-1 text-sm">{errors.confirmPassword}</p>}
      </div>
    </>
  );
};

export default RegisterForm;