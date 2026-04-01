import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import LoginForm from './Forms/LoginForm';
import RegisterForm from './Forms/RegisterForm';
import { LogOut } from 'lucide-react';
import { buildPublicApiUrl } from '../lib/public-api';

interface AuthStepProps {
  onAuthSuccess: () => void;
}

const AuthStep: React.FC<AuthStepProps> = ({ onAuthSuccess }) => {
  const { user, token, setToken, setUser, logout, loadToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAccount, setHasAccount] = useState(true);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [phonePrefix, setPhonePrefix] = useState('+55');
  const [phone, setPhone] = useState('');
  const [formErrors, setFormErrors] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  useEffect(() => {
    const fetchUser = async () => {
      if (token && !user) {
        try {
          const response = await fetch(buildPublicApiUrl('/users/me'), {
            headers: { Authorization: `Bearer ${token}` },
          });
          if (!response.ok) throw new Error('Falha ao buscar dados do usuário.');
          const userData = await response.json();
          setUser(userData);
        } catch {
          logout(); // Token inválido, deslogar
        }
      }
    };
    fetchUser();
  }, [token, user, setUser, logout]);

  useEffect(() => {
    if (country === 'Brasil') {
      setPhonePrefix('+55');
    } else if (country === 'Uruguai') {
      setPhonePrefix('+598');
    }
    setPhone('');
  }, [country]);

  const validate = () => {
    const newErrors = { name: '', email: '', password: '', confirmPassword: '', phone: '' };
    let isValid = true;
    if (!hasAccount) {
      if (!name.trim()) { newErrors.name = 'Nome é obrigatório'; isValid = false; }
      if (password.length < 6 || password.length > 20) { newErrors.password = 'A senha deve ter entre 6 e 20 caracteres'; isValid = false; }
      if (password !== confirmPassword) { newErrors.confirmPassword = 'As senhas não coincidem'; isValid = false; }
      const phoneNumbers = phone.replace(/\D/g, '');
      if (!phoneNumbers || (phonePrefix === '+55' && phoneNumbers.length !== 11) || (phonePrefix === '+598' && phoneNumbers.length !== 8)) { newErrors.phone = 'Telefone inválido'; isValid = false; }
    }
    if (!email.trim()) { newErrors.email = 'Email é obrigatório'; isValid = false; }
    else if (!/\S+@\S+\.\S+/.test(email)) { newErrors.email = 'Email é inválido'; isValid = false; }
    setFormErrors(newErrors);
    return isValid;
  };

  const handleLogin = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(buildPublicApiUrl('/auth/login'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Email ou senha incorretos');
      setToken(data.access_token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao fazer login');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRegister = async () => {
    if (!validate()) return;
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(buildPublicApiUrl('/users/create'), {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          nome: name,
          email,
          senha: password,
          pais: country,
          telefone_ddi: phonePrefix.replace('+', ''),
          telefone: phone,
        }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.message || 'Erro ao criar conta');
      setToken(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (hasAccount) {
      handleLogin();
    } else {
      handleRegister();
    }
  };

  if (user) {
    return (
      <div id="auth-step-section" className="space-y-4">
        <div className="theme-panel-success flex items-center justify-between p-4">
          <div className="flex items-center">
            <img src={user.img} alt={user.nome} className="w-12 h-12 rounded-full mr-4" />
            <div>
              <p className="theme-text-primary font-bold">{user.nome}</p>
              <p className="theme-text-secondary text-sm">{user.email}</p>
            </div>
          </div>
          <button onClick={logout} className="theme-text-danger transition-colors hover:opacity-80">
            <LogOut size={24} />
          </button>
        </div>
        <button onClick={onAuthSuccess} className="theme-primary-btn w-full px-4 py-3 font-medium">
          Continuar como {user.nome.split(' ')[0]}
        </button>
      </div>
    );
  }

  return (
    <form id="auth-step-section" onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-4 mb-6">
        <button type="button" onClick={() => setHasAccount(true)} className={`flex-1 px-4 py-3 font-medium transition-colors ${hasAccount ? 'theme-primary-btn' : 'theme-secondary-btn'}`}>
          Já tenho conta
        </button>
        <button type="button" onClick={() => setHasAccount(false)} className={`flex-1 px-4 py-3 font-medium transition-colors ${!hasAccount ? 'theme-primary-btn' : 'theme-secondary-btn'}`}>
          Criar uma conta
        </button>
      </div>

      {hasAccount ? (
        <LoginForm email={email} password={password} errors={formErrors} onEmailChange={setEmail} onPasswordChange={setPassword} />
      ) : (
        <RegisterForm name={name} email={email} password={password} confirmPassword={confirmPassword} country={country} phonePrefix={phonePrefix} phone={phone} errors={formErrors} onNameChange={setName} onEmailChange={setEmail} onPasswordChange={setPassword} onConfirmPasswordChange={setConfirmPassword} onCountryChange={setCountry} onPhoneChange={setPhone} />
      )}

      {error && <p className="theme-text-danger mt-2 text-sm">{error}</p>}

      <button type="submit" disabled={isLoading} className="theme-primary-btn w-full px-4 py-3 font-medium">
        {isLoading ? 'Processando...' : (hasAccount ? 'Entrar' : 'Criar Conta e Continuar')}
      </button>
    </form>
  );
};

export default AuthStep;