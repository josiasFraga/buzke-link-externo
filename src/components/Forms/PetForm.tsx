import React, { useState, useEffect, useRef } from 'react';
import { Pet, PetType } from '../../types';
import { PawPrint as Paw } from 'lucide-react';

interface PetFormProps {
  onSubmit: (pet: Pet) => void;
}

const PetForm: React.FC<PetFormProps> = ({ onSubmit }) => {
  const [petTypes, setPetTypes] = useState<PetType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errors, setErrors] = useState<{
    name?: string;
    type?: string;
    sex?: string;
  }>({});

  const [petName, setPetName] = useState('');
  const [petType, setPetType] = useState<number | null>(null);
  const [petSex, setPetSex] = useState<'F' | 'M' | null>(null);

  const nameInputRef = useRef<HTMLInputElement>(null);
  const typeSelectRef = useRef<HTMLSelectElement>(null);

  useEffect(() => {
    const fetchPetTypes = async () => {
      try {
        const response = await fetch(`${import.meta.env.VITE_API_URL}/pet-types`);
        const data = await response.json();
        setPetTypes(data);
      } catch (error) {
        console.error('Error fetching pet types:', error);
        setErrors({ ...errors, type: 'Erro ao carregar tipos de pet' });
      } finally {
        setIsLoading(false);
      }
    };

    fetchPetTypes();
  }, []);

  const validate = () => {
    const newErrors: typeof errors = {};
    let isValid = true;

    if (!petName.trim()) {
      newErrors.name = 'Nome do pet é obrigatório';
      isValid = false;
      nameInputRef.current?.focus();
    }

    if (!petType) {
      newErrors.type = 'Tipo do pet é obrigatório';
      isValid = false;
      if (!newErrors.name) {
        typeSelectRef.current?.focus();
      }
    }

    if (!petSex) {
      newErrors.sex = 'Sexo do pet é obrigatório';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (validate()) {
      onSubmit({
        nome: petName.trim(),
        sexo: petSex!,
        pet_tipo_id: petType!
      });
    }
  };

  if (isLoading) {
    return (
      <div className="animate-pulse">
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded mb-4"></div>
        <div className="h-10 bg-gray-200 rounded"></div>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="bg-indigo-50 p-4 rounded-lg">
        <div className="flex items-start mb-4">
          <Paw size={20} className="text-indigo-600 mr-2 mt-0.5 flex-shrink-0" />
          <div>
            <h4 className="font-medium text-indigo-800">Informações do Pet</h4>
            <p className="text-sm text-indigo-600 mt-1">
              Preencha os dados do seu pet para o atendimento
            </p>
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-1">
              Nome do Pet
            </label>
            <input
              ref={nameInputRef}
              type="text"
              id="petName"
              value={petName}
              onChange={(e) => {
                setPetName(e.target.value);
                if (errors.name) {
                  setErrors({ ...errors, name: undefined });
                }
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.name ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Digite o nome do seu pet"
            />
            {errors.name && (
              <p className="mt-1 text-sm text-red-600">{errors.name}</p>
            )}
          </div>

          <div>
            <label htmlFor="petType" className="block text-sm font-medium text-gray-700 mb-1">
              Tipo do Pet
            </label>
            <select
              ref={typeSelectRef}
              id="petType"
              value={petType || ''}
              onChange={(e) => {
                setPetType(Number(e.target.value));
                if (errors.type) {
                  setErrors({ ...errors, type: undefined });
                }
              }}
              className={`w-full px-4 py-2 border rounded-lg focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 ${
                errors.type ? 'border-red-500' : 'border-gray-300'
              }`}
            >
              <option value="">Selecione o tipo</option>
              {petTypes.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.nome}
                </option>
              ))}
            </select>
            {errors.type && (
              <p className="mt-1 text-sm text-red-600">{errors.type}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sexo do Pet
            </label>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={() => {
                  setPetSex('F');
                  if (errors.sex) {
                    setErrors({ ...errors, sex: undefined });
                  }
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  petSex === 'F'
                    ? 'bg-indigo-600 text-white'
                    : `bg-white border ${errors.sex ? 'border-red-500' : 'border-gray-300'} text-gray-700 hover:bg-gray-50`
                }`}
              >
                Fêmea
              </button>
              <button
                type="button"
                onClick={() => {
                  setPetSex('M');
                  if (errors.sex) {
                    setErrors({ ...errors, sex: undefined });
                  }
                }}
                className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${
                  petSex === 'M'
                    ? 'bg-indigo-600 text-white'
                    : `bg-white border ${errors.sex ? 'border-red-500' : 'border-gray-300'} text-gray-700 hover:bg-gray-50`
                }`}
              >
                Macho
              </button>
            </div>
            {errors.sex && (
              <p className="mt-1 text-sm text-red-600">{errors.sex}</p>
            )}
          </div>
        </div>
      </div>

      <button
        type="submit"
        className="w-full py-3 px-4 bg-indigo-600 text-white rounded-lg font-medium hover:bg-indigo-700 transition-colors shadow-sm"
      >
        Continuar
      </button>
    </form>
  );
};

export default PetForm;