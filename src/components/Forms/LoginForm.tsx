import React from 'react';
import { Mail, Lock } from 'lucide-react';

interface LoginFormProps {
  email: string;
  password: string;
  errors: {
    email?: string;
    password?: string;
  };
  onEmailChange: (value: string) => void;
  onPasswordChange: (value: string) => void;
}

const LoginForm: React.FC<LoginFormProps> = ({
  email,
  password,
  errors,
  onEmailChange,
  onPasswordChange
}) => {
  return (
    <>
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
    </>
  );
};

export default LoginForm;