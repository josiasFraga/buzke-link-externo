import { Company, Service, TimeSlot, BookingStep } from '../types';

// Company data from payload
export const companies: Record<string, Company> = {
  'mdbeautystudio': {
    id: '73',
    name: 'MD beauty studio',
    logo: 'https://buzke-images.s3.sa-east-1.amazonaws.com/business/d9fe4d54213721131f7aa191990da0f0.png',
    coverPhoto: 'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=1200&h=400&q=80',
    description: 'Maquiadora(o), Designer e Micropigmentação de sobrancelhas, Depilação',
    phone: '(53) 99711-2186',
    whatsapp: '(53) 99711-2186',
    address: {
      pais: 'Brasil',
      street: 'Angelo Trindade',
      number: '1773',
      neighborhood: 'Humaita',
      city: 'Rio Grande',
      state: 'RS'
    },
    businessHours: [
      { day: 'Domingo', hours: '06:00 - 20:00' },
      { day: 'Segunda-feira', hours: '06:00 - 20:00' },
      { day: 'Terça-feira', hours: '06:00 - 20:00' },
      { day: 'Quarta-feira', hours: '06:00 - 20:00' },
      { day: 'Quinta-feira', hours: '06:00 - 20:00' },
      { day: 'Sexta-feira', hours: '06:00 - 20:00' },
      { day: 'Sábado', hours: '06:00 - 20:00' }
    ],
    categories: [
      'Maquiadora(o)',
      'Designer e Micropigmentação de sobrancelhas',
      'Depilação'
    ],
    media_avaliacoes: null,
    total_avaliacoes: "0"
  }
};

// Mock services data based on categories
export const services: Record<string, Service[]> = {
  'mdbeautystudio': [
    {
      id: 'service-1',
      companyId: '73',
      name: 'Maquiagem Profissional',
      description: 'Maquiagem completa para eventos especiais',
      duration: '60min',
      price: 150,
      rating: 4.8,
      reviewCount: 124,
      images: [
        'https://images.unsplash.com/photo-1487412947147-5cebf100ffc2?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500&q=80',
        'https://images.unsplash.com/photo-1512496015851-a90fb38ba796?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500&q=80'
      ]
    },
    {
      id: 'service-2',
      companyId: '73',
      name: 'Design de Sobrancelhas',
      description: 'Design profissional com henna',
      duration: '45min',
      price: 80,
      rating: 4.9,
      reviewCount: 156,
      images: [
        'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500&q=80'
      ]
    },
    {
      id: 'service-3',
      companyId: '73',
      name: 'Micropigmentação de Sobrancelhas',
      description: 'Procedimento semi-permanente para sobrancelhas perfeitas',
      duration: '120min',
      price: 450,
      rating: 5.0,
      reviewCount: 89,
      images: [
        'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500&q=80'
      ]
    },
    {
      id: 'service-4',
      companyId: '73',
      name: 'Depilação Completa',
      description: 'Depilação profissional para todas as áreas',
      duration: '90min',
      price: 200,
      rating: 4.7,
      reviewCount: 112,
      images: [
        'https://images.unsplash.com/photo-1560066984-138dadb4c035?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500&q=80'
      ]
    }
  ]
};

// Generate time slots for a given date
export const generateTimeSlots = (date: string): TimeSlot[] => {
  const slots: TimeSlot[] = [];
  const startHour = 6; // 6 AM based on business hours
  const endHour = 20; // 8 PM based on business hours
  
  for (let hour = startHour; hour < endHour; hour++) {
    for (let minutes = 0; minutes < 60; minutes += 30) {
      const startTime = `${hour.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
      const endTimeHour = minutes === 30 ? hour + 1 : hour;
      const endTimeMinutes = minutes === 30 ? 0 : 30;
      const endTime = `${endTimeHour.toString().padStart(2, '0')}:${endTimeMinutes.toString().padStart(2, '0')}`;
      
      // Mock data doesn't perfectly match TimeSlot, so we cast it.
      // This is just for mock data generation.
      slots.push({
        time: startTime,
        endTime,
        active: true,
      } as TimeSlot);
    }
  }
  
  return slots;
};

// Booking steps for the wizard
export const getBookingSteps = (requiresPetInfo: boolean, isAuthenticated: boolean): BookingStep[] => {
  const steps: BookingStep[] = [
    {
      id: 1,
      title: "Data e Hora",
      description: "Escolha o melhor horário"
    },
    {
      id: 2,
      title: "Login",
      description: "Acesse ou crie sua conta"
    }
  ];

  if (requiresPetInfo) {
    steps.push({
      id: 3,
      title: "Pet",
      description: "Selecione seu pet"
    });
  }

  steps.push({
    id: requiresPetInfo ? 4 : 3,
    title: "Confirmação",
    description: "Revise e finalize"
  });

  return steps;
};

// Filter services by date (simulated)
export const filterServicesByDate = (services: Service[]): Service[] => {
  return services;
};