export interface Company {
  id: string;
  name: string;
  logo: string;
  coverPhoto: string;
  description: string;
  phone?: string;
  whatsapp?: string;
  address?: {
    pais: string;
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
  };
  businessHours?: Array<{
    day: string;
    hours: string;
  }>;
  categories?: string[];
  media_avaliacoes: number | null;
  total_avaliacoes: string;
}

export interface Professional {
  id: number;
  usuario: {
    id: number;
    nome: string;
    img: string;
  };
}

export interface Service {
  id: string;
  companyId: string;
  name: string;
  description: string;
  duration: string;
  price: number;
  rating?: number;
  reviewCount?: number;
  images?: string[];
  tipo?: string;
}

export interface TimeSlot {
  time: string;
  duration: string;
  endTime: string;
  label: string;
  default_value: number;
  fixed_value: number | null;
  default_value_old: number;
  fixed_value_old: number | null;
  at_home: boolean;
  only_at_home: boolean;
  enable_fixed_scheduling: boolean;
  fixed_type: string;
  have_promotion: boolean;
  availableProfessionals: number[];
  active: boolean;
  motivo?: string;
}

export interface Sport {
  id: number;
  subcategoria: {
    id: number;
    esporte_nome: string | null;
  };
}

export interface AppointmentSlots {
  origem: string;
  tipo: string;
  is_court: boolean;
  selecao_pet: boolean;
  localidade: string;
  prazo_cancelamento: string;
  profissionais: Professional[];
  subcategorias: Sport[];
  horarios: TimeSlot[];
}

export interface PetType {
  id: number;
  slug: string;
  nome: string;
  created: string;
  modified: string | null;
}

export interface Pet {
  id: number;
  nome: string;
  sexo: 'M' | 'F';
  raca: string | null;
  foto: string;
  cliente_cliente_id: number;
  tipo: {
    id: number;
    nome: string;
  };
}

export interface User {
  id: number;
  nome: string;
  email: string;
  usuario: string;
  img: string;
  telefone: string | null;
  telefone_ddi: string;
  pais: string;
  cliente_id: number | null;
  cliente?: {
    id: number;
    sexo: 'M' | 'F';
    data_nascimento: string;
  }[];
}

export interface Appointment {
  id?: string;
  serviceId: string;
  date: string;
  timeSlot: string;
  customerName: string;
  customerEmail: string;
  isRecurring?: boolean;
  recurringType?: 'weekly' | 'monthly';
  isAtHome?: boolean;
  address?: string;
  professionalId?: number;
  sportId?: number;
  pet_id?: number;
  vouchersIds?: number[];
}

export interface BookingStep {
  id: number;
  title: string;
  description: string;
}

export interface Voucher {
  id: number;
  created: string;
  modified: string;
  deleted_at: string | null;
  validade_inicio: string;
  validade_fim: string;
  codigo: string;
  limite_uso: number;
  ativo: boolean;
  tipo_desconto: 'P' | 'V';
  valor_desconto: string | null;
  porcentagem_desconto: string | null;
  apenas_agendamentos_novos: boolean;
  descricao: string;
}