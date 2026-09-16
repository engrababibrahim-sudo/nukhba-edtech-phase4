import React, { useState } from 'react';
import { useTutors } from '../context/TutorContext';

export const RegisterTutor: React.FC = () => {
  const { addTutor } = useTutors();
  const [submitted, setSubmitted] = useState(false);
  const [form, setForm] = useState({ name: '', subject: '', price: 100, phone: '', bio: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    addTutor({ ...form, price: Number(form.price) });
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="p-8 text-center dir-rtl" dir="rtl">
        <h2 className="text-2xl font-bold text-green-600 mb-2">تم تقديم طلبك بنجاح! 🎉</h2>
        <p className="text-gray-600">طلبك الآن قيد المراجعة من الإدارة، وسيتم تفعيل حسابك فور الموافقة عليه.</p>
      </div>
    );
  }
