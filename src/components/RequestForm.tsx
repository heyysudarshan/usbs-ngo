// src/components/RequestForm.tsx
"use client";
import React, { useState, useRef, useMemo, useEffect } from "react";
import {
  collection, query, where, getDocs, getDoc, doc, setDoc,
} from "firebase/firestore";
import {
  ArrowRight, ArrowLeft, Phone, User, MapPin, HelpCircle, CheckCircle, Loader2,
} from "lucide-react";
import toast from "react-hot-toast";

import { useLanguage } from "../contexts/LanguageContext";
import { useAuth } from "../contexts/AuthContext";
import { useFirebase } from "../contexts/FirebaseContext";

interface Category {
  id: string;
  name: string;
}

const RequestForm: React.FC = () => {
  const [currentStep, setCurrentStep] = useState(0);
  const [formData, setFormData] = useState({
    mobileNumber: "", firstName: "", middleName: "", lastName: "",
    gender: "", location: "", category: "", problemDescription: "",
  });
  const [categories, setCategories] = useState<Category[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isChecking, setIsChecking] = useState(false);

  const { t } = useLanguage();
  const { setCurrentUserMobile } = useAuth();
  const { db } = useFirebase();
  const inputRefs = useRef<(HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement | null)[]>([]);

  const steps = useMemo(() => [
    { title: t("mobile_number"), icon: Phone, hash: "mobile" },
    { title: t("personal_details"), icon: User, hash: "personal-details" },
    { title: t("contact_info"), icon: MapPin, hash: "contact-info" },
    { title: t("help_needed"), icon: HelpCircle, hash: "help-needed" },
  ], [t]);

  useEffect(() => {
    setTimeout(() => {
      if (currentStep === 0) inputRefs.current[0]?.focus();
      else if (currentStep === 1) inputRefs.current[1]?.focus();
      else if (currentStep === 2) inputRefs.current[5]?.focus();
      else if (currentStep === 3) inputRefs.current[6]?.focus();
    }, 100);
  }, [currentStep]);

  useEffect(() => {
    const hashes = steps.map((step) => step.hash);
    window.location.hash = hashes[currentStep];
  }, [currentStep, steps]);

  useEffect(() => {
    const hashes = steps.map((s) => s.hash);
    const onHash = () => {
      const hash = window.location.hash.replace("#", "");
      const index = hashes.indexOf(hash);
      if (index >= 0 && index !== currentStep) setCurrentStep(index);
    };
    window.addEventListener("hashchange", onHash);
    return () => window.removeEventListener("hashchange", onHash);
  }, [currentStep, steps]);

  useEffect(() => {
    const fetch = async () => {
      if (!db) return toast.error(t("db_not_ready"));
      try {
        const snapshot = await getDocs(collection(db, "categories"));
        setCategories(snapshot.docs.map((d) => ({ id: d.id, name: d.data().name })));
      } catch {
        toast.error(t("failed_load_categories"));
      }
    };
    fetch();
  }, [db, t]);

  const handleKeyDown = (e: React.KeyboardEvent, i: number) => {
    if (e.key === "Enter") {
      e.preventDefault();
      let next = -1;
      if (currentStep === 0 && i === 0) handleNext();
      else if (currentStep === 1) {
        if (i === 1) next = 2;
        else if (i === 2) next = 3;
        else if (i === 3) next = 4;
        else if (i === 4) handleNext();
      } else if (currentStep === 2 && i === 5) handleNext();
      else if (currentStep === 3) {
        if (i === 6) next = 7;
        else if (i === 7) handleNext();
      }
      if (next !== -1) inputRefs.current[next]?.focus();
    }
  };

  const isValid = () => {
    if (currentStep === 0)
      return formData.mobileNumber.length === 10 && /^[0-9]+$/.test(formData.mobileNumber);
    if (currentStep === 1)
      return formData.firstName && formData.lastName && formData.gender;
    if (currentStep === 2) return formData.location;
    if (currentStep === 3) return formData.category && formData.problemDescription;
    return false;
  };

  const handleSubmit = async () => {
    setIsSubmitting(true);
    try {
      if (!db) return toast.error(t("db_not_ready"));
      const ref = doc(collection(db, "requests"));
      await setDoc(ref, {
        ...formData,
        userId: formData.mobileNumber,
        id: ref.id,
        status: "Pending",
        submittedAt: new Date(),
      });
      setCurrentUserMobile(formData.mobileNumber);
      toast.success(t("submitted"));
      window.location.replace("/dashboard#requests");
    } catch {
      toast.error(t("submit_failed"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleNext = async () => {
    if (!isValid()) return toast.error(t("fill_required_fields"));
    if (currentStep === 0) {
      setIsChecking(true);
      try {
        const mobile = formData.mobileNumber;
        const existing = await getDocs(query(collection(db!, "requests"), where("userId", "==", mobile)));
        if (!existing.empty) {
          setCurrentUserMobile(mobile);
          toast.success(t("existing_request_found"));
          return window.location.replace("/dashboard#requests");
        }
        const userDoc = await getDoc(doc(db!, "users", mobile));
        if (userDoc.exists()) {
          const u = userDoc.data();
          setFormData((p) => ({
            ...p,
            firstName: u.firstName || "",
            middleName: u.middleName || "",
            lastName: u.lastName || "",
            gender: u.gender || "",
            location: u.location || "",
          }));
        }
      } catch {
        toast.error(t("failed_to_check_mobile"));
      } finally {
        setIsChecking(false);
      }
    }
    if (currentStep < steps.length - 1) setCurrentStep((p) => p + 1);
    else handleSubmit();
  };

  const handleBack = () => {
    if (currentStep > 0) window.history.back();
  };

  const progress = ((currentStep + 1) / steps.length) * 100;

  return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-purple-50 dark:from-gray-950 dark:via-gray-900 dark:to-black">
        <div className="max-w-2xl mx-auto px-4 py-8">
          <div className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h1 className="text-3xl font-bold text-gray-900 dark:text-white">{t("submit_request")}</h1>
              <span className="text-sm font-medium text-gray-500 dark:text-gray-300 bg-gray-100 dark:bg-gray-800 px-3 py-1 rounded-full">
              {localStorage.getItem("selectedLanguage") === "mr" || localStorage.getItem("selectedLanguage") === "hi"
                  ? `${steps.length} ${t("of")} ${currentStep + 1}`
                  : `${currentStep + 1} ${t("of")} ${steps.length}`}
            </span>
            </div>
            <div className="w-full bg-gray-200 dark:bg-gray-800 rounded-full h-2 mb-6">
              <div
                  className="bg-gradient-to-r from-blue-500 to-purple-600 h-2 rounded-full"
                  style={{ width: `${progress}%` }}
              />
            </div>
          </div>

          <div className="bg-white dark:bg-gray-900 rounded-3xl shadow-xl border border-gray-100 dark:border-gray-800 overflow-hidden">
            <div className="p-8">
              <div className="text-center mb-8">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-2xl mb-4">
                  {React.createElement(steps[currentStep].icon, { className: "w-8 h-8 text-white" })}
                </div>
                <h2 className="text-2xl font-bold text-gray-900 dark:text-white mb-2">
                  {steps[currentStep].title}
                </h2>
                <p className="text-gray-600 dark:text-gray-300">{t("provide_required_info")}</p>
              </div>

              {/* STEP 0 - Mobile Number */}
              {currentStep === 0 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-white">{t("mobile_number_required")}</label>
                    <div className="flex rounded-2xl border-2 dark:border-gray-700 border-gray-200 overflow-hidden">
                      <div className="flex items-center px-4 py-4 bg-gray-50 dark:bg-gray-800 border-r border-gray-200 dark:border-gray-700">
                        <Phone className="w-5 h-5 text-gray-400 mr-2" />
                        <span className="text-gray-700 dark:text-white font-medium">+91</span>
                      </div>
                      <input
                          ref={(el) => inputRefs.current[0] = el}
                          type="tel"
                          inputMode="numeric"
                          value={formData.mobileNumber}
                          onChange={(e) =>
                              setFormData((p) => ({ ...p, mobileNumber: e.target.value.replace(/\D/g, "").slice(0, 10) }))
                          }
                          onKeyDown={(e) => handleKeyDown(e, 0)}
                          className="flex-1 px-4 py-4 bg-transparent dark:bg-gray-800 text-gray-900 dark:text-white outline-none"
                          placeholder={t("enter_10_digit_mobile")}
                      />
                    </div>
                  </div>
              )}

              {/* STEP 1 - Name Details */}
              {currentStep === 1 && (
                  <div className="space-y-6">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { key: "firstName", labelKey: "first_name_required", placeholderKey: "first_name" },
                        { key: "middleName", labelKey: "middle_name", placeholderKey: "middle_name" },
                        { key: "lastName", labelKey: "last_name_required", placeholderKey: "last_name" },
                      ].map((fieldObj, i) => (
                          <div key={fieldObj.key}>
                            <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">
                              {t(fieldObj.labelKey)}
                            </label>
                            <input
                                ref={(el) => (inputRefs.current[i + 1] = el)}
                                type="text"
                                placeholder={t(fieldObj.placeholderKey)}
                                className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                                value={(formData as any)[fieldObj.key]}
                                onChange={(e) => setFormData({ ...formData, [fieldObj.key]: e.target.value })}
                                onKeyDown={(e) => handleKeyDown(e, i + 1)}
                            />
                          </div>
                      ))}
                    </div>

                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">{t("gender_required")}</label>
                      <select
                          ref={(el) => (inputRefs.current[4] = el)}
                          className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          value={formData.gender}
                          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
                          onKeyDown={(e) => handleKeyDown(e, 4)}
                      >
                        <option value="">{t("select_gender")}</option>
                        <option value="male">{t("male")}</option>
                        <option value="female">{t("female")}</option>
                        <option value="other">{t("other")}</option>
                      </select>
                    </div>
                  </div>
              )}

              {/* STEP 2 - Location */}
              {currentStep === 2 && (
                  <div className="space-y-4">
                    <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">{t("location_required")}</label>
                    <div className="relative">
                      <MapPin className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
                      <input
                          ref={(el) => (inputRefs.current[5] = el)}
                          type="text"
                          placeholder={t("location")}
                          className="w-full pl-12 pr-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          value={formData.location}
                          onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                          onKeyDown={(e) => handleKeyDown(e, 5)}
                      />
                    </div>
                  </div>
              )}

              {/* STEP 3 - Help Needed */}
              {currentStep === 3 && (
                  <div className="space-y-6">
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">{t("category_required")}</label>
                      <select
                          ref={(el) => (inputRefs.current[6] = el)}
                          className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white"
                          value={formData.category}
                          onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                          onKeyDown={(e) => handleKeyDown(e, 6)}
                      >
                        <option value="">{t("select_category")}</option>
                        {categories.map((c) => (
                            <option key={c.id} value={c.name}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-gray-700 dark:text-white mb-2">{t("problem_description_required")}</label>
                      <textarea
                          ref={(el) => (inputRefs.current[7] = el)}
                          placeholder={t("describe_problem")}
                          className="w-full px-4 py-4 rounded-2xl border-2 border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 text-gray-900 dark:text-white resize-none"
                          rows={6}
                          value={formData.problemDescription}
                          onChange={(e) => setFormData({ ...formData, problemDescription: e.target.value })}
                          onKeyDown={(e) => handleKeyDown(e, 7)}
                      />
                    </div>
                  </div>
              )}
            </div>

            {/* Bottom Navigation */}
            <div className="px-8 py-6 bg-gray-50 dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700">
              <div className="flex justify-between items-center gap-4">
                <button
                    onClick={handleBack}
                    disabled={currentStep === 0}
                    className={`flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all duration-200 ${
                        currentStep === 0
                            ? "bg-gray-200 dark:bg-gray-700 text-gray-400 cursor-not-allowed"
                            : "bg-white dark:bg-gray-900 text-gray-700 dark:text-white shadow-md hover:shadow-lg hover:bg-gray-50 dark:hover:bg-gray-800 border border-gray-200 dark:border-gray-700"
                    }`}
                >
                  <ArrowLeft className="w-5 h-5" />
                  {t("back")}
                </button>

                <button
                    onClick={handleNext}
                    disabled={!isValid() || isChecking || isSubmitting}
                    className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-blue-500 to-purple-600 hover:from-blue-600 hover:to-purple-700 disabled:from-gray-400 disabled:to-gray-400 text-white font-semibold rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 disabled:cursor-not-allowed"
                >
                  {isChecking ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t("checking")}
                      </>
                  ) : isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        {t("submitting")}
                      </>
                  ) : currentStep === steps.length - 1 ? (
                      <>
                        {t("submit")}
                        <CheckCircle className="w-5 h-5" />
                      </>
                  ) : (
                      <>
                        {t("next")}
                        <ArrowRight className="w-5 h-5" />
                      </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
  );
};

export default RequestForm;