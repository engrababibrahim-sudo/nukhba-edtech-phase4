import React from 'react';
import { useTutors } from '../context/TutorContext';

export const AdminPanel: React.FC = () => {
  const { tutors, approveTutor, rejectTutor } = useTutors();

  return (
    <div className="p-6 max-w-5xl mx-auto dir-rtl" dir="rtl">
      <h1 className="text-2xl font-bold mb-6">لوحة تحكم الإدارة 🛡️</h1>
      <div className="space-y-4">
        {tutors.map((tutor) => (
          <div key={tutor.id} className="p-4 bg-white border rounded-lg shadow-sm flex justify-between items-center">
            <div>
              <h3 className="font-bold text-lg">{tutor.name} <span className="text-sm font-normal text-gray-500">({tutor.subject})</span></h3>
              <p className="text-sm text-gray-600">{tutor.bio}</p>
              <p className="text-sm font-semibold mt-1">السعر: {tutor.price} ج.م | الهاتف: {tutor.phone}</p>
              <span className={`inline-block text-xs px-2 py-1 rounded mt-2 ${tutor.status === 'approved' ? 'bg-green-100 text-green-800' : tutor.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-yellow-100 text-yellow-800'}`}>
                {tutor.status === 'approved' ? 'معتمد ✅' : tutor.status === 'rejected' ? 'مرفوض ❌' : 'قيد الانتظار ⏳'}
              </span>
            </div>
            <div className="flex gap-2">
              <button onClick={() => approveTutor(tutor.id)} className="bg-green-600 text-white px-3 py-1 rounded text-sm hover:bg-green-700">موافقة</button>
              <button onClick={() => rejectTutor(tutor.id)} className="bg-red-500 text-white px-3 py-1 rounded text-sm hover:bg-red-600">رفض</button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
