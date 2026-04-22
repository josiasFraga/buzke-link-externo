import React, { useState, useEffect, useCallback } from 'react';
import useAuthStore from '../store/authStore';
import LoginForm from './Forms/LoginForm';
import PhoneValidationForm from './Forms/PhoneValidationForm';
import RegisterForm from './Forms/RegisterForm';
import { LogOut } from 'lucide-react';
import { buildPublicApiUrl } from '../lib/public-api';
import { User } from '../types';

interface AuthStepProps {
  onAuthSuccess: () => void;
}

function normalizeDigits(value: string | null | undefined) {
  return (value || '').replace(/\D/g, '');
}

function getPhonePrefixFromUser(userData: User) {
  return normalizeDigits(userData.telefone_ddi) === '598' ? '+598' : '+55';
}

function formatPhoneForDisplay(phone: string | null | undefined, phonePrefix: string) {
  const numbers = normalizeDigits(phone);

  if (!numbers) {
    return '';
  }

  if (phonePrefix === '+55') {
    if (numbers.length <= 2) return `(${numbers}`;
    if (numbers.length <= 7) return `(${numbers.slice(0, 2)}) ${numbers.slice(2)}`;
    if (numbers.length <= 11) return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7)}`;
    return `(${numbers.slice(0, 2)}) ${numbers.slice(2, 7)}-${numbers.slice(7, 11)}`;
  }

  if (phonePrefix === '+598') {
    if (numbers.length <= 4) return numbers;
    if (numbers.length <= 8) return `${numbers.slice(0, 4)} ${numbers.slice(4)}`;
    return `${numbers.slice(0, 4)} ${numbers.slice(4, 8)}`;
  }

  return numbers;
}

function isPhoneValidated(user: User | null) {
  return Boolean(user && Number(user.telefone_validado) === 1);
}

function isPhoneValidationRequired(user: User | null) {
  return Boolean(user) && !isPhoneValidated(user);
}

function isPhoneNumberValid(ddi: string, phone: string) {
  const normalizedDdi = normalizeDigits(ddi);
  const normalizedPhone = normalizeDigits(phone);

  if (!normalizedDdi || normalizedDdi.length < 1 || normalizedDdi.length > 3) {
    return false;
  }

  if (normalizedDdi === '55') {
    return normalizedPhone.length === 11;
  }

  if (normalizedDdi === '598') {
    return normalizedPhone.length === 8;
  }

  return normalizedPhone.length >= 8 && normalizedPhone.length <= 15;
}

const AuthStep: React.FC<AuthStepProps> = ({ onAuthSuccess }) => {
  const { user, token, setToken, setUser, logout, loadToken } = useAuthStore();
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingUser, setIsFetchingUser] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [hasAccount, setHasAccount] = useState(true);
  const [phoneValidationPrefix, setPhoneValidationPrefix] = useState('+55');
  const [phoneValidationPhone, setPhoneValidationPhone] = useState('');
  const [phoneValidationCode, setPhoneValidationCode] = useState('');
  const [phoneValidationError, setPhoneValidationError] = useState<string | null>(null);
  const [phoneValidationSuccessMessage, setPhoneValidationSuccessMessage] = useState<string | null>(null);
  const [isSendingPhoneValidationCode, setIsSendingPhoneValidationCode] = useState(false);
  const [isValidatingPhoneCode, setIsValidatingPhoneCode] = useState(false);
  const [hasPhoneValidationCodeBeenSent, setHasPhoneValidationCodeBeenSent] = useState(false);
  const [phoneValidationResendCooldownSeconds, setPhoneValidationResendCooldownSeconds] = useState(0);

  // Form states
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [phonePrefix, setPhonePrefix] = useState('+55');
  const [phone, setPhone] = useState('');
  const [formErrors, setFormErrors] = useState({ name: '', email: '', password: '', confirmPassword: '', phone: '' });

  const resetPhoneValidationState = useCallback(() => {
    setPhoneValidationCode('');
    setPhoneValidationError(null);
    setPhoneValidationSuccessMessage(null);
    setHasPhoneValidationCodeBeenSent(false);
    setPhoneValidationResendCooldownSeconds(0);
  }, []);

  const handleLogout = () => {
    resetPhoneValidationState();
    setPhoneValidationPrefix('+55');
    setPhoneValidationPhone('');
    logout();
  };

  const syncPhoneValidationForm = useCallback((userData: User) => {
    const prefix = getPhonePrefixFromUser(userData);

    setPhoneValidationPrefix(prefix);
    setPhoneValidationPhone(formatPhoneForDisplay(userData.telefone, prefix));

    if (isPhoneValidated(userData)) {
      resetPhoneValidationState();
    }
  }, [resetPhoneValidationState]);

  const fetchAuthenticatedUser = useCallback(async (activeToken: string) => {
    setIsFetchingUser(true);

    try {
      const response = await fetch(buildPublicApiUrl('/users/me'), {
        headers: { Authorization: `Bearer ${activeToken}` },
      });

      if (!response.ok) {
        throw new Error('Falha ao buscar dados do usuário.');
      }

      const userData = await response.json() as User;
      setUser(userData);
      syncPhoneValidationForm(userData);

      return userData;
    } catch {
      logout();
      throw new Error('Não foi possível carregar o usuário autenticado.');
    } finally {
      setIsFetchingUser(false);
    }
  }, [logout, setUser, syncPhoneValidationForm]);

  useEffect(() => {
    loadToken();
  }, [loadToken]);

  useEffect(() => {
    if (token && !user && !isFetchingUser) {
      fetchAuthenticatedUser(token).catch(() => undefined);
    }
  }, [token, user, isFetchingUser, fetchAuthenticatedUser]);

  useEffect(() => {
    if (country === 'Brasil') {
      setPhonePrefix('+55');
    } else if (country === 'Uruguai') {
      setPhonePrefix('+598');
    }
    setPhone('');
  }, [country]);

  useEffect(() => {
    if (phoneValidationResendCooldownSeconds <= 0) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      setPhoneValidationResendCooldownSeconds((currentValue) => Math.max(0, currentValue - 1));
    }, 1000);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [phoneValidationResendCooldownSeconds]);

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
      await fetchAuthenticatedUser(data.access_token);
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
      await fetchAuthenticatedUser(data.token);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Erro ao criar conta');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPhoneValidationCode = async () => {
    if (!token) {
      setPhoneValidationError('Faça login novamente para validar seu telefone.');
      return;
    }

    if (!isPhoneNumberValid(phoneValidationPrefix, phoneValidationPhone)) {
      setPhoneValidationError('Informe um telefone válido para receber o código no WhatsApp.');
      return;
    }

    if (phoneValidationResendCooldownSeconds > 0) {
      return;
    }

    setIsSendingPhoneValidationCode(true);
    setPhoneValidationError(null);
    setPhoneValidationSuccessMessage(null);

    try {
      const response = await fetch(buildPublicApiUrl('/phone-validation-codes'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          ddi: normalizeDigits(phoneValidationPrefix),
          telefone: phoneValidationPhone,
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível enviar o código de validação.');
      }

      setHasPhoneValidationCodeBeenSent(true);
      setPhoneValidationResendCooldownSeconds(60);
      setPhoneValidationSuccessMessage(data.message || 'Código enviado com sucesso.');
    } catch (err) {
      setPhoneValidationError(err instanceof Error ? err.message : 'Não foi possível enviar o código de validação.');
    } finally {
      setIsSendingPhoneValidationCode(false);
    }
  };

  const handleValidatePhoneCode = async () => {
    if (!token) {
      setPhoneValidationError('Faça login novamente para validar seu telefone.');
      return;
    }

    if (normalizeDigits(phoneValidationCode).length !== 6) {
      setPhoneValidationError('Informe o código de 6 dígitos enviado por WhatsApp.');
      return;
    }

    setIsValidatingPhoneCode(true);
    setPhoneValidationError(null);
    setPhoneValidationSuccessMessage(null);

    try {
      const response = await fetch(buildPublicApiUrl('/phone-validation-codes/validate'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          code: normalizeDigits(phoneValidationCode),
        }),
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || 'Não foi possível validar o código informado.');
      }

      setPhoneValidationSuccessMessage(data.message || 'Telefone validado com sucesso.');
      const refreshedUser = await fetchAuthenticatedUser(token);

      if (isPhoneValidated(refreshedUser)) {
        onAuthSuccess();
      }
    } catch (err) {
      setPhoneValidationError(err instanceof Error ? err.message : 'Não foi possível validar o código informado.');
    } finally {
      setIsValidatingPhoneCode(false);
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

  if (token && !user && isFetchingUser) {
    return (
      <div id="auth-step-section" className="theme-card-soft p-4">
        <p className="theme-text-secondary text-sm">Carregando sua conta...</p>
      </div>
    );
  }

  if (user) {
    return (
      <div id="auth-step-section" className="space-y-4">
        <div className="theme-panel-success flex items-center justify-between p-4">
          <div className="flex items-center">
            {user.img ? (
              <img src={user.img} alt={user.nome} className="w-12 h-12 rounded-full mr-4 object-cover" />
            ) : (
              <div className="theme-panel-accent theme-text-accent mr-4 flex h-12 w-12 items-center justify-center rounded-full font-semibold">
                {user.nome.slice(0, 2).toUpperCase()}
              </div>
            )}
            <div>
              <p className="theme-text-primary font-bold">{user.nome}</p>
              <p className="theme-text-secondary text-sm">{user.email}</p>
            </div>
          </div>
          <button onClick={handleLogout} className="theme-text-danger transition-colors hover:opacity-80">
            <LogOut size={24} />
          </button>
        </div>

        {isPhoneValidationRequired(user) ? (
          <PhoneValidationForm
            ddi={phoneValidationPrefix}
            phone={phoneValidationPhone}
            code={phoneValidationCode}
            isCodeSent={hasPhoneValidationCodeBeenSent}
            isSendingCode={isSendingPhoneValidationCode}
            isValidatingCode={isValidatingPhoneCode}
            resendCooldownSeconds={phoneValidationResendCooldownSeconds}
            error={phoneValidationError}
            successMessage={phoneValidationSuccessMessage}
            onDdiChange={(value) => {
              setPhoneValidationPrefix(value);
              setPhoneValidationPhone('');
              setPhoneValidationError(null);
              setPhoneValidationSuccessMessage(null);
              setHasPhoneValidationCodeBeenSent(false);
              setPhoneValidationResendCooldownSeconds(0);
            }}
            onPhoneChange={(value) => {
              setPhoneValidationPhone(value);
              setPhoneValidationError(null);
            }}
            onCodeChange={(value) => {
              setPhoneValidationCode(value);
              setPhoneValidationError(null);
            }}
            onSendCode={handleSendPhoneValidationCode}
            onValidateCode={handleValidatePhoneCode}
          />
        ) : (
          <button onClick={onAuthSuccess} className="theme-primary-btn w-full px-4 py-3 font-medium">
            Continuar como {user.nome.split(' ')[0]}
          </button>
        )}
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
        <RegisterForm name={name} email={email} password={password} confirmPassword={confirmPassword} country={country} phonePrefix={phonePrefix} phone={phone} errors={formErrors} onNameChange={setName} onEmailChange={setEmail} onPasswordChange={setPassword} onConfirmPasswordChange={setConfirmPassword} onCountryChange={setCountry} onPhonePrefixChange={(value) => {
          setPhonePrefix(value);
          setPhone('');
        }} onPhoneChange={setPhone} />
      )}

      {error && <p className="theme-text-danger mt-2 text-sm">{error}</p>}

      <button type="submit" disabled={isLoading} className="theme-primary-btn w-full px-4 py-3 font-medium">
        {isLoading ? 'Processando...' : (hasAccount ? 'Entrar' : 'Criar Conta e Continuar')}
      </button>
    </form>
  );
};

export default AuthStep;