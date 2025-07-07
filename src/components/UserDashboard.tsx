import { motion } from "framer-motion";
import {
    PlusCircle,
    Clock,
    CheckCircle2,
    AlertCircle,
    Trash2,
    Home,
    User,
    LogOut,
    Globe,
    Sun,
    Moon,
    Settings,
    Wifi,
    WifiOff,
    RefreshCw,
    Loader2,
} from "lucide-react";
import { useLanguage, SUPPORTED_LANGUAGES } from "../contexts/LanguageContext";
import { useTheme } from "../contexts/ThemeContext";
import { useAuth } from "../contexts/AuthContext";
import { useFirebase } from "../contexts/FirebaseContext";
import { useNavigate, useLocation } from "react-router-dom";
import {
    collection,
    query,
    where,
    deleteDoc,
    doc,
    onSnapshot,
    addDoc,
    getDocs,
} from "firebase/firestore";
import toast from "react-hot-toast";
import {useEffect, useState} from "react";

interface Request {
    id: string;
    category: string;
    problemDescription: string;
    status: string;
    submittedAt: any;
}

interface Category {
    id: string;
    name: string;
    description: string;
}

const RequestStatusBadge = ({ status }: { status: string }) => {
    const color =
        status === "Pending"
            ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300"
            : status === "Approved"
                ? "bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300"
                : "bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300";
    const icon =
        status === "Pending" ? <Clock size={14} /> : status === "Approved" ? <CheckCircle2 size={14} /> : <AlertCircle size={14} />;

    return (
        <span
            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-medium ${color}`}
        >
            {icon}
            <span>{status}</span>
        </span>
    );
};

const NetworkStatus = ({ isOnline, onRetry }: { isOnline: boolean; onRetry: () => void }) => {
    const { t } = useLanguage();

    if (isOnline) return null;

    return (
        <div className="bg-red-50 dark:bg-red-900/20 border border-red-200 dark:border-red-800 rounded-lg p-4 mb-6">
            <div className="flex items-center gap-3">
                <WifiOff className="text-red-500" size={20} />
                <div className="flex-1">
                    <h3 className="font-semibold text-red-800 dark:text-red-200">{t("network_error")}</h3>
                    <p className="text-sm text-red-600 dark:text-red-300 mt-1">{t("check_connection")}</p>
                </div>
                <button
                    onClick={onRetry}
                    className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                >
                    <RefreshCw size={16} />
                    {t("retry")}
                </button>
            </div>
        </div>
    );
};

const UserDashboard: React.FC = () => {
    const [requests, setRequests] = useState<Request[]>([]);
    const [categories, setCategories] = useState<Category[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);
    const [activeTab, setActiveTab] = useState("requests");
    const [newCategory, setNewCategory] = useState("");
    const [newDescription, setNewDescription] = useState("");
    const [isOnline, setIsOnline] = useState(navigator.onLine);
    const [networkError, setNetworkError] = useState(false);

    const { t, setLanguage, currentLanguage } = useLanguage();
    const { theme, setTheme} = useTheme();
    const { currentUserMobile, setCurrentUserMobile } = useAuth();
    const { db } = useFirebase();
    const navigate = useNavigate();
    const location = useLocation();

    // Network status monitoring
    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setNetworkError(false);
            toast.success(t("back_online"));
        };

        const handleOffline = () => {
            setIsOnline(false);
            setNetworkError(true);
            toast.error(t("connection_lost"));
        };

        window.addEventListener('online', handleOnline);
        window.addEventListener('offline', handleOffline);

        return () => {
            window.removeEventListener('online', handleOnline);
            window.removeEventListener('offline', handleOffline);
        };
    }, [t]);

    useEffect(() => {
        if (!currentUserMobile) navigate("/", { replace: true });
        const hash = location.hash.replace("#", "") || "requests";
        setActiveTab(hash);
    }, [currentUserMobile, location.hash]);

    useEffect(() => {
        // Push a dummy history entry so back won't go to /request
        history.replaceState(null, "", "/dashboard#request");
        history.pushState(null, "", window.location.href);

        const handlePopState = () => {
            // Prevent going back
            window.history.go(1);
        };

        window.addEventListener("popstate", handlePopState);
        return () => window.removeEventListener("popstate", handlePopState);
    }, []);

    const setTab = (tab: string) => {
        window.location.hash = tab;
        setActiveTab(tab);
    };

    const fetchRequests = async () => {
        if (!db || !currentUserMobile) return;

        try {
            setNetworkError(false);
            const q = query(collection(db, "requests"), where("userId", "==", currentUserMobile));
            const unsubscribe = onSnapshot(q, (snap) => {
                const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Request));
                arr.sort((a, b) => b.submittedAt?.toDate() - a.submittedAt?.toDate());
                setRequests(arr);
                setIsLoading(false);
            }, (error) => {
                console.error("Error fetching requests:", error);
                setNetworkError(true);
                setIsLoading(false);
            });
            return unsubscribe;
        } catch (error) {
            console.error("Error setting up requests listener:", error);
            setNetworkError(true);
            setIsLoading(false);
        }
    };

    const fetchCategories = async () => {
        if (!db || !currentUserMobile) return;

        try {
            setNetworkError(false);
            const snap = await getDocs(collection(db, "categories"));
            const arr = snap.docs.map((d) => ({ id: d.id, ...d.data() } as Category));
            setCategories(arr);
        } catch (error) {
            console.error("Error fetching categories:", error);
            setNetworkError(true);
            toast.error(t("failed_to_load_categories"));
        }
    };

    useEffect(() => {
        fetchRequests();
    }, [db, currentUserMobile]);

    useEffect(() => {
        fetchCategories();
    }, [db, currentUserMobile]);

    const handleDelete = async (id: string) => {
        if (!isOnline) {
            toast.error(t("no_internet_connection"));
            return;
        }

        try {
            await deleteDoc(doc(db!, "requests", id));
            toast.success(t("request_deleted"));
            setDeleteConfirmId(null);
        } catch (error) {
            console.error("Error deleting request:", error);
            toast.error(t("failed_to_delete"));
        }
    };

    const handleAddNew = async () => {
        if (!newCategory || !newDescription) return toast.error(t("fill_all_fields"));

        if (!isOnline) {
            toast.error(t("no_internet_connection"));
            return;
        }

        setIsSubmitting(true);

        try {
            await addDoc(collection(db!, "requests"), {
                userId: currentUserMobile,
                category: newCategory,
                problemDescription: newDescription,
                status: "Pending",
                submittedAt: new Date(),
                lastUpdatedAt: new Date(),
            });
            toast.success(t("submitted"));
            setNewCategory("");
            setNewDescription("");
            setTab("requests");
        } catch (error) {
            console.error("Error submitting request:", error);
            toast.error(t("failed_to_submit"));
        } finally {
            setIsSubmitting(false);
        }
    };

    const handleThemeChange = (newTheme: "light" | "dark") => {
        setTheme(newTheme);
    };

    const handleLogout = () => {
        setCurrentUserMobile(null);
        localStorage.removeItem("currentUserMobile");
        navigate("/", { replace: true });
    };

    const handleNetworkRetry = () => {
        if (isOnline) {
            setIsLoading(true);
            fetchRequests();
            fetchCategories();
        }
    };

    return (
        <div className="min-h-screen flex flex-col bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-white pb-20">
            {/* Header */}
            <div className="flex justify-between items-center px-6 py-4 bg-white dark:bg-gray-800 shadow-sm border-b dark:border-gray-700">
                <div className="flex items-center gap-3">
                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                        <Home className="text-blue-600 dark:text-blue-400" size={20} />
                    </div>
                    <h1 className="text-xl font-bold">USBS</h1>
                </div>
                <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2">
                        {isOnline ? (
                            <Wifi className="text-green-500" size={16} />
                        ) : (
                            <WifiOff className="text-red-500" size={16} />
                        )}
                    </div>
                    <div className="flex items-center gap-2 bg-gray-100 dark:bg-gray-700 px-3 py-2 rounded-lg">
                        <User size={16} />
                        <span className="text-sm font-medium">{currentUserMobile}</span>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
                    >
                        <LogOut size={18} />
                    </button>
                </div>
            </div>

            {/* Content */}
            <div className="flex-1 p-6 max-w-4xl w-full mx-auto">
                {networkError && <NetworkStatus isOnline={isOnline} onRetry={handleNetworkRetry} />}

                {activeTab === "requests" && (
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h2 className="text-2xl font-bold">{t("my_requests")}</h2>
                            <div className="text-sm text-gray-500 dark:text-gray-400">
                                {requests.length} {t("total_requests")}
                            </div>
                        </div>

                        {isLoading ? (
                            <div className="flex items-center justify-center py-12">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-3">{t("loading")}...</span>
                            </div>
                        ) : requests.length === 0 ? (
                            <div className="text-center py-12">
                                <Clock size={48} className="mx-auto text-gray-400 mb-4" />
                                <p className="text-gray-500 dark:text-gray-400 text-lg">{t("no_requests_yet")}</p>
                                <p className="text-sm text-gray-400 mt-2">{t("create_first_request")}</p>
                            </div>
                        ) : (
                            <div className="grid gap-4">
                                {requests.map((r) => (
                                    <motion.div
                                        key={r.id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-sm border dark:border-gray-700 hover:shadow-md transition-shadow"
                                    >
                                        <div className="flex justify-between items-start mb-3">
                                            <h3 className="font-semibold text-lg">{r.category}</h3>
                                            <RequestStatusBadge status={r.status} />
                                        </div>
                                        <p className="text-gray-700 dark:text-gray-300 mb-4 leading-relaxed">
                                            {r.problemDescription}
                                        </p>
                                        <div className="flex justify-between items-center">
                                            <p className="text-sm text-gray-500 dark:text-gray-400">
                                                {t("submitted_on")}: {r.submittedAt?.toDate().toLocaleDateString()}
                                            </p>
                                            <button
                                                onClick={() => setDeleteConfirmId(r.id)}
                                                className="flex items-center gap-1 text-sm text-red-500 hover:text-red-600 transition-colors"
                                            >
                                                <Trash2 size={14} />
                                                {t("delete")}
                                            </button>
                                        </div>

                                        {deleteConfirmId === r.id && (
                                            <motion.div
                                                className="fixed inset-0 bg-black bg-opacity-50 z-50 flex justify-center items-center p-4"
                                                initial={{ opacity: 0 }}
                                                animate={{ opacity: 1 }}
                                            >
                                                <motion.div
                                                    className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-xl w-full max-w-md"
                                                    initial={{ scale: 0.8, opacity: 0 }}
                                                    animate={{ scale: 1, opacity: 1 }}
                                                >
                                                    <h2 className="text-lg font-semibold mb-3">{t("confirm_delete")}</h2>
                                                    <p className="text-gray-600 dark:text-gray-400 mb-6">{t("confirm_delete_desc")}</p>
                                                    <div className="flex justify-end gap-3">
                                                        <button
                                                            onClick={() => setDeleteConfirmId(null)}
                                                            className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded-lg hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
                                                        >
                                                            {t("cancel")}
                                                        </button>
                                                        <button
                                                            onClick={() => handleDelete(r.id)}
                                                            className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                                                        >
                                                            {t("delete")}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            </motion.div>
                                        )}
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {activeTab === "new" && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-2xl font-bold mb-2">{t("add_new_request")}</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t("describe_your_issue")}
                            </p>
                        </div>

                        <div className="bg-white dark:bg-gray-800 p-8 rounded-xl shadow-sm border dark:border-gray-700 space-y-8">
                            <div>
                                <label className="block text-sm font-medium mb-3">{t("category")}</label>
                                <select
                                    value={newCategory}
                                    onChange={(e) => setNewCategory(e.target.value)}
                                    className="w-full p-4 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                                    disabled={isSubmitting}
                                >
                                    <option value="">{t("select_category")}</option>
                                    {categories.map((c) => (
                                        <option key={c.id} value={c.name}>
                                            {c.name}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium mb-3">{t("problem_description")}</label>
                                <textarea
                                    rows={6}
                                    value={newDescription}
                                    onChange={(e) => setNewDescription(e.target.value)}
                                    className="w-full p-4 rounded-lg border dark:border-gray-600 bg-white dark:bg-gray-700 focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all resize-none"
                                    placeholder={t("problemDescription")}
                                    disabled={isSubmitting}
                                />
                            </div>

                            <button
                                onClick={handleAddNew}
                                disabled={isSubmitting || !isOnline}
                                className="w-full bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white py-4 rounded-lg font-semibold flex items-center justify-center gap-2 transition-colors"
                            >
                                {isSubmitting ? (
                                    <>
                                        <Loader2 size={20} className="animate-spin" />
                                        {t("submitting")}...
                                    </>
                                ) : (
                                    <>
                                        <PlusCircle size={20} />
                                        {t("submit")}
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}

                {activeTab === "settings" && (
                    <div className="space-y-8">
                        <div className="text-center">
                            <h2 className="text-3xl font-bold mb-2">{t("settings")}</h2>
                            <p className="text-gray-600 dark:text-gray-400">
                                {t("customize_your_experience")}
                            </p>
                        </div>

                        {/* Language Settings */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-blue-100 dark:bg-blue-900/30 rounded-xl">
                                    <Globe className="text-blue-600 dark:text-blue-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{t("language_preferences")}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                        {t("select_your_preferred_language")}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                                {SUPPORTED_LANGUAGES.map((lang) => (
                                    <button
                                        key={lang.code}
                                        onClick={() => setLanguage(lang)}
                                        className={`p-6 rounded-xl border-2 text-left transition-all duration-200 ${
    currentLanguage.code === lang.code
        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20 scale-105"
        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
}`}
                                    >
                                        <div className="font-semibold text-lg mb-1">{lang.nativeName}</div>
                                        <div className="text-sm text-gray-500 dark:text-gray-400">{lang.name}</div>
                                        {currentLanguage.code === lang.code && (
                                            <div className="mt-3 flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm">
                                                <CheckCircle2 size={16} />
                                                <span>{t("selected")}</span>
                                            </div>
                                        )}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Theme Settings */}
                        <div className="bg-white dark:bg-gray-800 p-8 rounded-2xl shadow-sm border dark:border-gray-700">
                            <div className="flex items-center gap-4 mb-8">
                                <div className="p-3 bg-purple-100 dark:bg-purple-900/30 rounded-xl">
                                    <Settings className="text-purple-600 dark:text-purple-400" size={24} />
                                </div>
                                <div>
                                    <h3 className="text-xl font-semibold">{t("appearance")}</h3>
                                    <p className="text-gray-600 dark:text-gray-400 text-sm mt-1">
                                        {t("choose_how_app_looks")}
                                    </p>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                {[
                                    {
                                        mode: "light" as const,
                                        icon: Sun,
                                        label: t("light_mode"),
                                        description: t("light_mode_description")
                                    },
                                    {
                                        mode: "dark" as const,
                                        icon: Moon,
                                        label: t("dark_mode"),
                                        description: t("dark_mode_description")
                                    }
                                ].map(({ mode, icon: Icon, label, description }) => (
                                    <button
                                        key={mode}
                                        onClick={() => handleThemeChange(mode)}
                                        className={`flex items-center gap-4 p-6 rounded-xl border-2 text-left transition-all duration-200 ${
    theme === mode
        ? "border-blue-500 bg-blue-50 dark:bg-blue-900/20 ring-2 ring-blue-500/20 scale-105"
        : "border-gray-200 dark:border-gray-600 hover:border-gray-300 dark:hover:border-gray-500 hover:bg-gray-50 dark:hover:bg-gray-700/50"
}`}
                                    >
                                        <div className={`p-3 rounded-lg ${
    theme === mode
        ? "bg-blue-100 dark:bg-blue-900/30"
        : "bg-gray-100 dark:bg-gray-700"
}`}>
                                            <Icon
                                                size={24}
                                                className={theme === mode ? "text-blue-600 dark:text-blue-400" : "text-gray-600 dark:text-gray-400"}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <div className="font-semibold text-lg mb-1">{label}</div>
                                            <div className="text-sm text-gray-500 dark:text-gray-400">{description}</div>
                                            {theme === mode && (
                                                <div className="mt-2 flex items-center gap-1 text-blue-600 dark:text-blue-400 text-sm">
                                                    <CheckCircle2 size={16} />
                                                    <span>{t("active")}</span>
                                                </div>
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* App Info */}
                        <div className="bg-gradient-to-r from-blue-50 to-purple-50 dark:from-blue-900/20 dark:to-purple-900/20 p-8 rounded-2xl border dark:border-gray-700">
                            <div className="text-center">
                                <div className="inline-flex items-center gap-2 mb-4">
                                    <div className="p-2 bg-blue-100 dark:bg-blue-900/30 rounded-lg">
                                        <Home className="text-blue-600 dark:text-blue-400" size={20} />
                                    </div>
                                    <h3 className="text-xl font-semibold">USBS</h3>
                                </div>
                                <p className="text-gray-600 dark:text-gray-400 mb-4">
                                    {t("app_description")}
                                </p>
                                <div className="text-sm text-gray-500 dark:text-gray-400">
                                    {t("version")} 1.0.0
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Bottom Navigation - Fixed */}
            <nav className="sticky bottom-0 left-0 right-0 w-full bg-white dark:bg-gray-800 shadow-lg border-t dark:border-gray-700 py-2 z-40">
                <div className="flex justify-around px-4">
                    {[
                        { tab: "requests", icon: Clock, label: t("requests") },
                        { tab: "new", icon: PlusCircle, label: t("new") },
                        { tab: "settings", icon: Settings, label: t("settings") }
                    ].map(({ tab, icon: Icon, label }) => (
                        <button
                            key={tab}
                            onClick={() => setTab(tab)}
                            className={`flex flex-col items-center p-3 rounded-lg transition-colors ${
    activeTab === tab
        ? "text-blue-600 dark:text-blue-400 bg-blue-50 dark:bg-blue-900/20"
        : "text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-300"
}`}
                        >
                            <Icon size={20} />
                            <span className="text-xs mt-1 font-medium">{label}</span>
                        </button>
                    ))}
                </div>
            </nav>
        </div>
    );
};

export default UserDashboard;