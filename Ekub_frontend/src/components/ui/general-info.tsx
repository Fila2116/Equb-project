import { useState } from "react"
import type { BrandingData } from "./branding-settings"

interface GeneralInfoProps {
  appName: string
  onUpdate: (updates: Partial<BrandingData>) => void
}

export function GeneralInfo({ appName, onUpdate }: GeneralInfoProps) {
  const [isFocused, setIsFocused] = useState(false)

  return (
    <div className="  p-4 rounded-xl border border-slate-200 bg-white group">


      <div className="space-y-4">
        <div className="relative">
          <label
            htmlFor="appName"
            className={`block text-sm font-medium mb-2 transition-all duration-200 ${
              isFocused || appName ? "text-blue-600 -translate-y-1" : "text-slate-700"
            }`}
          >
            App Name *
          </label>
          <div className="relative">
            <input
              type="text"
              id="appName"
              value={appName}
              onChange={(e) => onUpdate({ appName: e.target.value })}
              onFocus={() => setIsFocused(true)}
              onBlur={() => setIsFocused(false)}
              placeholder="Enter your app name"
              className={`
                w-full px-4 py-3 border rounded-xl transition-all duration-300 text-slate-900 placeholder-slate-400
                ${
                  isFocused
                    ? "border-blue-500 ring-4 ring-blue-100 shadow-lg transform scale-[1.02]"
                    : "border-slate-300 hover:border-slate-400 hover:shadow-sm"
                }
              `}
            />
            {appName && (
              <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
