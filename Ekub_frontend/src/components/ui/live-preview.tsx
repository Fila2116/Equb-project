import { useState, useEffect } from "react";
import type { BrandingData } from "./branding-settings";
import { Toggle } from "./toggle";

interface LivePreviewProps {
  data: BrandingData;
  onUpdate: (updates: Partial<BrandingData>) => void;
}

export function LivePreview({ data, onUpdate }: LivePreviewProps) {
  const [isUpdating, setIsUpdating] = useState(false);
  const [previousData, setPreviousData] = useState(data);

  const currentLogo = data.defaultDarkMode ? data.logoDark : data.logoLight;

  // Detect changes and trigger update animation
  useEffect(() => {
    if (JSON.stringify(data) !== JSON.stringify(previousData)) {
      setIsUpdating(true);
      const timer = setTimeout(() => {
        setIsUpdating(false);
        setPreviousData(data);
      }, 600);
      return () => clearTimeout(timer);
    }
  }, [data, previousData]);

  return (
    <div className="sticky top-8">
      <div className="p-2 pb-6 bg-white rounded-xl border border-slate-200 transition-all duration-300 group">
        <div className="flex items-center space-x-2 mb-2 bg-none group-hover:translate-x-1 transition-transform duration-200"></div>

        {/* iPhone Device Frame */}
        <div className="mx-auto max-w-xs w-[266px] ">
          <div
            className={`
            relative bg-[#5d5d5d] rounded-[40px] p-1 transition-all duration-500 hover:scale-105 hover:shadow-2xl
            ${isUpdating ? "animate-pulse" : ""}
          `}>
            {/* iPhone frame with bezels */}
            <div className="bg-black  rounded-[36px] overflow-hidden">
              {/* Notch */}
              <div className="absolute top-0 left-1/2 transform -translate-x-1/2 w-[40%] h-7 bg-black z-10 rounded-b-[24px]">
                <div className="absolute top-1 left-1/2 transform -translate-x-1/2 w-16 h-4 flex justify-center items-center">
                  <div className="w-2 h-2 bg-slate-800 rounded-full mx-1"></div>
                  <div className="w-1 h-1 bg-slate-700 rounded-full mx-0.5"></div>
                  <div className="w-4 h-1 bg-slate-800 rounded-full mx-1"></div>
                </div>
              </div>

              {/* Screen Content */}
              <div
                className={`
                  relative rounded-[32px] p-4  h-[500px] flex flex-col transition-all duration-700 ease-out overflow-hidden
                  ${data.defaultDarkMode ? "bg-black" : "bg-white"}
                  ${
                    isUpdating ? "scale-95 opacity-80" : "scale-100 opacity-100"
                  }
                `}>
                {/* Status Bar */}
                <div className="flex justify-between items-center mb-6 animate-in slide-in-from-top duration-500 pt-4">
                  <div className="text-xs font-medium text-slate-400">9:41</div>
                  <div className="flex space-x-1">
                    <Toggle
                      checked={data.defaultDarkMode}
                      onChange={(checked) =>
                        onUpdate({ defaultDarkMode: checked })
                      }
                    />
                  </div>
                </div>

                {/* Logo */}
                <div className="flex justify-center mb-4 animate-in zoom-in duration-700 delay-200">
                  {currentLogo ? (
                    <div className="relative group/logo">
                      <img
                        src={currentLogo || "/placeholder.svg"}
                        alt="App Logo"
                        className="w-28 h-28 object-contain transition-all duration-500 group-hover/logo:scale-110 group-hover/logo:rotate-3"
                      />
                      {isUpdating && (
                        <div className="absolute inset-0 bg-blue-400 rounded-full animate-ping opacity-30"></div>
                      )}
                    </div>
                  ) : (
                    <div
                      className={`
                        w-16 h-16 rounded-2xl flex items-center justify-center text-white font-bold text-xl transition-all duration-500 hover:scale-110 hover:rotate-3
                        ${
                          data.defaultDarkMode ? "bg-slate-700" : "bg-slate-300"
                        }
                      `}
                      style={{
                        backgroundColor: data.primaryColor,
                        transform: isUpdating
                          ? "scale(1.1) rotate(5deg)"
                          : undefined,
                      }}>
                      {data.appName.charAt(0) || "A"}
                    </div>
                  )}
                </div>

                {/* App Name */}
                <h1
                  className={`
                    text-center text-2xl font-bold mb-4 transition-all duration-500 animate-in slide-in-from-bottom delay-300
                    ${data.defaultDarkMode ? "text-white" : "text-slate-900"}
                   ${isUpdating ? "scale-105" : "scale-100"}
                  `}>
                  {data.appName || "App name"}
                </h1>

                {/* Login Form */}
                <div className="space-y-4 flex-1 animate-in slide-in-from-bottom duration-700 delay-500">
                  <div className="transform transition-all duration-300 hover:scale-[1.02]">
                    <input
                      type="email"
                      placeholder="Email"
                      className={`
                        w-full px-4 py-2 rounded-xl border text-xs transition-all duration-500
                        ${
                          data.defaultDarkMode
                            ? "bg-[#1C1C1E] border-[#2C2C2E] text-white placeholder-slate-400"
                            : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"
                        }
                        ${isUpdating ? "animate-pulse" : ""}
                      `}
                      disabled
                    />
                  </div>

                  <div className="transform transition-all duration-300 hover:scale-[1.02] delay-75">
                    <input
                      type="password"
                      placeholder="Password"
                      className={`
                        w-full px-4 py-2 rounded-xl border text-xs transition-all duration-500
                        ${
                          data.defaultDarkMode
                            ? "bg-[#1C1C1E] border-[#2C2C2E] text-white placeholder-slate-400"
                            : "bg-white border-slate-300 text-slate-900 placeholder-slate-500"
                        }
                        ${isUpdating ? "animate-pulse" : ""}
                      `}
                      disabled
                    />
                  </div>

                  {/* Primary Action Button */}
                  <button
                    className={`
                      w-full py-2 rounded-xl text-white font-medium text-xs transition-all duration-500 transform hover:scale-105 hover:shadow-lg
                      ${isUpdating ? "animate-pulse scale-105 shadow-lg" : ""}
                    `}
                    style={{
                      backgroundColor: data.primaryColor,
                      boxShadow: isUpdating
                        ? `0 10px 25px ${data.primaryColor}40`
                        : undefined,
                    }}
                    disabled>
                    Login
                  </button>

                  {/* Secondary Action Button */}
                  <button
                    className={`
                      w-full py-2 rounded-xl font-medium text-xs transition-all duration-500 transform hover:scale-105 hover:shadow-lg border
                      ${isUpdating ? "animate-pulse scale-105 shadow-lg" : ""}
                      ${
                        data.defaultDarkMode
                          ? "bg-transparent text-white"
                          : "bg-transparent text-slate-900"
                      }
                    `}
                    style={{
                      borderColor: data.secondaryColor,
                      color: data.secondaryColor,
                      boxShadow: isUpdating
                        ? `0 10px 25px ${data.secondaryColor}20`
                        : undefined,
                    }}
                    disabled>
                    Create Account
                  </button>

                  {/* Secondary Color Showcase - Link */}
                  <div className="text-center pt-2">
                    <button
                      className={`
                        text-xs font-light transition-all duration-500 hover:underline
                        ${isUpdating ? "animate-pulse" : ""}
                      `}
                      style={{
                        color: data.secondaryColor,
                      }}
                      disabled>
                      Forgot Password?
                    </button>
                  </div>
                </div>

                {/* Home Indicator */}
                <div className="absolute bottom-2 left-1/2 transform -translate-x-1/2 w-32 h-1 bg-slate-400 rounded-full opacity-80"></div>

                {/* Update indicator */}
                {isUpdating && (
                  <div className="absolute top-4 right-4 w-3 h-3 bg-blue-500 rounded-full animate-ping"></div>
                )}
              </div>
            </div>

            {/* Side button */}
            <div className="absolute right-[-2px] top-[80px] w-[3px] h-[30px] bg-[#2A2A2C] rounded-l-sm"></div>

            {/* Volume buttons */}
            <div className="absolute left-[-2px] top-[80px] w-[3px] h-[20px] bg-[#2A2A2C] rounded-r-sm"></div>
            <div className="absolute left-[-2px] top-[110px] w-[3px] h-[40px] bg-[#2A2A2C] rounded-r-sm"></div>
          </div>
        </div>
      </div>
    </div>
  );
}
