import React, {useEffect, useState} from "react";
import { motion } from "framer-motion";
import { Palette, ArrowRight, Sun, Moon, Check } from "lucide-react";
import { useTheme } from "../contexts/ThemeContext";
import { useNavigate } from "react-router-dom";
import { useLanguage } from "../contexts/LanguageContext";

const ThemeSelector: React.FC = () => {
    const { setTheme } = useTheme();
    const { t } = useLanguage();
    const navigate = useNavigate();

    const viewType = localStorage.getItem("viewType") || "user";

    const [selectedTheme, setSelectedTheme] = useState<"light" | "dark">(() => {
        const saved = localStorage.getItem("selectedTheme");
        return saved === "dark" ? "dark" : "light";
    });

    useEffect(() => {
        // Ensure UI updates on first load if theme is already applied
        const current = localStorage.getItem("selectedTheme");
        if (current === "dark" || current === "light") {
            setSelectedTheme(current);
        }
    }, []);

    const handleSelect = (choice: "light" | "dark") => {
        setSelectedTheme(choice);
        setTheme(choice);
    };

    const handleNext = () => {
        setTheme(selectedTheme);
        localStorage.setItem("selectedTheme", selectedTheme);
        localStorage.setItem("isThemeViewed", "true");
        if (viewType === "admin") {
            navigate("/admin", { replace: true });
        } else {
            navigate("/onboarding#1", { replace: true });
        }
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 sm:bg-gradient-to-br sm:from-slate-50 sm:via-blue-50 sm:to-indigo-100 sm:dark:from-gray-900 sm:dark:via-slate-900 sm:dark:to-gray-800 flex items-center justify-center p-4 relative overflow-hidden">
            {/* Background decorative elements - only on desktop */}
            <div className="absolute inset-0 overflow-hidden hidden sm:block">
                <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-blue-200/20 to-purple-200/20 dark:from-blue-900/10 dark:to-purple-900/10 rounded-full blur-3xl"></div>
                <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-indigo-200/20 to-pink-200/20 dark:from-indigo-900/10 dark:to-pink-900/10 rounded-full blur-3xl"></div>
            </div>

            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, ease: "easeOut" }}
                className="w-full max-w-md relative z-10"
            >
                <div className="bg-transparent sm:bg-white/80 sm:dark:bg-gray-800/80 sm:backdrop-blur-xl sm:rounded-3xl sm:shadow-2xl sm:border sm:border-white/20 sm:dark:border-gray-700/30 p-8 sm:p-10">
                    {/* Header */}
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            transition={{ delay: 0.2, duration: 0.5, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl mb-6 shadow-lg"
                        >
                            <Palette className="w-10 h-10 text-white" />
                        </motion.div>
                        <motion.h1
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.3, duration: 0.5 }}
                            className="text-3xl font-bold bg-gradient-to-r from-gray-900 to-gray-600 dark:from-white dark:to-gray-300 bg-clip-text text-transparent mb-3"
                        >
                            <div className="h-1"></div>
                            {t("choose_theme")}
                        </motion.h1>
                        <motion.p
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.4, duration: 0.5 }}
                            className="text-gray-600 dark:text-gray-400 text-lg"
                        >
                            {t("select_theme")}
                        </motion.p>
                    </div>

                    {/* Theme Options */}
                    <div className="space-y-4 mb-8">
                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5, duration: 0.4 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect("light")}
                            className={`group w-full p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                                selectedTheme === "light"
                                    ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-blue-50 dark:from-indigo-900/20 dark:to-blue-900/20 shadow-lg"
                                    : "border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:border-gray-300 dark:hover:border-gray-500"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                                        selectedTheme === "light"
                                            ? "bg-yellow-100 dark:bg-yellow-900/30"
                                            : "bg-gray-100 dark:bg-gray-600 group-hover:bg-yellow-100 dark:group-hover:bg-yellow-900/30"
                                    }`}>
                                        <Sun className={`w-6 h-6 transition-colors duration-300 ${
                                            selectedTheme === "light"
                                                ? "text-yellow-500"
                                                : "text-gray-500 group-hover:text-yellow-500"
                                        }`} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-900 dark:text-white text-lg">
                                            {t("light_theme")}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {t("light_theme_desc")}
                                        </div>
                                    </div>
                                </div>
                                {selectedTheme === "light" && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"
                                    >
                                        <Check className="w-4 h-4 text-white" />
                                    </motion.div>
                                )}
                            </div>
                        </motion.button>

                        <motion.button
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.6, duration: 0.4 }}
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleSelect("dark")}
                            className={`group w-full p-6 rounded-2xl border-2 transition-all duration-300 relative overflow-hidden ${
                                selectedTheme === "dark"
                                    ? "border-indigo-500 bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-900/20 dark:to-purple-900/20 shadow-lg"
                                    : "border-gray-200 dark:border-gray-600 bg-white/50 dark:bg-gray-700/50 hover:bg-white/70 dark:hover:bg-gray-700/70 hover:border-gray-300 dark:hover:border-gray-500"
                            }`}
                        >
                            <div className="flex items-center justify-between">
                                <div className="flex items-center gap-4">
                                    <div className={`p-3 rounded-xl transition-all duration-300 ${
                                        selectedTheme === "dark"
                                            ? "bg-purple-100 dark:bg-purple-900/30"
                                            : "bg-gray-100 dark:bg-gray-600 group-hover:bg-purple-100 dark:group-hover:bg-purple-900/30"
                                    }`}>
                                        <Moon className={`w-6 h-6 transition-colors duration-300 ${
                                            selectedTheme === "dark"
                                                ? "text-purple-500"
                                                : "text-gray-500 group-hover:text-purple-500"
                                        }`} />
                                    </div>
                                    <div className="text-left">
                                        <div className="font-semibold text-gray-900 dark:text-white text-lg">
                                            {t("dark_theme")}
                                        </div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400 mt-1">
                                            {t("dark_theme_desc")}
                                        </div>
                                    </div>
                                </div>
                                {selectedTheme === "dark" && (
                                    <motion.div
                                        initial={{ scale: 0 }}
                                        animate={{ scale: 1 }}
                                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                                        className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center"
                                    >
                                        <Check className="w-4 h-4 text-white" />
                                    </motion.div>
                                )}
                            </div>
                        </motion.button>
                    </div>

                    {/* Next Button */}
                    <motion.button
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.7, duration: 0.4 }}
                        whileHover={{ scale: 1.02, y: -2 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleNext}
                        className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-700 hover:to-purple-700 text-white font-semibold py-4 px-8 rounded-2xl flex items-center justify-center gap-3 transition-all duration-300 shadow-lg hover:shadow-xl"
                    >
                        <span className="text-lg">{t("next")}</span>
                        <ArrowRight className="w-5 h-5" />
                    </motion.button>
                </div>
            </motion.div>
        </div>
    );
};

export default ThemeSelector;