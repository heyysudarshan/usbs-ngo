import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { Globe, ArrowRight, Check } from "lucide-react";
import { useLanguage, SUPPORTED_LANGUAGES } from "../contexts/LanguageContext";
import { useNavigate } from "react-router-dom";

const LanguageSelector: React.FC = () => {
    const { currentLanguage, setLanguage, t } = useLanguage();
    const navigate = useNavigate();
    const [selectedLang, setSelectedLang] = useState(currentLanguage);

    useEffect(() => {
        setLanguage(selectedLang);
    }, [selectedLang, setLanguage]);

    const handleLanguageSelect = (language: (typeof SUPPORTED_LANGUAGES)[0]) => {
        setSelectedLang(language);
    };

    const handleContinue = () => {
        localStorage.setItem("languageSelected", "true");
        localStorage.setItem("isLanguageViewed", "true");
        navigate("/theme", { replace: true });
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 sm:bg-gradient-to-br sm:from-slate-50 sm:via-blue-50 sm:to-indigo-100 sm:dark:from-gray-950 sm:dark:via-gray-900 sm:dark:to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decoration - only on desktop */}
            <div className="absolute inset-0 overflow-hidden hidden sm:block">
                <div className="absolute -top-1/2 -right-1/2 w-96 h-96 bg-gradient-to-br from-blue-400/10 to-indigo-600/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-1/2 -left-1/2 w-96 h-96 bg-gradient-to-tr from-purple-400/10 to-pink-600/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 30, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md mx-auto relative z-10"
            >
                <div className="bg-transparent sm:bg-white/80 sm:dark:bg-gray-900/80 sm:backdrop-blur-xl sm:rounded-3xl sm:shadow-2xl sm:border sm:border-white/20 sm:dark:border-gray-800/20 p-4 sm:p-8 relative overflow-hidden">
                    <div className="text-center mb-8 relative z-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-2xl mb-6 shadow-lg"
                        >
                            <Globe className="w-10 h-10 text-white" />
                        </motion.div>

                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3 }}
                            className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-700 dark:from-white dark:to-gray-200 bg-clip-text text-transparent mb-3"
                        >
                            {t("welcome")}
                        </motion.h1>

                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4 }}
                            className="text-gray-600 dark:text-gray-300 text-lg"
                        >
                            {t("select_language")}
                        </motion.p>
                    </div>

                    <div className="space-y-3 mb-8 max-h-80 overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-gray-300 dark:scrollbar-thumb-gray-600 scrollbar-track-transparent">
                        {SUPPORTED_LANGUAGES.map((language, index) => (
                            <motion.button
                                key={language.code}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.5 + index * 0.05 }}
                                whileHover={{ scale: 1.02, y: -2 }}
                                whileTap={{ scale: 0.98 }}
                                onClick={() => handleLanguageSelect(language)}
                                className={`block w-full p-4 rounded-2xl border-2 transition-all duration-300 text-left relative overflow-hidden group ${
                                    selectedLang.code === language.code
                                        ? "border-blue-500 bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950/30 dark:to-indigo-950/30 shadow-lg"
                                        : "bg-transparent border-gray-200/50 dark:border-gray-700/50 hover:border-gray-300 dark:hover:border-gray-600 hover:bg-gray-50/50 dark:hover:bg-gray-800/50"
                                }`}
                            >
                                {/* Hover glow effect */}
                                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-indigo-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>

                                <div className="flex items-center justify-between relative z-10 w-full overflow-hidden">
                                    <div className="flex items-center gap-4 min-w-0 w-full">
                                        <div className="w-10 h-10 bg-gradient-to-br from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-600 rounded-xl flex items-center justify-center text-sm font-semibold text-gray-700 dark:text-gray-200 shrink-0">
                                            {language.code.toUpperCase()}
                                        </div>
                                        <div className="min-w-0 w-full">
                                            <div className="font-semibold text-gray-900 dark:text-white text-lg truncate">
                                                {language.nativeName}
                                            </div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400 truncate">
                                                {language.name}
                                            </div>
                                        </div>
                                    </div>

                                    {selectedLang.code === language.code && (
                                        <motion.div
                                            initial={{ scale: 0 }}
                                            animate={{ scale: 1 }}
                                            className="w-6 h-6 flex-shrink-0 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center shadow-lg"
                                        >
                                            <Check className="w-4 h-4 text-white" />
                                        </motion.div>
                                    )}
                                </div>
                            </motion.button>
                        ))}
                    </div>

                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.8 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleContinue}
                        className="w-full bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white font-semibold py-4 px-6 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl relative overflow-hidden group"
                    >
                        <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-indigo-400 opacity-0 group-hover:opacity-20 transition-opacity duration-300"></div>
                        <span className="relative z-10 text-lg">{t("next")}</span>
                        <ArrowRight className="w-5 h-5 relative z-10 group-hover:translate-x-1 transition-transform duration-300" />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default LanguageSelector;