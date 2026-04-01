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
    </>
  );
};

export default LoginForm;