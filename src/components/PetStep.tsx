import React, { useState, useEffect } from 'react';
import useAuthStore from '../store/authStore';
import { Pet, PetType } from '../types';
import { PawPrint, PlusCircle } from 'lucide-react';

interface PetStepProps {
  onPetSelected: (petId: number) => void;
}

const PetStep: React.FC<PetStepProps> = ({ onPetSelected }) => {
  const { token } = useAuthStore();
  const [userPets, setUserPets] = useState<Pet[]>([]);
  const [petTypes, setPetTypes] = useState<PetType[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showNewPetForm, setShowNewPetForm] = useState(false);

  // New Pet Form State
  const [newPetName, setNewPetName] = useState('');
  const [newPetType, setNewPetType] = useState<number | null>(null);
  const [newPetSex, setNewPetSex] = useState<'M' | 'F' | null>(null);
  const [isCreatingPet, setIsCreatingPet] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  useEffect(() => {
    const fetchData = async () => {
      if (!token) {
        setError("Você precisa estar logado para ver seus pets.");
        setIsLoading(false);
        return;
      }
      try {
        const [petsResponse, typesResponse] = await Promise.all([
          fetch(`${import.meta.env.VITE_API_URL}/pet`, {
            headers: { Authorization: `Bearer ${token}` },
          }),
          fetch(`${import.meta.env.VITE_API_URL}/pet-types`),
        ]);

        if (!petsResponse.ok) throw new Error('Falha ao buscar seus pets.');
        if (!typesResponse.ok) throw new Error('Falha ao buscar os tipos de pet.');

        const petsData = await petsResponse.json();
        const typesData = await typesResponse.json();

        setUserPets(petsData);
        setPetTypes(typesData);
        if (petsData.length === 0) {
          setShowNewPetForm(true);
        }
      } catch (e) {
        setError(e instanceof Error ? e.message : 'Ocorreu um erro.');
      } finally {
        setIsLoading(false);
      }
    };
    fetchData();
  }, [token]);

  const handleCreatePet = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPetName || !newPetType || !newPetSex) {
      setFormError("Todos os campos são obrigatórios.");
      return;
    }
    setFormError(null);
    setIsCreatingPet(true);
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/pet`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          nome: newPetName,
          tipo_pet_id: newPetType,
          sexo: newPetSex,
        }),
      });
      const createdPet = await response.json();
      if (!response.ok) throw new Error(createdPet.message || 'Erro ao criar pet.');
      onPetSelected(createdPet.id);
    } catch (err) {
      setFormError(err instanceof Error ? err.message : 'Ocorreu um erro.');
    } finally {
      setIsCreatingPet(false);
    }
  };

  if (isLoading) return <div>Carregando seus pets...</div>;
  if (error) return <div className="text-red-600">{error}</div>;

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-xl font-bold text-gray-800 mb-4">Selecione o Pet</h3>
        <div className="space-y-3">
          {userPets.map((pet) => (
            <button key={pet.id} onClick={() => onPetSelected(pet.id)} className="w-full text-left p-4 border border-gray-200 rounded-lg hover:bg-indigo-50 hover:border-indigo-500 transition-colors flex items-center">
              <img src={pet.foto} alt={pet.nome} className="w-12 h-12 rounded-full mr-4 object-cover" />
              <div>
                <p className="font-bold">{pet.nome}</p>
                <p className="text-sm text-gray-500">{pet.tipo.nome}</p>
              </div>
            </button>
          ))}
        </div>
      </div>

      {!showNewPetForm && (
        <button onClick={() => setShowNewPetForm(true)} className="w-full flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-indigo-600 hover:bg-indigo-100 transition-colors">
          <PlusCircle size={20} />
          Cadastrar outro pet
        </button>
      )}

      {showNewPetForm && (
        <form onSubmit={handleCreatePet} className="p-4 border-t mt-6 pt-6 space-y-4">
          <h4 className="text-lg font-bold text-gray-800">Cadastrar Novo Pet</h4>
          <div>
            <label htmlFor="petName" className="block text-sm font-medium text-gray-700 mb-1">Nome do Pet</label>
            <input type="text" id="petName" value={newPetName} onChange={(e) => setNewPetName(e.target.value)} className="w-full p-2 border border-gray-300 rounded-lg" required />
          </div>
          <div>
            <label htmlFor="petType" className="block text-sm font-medium text-gray-700 mb-1">Tipo</label>
            <select id="petType" value={newPetType || ''} onChange={(e) => setNewPetType(Number(e.target.value))} className="w-full p-2 border border-gray-300 rounded-lg" required>
              <option value="">Selecione</option>
              {petTypes.map(type => <option key={type.id} value={type.id}>{type.nome}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Sexo</label>
            <div className="flex gap-4">
                <button type="button" onClick={() => setNewPetSex('M')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${newPetSex === 'M' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300'}`}>Macho</button>
                <button type="button" onClick={() => setNewPetSex('F')} className={`flex-1 py-2 px-4 rounded-lg font-medium transition-colors ${newPetSex === 'F' ? 'bg-indigo-600 text-white' : 'bg-white border border-gray-300'}`}>Fêmea</button>
            </div>
          </div>
          {formError && <p className="text-red-600 text-sm">{formError}</p>}
          <button type="submit" disabled={isCreatingPet} className="w-full py-3 px-4 rounded-lg text-white font-medium bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 transition-colors">
            {isCreatingPet ? 'Salvando...' : 'Salvar e Continuar'}
          </button>
        </form>
      )}
    </div>
  );
};

export default PetStep;