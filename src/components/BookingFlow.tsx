import React, { useEffect, useMemo, useRef, useState } from 'react';
import { ArrowLeft, BookOpen, Calendar, CalendarCheck, CheckCircle2, Clock3, Sparkles, Trophy, UserRound } from 'lucide-react';
import { Appointment, AppointmentSlotInterestType, AppointmentSlots, AvailableProfessional, AvailableTeacher, LessonType, Professional, Service, TimeSlot, Voucher } from '../types';
import { getBookingSteps } from '../data/mockData';
import AuthStep from './AuthStep';
import BookingConfirmation from './BookingConfirmation';
import BookingSteps from './BookingSteps';
import ConfirmationStep from './ConfirmationStep';
import DatePicker from './DatePicker';
import { createAppointmentSlotInterest } from '../lib/appointment-slot-interests';
import { buildPublicApiUrl } from '../lib/public-api';
import { useToast } from './feedback/ToastProvider';
import useAuthStore from '../store/authStore';
import Modal from './Modal';
import PetStep from './PetStep';
import PaymentCheckout from './PaymentCheckout';
import ProfessionalSelector from './ProfessionalSelector';
import SportSelector from './SportSelector';
import LessonTypeSelector from './LessonTypeSelector';
import TimeSlotPicker from './TimeSlotPicker';
import { useTheme } from './theme/ThemeProvider';
import { getServiceImageSources } from '../lib/service-images';

interface BookingFlowProps {
  selectedService: Service;
  selectedDate: string | null;
  selectedTimeSlots: TimeSlot[];
  timeSlots: TimeSlot[];
  onSelectDate: (date: string) => void;
  onToggleTimeSlot: (timeSlotId: string) => void;
  onDateSelected?: () => void;
  appointmentData: AppointmentSlots | null;
  onRefreshTimeSlots?: () => Promise<void> | void;
  containerRef?: React.RefObject<HTMLDivElement>;
  showServiceSummary?: boolean;
  stickySteps?: boolean;
  showSelectionSidebar?: boolean;
}

interface PendingInterestRequest {
  slot: TimeSlot;
  type: AppointmentSlotInterestType;
}

interface LessonTypeListResponse {
  items: LessonType[];
}

type BookingScheduleType = 'normal' | 'lesson';

function formatDateForTeacherQuery(date: string) {
  const [year, month, day] = date.split('-');

  return `${day}/${month}/${year}`;
}

function formatTimeForTeacherQuery(time: string) {
  return time.length === 5 ? `${time}:00` : time;
}

function formatDateTimeForAvailability(date: string, time: string) {
  return `${formatDateForTeacherQuery(date)} ${formatTimeForTeacherQuery(time)}`;
}

function appendArrayParam(params: URLSearchParams, key: string, values: string[]) {
  values.forEach((value) => {
    params.append(`${key}[]`, value);
  });
}

function toAvailableProfessional(professional: AvailableProfessional): Professional & { available: boolean } {
  return {
    id: professional.id,
    available: professional.available,
    usuario: {
      id: professional.id,
      nome: professional.nome,
      img: professional.img ?? null,
    },
  };
}

function normalizeAvailableProfessionals(data: unknown): Array<Professional & { available: boolean }> {
  const payload = Array.isArray(data)
    ? data
    : data && typeof data === 'object' && Array.isArray((data as { data?: unknown }).data)
      ? (data as { data: unknown[] }).data
      : [];

  return payload.map((item) => toAvailableProfessional(item as AvailableProfessional));
}

function getInterestTypesForSlot(slot: TimeSlot): AppointmentSlotInterestType[] {
  const interestTypes: AppointmentSlotInterestType[] = [];

  if (slot.interest_options?.occasional) {
    interestTypes.push('occasional');
  }

  if (slot.occupied_by_fixed && slot.interest_options?.fixed_series) {
    interestTypes.push('fixed_series');
  }

  return interestTypes;
}

function getInterestTypeLabel(type: AppointmentSlotInterestType) {
  return type === 'fixed_series' ? 'Interesse fixo' : 'Interesse avulso';
}

function getInterestTypeDescription(type: AppointmentSlotInterestType) {
  return type === 'fixed_series'
    ? 'Você só recebe aviso se o titular atual desistir desse horário fixo. Se isso acontecer, você decide depois se quer ficar com ele.'
    : 'Você recebe aviso se esse horário for cancelado nesta data. Se a vaga abrir, você decide depois se quer ficar com ela.';
}

function formatCurrency(value: number) {
  return value.toLocaleString('pt-BR', {
    style: 'currency',
    currency: 'BRL',
  });
}

function parseDurationToMinutes(duration: string) {
  const [hours = '0', minutes = '0', seconds = '0'] = duration.split(':');
  const parsedHours = Number(hours);
  const parsedMinutes = Number(minutes);
  const parsedSeconds = Number(seconds);

  if (!Number.isFinite(parsedHours) || !Number.isFinite(parsedMinutes) || !Number.isFinite(parsedSeconds)) {
    return 0;
  }

  return (parsedHours * 60) + parsedMinutes + Math.ceil(parsedSeconds / 60);
}

function formatDurationFromMinutes(totalMinutes: number) {
  if (totalMinutes <= 0) {
    return null;
  }

  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours > 0 && minutes > 0) {
    return `${hours}h${minutes.toString().padStart(2, '0')}`;
  }

  if (hours > 0) {
    return `${hours}h`;
  }

  return `${minutes}min`;
}

const BookingFlow: React.FC<BookingFlowProps> = ({
  selectedService,
  selectedDate,
  selectedTimeSlots,
  timeSlots,
  onSelectDate,
  onToggleTimeSlot,
  onDateSelected,
  appointmentData,
  onRefreshTimeSlots,
  containerRef,
  showServiceSummary = true,
  stickySteps = false,
  showSelectionSidebar = false,
}) => {
  const { theme } = useTheme();
  const { showToast } = useToast();
  const { isAuthenticated, token } = useAuthStore();
  const internalContainerRef = useRef<HTMLDivElement>(null);
  const activeContainerRef = containerRef || internalContainerRef;
  const lastErrorToastRef = useRef<string | null>(null);
  const lastInterestErrorToastRef = useRef<string | null>(null);

  const [bookingStep, setBookingStep] = useState(1);
  const [appointment, setAppointment] = useState<Appointment | null>(null);
  const [selectedProfessionalId, setSelectedProfessionalId] = useState<number | null>(null);
  const [selectedSportId, setSelectedSportId] = useState<number | null>(null);
  const [selectedLessonTypeId, setSelectedLessonTypeId] = useState<number | null>(null);
  const [bookingScheduleType, setBookingScheduleType] = useState<BookingScheduleType | null>(null);
  const [lessonTypes, setLessonTypes] = useState<LessonType[]>([]);
  const [isLoadingLessonTypes, setIsLoadingLessonTypes] = useState(false);
  const [availableProfessionals, setAvailableProfessionals] = useState<Array<Professional & { available: boolean }>>([]);
  const [isLoadingAvailableProfessionals, setIsLoadingAvailableProfessionals] = useState(false);
  const [availableLessonTeachers, setAvailableLessonTeachers] = useState<AvailableTeacher[]>([]);
  const [isLoadingLessonTeachers, setIsLoadingLessonTeachers] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedPetId, setSelectedPetId] = useState<number | null>(null);
  const [appliedVoucher, setAppliedVoucher] = useState<Voucher | null>(null);
  const [interestSelectionSlot, setInterestSelectionSlot] = useState<TimeSlot | null>(null);
  const [interestSelectionType, setInterestSelectionType] = useState<AppointmentSlotInterestType | null>(null);
  const [pendingInterestRequest, setPendingInterestRequest] = useState<PendingInterestRequest | null>(null);
  const [interestLoadingAppointmentId, setInterestLoadingAppointmentId] = useState<number | null>(null);
  const [interestError, setInterestError] = useState<string | null>(null);
  const [interestSuccess, setInterestSuccess] = useState<string | null>(null);

  const requiresPetInfo = appointmentData?.selecao_pet || false;
  const bookingSteps = useMemo(() => getBookingSteps(requiresPetInfo), [requiresPetInfo]);
  const finalStep = bookingSteps.length + 1;
  const timeSlotsLoaded = timeSlots.length > 0;
  const isLoadingTimeSlots = Boolean(selectedDate && !appointmentData);
  const selectedTimeSlotData = selectedTimeSlots[0] ?? null;
  const selectedTimeSlot = selectedTimeSlotData?.time ?? null;
  const hasSelectedTimeSlots = selectedTimeSlots.length > 0;
  const selectedTimeSlotsKey = selectedTimeSlots.map((slot) => `${slot.time}-${slot.duration}`).join('|');
  const selectedSlotsAllowLesson = hasSelectedTimeSlots && selectedTimeSlots.every((slot) => Boolean(slot.permite_agendamento_aula));
  const isLessonBooking = selectedSlotsAllowLesson && bookingScheduleType === 'lesson';
  const canShowNormalBookingFlow = !selectedSlotsAllowLesson || bookingScheduleType === 'normal';
  const requiresBookingScheduleType = Boolean(hasSelectedTimeSlots && selectedSlotsAllowLesson);
  const showLessonTypeSelector = Boolean(hasSelectedTimeSlots && selectedSlotsAllowLesson);
  const showNormalProfessionalSelector = Boolean(hasSelectedTimeSlots && canShowNormalBookingFlow && appointmentData?.tipo === 'Serviço');
  const showSportSelector = Boolean(hasSelectedTimeSlots && ((canShowNormalBookingFlow && appointmentData?.tipo === 'Quadra') || isLessonBooking));
  const showLessonClassTypeSelector = Boolean(isLessonBooking && selectedSportId);
  const showLessonTeacherSelector = Boolean(isLessonBooking && selectedSportId && selectedLessonTypeId && selectedTimeSlotData);
  const showProfessionalSelector = showNormalProfessionalSelector || showLessonTeacherSelector;
  const stickySectionTopClassName = stickySteps ? 'top-[8.75rem] sm:top-[10.25rem] lg:top-[10.75rem]' : '';
  const sidebarStickyTopClassName = bookingStep === 1 ? 'lg:top-[11.5rem]' : 'lg:top-[8.75rem]';
  const selectedProfessional = useMemo(
    () => {
      if (isLessonBooking) {
        return availableLessonTeachers.find((teacher) => teacher.id === selectedProfessionalId) || null;
      }

      return availableProfessionals.find((professional) => professional.id === selectedProfessionalId) || null;
    },
    [availableLessonTeachers, availableProfessionals, isLessonBooking, selectedProfessionalId]
  );
  const selectedSport = useMemo(
    () => appointmentData?.subcategorias?.find((sport) => sport.id === selectedSportId) || null,
    [appointmentData?.subcategorias, selectedSportId]
  );
  const selectedLessonType = useMemo(
    () => lessonTypes.find((lessonType) => lessonType.id === selectedLessonTypeId) || null,
    [lessonTypes, selectedLessonTypeId]
  );
  const selectedLessonTypePrice = useMemo(() => {
    if (!isLessonBooking || !selectedLessonTypeId || !selectedProfessionalId) {
      return null;
    }

    const selectedTeacher = availableLessonTeachers.find((teacher) => teacher.id === selectedProfessionalId);

    return selectedTeacher?.precos_tipos_aula?.find((price) => price.cliente_aula_tipo_id === selectedLessonTypeId) || null;
  }, [availableLessonTeachers, isLessonBooking, selectedLessonTypeId, selectedProfessionalId]);
  const sidebarPriceValue = useMemo(() => {
    if (!hasSelectedTimeSlots) {
      return isLessonBooking ? (selectedLessonTypePrice?.valor ?? null) : selectedService.price;
    }

    if (isLessonBooking) {
      return selectedLessonTypePrice ? selectedTimeSlots.length * selectedLessonTypePrice.valor : null;
    }

    return selectedTimeSlots.reduce((total, slot) => total + slot.default_value, 0);
  }, [hasSelectedTimeSlots, isLessonBooking, selectedLessonTypePrice, selectedService.price, selectedTimeSlots]);
  const sidebarPriceLabel = selectedTimeSlots.length > 1
    ? 'Valor total'
    : isLessonBooking
      ? 'Valor da aula'
      : 'Valor inicial';
  const sidebarPriceDisplay = sidebarPriceValue && sidebarPriceValue > 0
    ? formatCurrency(sidebarPriceValue)
    : isLessonBooking && selectedLessonType
      ? 'Selecione um professor'
      : 'Consulte';
  const sidebarDurationDisplay = useMemo(() => {
    if (!hasSelectedTimeSlots) {
      return selectedService.duration;
    }

    const totalMinutes = selectedTimeSlots.reduce(
      (total, slot) => total + parseDurationToMinutes(slot.duration),
      0
    );

    return formatDurationFromMinutes(totalMinutes) || selectedService.duration;
  }, [hasSelectedTimeSlots, selectedService.duration, selectedTimeSlots]);
  const selectedSubcategoryId = selectedSport?.subcategoria.id ?? null;
  const showDesktopSidebar = showSelectionSidebar && bookingStep < finalStep;
  const selectedServiceImages = useMemo(
    () => getServiceImageSources(selectedService.images, theme),
    [selectedService.images, theme]
  );

  const formatSelectedDate = (date: string | null) => {
    if (!date) {
      return 'Escolha no calendario';
    }

    const [year, month, day] = date.split('-').map(Number);
    const formattedDate = new Date(year, (month || 1) - 1, day || 1);

    return new Intl.DateTimeFormat('pt-BR', {
      weekday: 'long',
      day: '2-digit',
      month: 'long',
      year: 'numeric',
    }).format(formattedDate);
  };

  const summaryItems = [
    {
      id: 'date',
      label: 'Data',
      value: formatSelectedDate(selectedDate),
      icon: Calendar,
      ready: Boolean(selectedDate),
    },
    {
      id: 'time',
      label: 'Horario',
      value: selectedTimeSlots.length > 0
        ? selectedTimeSlots.map((slot) => slot.time).join(', ')
        : 'Selecione um horario',
      icon: Clock3,
      ready: hasSelectedTimeSlots,
    },
    ...(isLessonBooking
      ? [{
          id: 'lessonType',
          label: 'Tipo de aula',
          value: selectedLessonType?.nome || 'Selecione um tipo de aula',
          icon: BookOpen,
          ready: Boolean(selectedLessonType),
        }]
      : []),
    {
      id: 'professional',
      label: isLessonBooking ? 'Professor da aula' : appointmentData?.tipo === 'Quadra' ? 'Esporte' : 'Profissional',
      value: isLessonBooking
        ? selectedProfessional?.usuario.nome || (selectedSport ? 'Selecione um professor' : 'Selecione um esporte')
        : appointmentData?.tipo === 'Quadra'
          ? selectedSport?.subcategoria.esporte_nome || 'Selecione um esporte'
          : selectedProfessional?.usuario.nome || (appointmentData?.tipo === 'Serviço' ? 'Selecione um profissional' : 'Nao se aplica'),
      icon: isLessonBooking ? UserRound : appointmentData?.tipo === 'Quadra' ? Trophy : UserRound,
      ready: isLessonBooking ? Boolean(selectedProfessional) : appointmentData?.tipo === 'Quadra' ? Boolean(selectedSport) : appointmentData?.tipo === 'Serviço' ? Boolean(selectedProfessional) : true,
    },
  ];

  const scrollToFlowSection = (sectionId: string, pageOffset = 172) => {
    const section = document.getElementById(sectionId);

    if (!section) {
      return;
    }

    const modalElement = section.closest('.overflow-y-auto');

    if (modalElement) {
      const modalRect = modalElement.getBoundingClientRect();
      const sectionRect = section.getBoundingClientRect();
      const top = sectionRect.top - modalRect.top + modalElement.scrollTop - 16;

      modalElement.scrollTo({
        top: Math.max(top, 0),
        behavior: 'smooth',
      });

      return;
    }

    const top = section.getBoundingClientRect().top + window.scrollY - pageOffset;
    window.scrollTo({
      top: Math.max(top, 0),
      behavior: 'smooth',
    });
  };

  useEffect(() => {
    if (!activeContainerRef.current) {
      return;
    }

    setTimeout(() => {
      requestAnimationFrame(() => {
        activeContainerRef.current?.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }, 100);
  }, [activeContainerRef, appointment, bookingStep]);

  useEffect(() => {
    if (bookingStep !== finalStep || !appointment) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }, 80);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [appointment, bookingStep, finalStep]);

  useEffect(() => {
    if (bookingStep <= 1) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      scrollToFlowSection('booking-steps-scroll-anchor', 56);
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [bookingStep]);

  useEffect(() => {
    if (!error) {
      lastErrorToastRef.current = null;
      return;
    }

    if (lastErrorToastRef.current === error) {
      return;
    }

    lastErrorToastRef.current = error;
    showToast({ message: error, variant: 'error' });
  }, [error, showToast]);

  useEffect(() => {
    if (!interestError) {
      lastInterestErrorToastRef.current = null;
      return;
    }

    if (lastInterestErrorToastRef.current === interestError) {
      return;
    }

    lastInterestErrorToastRef.current = interestError;
    showToast({ message: interestError, variant: 'error' });
  }, [interestError, showToast]);

  useEffect(() => {
    if (!hasSelectedTimeSlots) {
      return;
    }

    const targetSectionId = showProfessionalSelector
      ? 'professional-selector-section'
      : showLessonClassTypeSelector
        ? 'lesson-type-selector-section'
      : showLessonTypeSelector
        ? 'lesson-type-section'
      : showSportSelector
        ? 'sport-selector-section'
        : null;

    if (!targetSectionId) {
      return;
    }

    const timeoutId = window.setTimeout(() => {
      scrollToFlowSection(targetSectionId);
    }, 120);

    return () => {
      window.clearTimeout(timeoutId);
    };
  }, [hasSelectedTimeSlots, showLessonClassTypeSelector, showLessonTypeSelector, showProfessionalSelector, showSportSelector]);

  useEffect(() => {
    setAvailableLessonTeachers([]);
    setIsLoadingLessonTeachers(false);
    setAvailableProfessionals([]);
    setIsLoadingAvailableProfessionals(false);
    setLessonTypes([]);
    setIsLoadingLessonTypes(false);
    setSelectedLessonTypeId(null);

    if (!hasSelectedTimeSlots) {
      setBookingScheduleType(null);
      return;
    }

    if (!selectedSlotsAllowLesson) {
      setBookingScheduleType('normal');
      return;
    }

    setBookingScheduleType(null);
  }, [hasSelectedTimeSlots, selectedSlotsAllowLesson, selectedTimeSlotsKey]);

  useEffect(() => {
    if (!isLessonBooking || !selectedSubcategoryId) {
      setLessonTypes([]);
      setIsLoadingLessonTypes(false);
      setSelectedLessonTypeId(null);
      return;
    }

    const abortController = new AbortController();
    const params = new URLSearchParams({
      empresa_id: selectedService.companyId,
      esporte_id: selectedSubcategoryId.toString(),
    });

    const headers = token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined;

    setError(null);
    setIsLoadingLessonTypes(true);

    fetch(buildPublicApiUrl(`/client-lesson-types/public?${params.toString()}`), {
      headers,
      signal: abortController.signal,
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Não foi possível listar os tipos de aula.');
        }

        return data as LessonTypeListResponse;
      })
      .then((result) => {
        const types = result.items || [];
        setLessonTypes(types);
        setSelectedLessonTypeId((currentTypeId) => {
          if (!currentTypeId) {
            return null;
          }

          const selectedTypeStillAvailable = types.some((lessonType) => lessonType.id === currentTypeId);

          return selectedTypeStillAvailable ? currentTypeId : null;
        });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setLessonTypes([]);
        setSelectedLessonTypeId(null);
        setError(err instanceof Error ? err.message : 'Não foi possível listar os tipos de aula.');
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoadingLessonTypes(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [isLessonBooking, selectedService.companyId, selectedSubcategoryId, token]);

  useEffect(() => {
    if (!showNormalProfessionalSelector || !selectedDate || selectedTimeSlots.length === 0) {
      setAvailableProfessionals([]);
      setIsLoadingAvailableProfessionals(false);
      return;
    }

    const abortController = new AbortController();
    const params = new URLSearchParams({
      servico_id: selectedService.id,
      cliente_id: selectedService.companyId,
    });
    const selectedDateTimes = selectedTimeSlots.map((slot) => formatDateTimeForAvailability(selectedDate, slot.time));
    const selectedDurations = selectedTimeSlots.map((slot) => formatTimeForTeacherQuery(slot.duration));

    appendArrayParam(params, 'datas_horarios', selectedDateTimes);
    appendArrayParam(params, 'duracoes', selectedDurations);

    const headers = token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined;

    setError(null);
    setIsLoadingAvailableProfessionals(true);

    fetch(buildPublicApiUrl(`/professionals/available?${params.toString()}`), {
      headers,
      signal: abortController.signal,
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Não foi possível listar os profissionais disponíveis.');
        }

        return normalizeAvailableProfessionals(data);
      })
      .then((professionals) => {
        setAvailableProfessionals(professionals);
        setSelectedProfessionalId((currentProfessionalId) => {
          if (!currentProfessionalId) {
            return null;
          }

          const selectedProfessionalStillAvailable = professionals.some(
            (professional) => professional.id === currentProfessionalId && professional.available
          );

          return selectedProfessionalStillAvailable ? currentProfessionalId : null;
        });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setAvailableProfessionals([]);
        setSelectedProfessionalId(null);
        setError(err instanceof Error ? err.message : 'Não foi possível listar os profissionais disponíveis.');
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoadingAvailableProfessionals(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [selectedDate, selectedService.companyId, selectedService.id, selectedTimeSlots, selectedTimeSlotsKey, showNormalProfessionalSelector, token]);

  useEffect(() => {
    if (!isLessonBooking || !selectedDate || !selectedSubcategoryId || !selectedLessonTypeId || !selectedTimeSlotData) {
      setAvailableLessonTeachers([]);
      setIsLoadingLessonTeachers(false);
      return;
    }

    const abortController = new AbortController();
    const params = new URLSearchParams({
      esporte_id: selectedSubcategoryId.toString(),
      data: formatDateForTeacherQuery(selectedDate),
      horario: formatTimeForTeacherQuery(selectedTimeSlotData.time),
      duracao: formatTimeForTeacherQuery(selectedTimeSlotData.duration),
      cliente_aula_tipo_id: selectedLessonTypeId.toString(),
      servico_id: selectedService.id,
      empresa_id: selectedService.companyId,
    });
    const selectedDateTimes = selectedTimeSlots.map((slot) => formatDateTimeForAvailability(selectedDate, slot.time));
    const selectedDurations = selectedTimeSlots.map((slot) => formatTimeForTeacherQuery(slot.duration));

    appendArrayParam(params, 'datas_horarios', selectedDateTimes);
    appendArrayParam(params, 'duracoes', selectedDurations);

    const headers = token
      ? {
          Authorization: `Bearer ${token}`,
        }
      : undefined;

    setError(null);
    setIsLoadingLessonTeachers(true);

    fetch(buildPublicApiUrl(`/client-teachers/available?${params.toString()}`), {
      headers,
      signal: abortController.signal,
    })
      .then(async (response) => {
        const data = await response.json();

        if (!response.ok) {
          throw new Error(data.message || 'Não foi possível listar os professores disponíveis.');
        }

        return data as AvailableTeacher[];
      })
      .then((teachers) => {
        setAvailableLessonTeachers(teachers);
        setSelectedProfessionalId((currentTeacherId) => {
          if (!currentTeacherId) {
            return null;
          }

          const selectedTeacherStillAvailable = teachers.some(
            (teacher) => (
              teacher.id === currentTeacherId
              && teacher.available
              && teacher.precos_tipos_aula.some((price) => price.cliente_aula_tipo_id === selectedLessonTypeId)
            )
          );

          return selectedTeacherStillAvailable ? currentTeacherId : null;
        });
      })
      .catch((err) => {
        if (err instanceof DOMException && err.name === 'AbortError') {
          return;
        }

        setAvailableLessonTeachers([]);
        setSelectedProfessionalId(null);
        setError(err instanceof Error ? err.message : 'Não foi possível listar os professores disponíveis.');
      })
      .finally(() => {
        if (!abortController.signal.aborted) {
          setIsLoadingLessonTeachers(false);
        }
      });

    return () => {
      abortController.abort();
    };
  }, [isLessonBooking, selectedDate, selectedLessonTypeId, selectedService.companyId, selectedService.id, selectedSubcategoryId, selectedTimeSlotData, selectedTimeSlots, selectedTimeSlotsKey, token]);

  const handleDateSelect = (date: string) => {
    setError(null);
    setInterestError(null);
    setInterestSuccess(null);
    setPendingInterestRequest(null);
    setInterestSelectionSlot(null);
    setInterestSelectionType(null);
    setBookingScheduleType(null);
    setSelectedLessonTypeId(null);
    setLessonTypes([]);
    setAvailableLessonTeachers([]);
    setAvailableProfessionals([]);
    setSelectedProfessionalId(null);
    setSelectedSportId(null);
    onSelectDate(date);
  };

  const handleTimeSlotSelect = (timeSlotId: string) => {
    setError(null);
    setInterestError(null);
    setInterestSuccess(null);
    setBookingScheduleType(null);
    setSelectedLessonTypeId(null);
    setLessonTypes([]);
    setAvailableLessonTeachers([]);
    setAvailableProfessionals([]);
    setSelectedProfessionalId(null);
    setSelectedSportId(null);
    onToggleTimeSlot(timeSlotId);
  };

  const handleBookingScheduleTypeChange = (type: BookingScheduleType) => {
    setError(null);
    setBookingScheduleType(type);
    setSelectedLessonTypeId(null);
    setSelectedProfessionalId(null);

    if (type === 'normal' && appointmentData?.tipo !== 'Quadra') {
      setSelectedSportId(null);
    }

    if (type === 'normal') {
      setLessonTypes([]);
      setAvailableLessonTeachers([]);
    }
  };

  const handleSportSelect = (sportId: number) => {
    setError(null);
    setSelectedSportId(sportId);
    setSelectedLessonTypeId(null);

    if (isLessonBooking) {
      setSelectedProfessionalId(null);
    }
  };

  const handleLessonTypeSelect = (lessonTypeId: number) => {
    setError(null);
    setSelectedLessonTypeId(lessonTypeId);
    setSelectedProfessionalId(null);
  };

  const submitSlotInterest = async (slot: TimeSlot, type: AppointmentSlotInterestType) => {
    if (!token) {
      setInterestError('Faça login para registrar interesse nesse horário.');
      return;
    }

    if (!selectedDate) {
      setInterestError('Selecione a data do horário para registrar esse aviso.');
      return;
    }

    if (!slot.occupied_appointment_id) {
      setInterestError('Esse horário permite interesse, mas o backend não retornou occupied_appointment_id. Sem esse identificador não é possível concluir o envio.');
      return;
    }

    setError(null);
    setInterestError(null);
    setInterestSuccess(null);
    setInterestSelectionSlot(null);
    setInterestLoadingAppointmentId(slot.occupied_appointment_id);

    try {
      await createAppointmentSlotInterest({
        token,
        appointmentId: slot.occupied_appointment_id,
        tipoInteresse: type,
        dataSlot: selectedDate,
        horaInicio: slot.time,
        duracao: slot.duration,
      });
      await onRefreshTimeSlots?.();
      setPendingInterestRequest(null);
      setBookingStep(1);
      setInterestSuccess(
        type === 'fixed_series'
          ? 'Seu interesse na série fixa foi registrado. A continuidade acontecerá pelo atendimento da empresa.'
          : 'Seu interesse nesse horário foi registrado. A continuidade acontecerá pelo atendimento da empresa.'
      );
    } catch (err) {
      setInterestError(err instanceof Error ? err.message : 'Não foi possível registrar seu interesse agora.');
    } finally {
      setInterestLoadingAppointmentId(null);
    }
  };

  const handleInterestTypeSelect = (slot: TimeSlot, type: AppointmentSlotInterestType) => {
    setInterestSelectionSlot(null);
    setInterestSelectionType(null);

    if (!isAuthenticated || !token) {
      setPendingInterestRequest({ slot, type });
      setBookingStep(2);
      return;
    }

    void submitSlotInterest(slot, type);
  };

  const handleExpressInterest = (slot: TimeSlot) => {
    const interestTypes = getInterestTypesForSlot(slot);

    setError(null);
    setInterestError(null);
    setInterestSuccess(null);

    if (interestTypes.length === 0) {
      setInterestError('Esse horário não possui opção de interesse disponível.');
      return;
    }

    setInterestSelectionSlot(slot);
    setInterestSelectionType(interestTypes[0]);
  };

  const handleCloseInterestModal = () => {
    setInterestSelectionSlot(null);
    setInterestSelectionType(null);
  };

  const handleConfirmInterestSelection = () => {
    if (!interestSelectionSlot || !interestSelectionType) {
      return;
    }

    handleInterestTypeSelect(interestSelectionSlot, interestSelectionType);
  };

  const handleNextStep = () => {
    setError(null);

    if (bookingStep === 1) {
      if (requiresBookingScheduleType && !bookingScheduleType) {
        setError('Por favor, selecione se deseja agendamento normal ou aula');
        return;
      }

      if (showNormalProfessionalSelector && !selectedProfessionalId) {
        setError('Por favor, selecione um profissional');
        return;
      }

      if (showSportSelector && !selectedSportId) {
        setError('Por favor, selecione um esporte');
        return;
      }

      if (showLessonClassTypeSelector && !selectedLessonTypeId) {
        setError('Por favor, selecione o tipo de aula');
        return;
      }

      if (showLessonTeacherSelector && !selectedProfessionalId) {
        setError('Por favor, selecione o professor da aula');
        return;
      }

      if (isLessonBooking && selectedLessonTypeId && selectedProfessionalId && !selectedLessonTypePrice) {
        setError('Não encontramos preço para o tipo de aula selecionado com este professor. Escolha outro professor.');
        return;
      }
    }

    setBookingStep((prev) => prev + 1);
  };

  const handleBack = () => {
    if (pendingInterestRequest && bookingStep === 2) {
      setInterestError(null);
      setPendingInterestRequest(null);
      setBookingStep(1);
      return;
    }

    setError(null);
    setBookingStep((prev) => prev - 1);
  };

  const handlePetSelected = (petId: number) => {
    setSelectedPetId(petId);
    handleNextStep();
  };

  const handleBookingComplete = (newAppointment: Appointment, voucher: Voucher | null) => {
    setAppointment(newAppointment);
    setAppliedVoucher(voucher);
    setBookingStep(finalStep);
  };

  const handlePaymentComplete = () => {
    setAppointment((currentAppointment) => currentAppointment
      ? {
          ...currentAppointment,
          payment: null,
        }
      : currentAppointment
    );
  };

  const handleAuthStepSuccess = () => {
    if (!pendingInterestRequest) {
      handleNextStep();
      return;
    }

    const request = pendingInterestRequest;

    setPendingInterestRequest(null);
    setBookingStep(1);
    void submitSlotInterest(request.slot, request.type);
  };

  const renderStepContent = () => {
    let currentStepIndex = 1;

    if (bookingStep === currentStepIndex) {
      return (
        <div>
          {showServiceSummary ? (
            <div className="mb-6 flex flex-col gap-6 md:flex-row">
              {selectedServiceImages[0] ? (
                <div className="h-40 w-full overflow-hidden rounded-lg md:w-1/3">
                  <img src={selectedServiceImages[0]} alt={selectedService.name} className="h-full w-full object-cover" />
                </div>
              ) : null}
              <div className="w-full md:w-2/3">
                <h3 className="theme-text-primary mb-2 text-xl font-bold">{selectedService.name}</h3>
                <p className="theme-text-secondary mb-4">{selectedService.description}</p>
                <div className="theme-panel-accent flex items-center p-3">
                  <div className="mr-3 rounded-full bg-[color:color-mix(in_srgb,var(--color-primary)_18%,transparent)] p-2">
                    <Calendar size={18} className="theme-text-accent" />
                  </div>
                  <div>
                    <p className="theme-text-primary text-sm font-medium">Duração: {selectedService.duration}</p>
                    <p className="theme-text-accent text-xs">Preço: {sidebarPriceDisplay}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : null}
          <DatePicker onSelectDate={handleDateSelect} selectedDate={selectedDate} onDateSelected={onDateSelected} timeSlotsLoaded={timeSlotsLoaded} stickyTitle={stickySteps} stickyTopClassName={stickySectionTopClassName} />
          {selectedDate ? (
            <TimeSlotPicker
              timeSlots={timeSlots}
              selectedTimeSlots={selectedTimeSlots}
              onToggleTimeSlot={handleTimeSlotSelect}
              onExpressInterest={handleExpressInterest}
              isLoading={isLoadingTimeSlots}
              stickyTitle={stickySteps}
              stickyTopClassName={stickySectionTopClassName}
              autoScrollOnSelect={false}
              interestLoadingAppointmentId={interestLoadingAppointmentId}
            />
          ) : null}
          {showLessonTypeSelector ? (
            <div className="mt-6" id="lesson-type-section">
              <div className={stickySteps ? `sticky z-20 bg-[var(--color-background)] py-2 ${stickySectionTopClassName}` : 'mb-4'}>
                <h3 className="theme-text-primary flex items-center text-lg font-semibold">
                  <BookOpen size={20} className="theme-text-accent mr-2" />
                  Tipo de agendamento
                </h3>
              </div>
              <div className="grid gap-3 sm:grid-cols-2">
                <button
                  type="button"
                  onClick={() => handleBookingScheduleTypeChange('normal')}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    bookingScheduleType === 'normal'
                      ? 'border-[var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-surface))]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  <span className="theme-text-primary flex items-center gap-2 font-semibold">
                    <CalendarCheck size={18} className="theme-text-accent" />
                    Agendamento normal
                  </span>
                  <span className="theme-text-secondary mt-1 block text-sm">Reserva o horário sem professor de aula.</span>
                </button>
                <button
                  type="button"
                  onClick={() => handleBookingScheduleTypeChange('lesson')}
                  className={`rounded-xl border p-4 text-left transition-colors ${
                    bookingScheduleType === 'lesson'
                      ? 'border-[var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_12%,var(--color-surface))]'
                      : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'
                  }`}
                >
                  <span className="theme-text-primary flex items-center gap-2 font-semibold">
                    <BookOpen size={18} className="theme-text-accent" />
                    Aula com professor
                  </span>
                  <span className="theme-text-secondary mt-1 block text-sm">Escolha esporte e professor disponíveis neste horário.</span>
                </button>
              </div>
            </div>
          ) : null}
          {showSportSelector && appointmentData?.subcategorias ? (
            <SportSelector sports={appointmentData.subcategorias} selectedSportId={selectedSportId} onSelectSport={handleSportSelect} stickyTitle={stickySteps} stickyTopClassName={stickySectionTopClassName} />
          ) : null}
          {showLessonClassTypeSelector ? (
            <LessonTypeSelector
              lessonTypes={lessonTypes}
              selectedLessonTypeId={selectedLessonTypeId}
              onSelectLessonType={handleLessonTypeSelect}
              isLoading={isLoadingLessonTypes}
              stickyTitle={stickySteps}
              stickyTopClassName={stickySectionTopClassName}
            />
          ) : null}
          {showProfessionalSelector && selectedTimeSlotData ? (
            <ProfessionalSelector
              professionals={isLessonBooking ? availableLessonTeachers : availableProfessionals}
              selectedProfessionalId={selectedProfessionalId}
              onSelectProfessional={setSelectedProfessionalId}
              title={isLessonBooking ? 'Selecione o professor da aula' : 'Selecione o Profissional'}
              isLoading={isLessonBooking ? isLoadingLessonTeachers : isLoadingAvailableProfessionals}
              emptyMessage={isLessonBooking ? 'Nenhum professor disponível para esse esporte e horário.' : 'Nenhum profissional disponível para os horários selecionados.'}
              stickyTitle={stickySteps}
              stickyTopClassName={stickySectionTopClassName}
            />
          ) : null}
          {selectedDate && hasSelectedTimeSlots ? (
            <div className="mt-8" id="booking-continue-section">
              <button
                type="button"
                onClick={handleNextStep}
                disabled={!hasSelectedTimeSlots || (requiresBookingScheduleType && !bookingScheduleType) || (showProfessionalSelector && !selectedProfessionalId) || (showSportSelector && !selectedSportId) || (showLessonClassTypeSelector && !selectedLessonTypeId) || isLoadingLessonTypes || isLoadingLessonTeachers}
                className="theme-primary-btn w-full px-4 py-3 font-medium"
              >
                Continuar
              </button>
            </div>
          ) : null}
        </div>
      );
    }
    currentStepIndex++;

    if (bookingStep === currentStepIndex) {
      return (
        <div className="space-y-4">
          {pendingInterestRequest ? (
            <div className="theme-panel-warning p-4">
              <p className="theme-text-primary font-medium">Entre para receber aviso desse horário.</p>
              <p className="theme-text-secondary mt-1 text-sm">
                {pendingInterestRequest.slot.time} • {getInterestTypeLabel(pendingInterestRequest.type)}
              </p>
            </div>
          ) : null}
          <AuthStep onAuthSuccess={handleAuthStepSuccess} />
        </div>
      );
    }
    currentStepIndex++;

    if (requiresPetInfo && bookingStep === currentStepIndex) {
      return <PetStep onPetSelected={handlePetSelected} />;
    }
    if (requiresPetInfo) currentStepIndex++;

    if (bookingStep === currentStepIndex) {
      return (
        <ConfirmationStep
          selectedService={selectedService}
          selectedDate={selectedDate!}
          selectedTimeSlots={selectedTimeSlots}
          selectedProfessionalId={selectedProfessionalId}
          selectedProfessionalUserId={selectedProfessional?.usuario.id ?? null}
          selectedSportId={selectedSportId}
          selectedSubcategoryId={selectedSubcategoryId}
          selectedPetId={selectedPetId}
          selectedLessonType={selectedLessonType}
          selectedLessonTypePrice={selectedLessonTypePrice}
          isLessonBooking={isLessonBooking}
          appointmentData={appointmentData}
          onBookingComplete={handleBookingComplete}
        />
      );
    }

    return null;
  };

  return (
    <div ref={activeContainerRef} className="min-h-[24rem]">
      {bookingStep < finalStep ? (
        <>
          {bookingStep > 1 ? (
            <button type="button" onClick={handleBack} className="theme-text-secondary mb-4 flex items-center transition-colors hover:text-[var(--color-text-primary)]">
              <ArrowLeft size={20} className="mr-1" />
              Voltar
            </button>
          ) : null}
          <div id="booking-steps-scroll-anchor" />
          <div id="booking-steps-anchor" className={stickySteps ? 'sticky top-[3.25rem] z-30 mb-6 bg-[var(--color-background)] sm:top-[3.25rem] lg:top-[3.75rem]' : ''}>
            <BookingSteps steps={bookingSteps} currentStep={bookingStep} />
          </div>
        </>
      ) : null}

      {error ? (
        <div className="theme-panel-error mb-4 p-4">
          <p className="theme-text-danger">{error}</p>
        </div>
      ) : null}

      {interestError ? (
        <div className="theme-panel-error mb-4 p-4">
          <p className="theme-text-danger">{interestError}</p>
        </div>
      ) : null}

      {interestSuccess ? (
        <div className="theme-panel-success mb-4 p-4">
          <p className="theme-text-success font-medium">{interestSuccess}</p>
        </div>
      ) : null}

      {bookingStep === finalStep && appointment ? (
        appointment.payment?.required ? (
          <PaymentCheckout appointment={appointment} service={selectedService} onPaymentComplete={handlePaymentComplete} />
        ) : (
          <BookingConfirmation appointment={appointment} service={selectedService} appliedVoucher={appliedVoucher} />
        )
      ) : (
        <div className={showDesktopSidebar ? 'lg:grid lg:grid-cols-[minmax(0,1fr)_22rem] lg:gap-6 lg:items-start' : ''}>
          <div className="min-w-0">
            {renderStepContent()}
          </div>

          {showDesktopSidebar ? (
            <aside className={`hidden lg:block lg:sticky ${sidebarStickyTopClassName}`}>
              <div className="theme-card overflow-hidden p-5">
                {selectedServiceImages[0] ? (
                  <div className="mb-5 h-40 overflow-hidden rounded-[1.25rem] border border-[var(--color-border)]">
                    <img src={selectedServiceImages[0]} alt={selectedService.name} className="h-full w-full object-cover" />
                  </div>
                ) : null}

                <div className="flex items-center justify-between gap-3">
                  <div>
                    <p className="theme-text-muted text-xs font-semibold uppercase tracking-[0.18em]">Resumo do agendamento</p>
                    <h3 className="theme-text-primary mt-2 text-xl font-bold">{selectedService.name}</h3>
                  </div>
                  <div className="theme-panel-accent flex h-11 w-11 items-center justify-center rounded-full">
                    <Sparkles size={18} className="theme-text-accent" />
                  </div>
                </div>

                <div className="mt-4 flex items-center justify-between rounded-[1rem] border border-[var(--color-border)] bg-[color:color-mix(in_srgb,var(--color-surface-secondary)_72%,transparent)] px-4 py-3">
                  <div>
                    <p className="theme-text-muted text-xs font-semibold uppercase tracking-[0.14em]">{sidebarPriceLabel}</p>
                    <p className="theme-text-primary mt-1 text-sm">{sidebarDurationDisplay}</p>
                  </div>
                  <p className="theme-text-accent text-xl font-bold">{sidebarPriceDisplay}</p>
                </div>

                <div className="mt-5 space-y-3">
                  {summaryItems.map((item) => {
                    const Icon = item.icon;

                    return (
                      <div key={item.id} className="theme-surface-muted flex items-start gap-3 p-4">
                        <div className={`mt-0.5 flex h-10 w-10 items-center justify-center rounded-full ${item.ready ? 'theme-panel-accent' : 'bg-[color:color-mix(in_srgb,var(--color-border)_32%,transparent)]'}`}>
                          <Icon size={17} className={item.ready ? 'theme-text-accent' : 'theme-text-secondary'} />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="theme-text-muted text-xs font-semibold uppercase tracking-[0.14em]">{item.label}</p>
                          <p className={`mt-1 text-sm leading-6 ${item.ready ? 'theme-text-primary font-medium' : 'theme-text-secondary'}`}>{item.value}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="theme-panel-success mt-5 flex items-start gap-3 p-4">
                  <CheckCircle2 size={18} className="theme-text-success mt-0.5" />
                  <div>
                    <p className="theme-text-primary text-sm font-semibold">Passo {bookingStep} de {bookingSteps.length}</p>
                    <p className="theme-text-secondary mt-1 text-sm">Seu resumo acompanha as selecoes em tempo real para facilitar a revisao antes da confirmacao.</p>
                  </div>
                </div>
              </div>
            </aside>
          ) : null}
        </div>
      )}

      <Modal
        isOpen={Boolean(interestSelectionSlot)}
        onClose={handleCloseInterestModal}
        title="Interesse no horário ocupado"
      >
        {interestSelectionSlot ? (
          <div className="space-y-5">
            <div className="theme-panel-warning p-4">
              <p className="theme-text-primary font-medium">{interestSelectionSlot.time} está ocupado.</p>
              <p className="theme-text-secondary mt-1 text-sm">
                Vamos avisar você pelo app e pelo WhatsApp se esse horário ficar disponível. O horário não fica reservado e a decisão final continua sendo sua quando o aviso chegar.
              </p>
            </div>

            <div className="space-y-3">
              <p className="theme-text-primary text-sm font-medium">Como você quer receber esse aviso?</p>

              <div className="grid gap-3">
                {getInterestTypesForSlot(interestSelectionSlot).map((type) => {
                  const isSelected = interestSelectionType === type;

                  return (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setInterestSelectionType(type)}
                      className={`w-full rounded-xl border px-4 py-4 text-left transition-colors ${
                        isSelected
                          ? 'border-[var(--color-primary)] bg-[color:color-mix(in_srgb,var(--color-primary)_10%,var(--color-surface))]'
                          : 'border-[var(--color-border)] bg-[var(--color-surface)] hover:border-[var(--color-primary)]'
                      }`}
                    >
                      <span className="theme-text-primary block font-medium">{getInterestTypeLabel(type)}</span>
                      <span className="theme-text-secondary mt-1 block text-sm">{getInterestTypeDescription(type)}</span>
                    </button>
                  );
                })}
              </div>
            </div>

            {!interestSelectionSlot.occupied_appointment_id ? (
              <div className="theme-panel-warning p-4">
                <p className="theme-text-primary text-sm font-medium">Este horário ainda não pode concluir o alerta.</p>
                <p className="theme-text-secondary mt-1 text-sm">
                  O sistema ainda não recebeu todos os dados necessários para registrar esse interesse. Assim que essa referência vier da API, o envio poderá ser concluído normalmente.
                </p>
              </div>
            ) : null}

            <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCloseInterestModal}
                className="theme-secondary-btn px-4 py-3"
              >
                Agora não
              </button>
              <button
                type="button"
                onClick={handleConfirmInterestSelection}
                disabled={!interestSelectionType || !interestSelectionSlot.occupied_appointment_id}
                className="theme-primary-btn px-4 py-3 disabled:cursor-not-allowed disabled:opacity-60"
              >
                Confirmar aviso
              </button>
            </div>
          </div>
        ) : null}
      </Modal>

    </div>
  );
};

export default BookingFlow;