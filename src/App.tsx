import { useEffect, useState } from "react";
import {
  Routes,
  Route,
  Navigate,
  useLocation
} from "react-router-dom";
import { Toaster } from "react-hot-toast";

import { LanguageProvider } from "./contexts/LanguageContext";
import { ThemeProvider } from "./contexts/ThemeContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { FirebaseProvider } from "./contexts/FirebaseContext";

import LanguageSelector from "./components/LanguageSelector";
import ThemeSelector from "./components/ThemeSelector";
import OnboardingFlow from "./components/OnboardingFlow";
import RequestForm from "./components/RequestForm";
import UserDashboard from "./components/UserDashboard";
import AdminLogin from "./components/admin/AdminLogin";
import AdminDashboard from "./components/admin/AdminDashboard";

import { useLanguage } from "./hooks/useLanguage";
import { useTheme } from "./hooks/useTheme";

function AppRedirector() {
  const { isLanguageSelected } = useLanguage();
  const { isThemeSelected } = useTheme();
  const { currentUserMobile, setCurrentUserMobile, user, isAdmin } = useAuth();
  const location = useLocation();

  const [viewType, setViewType] = useState("user");
  const [checkingStatus, setCheckingStatus] = useState(true);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    const urlViewType = params.get("viewType");
    const storedViewType = localStorage.getItem("viewType");

    let finalViewType = "user";
    if (urlViewType === "admin") finalViewType = "admin";
    else if (storedViewType === "admin") finalViewType = "admin";

    localStorage.setItem("viewType", finalViewType);
    setViewType(finalViewType);
  }, []);

  useEffect(() => {
    const languagePageViewed = localStorage.getItem("isLanguageViewed") === "true";
    const themePageViewed = localStorage.getItem("isThemeViewed") === "true";

    if (!languagePageViewed) {
      window.location.replace("/language");
    } else if (!themePageViewed) {
      window.location.replace("/theme");
    }
  }, []);

  useEffect(() => {
    const storedMobile = localStorage.getItem("currentUserMobile");
    if (storedMobile) {
      setCurrentUserMobile(storedMobile);
    }
    setCheckingStatus(false);
  }, []);

  const setupDone = isLanguageSelected && isThemeSelected;

  if (!setupDone || checkingStatus) return null;

  if (viewType === "admin") {
    return user && isAdmin ? (
        <Navigate to="/admin/dashboard" replace={true} />
    ) : (
        <Navigate to="/admin" replace={true} />
    );
  }

  const onboardingCompleted = localStorage.getItem("onboardingCompleted") === "true";

  if (currentUserMobile && onboardingCompleted) {
    return <Navigate to="/dashboard#requests" replace={true} />;
  }

  return <Navigate to="/onboarding#1" replace={true} />;
}


function AppRoutes() {
  return (
      <Routes>
        <Route path="/" element={<AppRedirector />} />
        <Route path="/language" element={<LanguageSelector />} />
        <Route path="/theme" element={<ThemeSelector />} />
        <Route path="/onboarding" element={<OnboardingFlow />} />
        <Route path="/request" element={<RequestForm />} />
        <Route path="/dashboard" element={<UserDashboard />} />
        <Route path="/admin" element={<AdminLogin />} />
        <Route path="/admin/dashboard" element={<AdminDashboard />} />
        <Route path="*" element={<AppRedirector />} />
      </Routes>
  );
}

function App() {
  return (
      <FirebaseProvider>
        <AuthProvider>
          <LanguageProvider>
            <ThemeProvider>
              <AppRoutes />
              <Toaster position="top-right" />
            </ThemeProvider>
          </LanguageProvider>
        </AuthProvider>
      </FirebaseProvider>
  );
}

export default App;