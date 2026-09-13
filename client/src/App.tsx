import { Toaster } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/NotFound";
import { Route, Switch } from "wouter";
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

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/teachers" component={Marketplace} />
      <Route path="/teachers/:id" component={Marketplace} />

      <Route path="/dashboard/:role" component={Dashboard} />
      <Route path="/auth" component={Auth} />

      <Route path="/student/profile" component={StudentProfile} />
      <Route path="/student/bookings" component={StudentBookings} />

      <Route path="/parent/children" component={ParentChildren} />
      <Route
        path="/parent/children/:studentId"
        component={ParentChildProfile}
      />

      <Route path="/teacher/register" component={TeacherRegister} />
      <Route path="/teacher/dashboard" component={TeacherDashboard} />
      <Route
        path="/teacher/availability"
        component={TeacherAvailability}
      />
      <Route
        path="/teacher/bookings"
        component={TeacherBookings}
      />

      <Route path="/admin/teachers" component={AdminTeachers} />

      <Route path="/404" component={NotFound} />
      <Route component={NotFound} />
    </Switch>
  );
}

export default function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider defaultTheme="light">
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </ThemeProvider>
    </ErrorBoundary>
  );
}