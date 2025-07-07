import React, { useState } from "react";
import { motion } from "framer-motion";
import { Mail, Lock, Shield } from "lucide-react";
import { useLanguage } from "../../contexts/LanguageContext";
import { useAuth } from "../../contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";

const AdminLogin: React.FC = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const { t } = useLanguage();
  const { login } = useAuth(); // Assuming login function handles Firebase authentication
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      // Call the login function from AuthContext
      // This function should ideally set the 'user' and 'isAdmin' states in AuthContext
      await login(email, password);

      // After successful login, AuthContext's onAuthStateChanged should update user and isAdmin.
      // We can then safely navigate. No need for localStorage.getItem("isAdmin") here
      // as isAdmin is managed by AuthContext.
      // Added a small timeout for toast to be visible before navigation.
      setTimeout(() => {
        // The AppContent component already handles redirection based on `isAdmin` state.
        // We can simply navigate to the admin dashboard route, and AppContent will protect it.
        toast.success("Welcome back, Admin!");
        navigate("/admin/dashboard");
      }, 500); // Short delay to allow toast to show
    } catch (error: any) {
      console.error("Login error:", error);
      toast.error("Invalid credentials or access denied.");
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-gray-900 dark:to-gray-800 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="max-w-md w-full"
      >
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-xl p-8 border border-gray-200 dark:border-gray-700">
          <div className="text-center mb-8">
            <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-100 dark:bg-blue-900 rounded-full mb-4">
              <Shield className="w-8 h-8 text-blue-600 dark:text-blue-400" />
            </div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
              Admin Login
            </h1>
            <p className="text-gray-600 dark:text-gray-300">
              Access the admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("email")}
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="admin@usbs.org"
                  required
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
                {t("password")}
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 dark:border-gray-600 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                  placeholder="Enter your password"
                  required
                />
              </div>
            </div>

            <motion.button
              type="submit"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              disabled={isLoading}
              className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white font-semibold py-3 px-6 rounded-xl transition-colors"
            >
              {isLoading ? "Signing in..." : t("login")}
            </motion.button>
          </form>

          <div className="mt-6 text-center">
            {/* The link back to home needs to include the viewType parameter */}
            <button
              onClick={() => navigate(`/?viewType=user`)} // Explicitly setting viewType to user
              className="text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 text-sm font-medium"
            >
              ← Back to Home (User View)
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default AdminLogin;
