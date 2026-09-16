import React from 'react';
import { useTutors } from '../context/TutorContext';

export const StudentHome: React.FC = () => {
  const { tutors } = useTutors();
  const approvedTutors = tutors.filter((t) => t.status === 'approved');

  return (
    <div className="p-6 max-w-6xl mx-auto dir-rtl" dir="rtl">
      <h1 className="text-3xl font-bold mb-6 text-center text-orange-600">درس أبنائك مع أفضل المدرسين الخصوصيين</h1>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {approvedTutors.map((tutor) => (
          <div key={tutor.id} className="p-5 bg-white rounded-xl shadow border hover:shadow-md transition">
            <h3 className="text-xl font-bold text-gray-800">{tutor.name}</h3>
            <p className="text-orange-600 font-semibold">{tutor.subject}</p>
            <p className="text-gray-600 text-sm my-2">{tutor.bio}</p>
            <div className="flex justify-between items-center mt-4">
              <span className="font-bold text-lg">{tutor.price} ج.م/حصة</span>
              <a href={`https://wa.me/2${tutor.phone}`} target="_blank" rel="noreferrer" className="bg-orange-500 text-white px-4 py-2 rounded-lg font-bold text-sm hover:bg-orange-600">احجز الآن</a>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
