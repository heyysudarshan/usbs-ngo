import React, {
  createContext,
  useContext,
  useState,
  ReactNode,
} from "react";

export interface Language {
  code: string;
  name: string;
  nativeName: string;
}

export const SUPPORTED_LANGUAGES: Language[] = [
  { code: "en", name: "English", nativeName: "English" },
  { code: "hi", name: "Hindi", nativeName: "हिंदी" },
  { code: "mr", name: "Marathi", nativeName: "मराठी" },
];

interface LanguageContextType {
  currentLanguage: Language;
  setLanguage: (language: Language) => void;
  isLanguageSelected: boolean;
  t: (key: string) => string;
  selectedLanguage: string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(
    undefined
);

const translations: Record<string, Record<string, string>> = {
  en: {
    welcome: "Welcome to USBS",
    select_language: "Select Your Language",
    next: "Next",
    choose_theme: "Choose App Theme",
    select_theme: "Select how the app should look",
    light_theme: "Light Theme",
    light_theme_desc: "Bright and clear view",
    dark_theme: "Dark Theme",
    dark_theme_desc: "Dark and comfortable view",
    request_help: "Request Help",
    get_legal_help: "Get Legal Help",
    get_legal_help_desc: "Receive free legal support for your issues.",
    get_education_help: "Get Education Help",
    get_education_help_desc: "Access guidance and resources for learning.",
    get_medical_help: "Get Medical Help",
    get_medical_help_desc: "Medical support for you and your family.",
    submit_request: "Submit Request",
    of: "of",
    provide_required_info: "Please fill in all required details",
    mobile_number: "Mobile Number",
    personal_details: "Personal Details",
    contact_info: "Contact Information",
    help_needed: "Help Needed",
    mobile_number_required: "Mobile Number *",
    enter_10_digit_mobile: "Enter 10-digit mobile number",
    first_name: "First Name",
    first_name_required: "First Name *",
    middle_name: "Middle Name",
    last_name: "Last Name",
    last_name_required: "Last Name *",
    gender_required: "Gender *",
    select_gender: "Select Gender",
    male: "Male",
    female: "Female",
    other: "Other",
    location_required: "Location *",
    location: "Enter your location",
    category_required: "Help Category *",
    select_category: "Select Help Category",
    problem_description_required: "Problem Description *",
    describe_problem: "Describe your issue",
    db_not_ready: "Database not ready. Try again later.",
    failed_load_categories: "Failed to load categories",
    fill_required_fields: "Please fill all required fields",
    submit_failed: "Failed to submit request",
    submitted: "Request submitted successfully",
    existing_request_found: "You already submitted a request",
    failed_to_check_mobile: "Failed to check mobile number",
    back: "Back",
    checking: "Checking...",
    submitting: "Submitting...",
    submit: "Submit",
  },
  hi: {
    welcome: "USBS में आपका स्वागत है",
    select_language: "अपनी भाषा चुनें",
    next: "आगे",
    choose_theme: "ऐप थीम चुनें",
    select_theme: "ऐप कैसा दिखेगा चुनें",
    light_theme: "लाइट थीम",
    light_theme_desc: "साफ और हल्की स्क्रीन",
    dark_theme: "डार्क थीम",
    dark_theme_desc: "गहरी और आरामदायक स्क्रीन",
    request_help: "मदद का अनुरोध करें",
    get_legal_help: "कानूनी सहायता प्राप्त करें",
    get_legal_help_desc: "अपने मुद्दों के लिए मुफ्त कानूनी सहायता प्राप्त करें।",
    get_education_help: "शैक्षणिक सहायता प्राप्त करें",
    get_education_help_desc: "सीखने के लिए मार्गदर्शन और साधन प्राप्त करें।",
    get_medical_help: "चिकित्सा सहायता प्राप्त करें",
    get_medical_help_desc: "आप और आपके परिवार के लिए चिकित्सा सहायता।",
    submit_request: "अनुरोध सबमिट करें",
    of: "में से",
    provide_required_info: "कृपया सभी ज़रूरी जानकारी भरें",
    mobile_number: "मोबाइल नंबर",
    personal_details: "व्यक्तिगत जानकारी",
    contact_info: "संपर्क जानकारी",
    help_needed: "मदद की ज़रूरत",
    mobile_number_required: "मोबाइल नंबर *",
    enter_10_digit_mobile: "10 अंकों का मोबाइल नंबर दर्ज करें",
    first_name: "पहला नाम",
    first_name_required: "पहला नाम *",
    middle_name: "मध्य नाम",
    last_name: "अंतिम नाम",
    last_name_required: "अंतिम नाम *",
    gender_required: "लिंग *",
    select_gender: "लिंग चुनें",
    male: "पुरुष",
    female: "महिला",
    other: "अन्य",
    location_required: "स्थान *",
    location: "अपना स्थान दर्ज करें",
    category_required: "सहायता श्रेणी *",
    select_category: "सहायता श्रेणी चुनें",
    problem_description_required: "समस्या का विवरण *",
    describe_problem: "अपनी समस्या का विवरण लिखें",
    db_not_ready: "डेटाबेस तैयार नहीं है, बाद में प्रयास करें।",
    failed_load_categories: "श्रेणियां लोड नहीं हो सकीं",
    fill_required_fields: "कृपया सभी ज़रूरी फ़ील्ड भरें",
    submit_failed: "अनुरोध सबमिट नहीं हुआ",
    submitted: "अनुरोध सफलतापूर्वक सबमिट हुआ",
    existing_request_found: "आपका अनुरोध पहले से है",
    failed_to_check_mobile: "मोबाइल नंबर चेक नहीं हो पाया",
    back: "पीछे",
    checking: "जांच हो रही है...",
    submitting: "सबमिट हो रहा है...",
    submit: "सबमिट करें",
  },
  mr: {
    welcome: "USBS मध्ये तुमचं स्वागत आहे",
    select_language: "तुमची भाषा निवडा",
    next: "पुढे",
    choose_theme: "अ‍ॅपची थीम निवडा",
    select_theme: "अ‍ॅप कसा दिसेल ते निवडा",
    light_theme: "लाइट थीम",
    light_theme_desc: "सोपं आणि स्वच्छ स्क्रीन",
    dark_theme: "डार्क थीम",
    dark_theme_desc: "गडद पण आरामदायक स्क्रीन",
    request_help: "मदतीची विनंती करा",
    get_legal_help: "कायदेशीर मदत घ्या",
    get_legal_help_desc: "तुमच्या समस्यांसाठी मोफत कायदेशीर मदत मिळवा.",
    get_education_help: "शैक्षणिक मदत घ्या",
    get_education_help_desc: "अभ्यासासाठी मदत व मार्गदर्शन मिळवा.",
    get_medical_help: "वैद्यकीय मदत घ्या",
    get_medical_help_desc: "तुमच्यासाठी आणि कुटुंबासाठी वैद्यकीय मदत.",
    submit_request: "विनंती सबमिट करा",
    of: "पैकी",
    provide_required_info: "कृपया सर्व आवश्यक माहिती भरा",
    mobile_number: "मोबाईल नंबर",
    personal_details: "वैयक्तिक माहिती",
    contact_info: "संपर्क माहिती",
    help_needed: "मदतीची गरज",
    mobile_number_required: "मोबाईल नंबर *",
    enter_10_digit_mobile: "१० अंकी मोबाईल नंबर टाका",
    first_name: "पहिलं नाव",
    first_name_required: "पहिलं नाव *",
    middle_name: "मधलं नाव",
    last_name: "आडनाव",
    last_name_required: "आडनाव *",
    gender_required: "लिंग *",
    select_gender: "लिंग निवडा",
    male: "पुरुष",
    female: "महिला",
    other: "इतर",
    location_required: "ठिकाण *",
    location: "तुमचं ठिकाण टाका",
    category_required: "सहाय्य प्रकार *",
    select_category: "सहाय्य प्रकार निवडा",
    problem_description_required: "समस्येचं वर्णन *",
    describe_problem: "तुमची समस्या लिहा",
    db_not_ready: "डेटाबेस तयार नाही. नंतर प्रयत्न करा.",
    failed_load_categories: "श्रेण्या लोड होऊ शकल्या नाहीत",
    fill_required_fields: "कृपया सर्व आवश्यक माहिती भरा",
    submit_failed: "विनंती सबमिट होऊ शकली नाही",
    submitted: "विनंती यशस्वीरित्या सबमिट झाली",
    existing_request_found: "तुमची विनंती आधीच सबमिट आहे",
    failed_to_check_mobile: "मोबाईल नंबर तपासता आला नाही",
    back: "मागे",
    checking: "तपासत आहोत...",
    submitting: "सबमिट करत आहोत...",
    submit: "सबमिट करा",
  },
};


export const LanguageProvider: React.FC<{ children: ReactNode }> = ({
                                                                      children,
                                                                    }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(() => {
    const savedCode = localStorage.getItem("selectedLanguage");
    return (
        SUPPORTED_LANGUAGES.find((lang) => lang.code === savedCode) ||
        SUPPORTED_LANGUAGES[0]
    );
  });

  const [isLanguageSelected, setIsLanguageSelected] = useState(() => {
    return localStorage.getItem("languageSelected") === "true";
  });

  const setLanguage = (language: Language) => {
    setCurrentLanguage(language);
    setIsLanguageSelected(true);
    localStorage.setItem("selectedLanguage", language.code);
    localStorage.setItem("languageSelected", "true");
  };

  const t = (key: string): string => {
    return (
        translations[currentLanguage.code]?.[key] || translations.en[key] || key
    );
  };

  return (
      <LanguageContext.Provider
          value={{
            currentLanguage,
            setLanguage,
            isLanguageSelected,
            t,
            selectedLanguage: currentLanguage.code,
          }}
      >
        {children}
      </LanguageContext.Provider>
  );
};

export const useLanguage = (): LanguageContextType => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error("useLanguage must be used within a LanguageProvider");
  }
  return context;
};

export { LanguageContext };
