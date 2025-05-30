import React from "react";
import { toast } from "sonner";
import { FaExclamationTriangle, FaCog } from "react-icons/fa";
import { Setting } from "../../../store/features/admin/settings/settingsSlice";
import Loader from "../../../utils/Loader";

type NoSettingProps = {
  settingStatus: "loading" | "succeeded" | "failed" | "idle";
  settingsFetched: Setting[];
};

const NoSetting: React.FC<NoSettingProps> = ({
  settingStatus,
  settingsFetched,
}) => {
  if (settingStatus === "loading") {
    return (
      <div className="flex items-center justify-center  bg-gray-100">
        <Loader />
      </div>
    );
  }

  if (settingStatus === "failed") {
    toast.error("Failed to load settings. Please try again.");
    return (
      <div className="flex items-center justify-center  bg-red-100">
        <FaExclamationTriangle className="text-red-600 h-10 w-10 mr-3" />
        <p className="text-lg text-red-600">
          Error loading settings. Please try again.
        </p>
      </div>
    );
  }

  if (settingStatus === "succeeded" && settingsFetched.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center  bg-gray-50">
        <FaCog className="w-20 h-20 text-gray-400 mb-5" />
        <h2 className="text-2xl font-bold text-gray-600 mb-4">
          No Settings Available
        </h2>
        <p className="text-gray-500">
          You have not added any settings yet. Please add some settings.
        </p>
      </div>
    );
  }

  return null;
};

export default NoSetting;
