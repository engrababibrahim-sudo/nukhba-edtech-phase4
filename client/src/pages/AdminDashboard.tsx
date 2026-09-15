import { Link } from "wouter";
import { trpc } from "@/lib/trpc";

const links = [
  ["/admin/students", "الطلاب"],
  ["/admin/teachers", "المعلمون"],
  ["/admin/parents", "أولياء الأمور"],
  ["/admin/bookings", "الحجوزات"],
] as const;

export default function AdminDashboard() {
  const overview = trpc.admin.overview.useQuery();
  return <main dir="rtl" className="min-h-screen bg-[#f7f6f2] px-5 py-10 text-[#13233a] lg:px-16">
    <div className="mx-auto max-w-6xl">
      <Link href="/" className="text-sm font-bold text-[#0e7c78]">العودة للرئيسية</Link>
      <div className="mt-5 flex flex-wrap items-end justify-between gap-4"><div><p className="text-sm font-bold text-[#0e7c78]">مركز الإدارة</p><h1 className="mt-2 text-3xl font-bold">لوحة تحكم نُخبة</h1><p className="mt-2 text-sm text-[#13233a]/55">بيانات حقيقية من قاعدة البيانات الحالية، دون بيانات تجريبية.</p></div></div>
      <div className="mt-8 grid gap-4 sm:grid-cols-2"><Link href="/admin/students" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5"><p className="text-sm text-[#13233a]/55">إجمالي الطلاب</p><strong className="mt-3 block text-4xl">{overview.isLoading ? "…" : overview.data?.studentCount ?? 0}</strong><span className="mt-4 inline-block text-sm font-bold text-[#0e7c78]">عرض حسابات الطلاب ←</span></Link><Link href="/admin/teachers" className="rounded-3xl bg-white p-6 shadow-sm transition hover:-translate-y-0.5"><p className="text-sm text-[#13233a]/55">طلبات المعلمين</p><strong className="mt-3 block text-4xl">{overview.isLoading ? "…" : overview.data?.teacherCount ?? 0}</strong><span className="mt-4 inline-block text-sm font-bold text-[#0e7c78]">فتح مراجعة المعلمين ←</span></Link></div>
      <nav className="mt-8 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">{links.map(([href, label]) => <Link key={href} href={href} className="rounded-2xl bg-[#13233a] p-5 text-sm font-bold text-white transition hover:bg-[#0e7c78]">إدارة {label} <span className="mr-2">←</span></Link>)}</nav>
    </div>
  </main>;
}

