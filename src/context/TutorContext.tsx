import React, { createContext, useContext, useState } from 'react';

export type TutorStatus = 'pending' | 'approved' | 'rejected';

export interface Tutor {
  id: string;
  name: string;
  subject: string;
  price: number;
  phone: string;
  bio: string;
  status: TutorStatus;
}

interface TutorContextType {
  tutors: Tutor[];
  addTutor: (tutor: Omit<Tutor, 'id' | 'status'>) => void;
  approveTutor: (id: string) => void;
  rejectTutor: (id: string) => void;
}

const TutorContext = createContext<TutorContextType | undefined>(undefined);

export const TutorProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [tutors, setTutors] = useState<Tutor[]>([
    {
      id: '1',
      name: 'أحمد محمود',
      subject: 'الرياضيات',
      price: 150,
      phone: '01012345678',
      bio: 'مدرس رياضيات خبرة 8 سنوات',
      status: 'pending',
    },
    {
      id: '2',
      name: 'سارة إبراهيم',
      subject: 'اللغة الإنجليزية',
      price: 200,
      phone: '01123456789',
      bio: 'معلمة لغة إنجليزية معتمدة',
      status: 'approved',
    },
  ]);

  const addTutor = (newTutor: Omit<Tutor, 'id' | 'status'>) => {
    const tutor: Tutor = {
      ...newTutor,
      id: Date.now().toString(),
      status: 'pending', // أي معلم جديد ينزل قيد الانتظار
    };
    setTutors((prev) => [...prev, tutor]);
  };

  const approveTutor = (id: string) => {
    setTutors((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'approved' } : t))
    );
  };

  const rejectTutor = (id: string) => {
    setTutors((prev) =>
      prev.map((t) => (t.id === id ? { ...t, status: 'rejected' } : t))
    );
  };

  return (
    <TutorContext.Provider value={{ tutors, addTutor, approveTutor, rejectTutor }}>
      {children}
    </TutorContext.Provider>
  );
};

export const useTutors = () => {
  const context = useContext(TutorContext);
  if (!context) throw new Error('useTutors must be used within TutorProvider');
  return context;
};
