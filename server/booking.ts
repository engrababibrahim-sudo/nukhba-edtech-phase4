import { and, eq, gt, lt, or, asc, desc } from "drizzle-orm";
import {
  bookings,
  teacherAvailability,
  teacherProfiles,
  users,
} from "../drizzle/schema";
import { getDb } from "./db";

export type BookingStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "rejected";

export function isEligibleTeacherState(state: {
  role: string;
  accountStatus: string;
  verificationStatus: string;
}) {
  return (
    state.role === "teacher" &&
    state.accountStatus === "active" &&
    state.verificationStatus === "approved"
  );
}

export function intervalsOverlap(
  startA: Date,
  endA: Date,
  startB: Date,
  endB: Date,
) {
  return startA < endB && endA > startB;
}

function localSlot(date: Date, timezone: string) {
  const parts = new Intl.DateTimeFormat("en-CA", {
    timeZone: timezone,
    weekday: "short",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
  })
    .formatToParts(date)
    .reduce<Record<string, string>>((acc, part) => {
      acc[part.type] = part.value;
      return acc;
    }, {});

  const weekday = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"].indexOf(
    parts.weekday,
  );

  return {
    date: `${parts.year}-${parts.month}-${parts.day}`,
    dayOfWeek: weekday,
    time: `${parts.hour}:${parts.minute}`,
  };
}

function ensureTimeWindow(startAt: Date, endAt: Date) {
  if (
    !Number.isFinite(startAt.getTime()) ||
    !Number.isFinite(endAt.getTime()) ||
    startAt >= endAt ||
    startAt.getTime() <= Date.now()
  ) {
    throw new Error("نافذة الوقت غير صالحة أو بدأت بالفعل");
  }
}

function assertValidTimezone(timezone: string) {
  try {
    new Intl.DateTimeFormat("en-US", { timeZone: timezone });
  } catch {
    throw new Error("المنطقة الزمنية غير صالحة");
  }
}

function assertValidClockTime(value: string) {
  const match = /^(\d{2}):(\d{2})$/.exec(value);
  if (!match || Number(match[1]) > 23 || Number(match[2]) > 59) {
    throw new Error("صيغة الوقت غير صالحة");
  }
}

export async function getTeacherForUser(userId: number) {
  const db = await getDb();
  if (!db) return undefined;

  const rows = await db
    .select({
      profile: teacherProfiles,
      user: users,
    })
    .from(teacherProfiles)
    .innerJoin(users, eq(users.id, teacherProfiles.userId))
    .where(eq(teacherProfiles.userId, userId))
    .limit(1);

  return rows[0];
}

export async function getEligibleTeacherForPublicAvailability(
  teacherId: number,
) {
  const db = await getDb();
  if (!db) return undefined;

  const rows = await db
    .select({
      id: teacherProfiles.id,
    })
    .from(teacherProfiles)
    .innerJoin(users, eq(users.id, teacherProfiles.userId))
    .where(
      and(
        eq(teacherProfiles.id, teacherId),
        eq(users.role, "teacher"),
        eq(users.accountStatus, "active"),
        eq(teacherProfiles.verificationStatus, "approved"),
      ),
    )
    .limit(1);

  return rows[0];
}

async function getEligibleTeacher(tx: any, teacherId: number) {
  const rows = await tx
    .select({
      profile: teacherProfiles,
      user: users,
    })
    .from(teacherProfiles)
    .innerJoin(users, eq(users.id, teacherProfiles.userId))
    .where(eq(teacherProfiles.id, teacherId))
    .for("update")
    .limit(1);

  const teacher = rows[0];

  if (!teacher) {
    throw new Error("المعلم غير موجود");
  }

  if (
    !isEligibleTeacherState({
      role: teacher.user.role,
      accountStatus: teacher.user.accountStatus,
      verificationStatus: teacher.profile.verificationStatus,
    })
  ) {
    throw new Error("المعلم غير متاح للحجز");
  }

  return teacher;
}

async function assertAvailability(
  tx: any,
  teacherId: number,
  startAt: Date,
  endAt: Date,
) {
  const rows = await tx
    .select()
    .from(teacherAvailability)
    .where(
      and(
        eq(teacherAvailability.teacherId, teacherId),
        eq(teacherAvailability.status, "active"),
      ),
    )
    .for("update");

  for (const slot of rows as typeof teacherAvailability.$inferSelect[]) {
    try {
      assertValidTimezone(slot.timezone);
      const start = localSlot(startAt, slot.timezone);
      const end = localSlot(endAt, slot.timezone);
      if (start.date !== end.date || start.dayOfWeek !== end.dayOfWeek) {
        continue;
      }

      const dateMatches = slot.specificDate === start.date;
      const recurrenceMatches = slot.specificDate === null && slot.dayOfWeek === start.dayOfWeek;
      if ((dateMatches || recurrenceMatches) && slot.startTime <= start.time && slot.endTime >= end.time) {
        return slot.timezone;
      }
    } catch {
      // Invalid legacy availability rows are ignored; the client cannot choose their timezone.
    }
  }

  throw new Error("الوقت خارج مواعيد توفر المعلم");
}

function conflictWhere(
  ownerField: typeof bookings.teacherId | typeof bookings.studentId,
  ownerId: number,
  startAt: Date,
  endAt: Date,
) {
  return and(
    eq(ownerField, ownerId),
    or(
      eq(bookings.status, "pending"),
      eq(bookings.status, "confirmed"),
    ),
    lt(bookings.startAt, endAt),
    gt(bookings.endAt, startAt),
  );
}

export async function createBooking(
  studentId: number,
  input: {
    teacherId: number;
    startAt: Date;
    endAt: Date;
    notes?: string | null;
  },
) {
  const db = await getDb();

  if (!db) {
    throw new Error("Database unavailable");
  }

  ensureTimeWindow(input.startAt, input.endAt);

  return db.transaction(async (tx) => {
    const studentRows = await tx
      .select()
      .from(users)
      .where(eq(users.id, studentId))
      .for("update")
      .limit(1);

    const student = studentRows[0];

    if (
      !student ||
      student.role !== "student" ||
      student.accountStatus !== "active"
    ) {
      throw new Error("الطالب غير مصرح له بالحجز");
    }

    await getEligibleTeacher(tx, input.teacherId);

    const timezone = await assertAvailability(
      tx,
      input.teacherId,
      input.startAt,
      input.endAt,
    );

    const teacherConflict = await tx
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        conflictWhere(
          bookings.teacherId,
          input.teacherId,
          input.startAt,
          input.endAt,
        ),
      )
      .limit(1);

    if (teacherConflict.length) {
      throw new Error("الموعد محجوز للمعلم");
    }

    const studentConflict = await tx
      .select({ id: bookings.id })
      .from(bookings)
      .where(
        conflictWhere(
          bookings.studentId,
          studentId,
          input.startAt,
          input.endAt,
        ),
      )
      .limit(1);

    if (studentConflict.length) {
      throw new Error("لدى الطالب حجز متعارض");
    }

    const result = await tx.insert(bookings).values({
      studentId,
      teacherId: input.teacherId,
      startAt: input.startAt,
      endAt: input.endAt,
      timezone,
      notes: input.notes ?? null,
      status: "pending",
    });

    const id = Number(result[0].insertId);

    const created = await tx
      .select()
      .from(bookings)
      .where(eq(bookings.id, id))
      .limit(1);

    return created[0];
  });
}

export async function listStudentBookings(studentId: number) {
  const db = await getDb();

  if (!db) return [];

  return db
    .select({
      booking: bookings,
      teacher: { fullName: teacherProfiles.fullName },
    })
    .from(bookings)
    .innerJoin(
      teacherProfiles,
      eq(teacherProfiles.id, bookings.teacherId),
    )
    .where(eq(bookings.studentId, studentId))
    .orderBy(desc(bookings.startAt));
}

export async function listTeacherBookings(teacherId: number) {
  const db = await getDb();

  if (!db) return [];

  return db
    .select({
      booking: bookings,
      student: { id: users.id, name: users.name },
    })
    .from(bookings)
    .innerJoin(users, eq(users.id, bookings.studentId))
    .where(eq(bookings.teacherId, teacherId))
    .orderBy(asc(bookings.startAt));
}

export async function listAvailability(teacherId: number) {
  const db = await getDb();

  if (!db) return [];

  return db
    .select()
    .from(teacherAvailability)
    .where(eq(teacherAvailability.teacherId, teacherId))
    .orderBy(
      asc(teacherAvailability.specificDate),
      asc(teacherAvailability.dayOfWeek),
      asc(teacherAvailability.startTime),
    );
}

export async function createAvailability(
  teacherId: number,
  input: {
    dayOfWeek?: number | null;
    specificDate?: string | null;
    startTime: string;
    endTime: string;
    timezone: string;
  },
) {
  const db = await getDb();

  if (!db) {
    throw new Error("Database unavailable");
  }

  if (input.dayOfWeek == null && !input.specificDate) {
    throw new Error("حدد يومًا متكررًا أو تاريخًا محددًا");
  }

  if (
    input.dayOfWeek != null &&
    (input.dayOfWeek < 0 || input.dayOfWeek > 6)
  ) {
    throw new Error("اليوم غير صالح");
  }

  if (input.startTime >= input.endTime) {
    throw new Error("وقت البداية يجب أن يسبق النهاية");
  }

  assertValidClockTime(input.startTime);
  assertValidClockTime(input.endTime);
  assertValidTimezone(input.timezone);

  const result = await db
    .insert(teacherAvailability)
    .values({
      teacherId,
      ...input,
    });

  return (await listAvailability(teacherId)).find(
    (row) => row.id === Number(result[0].insertId),
  );
}

export async function updateAvailability(
  teacherId: number,
  id: number,
  input: Partial<{
    dayOfWeek: number | null;
    specificDate: string | null;
    startTime: string;
    endTime: string;
    timezone: string;
    status: "active" | "inactive";
  }>,
) {
  const db = await getDb();

  if (!db) {
    throw new Error("Database unavailable");
  }

  const current = (
    await db
      .select()
      .from(teacherAvailability)
      .where(
        and(
          eq(teacherAvailability.id, id),
          eq(teacherAvailability.teacherId, teacherId),
        ),
      )
      .limit(1)
  )[0];

  if (!current) return undefined;

  const next = {
    ...current,
    ...input,
  };

  if (next.dayOfWeek == null && !next.specificDate) {
    throw new Error("حدد يومًا متكررًا أو تاريخًا محددًا");
  }

  if (next.startTime >= next.endTime) {
    throw new Error("وقت البداية يجب أن يسبق النهاية");
  }

  assertValidClockTime(next.startTime);
  assertValidClockTime(next.endTime);
  assertValidTimezone(next.timezone);

  await db
    .update(teacherAvailability)
    .set({
      ...input,
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(teacherAvailability.id, id),
        eq(teacherAvailability.teacherId, teacherId),
      ),
    );

  return (
    await db
      .select()
      .from(teacherAvailability)
      .where(eq(teacherAvailability.id, id))
      .limit(1)
  )[0];
}

export async function deleteAvailability(
  teacherId: number,
  id: number,
) {
  const db = await getDb();

  if (!db) {
    throw new Error("Database unavailable");
  }

  const result = await db
    .update(teacherAvailability)
    .set({
      status: "inactive",
      updatedAt: new Date(),
    })
    .where(
      and(
        eq(teacherAvailability.id, id),
        eq(teacherAvailability.teacherId, teacherId),
      ),
    );

  return result;
}

export async function cancelStudentBooking(
  studentId: number,
  id: number,
) {
  const db = await getDb();

  if (!db) {
    throw new Error("Database unavailable");
  }

  return db.transaction(async (tx) => {
    const current = (await tx.select().from(bookings).where(and(eq(bookings.id, id), eq(bookings.studentId, studentId))).for("update").limit(1))[0];
    if (!current || !["pending", "confirmed"].includes(current.status)) return undefined;
    await tx.update(bookings).set({ status: "cancelled", updatedAt: new Date() }).where(and(eq(bookings.id, id), eq(bookings.studentId, studentId), eq(bookings.status, current.status)));
    return (await tx.select().from(bookings).where(and(eq(bookings.id, id), eq(bookings.studentId, studentId))).limit(1))[0];
  });
}

export async function updateTeacherBookingStatus(
  teacherId: number,
  id: number,
  status: BookingStatus,
) {
  const db = await getDb();

  if (!db) {
    throw new Error("Database unavailable");
  }

  const allowed: Record<string, BookingStatus[]> = {
    pending: ["confirmed", "rejected"],
    confirmed: ["completed", "cancelled"],
  };

  return db.transaction(async (tx) => {
    const current = (await tx.select().from(bookings).where(and(eq(bookings.id, id), eq(bookings.teacherId, teacherId))).for("update").limit(1))[0];
    if (!current) return undefined;
    if (!allowed[current.status]?.includes(status)) throw new Error("انتقال حالة الحجز غير مسموح");
    await tx.update(bookings).set({ status, updatedAt: new Date() }).where(and(eq(bookings.id, id), eq(bookings.teacherId, teacherId), eq(bookings.status, current.status)));
    return (await tx.select().from(bookings).where(and(eq(bookings.id, id), eq(bookings.teacherId, teacherId))).limit(1))[0];
  });
}
