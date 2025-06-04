import type { BrandingData } from "../ui/branding-settings";
import { FileUpload } from "../ui/file-upload";

interface VisualIdentityProps {
  data: BrandingData;
  onUpdate: (updates: Partial<BrandingData>) => void;
}

export function VisualIdentity({ data, onUpdate }: VisualIdentityProps) {
  return (
    <div className="bg-white rounded-2xl  shadow-sm  p-6 hover:shadow-md hover:border-slate-300 transition-all duration-300 group">
      <h2 className="text-xl font-semibold text-slate-900 mb-6 group-hover:text-slate-800 transition-colors duration-200">
        Visual Identity
      </h2>

      <div className="space-y-8">
        {/* Logo Uploads */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="transform transition-all duration-300 hover:scale-[1.02]">
            <FileUpload
              label="Logo (Light Version)"
              value={data.logoLight}
              onChange={(value) => onUpdate({ logoLight: value })}
              accept="image/*"
            />
          </div>

          <div className="transform transition-all duration-300 hover:scale-[1.02] md:delay-75">
            <FileUpload
              label="Logo (Dark Version)"
              value={data.logoDark}
              onChange={(value) => onUpdate({ logoDark: value })}
              accept="image/*"
            />
          </div>
        </div>

        {/* Color Pickers */}
        <div className="grid grid-cols-1 w-[50%] md:grid-cols-2 gap-6">
          <div className="flex flex-col space-y-2">
            <label
              htmlFor="PrimaryColor"
              className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Primary Color
            </label>
            <input
              id="PrimaryColor"
              type="color"
              value={data.primaryColor}
              onChange={(e) => onUpdate({ primaryColor: e.target.value })}
              className="h-10 w-full  p-1 rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent"
            />
          </div>

          <div className="flex flex-col space-y-2">
            <label
              htmlFor="secondaryColor"
              className="text-sm font-medium text-gray-700 dark:text-gray-300">
              Secondary Color
            </label>
            <input
              id="secondaryColor"
              type="color"
              value={data.secondaryColor}
              onChange={(e) => onUpdate({ secondaryColor: e.target.value })}
              className="h-10 w-full  p-1 rounded-md border border-gray-300 dark:border-gray-600 cursor-pointer bg-transparent"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
