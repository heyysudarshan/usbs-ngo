import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  ArrowRight,
  ArrowLeft,
  Scale,
  GraduationCap,
  Heart,
  Home,
  ChevronDown,
} from "lucide-react";
import { useLanguage, SUPPORTED_LANGUAGES } from "../contexts/LanguageContext";

const OnboardingFlow: React.FC = () => {
  const { t, setLanguage, currentLanguage } = useLanguage();

  const pages = [
    {
      title: t("get_legal_help"),
      description: t("get_legal_help_desc"),
      icon: Scale,
      gradient: "from-blue-500 to-indigo-600",
      value: "legal",
      image:
          "https://images.pexels.com/photos/5668882/pexels-photo-5668882.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      title: t("get_education_help"),
      description: t("get_education_help_desc"),
      icon: GraduationCap,
      gradient: "from-emerald-500 to-green-600",
      value: "education",
      image:
          "https://images.pexels.com/photos/5212317/pexels-photo-5212317.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
    {
      title: t("get_medical_help"),
      description: t("get_medical_help_desc"),
      icon: Heart,
      gradient: "from-rose-500 to-pink-600",
      value: "medical",
      image:
          "https://images.pexels.com/photos/4386467/pexels-photo-4386467.jpeg?auto=compress&cs=tinysrgb&w=800",
    },
  ];

  const [currentPage, setCurrentPage] = useState(0);
  const [selectedLang, setSelectedLang] = useState(currentLanguage);

  useEffect(() => {
    // If first time landing on /onboarding, push dummy state to disable back
    if (window.location.pathname === "/onboarding" && (window.location.hash === "" || window.location.hash === "#1")) {
      history.replaceState(null, "", "/onboarding#1");
    }

    const handlePopState = () => {
      const hash = window.location.hash;
      if (window.location.pathname === "/onboarding" && (hash === "" || hash === "#1")) {
        history.pushState(null, "", window.location.href);
      }
    };

    const onHashChange = () => {
      const hash = parseInt(location.hash.replace("#", ""), 10);
      if (!isNaN(hash) && hash >= 1 && hash <= pages.length) {
        setCurrentPage(hash - 1);
      }
    };

    // Set initial page from hash
    const step = parseInt(location.hash.replace("#", ""), 10);
    if (!isNaN(step) && step >= 1 && step <= pages.length) {
      setCurrentPage(step - 1);
    } else {
      setCurrentPage(0);
    }

    window.addEventListener("popstate", handlePopState);
    window.addEventListener("hashchange", onHashChange);

    return () => {
      window.removeEventListener("popstate", handlePopState);
      window.removeEventListener("hashchange", onHashChange);
    };
  }, []);



  useEffect(() => {
    if (currentPage >= 0 && currentPage < pages.length) {
      const targetHash = `#${currentPage + 1}`;
      if (location.hash !== targetHash) {
        history.pushState(null, "", targetHash);
      }
    }
  }, [currentPage]);

  useEffect(() => {
    setLanguage(selectedLang);
    localStorage.setItem("language", selectedLang.code);
  }, [selectedLang]);

  const handleLangChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const selected = SUPPORTED_LANGUAGES.find((l) => l.code === e.target.value)!;
    setSelectedLang(selected);
  };

  const handleNext = () => {
    if (currentPage < pages.length - 1) {
      const nextPage = currentPage + 1;
      history.pushState(null, "", `#${nextPage + 1}`);
      setCurrentPage(nextPage);
    } else {
      window.location.replace("/request#mobile");
    }
  };

  const handlePrevious = () => {
    window.history.back();
  };

  const currentPageData = pages[currentPage];
  const Icon = currentPageData.icon;

  return (
      <div className="min-h-screen bg-white dark:bg-gray-900 relative overflow-hidden">
        <div className="absolute inset-0 overflow-hidden hidden sm:block">
          <div className="absolute top-0 right-0 w-72 h-72 bg-gradient-to-br from-blue-100/30 to-indigo-100/30 dark:from-blue-900/10 dark:to-indigo-900/10 rounded-full blur-3xl transform translate-x-1/2 -translate-y-1/2" />
          <div className="absolute bottom-0 left-0 w-72 h-72 bg-gradient-to-tr from-purple-100/30 to-pink-100/30 dark:from-purple-900/10 dark:to-pink-900/10 rounded-full blur-3xl transform -translate-x-1/2 translate-y-1/2" />
        </div>

        <div className="relative z-10 min-h-screen flex flex-col">
          {/* Header */}
          <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="flex items-center justify-between p-6 sm:p-8"
          >
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
                <Home className="w-6 h-6 text-white" />
              </div>
              <span className="font-bold text-2xl bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent">
              USBS
            </span>
            </div>

            <div className="relative">
              <select
                  value={selectedLang.code}
                  onChange={handleLangChange}
                  className="appearance-none bg-white/80 dark:bg-gray-800/80 backdrop-blur-sm text-sm rounded-2xl py-3 px-4 pr-10 border border-gray-200/50 dark:border-gray-700/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500/50 transition-all duration-200 shadow-lg hover:shadow-xl"
              >
                {SUPPORTED_LANGUAGES.map((lang) => (
                    <option key={lang.code} value={lang.code}>
                      {lang.nativeName}
                    </option>
                ))}
              </select>
              <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400 pointer-events-none" />
            </div>
          </motion.div>

          {/* Progress Bar */}
          <motion.div
              initial={{ opacity: 0, scaleX: 0 }}
              animate={{ opacity: 1, scaleX: 1 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="px-6 sm:px-8 mb-8"
          >
            <div className="flex space-x-2">
              {pages.map((_, index) => (
                  <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.8 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ duration: 0.3, delay: 0.1 * index }}
                      className={`h-2 rounded-full transition-all duration-500 ${
                          index === currentPage
                              ? `bg-gradient-to-r ${currentPageData.gradient} flex-1 shadow-lg`
                              : index < currentPage
                                  ? "bg-gray-400 dark:bg-gray-600 w-8"
                                  : "bg-gray-200 dark:bg-gray-700 w-8"
                      }`}
                  />
              ))}
            </div>
            <div className="flex justify-between mt-2 text-xs text-gray-500 dark:text-gray-400">
              <span>{currentPage + 1}</span>
              <span>{pages.length}</span>
            </div>
          </motion.div>

          {/* Main Card Content */}
          <div className="flex-1 px-6 sm:px-8 flex items-center justify-center">
            <AnimatePresence mode="wait">
              <motion.div
                  key={currentPage}
                  initial={{ opacity: 0, x: 50, scale: 0.9 }}
                  animate={{ opacity: 1, x: 0, scale: 1 }}
                  exit={{ opacity: 0, x: -50, scale: 0.9 }}
                  transition={{ duration: 0.4, ease: "easeInOut" }}
                  className="text-center max-w-lg mx-auto"
              >
                <div className="mb-12 relative">
                  <motion.div
                      initial={{ scale: 0.8, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ duration: 0.5, delay: 0.2 }}
                      className="w-80 h-80 sm:w-96 sm:h-96 mx-auto rounded-3xl overflow-hidden shadow-2xl relative"
                  >
                    <img
                        src={currentPageData.image}
                        alt={currentPageData.title}
                        className="w-full h-full object-cover"
                    />
                    <div
                        className={`absolute inset-0 bg-gradient-to-t ${currentPageData.gradient} opacity-20`}
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 via-transparent to-transparent" />
                  </motion.div>
                  <motion.div
                      initial={{ scale: 0, rotate: -180 }}
                      animate={{ scale: 1, rotate: 0 }}
                      transition={{
                        duration: 0.6,
                        delay: 0.4,
                        type: "spring",
                        stiffness: 200,
                      }}
                      className={`absolute -bottom-8 left-1/2 transform -translate-x-1/2 w-20 h-20 bg-gradient-to-r ${currentPageData.gradient} rounded-3xl flex items-center justify-center shadow-2xl border-4 border-white dark:border-gray-900`}
                  >
                    <Icon className="w-10 h-10 text-white" />
                  </motion.div>
                </div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.6 }}
                    className="text-4xl sm:text-5xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-6 leading-tight"
                >
                  <div className="h-1"/>
                  {currentPageData.title}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.5, delay: 0.8 }}
                    className="text-xl text-gray-600 dark:text-gray-300 leading-relaxed max-w-md mx-auto"
                >
                  {currentPageData.description}
                </motion.p>
              </motion.div>
            </AnimatePresence>
          </div>

          {/* Navigation Buttons */}
          <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5, delay: 1 }}
              className="p-6 sm:p-8"
          >
            <div className="flex items-center justify-between gap-4 max-w-lg mx-auto">
              <motion.button
                  whileHover={{ scale: 1.05, y: -2 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={handlePrevious}
                  disabled={currentPage === 0}
                  className={`p-4 rounded-2xl transition-all duration-300 ${
                      currentPage === 0
                          ? "bg-gray-100 dark:bg-gray-800 text-gray-400 dark:text-gray-600 cursor-not-allowed"
                          : "bg-white dark:bg-gray-800 text-gray-700 dark:text-gray-300 shadow-lg hover:shadow-xl border border-gray-200/50 dark:border-gray-700/50"
                  }`}
              >
                <ArrowLeft className="w-6 h-6" />
              </motion.button>

              <motion.button
                  whileHover={{ scale: 1.02, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleNext}
                  className={`flex-1 bg-gradient-to-r ${currentPageData.gradient} text-white font-semibold py-5 px-8 rounded-2xl flex items-center justify-center gap-3 shadow-lg hover:shadow-xl transition-all duration-300 text-lg relative overflow-hidden group`}
              >
                <div className="absolute inset-0 bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10">
                {currentPage === pages.length - 1 ? t("request_help") : t("next")}
              </span>
                <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
              </motion.button>
            </div>
          </motion.div>
        </div>
      </div>
  );
};

export default OnboardingFlow;