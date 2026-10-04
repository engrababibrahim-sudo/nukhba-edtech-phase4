import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Route, Switch, useLocation, useRoute } from "wouter";
import { lazy, Suspense, useEffect } from "react";
import { useAuth } from "@/_core/hooks/useAuth";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
const Dashboard = lazy(() => import("./pages/Dashboard"));
const Auth = lazy(() => import("./pages/Auth"));
const StudentProfile = lazy(() => import("./pages/StudentProfile"));
const ParentChildren = lazy(() => import("./pages/ParentChildren"));
const ParentChildProfile = lazy(() => import("./pages/ParentChildProfile"));
const TeacherRegister = lazy(() => import("./pages/TeacherRegister"));
const TeacherDashboard = lazy(() => import("./pages/TeacherDashboard"));
const AdminTeachers = lazy(() => import("./pages/AdminTeachers"));
const AdminDashboard = lazy(() => import("./pages/AdminDashboard"));
const AdminStudents = lazy(() => import("./pages/AdminStudents"));
const AdminPlaceholder = lazy(() => import("./pages/AdminPlaceholder"));
const StudentBookings = lazy(() => import("./pages/StudentBookings"));
const Favorites = lazy(() => import("./pages/Favorites"));
const TeacherAvailability = lazy(() => import("./pages/TeacherAvailability"));
const TeacherBookings = lazy(() => import("./pages/TeacherBookings"));
import { AppRole, ProtectedRoute } from "./components/AuthRoute";

const NotFound = lazy(() => import("@/pages/NotFound"));

function Guard({ roles, children }: { roles?: AppRole[]; children: React.ReactNode }) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
}

function DashboardRoute() {
  const [, params] = useRoute("/dashboard/:role");
  const role = params?.role;
  const roles: AppRole[] = role === "student" ? ["student"] : role === "parent" ? ["parent"] : role === "teacher" ? ["teacher"] : ["admin", "super_admin", "support"];
  return <Guard roles={roles}><Dashboard /></Guard>;
}


function AuthIntentRedirect() {
  const { user, loading } = useAuth();
  const [location, setLocation] = useLocation();
  useEffect(() => {
    if (loading || !user) return;
    try {
      if (sessionStorage.getItem("nukhba-auth-intent") !== "1") return;
      const target = sessionStorage.getItem("nukhba-auth-return-to") || "/";
      sessionStorage.removeItem("nukhba-auth-intent");
      sessionStorage.removeItem("nukhba-auth-return-to");
      const safe = target.startsWith("/") && !target.startsWith("//") && !target.includes("\\") && new URL(target, window.location.origin).origin === window.location.origin;
      if (safe && target !== location) setLocation(target);
    } catch {}
  }, [loading, user, location, setLocation]);
  return null;
}

function RouteMetadata() {
  const [location] = useLocation();
  useEffect(() => {
    const publicRoute = location === "/" || location === "/teachers" || /^\/teachers\/[^/]+$/.test(location);
    const titles: Record<string, string> = { "/": "مُعلّم | تعلم على مقاسك", "/teachers": "ابحث عن معلم | مُعلّم", "/auth": "تسجيل الدخول | مُعلّم" };
    document.title = titles[location] || (location.startsWith("/teachers/") ? "ملف المعلم | مُعلّم" : "حسابك | مُعلّم");
    const ensureMeta = (name: string, key: "name" | "property" = "name") => {
      let element = document.head.querySelector<HTMLMetaElement>(`meta[${key}="${name}"]`);
      if (!element) { element = document.createElement("meta"); element.setAttribute(key, name); document.head.appendChild(element); }
      return element;
    };
    ensureMeta("description").content = "اعثر على معلم مناسب، قارن الملفات المعتمدة والأسعار، وأرسل طلب الحجز عبر مُعلّم.";
    ensureMeta("robots").content = publicRoute ? "index,follow" : "noindex,nofollow";
    ensureMeta("og:title", "property").content = document.title;
    ensureMeta("og:description", "property").content = "تعلم على مقاسك — ابحث بين ملفات المعلمين المعتمدة في مصر.";
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]');
    if (canonical) canonical.href = `${window.location.origin}${location}`;
    ensureMeta("og:url", "property").content = `${window.location.origin}${location}`;
  }, [location]);
  return null;
}

function Router() {
  return (
    <Suspense fallback={<div role="status" className="grid min-h-[40vh] place-items-center bg-[#fbf8f4] p-8 text-[#182431]">جارٍ تحميل الصفحة…</div>}><AuthIntentRedirect /><RouteMetadata /><Switch>
      <Route path="/" component={Home} />
      <Route path="/teachers" component={Marketplace} />
      <Route path="/teachers/:id" component={Marketplace} />
      <Route path="/dashboard/:role" component={DashboardRoute} />
      <Route path="/auth" component={Auth} />

      <Route path="/onboarding"><Guard roles={["user", "student"]}><Home /></Guard></Route>

      <Route path="/student/profile"><Guard roles={["user", "student"]}><StudentProfile /></Guard></Route>
      <Route path="/student/bookings"><Guard roles={["student"]}><StudentBookings /></Guard></Route>
      <Route path="/student/favorites"><Guard roles={["student"]}><Favorites /></Guard></Route>

      <Route path="/parent/children"><Guard roles={["parent"]}><ParentChildren /></Guard></Route>
      <Route path="/parent/children/:studentId"><Guard roles={["parent"]}><ParentChildProfile /></Guard></Route>

      <Route path="/teacher/register"><Guard roles={["user", "student", "teacher"]}><TeacherRegister /></Guard></Route>
      <Route path="/teacher/dashboard"><Guard roles={["teacher"]}><TeacherDashboard /></Guard></Route>
      <Route path="/teacher/availability"><Guard roles={["teacher"]}><TeacherAvailability /></Guard></Route>
      <Route path="/teacher/bookings"><Guard roles={["teacher"]}><TeacherBookings /></Guard></Route>

      <Route path="/admin"><Guard roles={["admin", "super_admin"]}><AdminDashboard /></Guard></Route>
      <Route path="/admin/students"><Guard roles={["admin", "super_admin"]}><AdminStudents /></Guard></Route>
      <Route path="/admin/teachers"><Guard roles={["admin", "super_admin"]}><AdminTeachers /></Guard></Route>
      <Route path="/admin/parents"><Guard roles={["admin", "super_admin"]}><AdminPlaceholder title="أولياء الأمور" /></Guard></Route>
      <Route path="/admin/bookings"><Guard roles={["admin", "super_admin"]}><AdminPlaceholder title="الحجوزات" /></Guard></Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch></Suspense>
  );
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
