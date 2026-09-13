import { useMemo, useState } from "react";
import { Link, useLocation, useRoute } from "wouter";
import {
  ArrowRight,
  BadgeCheck,
  CalendarDays,
  CheckCircle2,
  ChevronDown,
  Filter,
  Search,
  ShieldCheck,
  Star,
  X,
} from "lucide-react";
import { trpc } from "@/lib/trpc";

export const demoTeachers = [
  {
    id: "sara",
    name: "سارة العتيبي",
    subject: "رياضيات",
    stage: "ثانوي",
    grade: "ثاني ثانوي",
    curriculum: "المسار السعودي",
    rating: 4.9,
    price: 120,
    experience: 8,
    availability: "مساءً",
    color: "#dbe9e4",
    initials: "س",
    bio: "أساعد طلاب المرحلة الثانوية على فهم الرياضيات بثقة، من خلال أمثلة عملية وخطة مراجعة واضحة.",
    qualifications: "ماجستير تعليم الرياضيات",
    style: "تفاعلي قائم على حل المسائل",
    match: 94,
  },
  {
    id: "omar",
    name: "عمر الحربي",
    subject: "فيزياء",
    stage: "ثانوي",
    grade: "ثالث ثانوي",
    curriculum: "المسار السعودي",
    rating: 4.8,
    price: 110,
    experience: 6,
    availability: "بعد الظهر",
    color: "#e9e0d0",
    initials: "ع",
    bio: "فيزياء أبسط. أركز على بناء الفهم أولًا ثم تحويله إلى مهارة حل مسائل.",
    qualifications: "بكالوريوس فيزياء",
    style: "عملي ومبني على الأمثلة",
    match: 91,
  },
  {
    id: "noura",
    name: "نورة القحطاني",
    subject: "لغة إنجليزية",
    stage: "متوسط",
    grade: "أولى متوسط",
    curriculum: "عام",
    rating: 4.9,
    price: 95,
    experience: 10,
    availability: "نهاية الأسبوع",
    color: "#e3dff0",
    initials: "ن",
    bio: "منهج تفاعلي يربط اللغة باهتمامات الطالب اليومية ويقيس تقدمه أسبوعيًا.",
    qualifications: "شهادة TESOL",
    style: "محادثة وتطبيق",
    match: 89,
  },
  {
    id: "khaled",
    name: "خالد الزهراني",
    subject: "كيمياء",
    stage: "ثانوي",
    grade: "ثاني ثانوي",
    curriculum: "المسار السعودي",
    rating: 4.7,
    price: 105,
    experience: 5,
    availability: "مساءً",
    color: "#dce8ee",
    initials: "خ",
    bio: "أبني خطة تعلم مرنة للطلاب الذين يريدون رفع مستواهم قبل الاختبارات.",
    qualifications: "بكالوريوس كيمياء",
    style: "منظم وموجه للاختبارات",
    match: 86,
  },
];

function Header() {
  return (
    <header className="border-b border-[#13233a]/10 bg-[#f7f6f2]/90">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-5 py-5 lg:px-10">
        <Link href="/" className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-2xl bg-[#13233a] font-bold text-[#e8a64a]">
            ن
          </span>
          <b className="text-xl">نُخبة</b>
        </Link>

        <div className="flex items-center gap-3 text-sm">
          <Link
            href="/"
            className="hidden text-[#13233a]/60 sm:block"
          >
            الرئيسية
          </Link>

          <Link
            href="/dashboard/student"
            className="rounded-full bg-[#13233a] px-4 py-2 font-bold text-white"
          >
            لوحة الطالب
          </Link>
        </div>
      </div>
    </header>
  );
}

export default function Marketplace() {
  const [, params] = useRoute("/teachers/:id");
  const [, setLocation] = useLocation();

  const live = trpc.marketplace.teachers.useQuery();

  const [query, setQuery] = useState("");
  const [subject, setSubject] = useState("كل المواد");
  const [maxPrice, setMaxPrice] = useState(200);
  const [bookingTeacher, setBookingTeacher] = useState<
    typeof demoTeachers[number] | null
  >(null);

  const teachers = (live.data ?? []).map((t) => ({
    id: String(t.id),
    name: t.name,
    subject: t.subjects[0] ?? "تدريس عام",
    stage: t.educationStages[0] ?? "مراحل متعددة",
    grade: t.grades[0] ?? "صفوف متعددة",
    curriculum: "نُخبة",
    rating: 0,
    price: t.hourlyRate ?? 0,
    experience: t.yearsOfExperience,
    availability: t.availability[0] ?? "حسب التوفر",
    color: "#dbe9e4",
    initials: t.name.slice(0, 1),
    bio: t.bio ?? "ملف معلم معتمد في نُخبة.",
    qualifications: t.qualification ?? "",
    style: t.teachingFormat ?? "",
    match: 100,
  }));

  const allTeachers =
    teachers.length > 0 ? teachers : demoTeachers;

  const selected = params?.id
    ? allTeachers.find((t) => t.id === params.id)
    : null;

  const filtered = useMemo(
    () =>
      allTeachers.filter(
        (t) =>
          (!query ||
            `${t.name} ${t.subject}`
              .toLowerCase()
              .includes(query.toLowerCase())) &&
          (subject === "كل المواد" || t.subject === subject) &&
          t.price <= maxPrice,
      ),
    [allTeachers, query, subject, maxPrice],
  );

  const startBooking = (
    teacher: typeof demoTeachers[number],
  ) => {
    setBookingTeacher(teacher);
  };

  if (selected) {
    return (
      <div
        dir="rtl"
        className="min-h-screen bg-[#f7f6f2] text-[#13233a]"
      >
        <Header />

        <main className="mx-auto max-w-5xl px-5 py-10 lg:px-10">
          <button
            type="button"
            onClick={() => setLocation("/teachers")}
            className="mb-8 flex items-center gap-2 text-sm font-bold text-[#13233a]/55"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للمعلمين
          </button>

          <div className="grid gap-7 lg:grid-cols-[1fr_1.4fr]">
            <aside className="rounded-[2rem] bg-[#13233a] p-7 text-white">
              <div
                className="grid h-24 w-24 place-items-center rounded-3xl text-4xl font-bold text-[#0e7c78]"
                style={{ backgroundColor: selected.color }}
              >
                {selected.initials}
              </div>

              <h1 className="mt-6 text-3xl font-bold">
                {selected.name}
              </h1>

              <p className="mt-2 text-white/55">
                {selected.subject} · {selected.stage}
              </p>

              <div className="mt-8 flex items-center gap-2">
                <Star className="h-5 w-5 fill-[#e8a64a] text-[#e8a64a]" />
                <b>{selected.rating}</b>
              </div>

              <div className="mt-8 rounded-2xl bg-white/8 p-4 text-sm leading-7 text-white/65">
                <ShieldCheck className="mb-2 h-5 w-5 text-[#e8a64a]" />
                ملف معلم متاح للحجز
              </div>
            </aside>

            <section className="rounded-[2rem] bg-white p-7">
              <div className="flex flex-wrap items-start justify-between gap-4">
                <div>
                  <p className="text-sm font-bold text-[#0e7c78]">
                    ملف المعلم
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">
                    {selected.bio}
                  </h2>
                </div>

                <div className="rounded-2xl bg-[#e9f5ef] px-4 py-3 text-center">
                  <b className="block text-xl text-[#0e7c78]">
                    {selected.price} ر.س
                  </b>
                  <span className="text-xs text-[#13233a]/50">
                    للساعة
                  </span>
                </div>
              </div>

              <div className="mt-7 grid gap-3 sm:grid-cols-2">
                <Info
                  label="المؤهل"
                  value={selected.qualifications}
                />
                <Info label="أسلوب التدريس" value={selected.style} />
                <Info
                  label="الخبرة"
                  value={`${selected.experience} سنوات`}
                />
                <Info
                  label="المواد والصفوف"
                  value={`${selected.subject} · ${selected.grade}`}
                />
              </div>

              <h3 className="mt-9 text-lg font-bold">
                احجز موعدًا
              </h3>

              <button
                type="button"
                onClick={() => startBooking(selected)}
                className="mt-4 w-full rounded-full bg-[#0e7c78] py-4 font-bold text-white"
              >
                احجز درسًا
                <CalendarDays className="mr-2 inline h-4 w-4" />
              </button>
            </section>
          </div>
        </main>

        {bookingTeacher && (
          <BookingModal
            teacher={bookingTeacher}
            close={() => setBookingTeacher(null)}
            navigate={setLocation}
          />
        )}
      </div>
    );
  }

  const subjects = Array.from(
    new Set(allTeachers.map((t) => t.subject)),
  );

  return (
    <div
      dir="rtl"
      className="min-h-screen bg-[#f7f6f2] text-[#13233a]"
    >
      <Header />

      <main className="mx-auto max-w-7xl px-5 py-10 lg:px-10">
        <div className="flex flex-col justify-between gap-5 md:flex-row md:items-end">
          <div>
            <p className="text-sm font-bold text-[#0e7c78]">
              سوق نُخبة
            </p>

            <h1 className="mt-2 text-4xl font-bold tracking-tight md:text-5xl">
              اختر معلمك
            </h1>

            <p className="mt-3 text-[#13233a]/55">
              معلمون موثّقون، ومواعيد حجز حقيقية.
            </p>
          </div>

          <Link
            href="/"
            className="flex items-center gap-2 text-sm font-bold text-[#13233a]/55"
          >
            <ArrowRight className="h-4 w-4" />
            العودة للرئيسية
          </Link>
        </div>

        <div className="mt-10 grid gap-7 lg:grid-cols-[250px_1fr]">
          <aside className="rounded-[1.5rem] bg-white p-5">
            <div className="flex items-center justify-between">
              <b>تصفية النتائج</b>
              <Filter className="h-4 w-4 text-[#0e7c78]" />
            </div>

            <label className="mt-6 block text-xs font-bold text-[#13233a]/50">
              ابحث
            </label>

            <div className="mt-2 flex items-center rounded-xl bg-[#f7f6f2] px-3">
              <Search className="h-4 w-4 text-[#13233a]/40" />
              <input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="اسم أو مادة"
                className="w-full bg-transparent px-2 py-3 text-sm outline-none"
              />
            </div>

            <label className="mt-5 block text-xs font-bold text-[#13233a]/50">
              المادة
            </label>

            <select
              value={subject}
              onChange={(e) => setSubject(e.target.value)}
              className="mt-2 w-full rounded-xl bg-[#f7f6f2] px-3 py-3 text-sm outline-none"
            >
              <option value="كل المواد">كل المواد</option>
              {subjects.map((x) => (
                <option key={x} value={x}>
                  {x}
                </option>
              ))}
            </select>

            <label className="mt-5 block text-xs font-bold text-[#13233a]/50">
              الحد الأقصى للسعر · {maxPrice} ر.س
            </label>

            <input
              className="mt-3 w-full"
              type="range"
              min="50"
              max="200"
              step="5"
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </aside>

          <section>
            <div className="mb-4 flex items-center justify-between text-sm text-[#13233a]/50">
              <span>
                {filtered.length} معلمًا متاحًا
              </span>

              <span className="flex items-center gap-1">
                الأعلى توافقًا
                <ChevronDown className="h-4 w-4" />
              </span>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              {filtered.map((t) => (
                <article
                  key={t.id}
                  className="rounded-[1.5rem] bg-white p-5 transition hover:-translate-y-1 hover:shadow-xl"
                >
                  <div className="flex items-start gap-4">
                    <div
                      className="grid h-16 w-16 shrink-0 place-items-center rounded-2xl text-2xl font-bold text-[#0e7c78]"
                      style={{ backgroundColor: t.color }}
                    >
                      {t.initials}
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h2 className="font-bold">{t.name}</h2>
                        <BadgeCheck className="h-4 w-4 text-[#0e7c78]" />
                      </div>

                      <p className="mt-1 text-sm text-[#13233a]/55">
                        {t.subject} · {t.stage}
                      </p>

                      <div className="mt-2 flex items-center gap-1 text-xs">
                        <Star className="h-3.5 w-3.5 fill-[#e8a64a] text-[#e8a64a]" />
                        <b>{t.rating}</b>
                      </div>
                    </div>

                    <span className="mr-auto rounded-full bg-[#e9f5ef] px-2.5 py-1 text-[10px] font-bold text-[#0e7c78]">
                      {t.match}% توافق
                    </span>
                  </div>

                  <p className="mt-5 text-sm leading-6 text-[#13233a]/60">
                    {t.bio}
                  </p>

                  <div className="mt-5 flex items-center justify-between border-t border-[#13233a]/8 pt-4">
                    <span>
                      <b>{t.price} ر.س</b>
                      <small className="mr-1 text-[#13233a]/40">
                        / ساعة
                      </small>
                    </span>

                    <div className="flex gap-2">
                      <Link
                        href={`/teachers/${t.id}`}
                        className="rounded-full border border-[#13233a]/12 px-3 py-2 text-xs font-bold"
                      >
                        عرض الملف
                      </Link>

                      <button
                        type="button"
                        onClick={() => startBooking(t)}
                        className="rounded-full bg-[#13233a] px-3 py-2 text-xs font-bold text-white"
                      >
                        حجز
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>

            {filtered.length === 0 && (
              <div className="rounded-3xl bg-white p-12 text-center">
                <X className="mx-auto text-[#0e7c78]" />
                <p className="mt-3 font-bold">
                  لا توجد نتائج بهذه التصفية
                </p>
              </div>
            )}
          </section>
        </div>
      </main>

      {bookingTeacher && (
        <BookingModal
          teacher={bookingTeacher}
          close={() => setBookingTeacher(null)}
          navigate={setLocation}
        />
      )}
    </div>
  );
}

function Info({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-2xl bg-[#f7f6f2] p-4">
      <span className="text-xs text-[#13233a]/45">
        {label}
      </span>
      <b className="mt-2 block text-sm">{value || "—"}</b>
    </div>
  );
}

function BookingModal({
  teacher,
  close,
  navigate,
}: {
  teacher: typeof demoTeachers[number];
  close: () => void;
  navigate: (path: string) => void;
}) {
  const teacherId = Number(teacher.id);
  const validTeacherId =
    Number.isInteger(teacherId) && teacherId > 0;

  const [date, setDate] = useState(
    new Date().toISOString().slice(0, 10),
  );
  const [selectedSlot, setSelectedSlot] = useState("");
  const [type, setType] = useState("فردي");
  const [confirmed, setConfirmed] = useState(false);
  const [error, setError] = useState("");

  const availability =
    trpc.marketplace.availability.useQuery(
      { teacherId },
      { enabled: validTeacherId },
    );

  const createBooking =
    trpc.student.booking.create.useMutation({
      onSuccess: () => {
        setError("");
        setConfirmed(true);
      },
      onError: (err) => {
        setError(err.message);
      },
    });

  const availableSlots =
    (availability.data ?? []).filter((slot) => {
      if (slot.status !== "active") return false;

      const selectedDate = new Date(`${date}T00:00:00`);
      const dayOfWeek = selectedDate.getDay();

      return (
        slot.specificDate === date ||
        (slot.specificDate === null &&
          slot.dayOfWeek === dayOfWeek)
      );
    });

  function zonedDateTimeToUtc(
    dateString: string,
    timeString: string,
    timezone: string,
  ) {
    const baseUtc = new Date(
      `${dateString}T${timeString}:00Z`,
    );

    if (!Number.isFinite(baseUtc.getTime())) {
      throw new Error("التاريخ أو الوقت غير صالح");
    }

    let guess = baseUtc;

    for (let i = 0; i < 3; i += 1) {
      const parts = new Intl.DateTimeFormat("en-US", {
        timeZone: timezone,
        year: "numeric",
        month: "2-digit",
        day: "2-digit",
        hour: "2-digit",
        minute: "2-digit",
        hourCycle: "h23",
      })
        .formatToParts(guess)
        .reduce<Record<string, string>>(
          (acc, part) => {
            acc[part.type] = part.value;
            return acc;
          },
          {},
        );

      const representedUtc = Date.UTC(
        Number(parts.year),
        Number(parts.month) - 1,
        Number(parts.day),
        Number(parts.hour),
        Number(parts.minute),
      );

      const difference =
        representedUtc - baseUtc.getTime();

      guess = new Date(
        baseUtc.getTime() - difference,
      );
    }

    return guess;
  }

  async function confirmBooking() {
    setError("");

    if (!validTeacherId) {
      setError(
        "هذا المعلم تجريبي ولا يمكن إنشاء حجز فعلي له.",
      );
      return;
    }

    if (!selectedSlot) {
      setError("اختاري موعدًا للحجز.");
      return;
    }

    const slot = availableSlots.find(
      (item) => String(item.id) === selectedSlot,
    );

    if (!slot) {
      setError("الموعد المختار غير متاح.");
      return;
    }

    try {
      const startAt = zonedDateTimeToUtc(
        date,
        slot.startTime,
        slot.timezone,
      );

      const endAt = zonedDateTimeToUtc(
        date,
        slot.endTime,
        slot.timezone,
      );

      await createBooking.mutateAsync({
        teacherId,
        startAt: startAt.toISOString(),
        endAt: endAt.toISOString(),
        timezone: slot.timezone,
        notes: `نوع الدرس: ${type}`,
      });
    } catch (err) {
      setError(
        err instanceof Error
          ? err.message
          : "تعذر إنشاء الحجز",
      );
    }
  }

  if (confirmed) {
    return (
      <div className="fixed inset-0 z-50 grid place-items-center bg-[#13233a]/60 p-4">
        <div
          role="dialog"
          aria-modal="true"
          className="w-full max-w-lg rounded-[2rem] bg-[#f7f6f2] p-6 shadow-2xl"
        >
          <div className="flex items-start justify-between">
            <div>
              <span className="text-xs font-bold text-[#0e7c78]">
                حجز حقيقي
              </span>

              <h2 className="mt-2 text-2xl font-bold">
                تم إرسال الحجز
              </h2>
            </div>

            <button
              type="button"
              aria-label="إغلاق"
              onClick={close}
            >
              <X />
            </button>
          </div>

          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-14 w-14 text-[#0e7c78]" />

            <h3 className="mt-4 text-xl font-bold">
              تم إرسال حجزك إلى {teacher.name}
            </h3>

            <p className="mt-3 text-sm leading-6 text-[#13233a]/60">
              التاريخ: {date}
              <br />
              نوع الدرس: {type}
              <br />
              الحجز في انتظار تأكيد المعلم.
            </p>

            <button
              type="button"
              onClick={() => navigate("/student/bookings")}
              className="mt-7 rounded-full bg-[#0e7c78] px-6 py-3 font-bold text-white"
            >
              عرض حجوزاتي
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-[#13233a]/60 p-4">
      <div
        role="dialog"
        aria-modal="true"
        className="w-full max-w-lg rounded-[2rem] bg-[#f7f6f2] p-6 shadow-2xl"
      >
        <div className="flex items-start justify-between">
          <div>
            <span className="text-xs font-bold text-[#0e7c78]">
              حجز درس
            </span>

            <h2 className="mt-2 text-2xl font-bold">
              احجز مع {teacher.name}
            </h2>
          </div>

          <button
            type="button"
            aria-label="إغلاق"
            onClick={close}
          >
            <X />
          </button>
        </div>

        {!validTeacherId && (
          <div className="mt-5 rounded-2xl bg-[#fff4df] p-4 text-sm font-semibold text-[#8a5a00]">
            هذا المعلم من بيانات العرض التجريبية ولا يمكن
            إنشاء حجز فعلي له.
          </div>
        )}

        {availability.isLoading && validTeacherId && (
          <div className="mt-6 rounded-2xl bg-white p-5 text-center text-sm">
            جاري تحميل المواعيد...
          </div>
        )}

        {availability.isError && (
          <div className="mt-6 rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">
            تعذر تحميل مواعيد المعلم.
          </div>
        )}

        <div className="mt-6 space-y-4">
          <label className="block text-sm font-bold">
            المعلم
            <input
              value={teacher.name}
              disabled
              className="mt-2 w-full rounded-xl bg-white p-3 text-sm"
            />
          </label>

          <label className="block text-sm font-bold">
            التاريخ
            <input
              type="date"
              value={date}
              onChange={(event) => {
                setDate(event.target.value);
                setSelectedSlot("");
                setError("");
              }}
              className="mt-2 w-full rounded-xl bg-white p-3 text-sm"
            />
          </label>

          <div>
            <label className="text-sm font-bold">
              المواعيد المتاحة
            </label>

            {availableSlots.length === 0 ? (
              <div className="mt-2 rounded-xl bg-white p-4 text-sm text-[#13233a]/55">
                لا توجد مواعيد متاحة في هذا التاريخ.
              </div>
            ) : (
              <div className="mt-2 grid gap-2">
                {availableSlots.map((slot) => (
                  <button
                    key={slot.id}
                    type="button"
                    onClick={() =>
                      setSelectedSlot(String(slot.id))
                    }
                    className={`rounded-xl border p-3 text-right text-sm font-bold ${
                      selectedSlot === String(slot.id)
                        ? "border-[#0e7c78] bg-[#e9f5ef] text-[#0e7c78]"
                        : "border-[#13233a]/10 bg-white"
                    }`}
                  >
                    {slot.startTime} — {slot.endTime}
                    <span className="mr-2 text-xs font-normal text-[#13233a]/45">
                      {slot.timezone}
                    </span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <label className="block text-sm font-bold">
            نوع الدرس
            <select
              value={type}
              onChange={(event) =>
                setType(event.target.value)
              }
              className="mt-2 w-full rounded-xl bg-white p-3 text-sm"
            >
              <option value="فردي">فردي</option>
              <option value="جماعي مستقبلًا">
                جماعي مستقبلًا
              </option>
            </select>
          </label>

          {error && (
            <div className="rounded-2xl bg-red-50 p-4 text-sm font-semibold text-red-600">
              {error}
            </div>
          )}
        </div>

        <button
          type="button"
          disabled={
            !validTeacherId ||
            !selectedSlot ||
            createBooking.isPending
          }
          onClick={confirmBooking}
          className="mt-7 w-full rounded-full bg-[#0e7c78] py-4 font-bold text-white disabled:cursor-not-allowed disabled:opacity-50"
        >
          {createBooking.isPending
            ? "جاري إنشاء الحجز..."
            : "تأكيد الحجز"}
        </button>
      </div>
    </div>
  );
}
