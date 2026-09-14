import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch, useRoute } from "wouter";
import ErrorBoundary from "./components/ErrorBoundary";
import { ThemeProvider } from "./contexts/ThemeContext";
import Home from "./pages/Home";
import Marketplace from "./pages/Marketplace";
import Dashboard from "./pages/Dashboard";
import Auth from "./pages/Auth";
import StudentProfile from "./pages/StudentProfile";
import ParentChildren from "./pages/ParentChildren";
import ParentChildProfile from "./pages/ParentChildProfile";
import TeacherRegister from "./pages/TeacherRegister";
import TeacherDashboard from "./pages/TeacherDashboard";
import AdminTeachers from "./pages/AdminTeachers";
import StudentBookings from "./pages/StudentBookings";
import TeacherAvailability from "./pages/TeacherAvailability";
import TeacherBookings from "./pages/TeacherBookings";
import { AppRole, ProtectedRoute, RoleRedirect } from "./components/AuthRoute";

function Guard({ roles, children }: { roles?: AppRole[]; children: React.ReactNode }) {
  return <ProtectedRoute roles={roles}>{children}</ProtectedRoute>;
}

function DashboardRoute() {
  const [, params] = useRoute("/dashboard/:role");
  const role = params?.role;
  const roles: AppRole[] = role === "student" ? ["student"] : role === "parent" ? ["parent"] : role === "teacher" ? ["teacher"] : ["admin", "super_admin", "support"];
  return <Guard roles={roles}><Dashboard /></Guard>;
}

function Router() {
  return (
    <Switch>
      <Route path="/"><><RoleRedirect /><Home /></></Route>
      <Route path="/teachers" component={Marketplace} />
      <Route path="/teachers/:id" component={Marketplace} />
      <Route path="/dashboard/:role" component={DashboardRoute} />
      <Route path="/auth" component={Auth} />

      <Route path="/student/profile"><Guard roles={["user", "student"]}><StudentProfile /></Guard></Route>
      <Route path="/student/bookings"><Guard roles={["student"]}><StudentBookings /></Guard></Route>

      <Route path="/parent/children"><Guard roles={["parent"]}><ParentChildren /></Guard></Route>
      <Route path="/parent/children/:studentId"><Guard roles={["parent"]}><ParentChildProfile /></Guard></Route>

      <Route path="/teacher/register"><Guard roles={["user", "student", "teacher"]}><TeacherRegister /></Guard></Route>
      <Route path="/teacher/dashboard"><Guard roles={["teacher"]}><TeacherDashboard /></Guard></Route>
      <Route path="/teacher/availability"><Guard roles={["teacher"]}><TeacherAvailability /></Guard></Route>
      <Route path="/teacher/bookings"><Guard roles={["teacher"]}><TeacherBookings /></Guard></Route>

      <Route path="/admin/teachers"><Guard roles={["admin", "super_admin"]}><AdminTeachers /></Guard></Route>
      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return <ErrorBoundary><ThemeProvider defaultTheme="light"><TooltipProvider><Toaster /><Router /></TooltipProvider></ThemeProvider></ErrorBoundary>;
}
