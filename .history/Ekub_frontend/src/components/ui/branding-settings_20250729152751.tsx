import { useState, useEffect } from "react";
import { GeneralInfo } from "./general-info";
import { VisualIdentity } from "./visual-identity";
import { LivePreview } from "./live-preview";
import { SaveButton } from "./save-button";
import api from "../../utils/axios";
import { useAppDispatch } from "../../store/store";
import { updateBranding } from "../../store/slices/brandingSlice";

export interface BrandingData {
  appName: string;
  logoLight: File | string | null;
  logoDark: File | string | null;
  primaryColor: string;
  secondaryColor: string;
  defaultDarkMode: boolean;
}

export function BrandingSettings() {
  const dispatch = useAppDispatch();
  const [brandingData, setBrandingData] = useState<BrandingData>({
    appName: "",
    logoLight: null,
    logoDark: null,
    primaryColor: "#3B82F6",
    secondaryColor: "#8B5CF6",
    defaultDarkMode: false,
  });

  const [hasChanges, setHasChanges] = useState(false);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load existing branding data
  useEffect(() => {
    const fetchBrandingData = async () => {
      try {
        const response = await api.get("/branding-config");
        if (response.data) {
          setBrandingData({
            appName: response.data.appName || "Filimon",
            logoLight: response.data.logoLightUrl || null,
            logoDark: response.data.logoDarkUrl || null,
            primaryColor: response.data.primaryColor || "#3B82F6",
            secondaryColor: response.data.secondaryColor || "#8B5CF6",
            defaultDarkMode: response.data.defaultDarkMode || false,
          });
        }
      } catch (error) {
        console.error("Failed to fetch branding data:", error);
      }
    };

    fetchBrandingData();
  }, []);

  // Entrance animation
  useEffect(() => {
    const timer = setTimeout(() => setIsLoaded(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const updateBrandingData = (updates: Partial<BrandingData>) => {
    setBrandingData((prev) => ({ ...prev, ...updates }));
    setHasChanges(true);
  };

  const isValid = brandingData.appName.trim().length > 0;

  const handleSave = async () => {
    if (!isValid) return;

    try {
      const formData = new FormData();

      formData.append("primaryColor", brandingData.primaryColor);
      formData.append("secondaryColor", brandingData.secondaryColor);
      formData.append(
        "defaultDarkMode",
        brandingData.defaultDarkMode.toString()
      );
      formData.append("appName", brandingData.appName);

      if (brandingData.logoLight instanceof File) {
        formData.append("logoLight", brandingData.logoLight);
      }

      if (brandingData.logoDark instanceof File) {
        formData.append("logoDark", brandingData.logoDark);
      }

      const response = await api.put("/branding-config", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      if (response.data) {
        dispatch(updateBranding(response.data));
        setHasChanges(false);
      }
    } catch (error: any) {
      console.error(
        "Failed to save branding data:",
        error.response?.data || error.message
      );
    }
  };

  return (
    <div
      className={`max-w-full ml-60 max-h-screen  mx-auto px-4 sm:px-6 lg:px-8 py-2 bg-none transition-all duration-1000 ${
        isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
      }`}
    >
      {/* Header with Save Button */}
      <div className="flex items-center justify-between mb-8">
        <div
          className={`transition-all duration-700 delay-200 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <h1 className="text-3xl font-bold text-slate-900 mb-2 bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text">
            Branding Settings
          </h1>
          <p className="text-slate-600">
            Customize your app's visual identity and branding elements
          </p>
        </div>

        <div
          className={`transition-all duration-700 delay-400 ${
            isLoaded ? "opacity-100 translate-y-0" : "opacity-0 translate-y-4"
          }`}
        >
          <SaveButton
            isValid={isValid}
            hasChanges={hasChanges}
            onSave={handleSave}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left Column - Settings */}
        <div
          className={`lg:col-span-2 space-y-2 transition-all duration-700 delay-300 ${
            isLoaded ? "opacity-100 translate-x-0" : "opacity-0 -translate-x-2"
          }`}
        >
          <GeneralInfo
            appName={brandingData.appName}
            onUpdate={updateBrandingData}
          />
          <VisualIdentity data={brandingData} onUpdate={updateBrandingData} />
        </div>

        {/* Right Column - Preview */}
        <div
          className={`lg:col-span-1 transition-all duration-700 delay-500 ${
            isLoaded ? "opacity-100 translate-x-0" : "opacity-0 translate-x-8"
          }`}
        >
          <LivePreview data={brandingData} onUpdate={updateBrandingData} />
        </div>
      </div>
    </div>
  );
}