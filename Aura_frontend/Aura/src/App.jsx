import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Home from "./pages/Home";
import HomePage from "./pages/HomePage";
import ActivitiesPage from "./pages/ActivitiesPage";
import NotificationPage from "./pages/NotificationPage";
import ProfilePage from "./pages/ProfilePage";
import CalendarPage from "./pages/CalendarPage";
import AuthPage from "./components/authPage";

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Auth Route - Standalone Page */}
        <Route path="/auth" element={<AuthPage />} />

        {/* Protected Routes - Wrapped in Home Layout */}
        <Route path="/" element={<Home />}>
          {/* Default redirect to home or auth based on status */}
          <Route index element={<Navigate to="/home" replace />} />

          <Route path="home" element={<HomePage />} />
          <Route path="calendar" element={<CalendarPage />} />
          <Route path="activities" element={<ActivitiesPage />} />
          <Route path="notifications" element={<NotificationPage />} />
          <Route path="profile" element={<ProfilePage />} />
        </Route>

        {/* Catch all - redirect to home */}
        <Route path="*" element={<Navigate to="/home" replace />} />
      </Routes>
    </BrowserRouter>
  );
}