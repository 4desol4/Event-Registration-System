import { lazy, Suspense } from "react";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { ThemeProvider } from "./context/ThemeContext";
import { AuthProvider } from "./context/AuthContext";
import { Layout } from "./components/Layout";
import { ProtectedRoute } from "./components/ProtectedRoute";

const LoginPage = lazy(() =>
  import("./pages/LoginPage").then((m) => ({ default: m.LoginPage })),
);
const RegisterPage = lazy(() =>
  import("./pages/RegisterPage").then((m) => ({ default: m.RegisterPage })),
);
const EventsListPage = lazy(() =>
  import("./pages/EventsListPage").then((m) => ({ default: m.EventsListPage })),
);
const EventDetailPage = lazy(() =>
  import("./pages/EventDetailPage").then((m) => ({
    default: m.EventDetailPage,
  })),
);
const FormBuilderPage = lazy(() =>
  import("./pages/FormBuilderPage").then((m) => ({
    default: m.FormBuilderPage,
  })),
);
const SubmissionsDashboardPage = lazy(() =>
  import("./pages/SubmissionsDashboardPage").then((m) => ({
    default: m.SubmissionsDashboardPage,
  })),
);
const TemplateLibraryPage = lazy(() =>
  import("./pages/TemplateLibraryPage").then((m) => ({
    default: m.TemplateLibraryPage,
  })),
);
const UserManagementPage = lazy(() =>
  import("./pages/UserManagementPage").then((m) => ({
    default: m.UserManagementPage,
  })),
);
const AdminDashboardPage = lazy(() =>
  import("./pages/AdminDashboardPage").then((m) => ({
    default: m.AdminDashboardPage,
  })),
);
const StaffDashboardPage = lazy(() =>
  import("./pages/StaffDashboardPage").then((m) => ({
    default: m.StaffDashboardPage,
  })),
);
const SuperAdminDashboardPage = lazy(() =>
  import("./pages/SuperAdminDashboardPage").then((m) => ({
    default: m.SuperAdminDashboardPage,
  })),
);

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <BrowserRouter
          future={{ v7_startTransition: true, v7_relativeSplatPath: true }}
        >
          <Suspense
            fallback={
              <div className="flex min-h-screen items-center justify-center bg-white dark:bg-brand-dark-950">
                <div className="text-sm font-medium text-brand-dark-600 dark:text-brand-lime-200">
                  Loading...
                </div>
              </div>
            }
          >
            <Routes>
              <Route path="/login" element={<LoginPage />} />
              <Route path="/r/:slug" element={<RegisterPage />} />

              <Route
                element={
                  <ProtectedRoute>
                    <Layout />
                  </ProtectedRoute>
                }
              >
                <Route path="/" element={<EventsListPage />} />
                <Route path="/events/:eventId" element={<EventDetailPage />} />
                <Route path="/forms/:formId" element={<FormBuilderPage />} />
                <Route
                  path="/forms/:formId/submissions"
                  element={<SubmissionsDashboardPage />}
                />
                <Route
                  path="/admin"
                  element={
                    <ProtectedRoute allowedRoles={["SUPER_ADMIN", "ADMIN"]}>
                      <AdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/super-admin"
                  element={
                    <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                      <SuperAdminDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route
                  path="/staff-dashboard"
                  element={
                    <ProtectedRoute
                      allowedRoles={["SUPER_ADMIN", "ADMIN", "STAFF"]}
                    >
                      <StaffDashboardPage />
                    </ProtectedRoute>
                  }
                />
                <Route path="/templates" element={<TemplateLibraryPage />} />
                <Route
                  path="/staff"
                  element={
                    <ProtectedRoute allowedRoles={["SUPER_ADMIN"]}>
                      <UserManagementPage />
                    </ProtectedRoute>
                  }
                />
              </Route>
            </Routes>
          </Suspense>
        </BrowserRouter>
      </AuthProvider>
    </ThemeProvider>
  );
}
