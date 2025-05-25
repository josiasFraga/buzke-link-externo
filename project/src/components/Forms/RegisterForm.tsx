import React from 'react';
import { User, Mail, Lock, Globe, Phone } from 'lucide-react';

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
        <label htmlFor="country" className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <Globe size={16} className="mr-2 text-gray-500" />
          País
        </label>
        <select
          id="country"
          value={country}
          onChange={(e) => onCountryChange(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg border-gray-300 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors"
        >
          <option value="Brasil">Brasil</option>
          <option value="Uruguai">Uruguai</option>
        </select>
      </div>

      <div>
        <label htmlFor="name" className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <User size={16} className="mr-2 text-gray-500" />
          Nome Completo
        </label>
        <input
          type="text"
          id="name"
          value={name}
          onChange={(e) => onNameChange(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg ${
            errors.name ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
          placeholder="João Silva"
        />
        {errors.name && <p className="mt-1 text-sm text-red-500">{errors.name}</p>}
      </div>

      <div>
        <label htmlFor="phone" className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <Phone size={16} className="mr-2 text-gray-500" />
          Telefone
        </label>
        <div className="flex gap-2">
          <div className="w-24 px-2 py-3 border rounded-lg border-gray-300 bg-gray-50 text-gray-700 font-medium">
            {phonePrefix}
          </div>
          <input
            type="tel"
            id="phone"
            value={phone}
            onChange={handlePhoneChange}
            placeholder={phonePrefix === '+55' ? '(XX) XXXXX-XXXX' : 'XXXX XXXX'}
            className={`flex-1 px-4 py-3 border rounded-lg ${
              errors.phone ? 'border-red-500' : 'border-gray-300'
            } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
          />
        </div>
        {errors.phone && <p className="mt-1 text-sm text-red-500">{errors.phone}</p>}
      </div>

      <div>
        <label htmlFor="email" className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <Mail size={16} className="mr-2 text-gray-500" />
          Email
        </label>
        <input
          type="email"
          id="email"
          value={email}
          onChange={(e) => onEmailChange(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg ${
            errors.email ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
          placeholder="seu@email.com"
        />
        {errors.email && <p className="mt-1 text-sm text-red-500">{errors.email}</p>}
      </div>

      <div>
        <label htmlFor="password" className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <Lock size={16} className="mr-2 text-gray-500" />
          Senha
        </label>
        <input
          type="password"
          id="password"
          value={password}
          onChange={(e) => onPasswordChange(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg ${
            errors.password ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
          placeholder="••••••••"
        />
        {errors.password && <p className="mt-1 text-sm text-red-500">{errors.password}</p>}
      </div>

      <div>
        <label htmlFor="confirmPassword" className="flex items-center text-sm font-medium text-gray-700 mb-1">
          <Lock size={16} className="mr-2 text-gray-500" />
          Confirmar Senha
        </label>
        <input
          type="password"
          id="confirmPassword"
          value={confirmPassword}
          onChange={(e) => onConfirmPasswordChange(e.target.value)}
          className={`w-full px-4 py-3 border rounded-lg ${
            errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
          } focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-colors`}
          placeholder="••••••••"
        />
        {errors.confirmPassword && <p className="mt-1 text-sm text-red-500">{errors.confirmPassword}</p>}
      </div>
    </>
  );
};

export default RegisterForm;