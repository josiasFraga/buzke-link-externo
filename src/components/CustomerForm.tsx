import React, { useState } from 'react';
import { CheckCircle, Calendar } from 'lucide-react';
import { Service, TimeSlot } from '../types';
import LoginForm from './Forms/LoginForm';
import RegisterForm from './Forms/RegisterForm';
import RecurringOptions from './Forms/RecurringOptions';
import HomeServiceOptions from './Forms/HomeServiceOptions';
import PetForm from './Forms/PetForm';

interface CustomerFormProps {
  onSubmit: (
    name: string,
    email: string,
    isRecurring: boolean,
    recurringType: 'weekly' | 'monthly' | null,
    isAtHome: boolean,
    address: string,
    hasAccount: boolean,
    password: string,
    country: string,
    phonePrefix: string,
    phone: string,
    recurringDuration: string,
    petInfo?: {
      nome: string;
      sexo: 'F' | 'M';
      pet_tipo_id: number;
    }
  ) => void;
  isLoading: boolean;
  companyAllowsRecurring?: boolean;
  selectedTimeSlot: TimeSlot;
  selectedService: Service;
  selectedDate: string;
  onRecurringChange: (isRecurring: boolean) => void;
  requiresPetInfo?: boolean;
}

const CustomerForm: React.FC<CustomerFormProps> = ({
  onSubmit,
  isLoading,
  companyAllowsRecurring = true,
  selectedTimeSlot,
  selectedService,
  selectedDate,
  onRecurringChange,
  requiresPetInfo = false
}) => {
  const [hasAccount, setHasAccount] = useState(true);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [country, setCountry] = useState('Brasil');
  const [phonePrefix, setPhonePrefix] = useState('+55');
  const [phone, setPhone] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringType, setRecurringType] = useState<'weekly' | 'monthly' | null>(null);
  const [recurringDuration, setRecurringDuration] = useState('3M');
  const [isAtHome, setIsAtHome] = useState(false);
  const [address, setAddress] = useState('');
  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<number | null>(null);
  const [petSex, setPetSex] = useState<'F' | 'M' | null>(null);
  const [errors, setErrors] = useState({
    name: '',
    email: '',
    password: '',
    confirmPassword: '',
    address: '',
    phone: '',
    pet: ''
  });

  const handleAccountTypeChange = (newHasAccount: boolean) => {
    if (newHasAccount) {
      setName('');
      setCountry('Brasil');
      setPhonePrefix('+55');
      setPhone('');
      setPassword('');
      setConfirmPassword('');
    } else {
      setEmail('');
      setPassword('');
    }
    setHasAccount(newHasAccount);
    setErrors({
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      address: '',
      phone: '',
      pet: ''
    });
  };

  const validate = () => {
    const newErrors = {
      name: '',
      email: '',
      password: '',
      confirmPassword: '',
      address: '',
      phone: '',
      pet: ''
    };
    let isValid = true;

    if (!hasAccount) {
      if (!name.trim()) {
        newErrors.name = 'Nome é obrigatório';
        isValid = false;
      }

      if (password.length < 6 || password.length > 20) {
        newErrors.password = 'A senha deve ter entre 6 e 20 caracteres';
        isValid = false;
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = 'As senhas não coincidem';
        isValid = false;
      }

      const phoneNumbers = phone.replace(/\D/g, '');
      if (!phoneNumbers || 
          (phonePrefix === '+55' && phoneNumbers.length !== 11) || 
          (phonePrefix === '+598' && phoneNumbers.length !== 8)) {
        newErrors.phone = 'Telefone inválido';
        isValid = false;
      }
    } else {
      if (password.length > 20) {
        newErrors.password = 'A senha deve ter no máximo 20 caracteres';
        isValid = false;
      }
    }

    if (!email.trim()) {
      newErrors.email = 'Email é obrigatório';
      isValid = false;
    } else if (!/\S+@\S+\.\S+/.test(email)) {
      newErrors.email = 'Email é inválido';
      isValid = false;
    }

    if (isAtHome && !address.trim()) {
      newErrors.address = 'Endereço é obrigatório para atendimento a domicílio';
      isValid = false;
    }

    if (requiresPetInfo) {
      if (!petName.trim()) {
        newErrors.pet = 'Nome do pet é obrigatório';
        isValid = false;
      }
      if (!petType) {
        newErrors.pet = 'Tipo do pet é obrigatório';
        isValid = false;
      }
      if (!petSex) {
        newErrors.pet = 'Sexo do pet é obrigatório';
        isValid = false;
      }
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validate()) {
      const petInfo = requiresPetInfo ? {
        nome: petName,
        sexo: petSex!,
        pet_tipo_id: petType!
      } : undefined;

      onSubmit(
        name,
        email,
        isRecurring,
        recurringType,
        isAtHome,
        address,
        hasAccount,
        password,
        country,
        phonePrefix,
        phone,
        isRecurring ? recurringDuration : '',
        petInfo
      );
    }
  };

  const handleCountryChange = (value: string) => {
    setCountry(value);
    setPhonePrefix(value === 'Brasil' ? '+55' : '+598');
    setPhone('');
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      <div className="flex gap-4 mb-6">
        <button
          type="button"
          onClick={() => handleAccountTypeChange(true)}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            hasAccount
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Já tenho conta
        </button>
        <button
          type="button"
          onClick={() => handleAccountTypeChange(false)}
          className={`flex-1 py-3 px-4 rounded-lg font-medium transition-colors ${
            !hasAccount
              ? 'bg-indigo-600 text-white'
              : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
          }`}
        >
          Criar uma conta
        </button>
      </div>

      {hasAccount ? (
        <LoginForm
          email={email}
          password={password}
          errors={errors}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
        />
      ) : (
        <RegisterForm
          name={name}
          email={email}
          password={password}
          confirmPassword={confirmPassword}
          country={country}
          phonePrefix={phonePrefix}
          phone={phone}
          errors={errors}
          onNameChange={setName}
          onEmailChange={setEmail}
          onPasswordChange={setPassword}
          onConfirmPasswordChange={setConfirmPassword}
          onCountryChange={handleCountryChange}
          onPhoneChange={setPhone}
        />
      )}

      {requiresPetInfo && (
        <PetForm
          petName={petName}
          petType={petType}
          petSex={petSex}
          onPetNameChange={setPetName}
          onPetTypeChange={setPetType}
          onPetSexChange={setPetSex}
          error={errors.pet}
        />
      )}

      {companyAllowsRecurring && selectedTimeSlot?.enable_fixed_scheduling && (
        <RecurringOptions
          isRecurring={isRecurring}
          recurringDuration={recurringDuration}
          onRecurringChange={(value) => {
            setIsRecurring(value);
            onRecurringChange(value);
            if (!value) {
              setRecurringDuration('3M');
            }
          }}
          onDurationChange={setRecurringDuration}
          fixedType={selectedTimeSlot?.fixed_type}
        />
      )}

      {selectedTimeSlot?.at_home && (
        <HomeServiceOptions
          isAtHome={isAtHome}
          address={address}
          onAtHomeChange={setIsAtHome}
          onAddressChange={setAddress}
          isRequired={selectedTimeSlot?.only_at_home}
          error={errors.address}
        />
      )}

      <div className="mt-6 mb-6 p-4 bg-indigo-50 rounded-lg">
        <div className="flex items-start">
          <Calendar size={20} className="text-indigo-600 mr-3 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-bold text-gray-800">{selectedService.name}</h4>
            <p className="text-sm text-gray-600 mt-1">
              {new Date(selectedDate).toLocaleDateString('pt-BR', {
                weekday: 'long',
                month: 'long',
                day: 'numeric'
              })}
              {' às '}
              {selectedTimeSlot.time}
            </p>
            {selectedTimeSlot.default_value && (
              <div className="mt-2">
                {selectedTimeSlot.have_promotion && (
                  <div className="flex items-center gap-2">
                    <span className="line-through text-gray-500">
                      R$ {selectedTimeSlot.default_value_old}
                    </span>
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2 py-0.5 rounded">
                      Promoção
                    </span>
                  </div>
                )}
                <p className={`text-lg font-medium ${selectedTimeSlot.have_promotion ? 'text-green-600' : 'text-indigo-600'} mt-1`}>
                  R$ {selectedTimeSlot.default_value}
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="bg-gray-50 p-4 rounded-lg">
        <div className="flex items-start">
          <CheckCircle size={20} className="text-green-500 mr-2 mt-0.5 flex-shrink-0" />
          <p className="text-sm text-gray-600">
            Ao concluir este agendamento, você concorda com nossos{' '}
            <a href="https://buzke.com.br/termos-de-uso" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              Termos de Serviço
            </a>{' '}
            e{' '}
            <a href="https://buzke.com.br/termos-de-uso#privacy_policy" target="_blank" rel="noopener noreferrer" className="text-indigo-600 hover:underline">
              Política de Privacidade
            </a>
            .
          </p>
        </div>
      </div>

      <button
        type="submit"
        disabled={isLoading}
        className={`w-full py-3 px-4 rounded-lg text-white font-medium ${
          isLoading ? 'bg-indigo-400 cursor-not-allowed' : 'bg-indigo-600 hover:bg-indigo-700'
        } transition-colors shadow-sm`}
      >
        {isLoading ? (
          <div className="flex items-center justify-center">
            <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
            </svg>
            Processando...
          </div>
        ) : 'Concluir Agendamento'}
      </button>
    </form>
  );
};

export default CustomerForm;