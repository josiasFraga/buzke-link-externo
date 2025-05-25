import { create } from 'zustand';
import { Company } from '../types';

interface CompanyState {
  company: Company | null;
  setCompany: (company: Company) => void;
  clearCompany: () => void;
}

export const useCompanyStore = create<CompanyState>((set) => ({
  company: null,
  setCompany: (company) => set({ company }),
  clearCompany: () => set({ company: null }),
}));