import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import {
  Users,
  FolderOpen,
  Plus,
  Edit,
  Trash2,
  Phone,
  LogOut,
  Shield,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings, // Import Settings icon
  Globe, // Import Globe icon for language
  Sun, // Import Sun icon for light theme
  Moon, // Import Moon icon for dark theme
  Palette, // Import Palette icon for theme
} from "lucide-react";
import {
  useLanguage,
  SUPPORTED_LANGUAGES,
} from "../../contexts/LanguageContext"; // Import SUPPORTED_LANGUAGES
import { useTheme } from "../../contexts/ThemeContext"; // Import useTheme
import { useAuth } from "../../contexts/AuthContext";
import { useFirebase } from "../../contexts/FirebaseContext";
import { useNavigate } from "react-router-dom";
import {
  collection,
  getDocs,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  onSnapshot,
} from "firebase/firestore";
import toast from "react-hot-toast";

interface Request {
  id: string;
  userId: string;
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

interface User {
  id: string;
  mobileNumber: string;
  firstName: string;
  lastName: string;
}

const AdminDashboard: React.FC = () => {
  const [activeTab, setActiveTab] = useState<
    "requests" | "categories" | "settings"
  >("requests");
  const [requests, setRequests] = useState<Request[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [users, setUsers] = useState<Record<string, User>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showAddCategory, setShowAddCategory] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  const [newCategory, setNewCategory] = useState({ name: "", description: "" });

  const { t, currentLanguage, setLanguage } = useLanguage();
  const { theme, setTheme } = useTheme(); // Use theme context
  const { user, isAdmin, logout } = useAuth();
  const { db } = useFirebase();
  const navigate = useNavigate();

  useEffect(() => {
    if (!user || !isAdmin) {
      navigate("/admin");
      return;
    }

    // Fetch requests
    const requestsRef = collection(db, "requests");
    const unsubscribeRequests = onSnapshot(requestsRef, (snapshot) => {
      const fetchedRequests = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Request)
      );
      setRequests(
        fetchedRequests.sort(
          (a, b) => b.submittedAt?.toDate() - a.submittedAt?.toDate()
        )
      );
    });

    // Fetch categories
    const categoriesRef = collection(db, "categories");
    const unsubscribeCategories = onSnapshot(categoriesRef, (snapshot) => {
      const fetchedCategories = snapshot.docs.map(
        (doc) =>
          ({
            id: doc.id,
            ...doc.data(),
          } as Category)
      );
      setCategories(fetchedCategories);
    });

    // Fetch users
    const fetchUsers = async () => {
      const usersRef = collection(db, "users");
      const snapshot = await getDocs(usersRef);
      const usersMap: Record<string, User> = {};
      snapshot.docs.forEach((doc) => {
        usersMap[doc.data().mobileNumber] = {
          id: doc.id,
          ...doc.data(),
        } as User;
      });
      setUsers(usersMap);
      setIsLoading(false);
    };

    fetchUsers();

    return () => {
      unsubscribeRequests();
      unsubscribeCategories();
    };
  }, [user, isAdmin, db, navigate]);

  const handleStatusUpdate = async (requestId: string, newStatus: string) => {
    try {
      await updateDoc(doc(db, "requests", requestId), {
        status: newStatus,
        lastUpdatedAt: new Date(),
      });
      toast.success("Request status updated");
    } catch (error) {
      console.error("Error updating status:", error);
      toast.error("Failed to update status");
    }
  };

  const handleDeleteRequest = async (requestId: string) => {
    if (window.confirm("Are you sure you want to delete this request?")) {
      try {
        await deleteDoc(doc(db, "requests", requestId));
        toast.success("Request deleted");
      } catch (error) {
        console.error("Error deleting request:", error);
        toast.error("Failed to delete request");
      }
    }
  };

  const handleAddCategory = async () => {
    if (!newCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await addDoc(collection(db, "categories"), {
        ...newCategory,
        createdAt: new Date(),
      });
      setNewCategory({ name: "", description: "" });
      setShowAddCategory(false);
      toast.success("Category added successfully");
    } catch (error) {
      console.error("Error adding category:", error);
      toast.error("Failed to add category");
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) {
      toast.error("Category name is required");
      return;
    }

    try {
      await updateDoc(doc(db, "categories", editingCategory.id), {
        name: editingCategory.name,
        description: editingCategory.description,
        updatedAt: new Date(),
      });
      setEditingCategory(null);
      toast.success("Category updated successfully");
    } catch (error) {
      console.error("Error updating category:", error);
      toast.error("Failed to update category");
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    if (window.confirm("Are you sure you want to delete this category?")) {
      try {
        await deleteDoc(doc(db, "categories", categoryId));
        toast.success("Category deleted");
      } catch (error) {
        console.error("Error deleting category:", error);
        toast.error("Failed to delete category");
      }
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status.toLowerCase()) {
      case "pending":
        return <Clock className="w-4 h-4 text-yellow-500" />;
      case "in progress":
        return <AlertCircle className="w-4 h-4 text-blue-500" />;
      case "resolved":
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      default:
        return <Clock className="w-4 h-4 text-gray-500" />;
    }
  };

  const handleLogout = async () => {
    try {
      await logout();
      navigate("/admin");
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 dark:bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900">
      {/* Header */}
      <div className="bg-white dark:bg-gray-800 shadow-sm border-b border-gray-200 dark:border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
                <Shield className="w-5 h-5 text-white" />
              </div>
              <span className="font-bold text-xl text-gray-900 dark:text-white">
                USBS Admin
              </span>
            </div>
            <div className="flex items-center gap-4">
              <span className="text-gray-700 dark:text-gray-300">
                {user?.email}
              </span>
              <button
                onClick={handleLogout}
                className="p-2 text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200 transition-colors"
              >
                <LogOut className="w-5 h-5" />
              </button>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Dashboard Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white mb-2">
            {t("admin_dashboard")}
          </h1>
          <p className="text-gray-600 dark:text-gray-400">
            Manage user requests, help categories, and app settings
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Total Requests
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {requests.length}
                </p>
              </div>
              <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                <FolderOpen className="w-6 h-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Pending Requests
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {
                    requests.filter((r) => r.status.toLowerCase() === "pending")
                      .length
                  }
                </p>
              </div>
              <div className="w-12 h-12 bg-yellow-100 dark:bg-yellow-900 rounded-full flex items-center justify-center">
                <Clock className="w-6 h-6 text-yellow-600 dark:text-yellow-400" />
              </div>
            </div>
          </div>

          <div className="bg-white dark:bg-gray-800 p-6 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600 dark:text-gray-400">
                  Active Users
                </p>
                <p className="text-2xl font-bold text-gray-900 dark:text-white">
                  {Object.keys(users).length}
                </p>
              </div>
              <div className="w-12 h-12 bg-green-100 dark:bg-green-900 rounded-full flex items-center justify-center">
                <Users className="w-6 h-6 text-green-600 dark:text-green-400" />
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="bg-white dark:bg-gray-800 rounded-xl shadow-lg border border-gray-200 dark:border-gray-700">
          <div className="border-b border-gray-200 dark:border-gray-700">
            <nav className="flex space-x-8 px-6">
              <button
                onClick={() => setActiveTab("requests")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "requests"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {t("manage_requests")}
              </button>
              <button
                onClick={() => setActiveTab("categories")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "categories"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                {t("manage_categories")}
              </button>
              <button
                onClick={() => setActiveTab("settings")}
                className={`py-4 px-1 border-b-2 font-medium text-sm ${
                  activeTab === "settings"
                    ? "border-blue-500 text-blue-600 dark:text-blue-400"
                    : "border-transparent text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
                }`}
              >
                <Settings className="inline-block w-4 h-4 mr-2" />{" "}
                {t("settings")}
              </button>
            </nav>
          </div>

          <div className="p-6">
            {
              activeTab === "requests" ? (
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("user_requests")}
                  </h3>
                  {requests.length === 0 ? (
                    <p className="text-gray-500 dark:text-gray-400 text-center py-8">
                      No requests found
                    </p>
                  ) : (
                    <div className="space-y-4">
                      {requests.map((request) => {
                        const user = users[request.userId];
                        return (
                          <div
                            key={request.id}
                            className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                          >
                            <div className="flex items-start justify-between mb-3">
                              <div className="flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                  <h4 className="font-semibold text-gray-900 dark:text-white">
                                    {request.category}
                                  </h4>
                                  {getStatusIcon(request.status)}
                                  <span className="text-sm text-gray-600 dark:text-gray-400">
                                    {request.status}
                                  </span>
                                </div>
                                <p className="text-gray-600 dark:text-gray-300 text-sm mb-2">
                                  {request.problemDescription}
                                </p>
                                <div className="flex items-center gap-4 text-sm text-gray-500 dark:text-gray-400">
                                  <span>
                                    User: {user?.firstName} {user?.lastName}
                                  </span>
                                  <span>Mobile: {request.userId}</span>
                                  <span>
                                    Date:{" "}
                                    {request.submittedAt
                                      ?.toDate()
                                      .toLocaleDateString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            <div className="flex items-center gap-2 flex-wrap">
                              <select
                                value={request.status}
                                onChange={(e) =>
                                  handleStatusUpdate(request.id, e.target.value)
                                }
                                className="px-3 py-1 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-sm"
                              >
                                <option value="Pending">Pending</option>
                                <option value="In Progress">In Progress</option>
                                <option value="Resolved">Resolved</option>
                              </select>

                              <a
                                href={`tel:${request.userId}`}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200 rounded text-sm hover:bg-green-200 dark:hover:bg-green-800 transition-colors"
                              >
                                <Phone className="w-4 h-4" />
                                {t("contact_user")}
                              </a>

                              <button
                                onClick={() => handleDeleteRequest(request.id)}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-200 rounded text-sm hover:bg-red-200 dark:hover:bg-red-800 transition-colors"
                              >
                                <Trash2 className="w-4 h-4" />
                                {t("delete")}
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>
              ) : activeTab === "categories" ? (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                      {t("manage_categories")}
                    </h3>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => setShowAddCategory(true)}
                      className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg flex items-center gap-2 text-sm"
                    >
                      <Plus className="w-4 h-4" />
                      {t("add_category")}
                    </motion.button>
                  </div>

                  {showAddCategory && (
                    <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                      <h4 className="font-medium text-gray-900 dark:text-white mb-3">
                        Add New Category
                      </h4>
                      <div className="space-y-3">
                        <input
                          type="text"
                          placeholder="Category Name"
                          value={newCategory.name}
                          onChange={(e) =>
                            setNewCategory((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                        />
                        <textarea
                          placeholder="Description (optional)"
                          value={newCategory.description}
                          onChange={(e) =>
                            setNewCategory((prev) => ({
                              ...prev,
                              description: e.target.value,
                            }))
                          }
                          className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          rows={2}
                        />
                        <div className="flex gap-2">
                          <button
                            onClick={handleAddCategory}
                            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                          >
                            {t("save")}
                          </button>
                          <button
                            onClick={() => {
                              setShowAddCategory(false);
                              setNewCategory({ name: "", description: "" });
                            }}
                            className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                          >
                            {t("cancel")}
                          </button>
                        </div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3">
                    {categories.map((category) => (
                      <div
                        key={category.id}
                        className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600"
                      >
                        {editingCategory?.id === category.id ? (
                          <div className="space-y-3">
                            <input
                              type="text"
                              value={editingCategory.name}
                              onChange={(e) =>
                                setEditingCategory((prev) =>
                                  prev
                                    ? { ...prev, name: e.target.value }
                                    : null
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                            />
                            <textarea
                              value={editingCategory.description}
                              onChange={(e) =>
                                setEditingCategory((prev) =>
                                  prev
                                    ? { ...prev, description: e.target.value }
                                    : null
                                )
                              }
                              className="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 rounded bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                              rows={2}
                            />
                            <div className="flex gap-2">
                              <button
                                onClick={handleEditCategory}
                                className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded text-sm"
                              >
                                {t("save")}
                              </button>
                              <button
                                onClick={() => setEditingCategory(null)}
                                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded text-sm"
                              >
                                {t("cancel")}
                              </button>
                            </div>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between">
                            <div>
                              <h4 className="font-medium text-gray-900 dark:text-white">
                                {category.name}
                              </h4>
                              {category.description && (
                                <p className="text-sm text-gray-600 dark:text-gray-400">
                                  {category.description}
                                </p>
                              )}
                            </div>
                            <div className="flex gap-2">
                              <button
                                onClick={() => setEditingCategory(category)}
                                className="p-2 text-blue-600 hover:bg-blue-100 dark:hover:bg-blue-900 rounded"
                              >
                                <Edit className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() =>
                                  handleDeleteCategory(category.id)
                                }
                                className="p-2 text-red-600 hover:bg-red-100 dark:hover:bg-red-900 rounded"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              ) : activeTab === "settings" ? ( // Correct conditional rendering for settings
                // Settings Tab Content
                <div className="space-y-6">
                  <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
                    {t("app_settings")}
                  </h3>

                  {/* Language Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-3 mb-4">
                      <Globe className="w-5 h-5 text-blue-600 dark:text-blue-400" />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {t("select_language")}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {SUPPORTED_LANGUAGES.map((lang) => (
                        <motion.button
                          key={lang.code}
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                          onClick={() => setLanguage(lang)}
                          className={`w-full p-3 rounded-md border text-sm flex items-center justify-between transition-colors
                          ${
                            currentLanguage.code === lang.code
                              ? "border-blue-500 bg-blue-100 dark:bg-blue-900/30 text-blue-800 dark:text-blue-200"
                              : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                          }`}
                        >
                          <span>
                            {lang.name} ({lang.nativeName})
                          </span>
                          {currentLanguage.code === lang.code && (
                            <CheckCircle className="w-4 h-4 text-blue-600 dark:text-blue-400" />
                          )}
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Theme Settings */}
                  <div className="bg-gray-50 dark:bg-gray-700 rounded-lg p-4 border border-gray-200 dark:border-gray-600">
                    <div className="flex items-center gap-3 mb-4">
                      <Palette className="w-5 h-5 text-purple-600 dark:text-purple-400" />
                      <h4 className="font-medium text-gray-900 dark:text-white">
                        {t("choose_theme")}
                      </h4>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTheme("light")}
                        className={`w-full p-3 rounded-md border text-sm flex items-center justify-between transition-colors
                        ${
                          theme === "light"
                            ? "border-purple-500 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-yellow-500" />
                          <span>{t("light_theme")}</span>
                        </div>
                        {theme === "light" && (
                          <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        )}
                      </motion.button>
                      <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setTheme("dark")}
                        className={`w-full p-3 rounded-md border text-sm flex items-center justify-between transition-colors
                        ${
                          theme === "dark"
                            ? "border-purple-500 bg-purple-100 dark:bg-purple-900/30 text-purple-800 dark:text-purple-200"
                            : "border-gray-300 dark:border-gray-600 bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-700"
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-indigo-500" />
                          <span>{t("dark_theme")}</span>
                        </div>
                        {theme === "dark" && (
                          <CheckCircle className="w-4 h-4 text-purple-600 dark:text-purple-400" />
                        )}
                      </motion.button>
                    </div>
                  </div>
                </div>
              ) : null /* Fallback if no tab is active, though one should always be */
            }
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
