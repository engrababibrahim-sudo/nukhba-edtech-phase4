import React, { useState } from 'react';
import { TutorProvider } from './context/TutorContext';
import { StudentHome } from './components/StudentHome';
import { RegisterTutor } from './components/RegisterTutor';
import { AdminPanel } from './components/AdminPanel';

export function App() {
  const [currentTab, setCurrentTab] = useState<'student' | 'register' | 'admin'>('student');

  return (
    <TutorProvider>
      <div className="min-h-screen bg-gray-50 text-gray-900 font-sans">
        {/* Navbar / الهيدر العلوي */}
        <header className="bg-white border-b border-gray-200 sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 py-4 flex justify-between items-center dir-rtl" dir="rtl">
            <div className="flex items-center gap-2 cursor-pointer" onClick={() => setCurrentTab('student')}>
              <span className="text-2xl font-black text-orange-500">نُخبة</span>
              <span className="text-sm font-semibold text-gray-500">منصة التعليم الذكي</span>
            </div>

            <nav className="flex gap-3">
              <button
                onClick={() => setCurrentTab('student')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  currentTab === 'student' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                الرئيسية (الطلاب)
              </button>
              <button
                onClick={() => setCurrentTab('register')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  currentTab === 'register' ? 'bg-orange-500 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                سجل كمعلم 👨‍🏫
              </button>
              <button
                onClick={() => setCurrentTab('admin')}
                className={`px-4 py-2 rounded-lg font-bold text-sm transition ${
                  currentTab === 'admin' ? 'bg-gray-800 text-white' : 'text-gray-600 hover:bg-gray-100'
                }`}
              >
                لوحة الأدمن 🛡️
              </button>
            </nav>
          </div>
        </header>

        {/* محتوى الصفحة حسب التبويب المختار */}
        <main className="py-8">
          {currentTab === 'student' && <StudentHome />}
          {currentTab === 'register' && <RegisterTutor />}
          {currentTab === 'admin' && <AdminPanel />}
        </main>
      </div>
    </TutorProvider>
  );
}

export default App;
