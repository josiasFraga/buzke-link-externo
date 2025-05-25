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
      name: 'Maquiagem Profissional',
      description: 'Maquiagem completa para eventos especiais',
      duration: 60,
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
      name: 'Design de Sobrancelhas',
      description: 'Design profissional com henna',
      duration: 45,
      price: 80,
      rating: 4.9,
      reviewCount: 156,
      images: [
        'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500&q=80'
      ]
    },
    {
      id: 'service-3',
      name: 'Micropigmentação de Sobrancelhas',
      description: 'Procedimento semi-permanente para sobrancelhas perfeitas',
      duration: 120,
      price: 450,
      rating: 5.0,
      reviewCount: 89,
      images: [
        'https://images.unsplash.com/photo-1616394584738-fc6e612e71b9?ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D&auto=format&fit=crop&w=800&h=500&q=80'
      ]
    },
    {
      id: 'service-4',
      name: 'Depilação Completa',
      description: 'Depilação profissional para todas as áreas',
      duration: 90,
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
      
      slots.push({
        id: `${date}-${startTime}`,
        startTime,
        endTime,
        available: true
      });
    }
  }
  
  return slots;
};

// Booking steps for the wizard
export const getBookingSteps = (requiresPetInfo: boolean): BookingStep[] => {
  if (requiresPetInfo) {
    return [
      {
        id: 1,
        title: "Selecionar Data e Hora",
        description: "Escolha quando deseja agendar seu compromisso"
      },
      {
        id: 2,
        title: "Informações do Pet",
        description: "Diga-nos sobre o pet que será atendido"
      },
      {
        id: 3,
        title: "Suas Informações",
        description: "Diga-nos quem você é para que possamos contatá-lo"
      },
      {
        id: 4,
        title: "Confirmação",
        description: "Revise e confirme os detalhes do seu agendamento"
      }
    ];
  }

  return [
    {
      id: 1,
      title: "Selecionar Data e Hora",
      description: "Escolha quando deseja agendar seu compromisso"
    },
    {
      id: 2,
      title: "Suas Informações",
      description: "Diga-nos quem você é para que possamos contatá-lo"
    },
    {
      id: 3,
      title: "Confirmação",
      description: "Revise e confirme os detalhes do seu agendamento"
    }
  ];
};

// Filter services by date (simulated)
export const filterServicesByDate = (services: Service[], date: string): Service[] => {
  return services;
};