import { useState } from "react"
import { Save, Check } from "lucide-react"

interface SaveButtonProps {
  isValid: boolean
  hasChanges: boolean
  onSave: () => void
}

export function SaveButton({ isValid, hasChanges, onSave }: SaveButtonProps) {
  const [isSaving, setIsSaving] = useState(false)
  const [justSaved, setJustSaved] = useState(false)

  const handleSave = async () => {
    if (!isValid || !hasChanges) return

    setIsSaving(true)

    // Simulate save delay
    await new Promise((resolve) => setTimeout(resolve, 1200))

    onSave()
    setIsSaving(false)
    setJustSaved(true)

    setTimeout(() => setJustSaved(false), 3000)
  }

  const canSave = isValid && hasChanges && !isSaving

  return (
    <button
      onClick={handleSave}
      disabled={!canSave}
      className={`
        flex items-center space-x-2 px-6 py-3 rounded-xl font-medium transition-all duration-300 transform
        ${
          canSave
            ? "bg-gradient-to-r from-blue-600 to-blue-700 text-white hover:from-blue-700 hover:to-blue-800 shadow-lg hover:shadow-xl hover:-translate-y-1 hover:scale-105 active:scale-95"
            : justSaved
              ? "bg-gradient-to-r from-green-600 to-green-700 text-white shadow-lg"
              : "bg-slate-300 text-slate-500 cursor-not-allowed"
        }
        ${isSaving ? "animate-pulse" : ""}
      `}
    >
      {isSaving ? (
        <>
          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
          <span>Saving...</span>
        </>
      ) : justSaved ? (
        <>
          <Check className="w-4 h-4 animate-bounce" />
          <span>Saved!</span>
        </>
      ) : (
        <>
          <Save className="w-4 h-4 transition-transform duration-200 group-hover:scale-110" />
          <span>Save Changes</span>
        </>
      )}
    </button>
  )
}
