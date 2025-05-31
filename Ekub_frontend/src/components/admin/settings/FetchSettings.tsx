import { useEffect, useState } from "react";
import { MdAdd } from "react-icons/md";
import { FaRegEdit, FaTrashAlt } from "react-icons/fa";
import {
  fetchSettings,
  deleteSetting,
  addSetting,
  updateSetting,
  NewSetting,
} from "../../../store/features/admin/settings/settingsSlice";
import { useAppDispatch, useAppSelector } from "../../../store/store";
import withMainComponent from "../../layout/withMainComponent";
import { toast } from "sonner";
import NoSetting from "./NoSetting";

const Settings = () => {
  const [showPopup, setShowPopup] = useState<boolean>(false);
  const [selectedSetting, setSelectedSetting] = useState<string>("");
  const [inputValue, setInputValue] = useState<number | "">("");
  const [statusChecked, setStatusChecked] = useState<string>("active");
  const [isEditing, setIsEditing] = useState<boolean>(false);
  const [editingRowId, setEditingRowId] = useState<string | null>(null);
  const [customOptions, setCustomOptions] = useState<string[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState<boolean>(false);
  const [settingToDelete, setSettingToDelete] = useState<string | null>(null);

  const dispatch = useAppDispatch();
  const settingsFetched = useAppSelector((state) => state.settings.settings);
  const settingStatus = useAppSelector((state) => state.settings.status);

  useEffect(() => {
    dispatch(fetchSettings());
  }, [dispatch]);

  useEffect(() => {
    const uniqueOptions = Array.from(
      new Set(settingsFetched.map((setting) => setting.name))
    );
    if (!uniqueOptions.includes("notificationTime")) {
      uniqueOptions.push("notificationTime");
    }
    setCustomOptions(uniqueOptions);
  }, [settingsFetched]);

  const sortedSettings = [...settingsFetched].sort((a, b) => {
    const dateA = a.createdAt ? new Date(a.createdAt).getTime() : 0; // Default to 0 if `createdAt` is missing or invalid
    const dateB = b.createdAt ? new Date(b.createdAt).getTime() : 0; // Default to 0 if `createdAt` is missing or invalid

    return dateB - dateA; // Sort in descending order (newest first)
  });

  const handleDropdownChange = (
    event: React.ChangeEvent<HTMLSelectElement>
  ) => {
    const value = event.target.value;
    setSelectedSetting(value === "Add Custom Option" ? "" : value);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value;

    // Remove leading zeros if the length is greater than 1
    if (value.length > 1 && value.startsWith("0")) {
      value = value.replace(/^0+/, "");
    }

    // Handle cases where the value is empty or not a valid number
    if (value === "") {
      setInputValue(""); // You might need to handle empty values separately if your input expects numbers
    } else {
      // Ensure the value is a number and set it
      setInputValue(Number(value));
    }
  };

  const handleAddSetting = () => {
    if (selectedSetting && inputValue && inputValue > 0) {
      const newSetting: NewSetting = {
        name: selectedSetting,
        numericValue: Number(inputValue),
        state: statusChecked,
      };
      dispatch(addSetting(newSetting))
        .unwrap()
        .then(() => {
          toast.success("Setting added successfully!");
          dispatch(fetchSettings());
          setIsEditing(false);
          setEditingRowId(null);
          setSelectedSetting("");
          setInputValue("");
          setStatusChecked("active"); // Reset status to default
          setShowPopup(false);
        })
        .catch(() => {
          toast.error("Failed to add setting.");
        });
    }
  };

  const handleEditSetting = (id: string) => {
    const settingToEdit = settingsFetched.find((setting) => setting.id === id);
    if (settingToEdit) {
      setSelectedSetting(settingToEdit.name);
      setInputValue(settingToEdit.numericValue);
      setStatusChecked(settingToEdit.state || "inactive");
      setEditingRowId(id);
      setIsEditing(true);
      // setShowPopup(true);
    }
  };

  const handleSaveSetting = () => {
    if (!selectedSetting || inputValue === "" || inputValue <= 0) {
      toast.error("Please provide valid setting name and value.");
      return;
    }

    const updatedSetting = {
      name: selectedSetting,
      numericValue: Number(inputValue),
      state: statusChecked,
    };
    if (editingRowId) {
      dispatch(updateSetting({ id: editingRowId, ...updatedSetting }))
        .unwrap()
        .then(() => {
          toast.success("Setting updated successfully!");
          dispatch(fetchSettings());
          setIsEditing(false);
          setEditingRowId(null);
          setSelectedSetting("");
          setInputValue("");
          setStatusChecked("active"); // Reset status to default
          setShowPopup(false);
        })
        .catch(() => {
          toast.error("Failed to update setting.");
        });
    }
  };

  const handleDeleteClick = (id: string) => {
    setSettingToDelete(id);
    setShowDeleteConfirm(true);
  };

  const confirmDeleteSetting = () => {
    if (settingToDelete) {
      dispatch(deleteSetting(settingToDelete))
        .unwrap()
        .then(() => {
          toast.success("Setting deleted successfully!");
          setShowDeleteConfirm(false);
          setSettingToDelete(null);
          dispatch(fetchSettings());
        })
        .catch(() => {
          toast.error("Failed to delete setting.");
        });
    }
  };

  const cancelDeleteSetting = () => {
    setShowDeleteConfirm(false);
    setSettingToDelete(null);
  };

  return (
    <div className="p-4 my-2 mx-auto max-w-7xl">
      <h1 className="text-2xl font-medium text-black font-poppins  leading-9 mb-4">
        Settings
      </h1>
      <div className="flex items-center justify-end mb-4">
        <button
          onClick={() => setShowPopup(true)}
          className="flex items-center gap-2 bg-green-500 hover:bg-green-600 text-white font-bold py-2 px-4 rounded text-sm"
        >
          <MdAdd /> Add Setting
        </button>
      </div>
      <div className="relative overflow-x-auto shadow-md sm:rounded-lg p-2 bg-white">
        <table className="w-full text-sm text-left text-gray-800">
          <thead className="text-xs text-slate-500 bg-gray-50">
            <tr>
              <th className="px-6 py-3 text-xs border border-r">No</th>
              <th className="px-6 py-3 text-xs border border-r">
                Setting Type
              </th>
              <th className="px-6 py-3 text-xs border border-r">Value</th>
              <th className="px-6 py-3 text-xs border border-r">Status</th>
              <th className="px-6 py-3 text-xs border border-r">Actions</th>
            </tr>
          </thead>
          <tbody>
            {sortedSettings.length > 0 ? (
              sortedSettings.map((setting, index) => (
                <tr key={index} className="bg-white border-b border-gray-300">
                  <td className="px-6 py-4 font-medium text-gray-900 text-xs border border-r">
                    {index + 1}
                  </td>
                  <td className="px-6 py-4 font-medium text-gray-900 text-xs border border-r">
                    {isEditing && editingRowId === setting.id ? (
                      <input
                        type="text"
                        value={selectedSetting}
                        onChange={(e) => setSelectedSetting(e.target.value)}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                        placeholder="Enter setting type"
                      />
                    ) : (
                      setting.name || "No Name"
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-900 border border-r">
                    {isEditing && editingRowId === setting.id ? (
                      <input
                        type="number"
                        value={inputValue}
                        min={1}
                        onChange={handleInputChange}
                        className="w-full px-2 py-1 border border-gray-300 rounded"
                      />
                    ) : (
                      setting.numericValue
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-900 border border-r text-center">
                    {isEditing && editingRowId === setting.id ? (
                      <div className="mb-4 flex flex-col items-start gap-2">
                        <label className="block text-sm font-medium text-gray-700">
                          Status
                        </label>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={statusChecked === "active"}
                            onChange={(e) =>
                              setStatusChecked(
                                e.target.checked ? "active" : "inactive"
                              )
                            }
                            className="sr-only peer"
                          />
                          <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary dark:bg-gray-700 peer-checked:bg-primary transition-all">
                            <div
                              className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${
                                statusChecked === "active"
                                  ? "translate-x-6"
                                  : "translate-x-0"
                              }`}
                            />
                          </div>
                        </label>
                      </div>
                    ) : (
                      <span
                        className={`inline-flex items-center px-3 py-0.5 rounded-full text-sm font-medium ${
                          setting.state === "active"
                            ? "bg-green-100 text-green-800"
                            : "bg-red-100 text-red-800"
                        }`}
                      >
                        {setting.state}
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4 text-xs border border-r">
                    <div className="flex space-x-4">
                      {!isEditing || editingRowId !== setting.id ? (
                        <>
                          <button
                            onClick={() => handleEditSetting(setting.id || "")}
                            className="text-green-600 hover:text-green-800"
                          >
                            <FaRegEdit size={14} />
                          </button>
                          <button
                            onClick={() => handleDeleteClick(setting.id || "")}
                            className="text-red-600 hover:text-red-800"
                          >
                            <FaTrashAlt size={14} />
                          </button>
                        </>
                      ) : (
                        <>
                          <button
                            onClick={handleSaveSetting}
                            className="text-white hover:text-green-800 bg-green-600 p-2 rounded-md"
                          >
                            Save
                          </button>
                          <button
                            onClick={() => {
                              setIsEditing(false);
                              setEditingRowId(null);
                              setSelectedSetting("");
                              setInputValue("");
                              setStatusChecked("active");
                            }}
                            className="text-white hover:text-gray-800 bg-gray-400 p-2 rounded-md"
                          >
                            Cancel
                          </button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={5}
                  className="text-center p-5 bg-gray-100 border border-gray-300 text-gray-600 italic w-full"
                >
                  <NoSetting
                    settingStatus={settingStatus}
                    settingsFetched={settingsFetched}
                  />
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      {showPopup && (
        <div
          id="popup-modal"
          tabIndex={-1}
          className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto bg-gray-800 bg-opacity-50 h-modal md:h-full"
        >
          <div className="relative w-full max-w-md h-full md:h-auto mx-auto mt-12">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  {isEditing ? "Edit Setting" : "Add Setting"}
                </h3>
                <button
                  type="button"
                  onClick={() => setShowPopup(false)}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700">
                    Select Setting Type
                  </label>
                  <select
                    value={selectedSetting}
                    onChange={handleDropdownChange}
                    className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                  >
                    <option value="" className="text-gray-300">
                      Select setting
                    </option>
                    {customOptions.map((option) => (
                      <option key={option} value={option}>
                        {option}
                      </option>
                    ))}

                    {/* <option value="Add Custom Option">Add Custom Option</option> */}
                  </select>
                </div>
                {selectedSetting && (
                  <>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Numeric Value
                      </label>
                      <input
                        type="number"
                        value={inputValue}
                        onChange={handleInputChange}
                        min={1}
                        className="block w-full px-3 py-2 border border-gray-300 rounded-lg"
                        placeholder="Enter numeric value"
                      />
                    </div>
                    <div className="mb-4">
                      <label className="block text-sm font-medium text-gray-700">
                        Status
                      </label>
                      <label className="relative inline-flex items-center cursor-pointer">
                        <input
                          type="checkbox"
                          checked={statusChecked === "active"}
                          onChange={(e) =>
                            setStatusChecked(
                              e.target.checked ? "active" : "inactive"
                            )
                          }
                          className="sr-only peer"
                        />
                        <div className="w-12 h-6 bg-gray-200 rounded-full peer peer-focus:ring-2 peer-focus:ring-primary dark:bg-gray-700 peer-checked:bg-primary transition-all">
                          <div
                            className={`absolute top-[2px] left-[2px] bg-white w-5 h-5 rounded-full shadow-md transition-transform duration-300 ${
                              statusChecked === "active"
                                ? "translate-x-6"
                                : "translate-x-0"
                            }`}
                          />
                        </div>
                      </label>
                    </div>
                  </>
                )}
              </div>
              <div className="flex items-center justify-end p-6 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button
                  type="button"
                  onClick={handleAddSetting}
                  className="bg-green-500 text-white px-4 py-2 rounded-lg mr-2"
                >
                  {isEditing ? "Save Changes" : "Add Setting"}
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setShowPopup(false);
                    setIsEditing(false);
                    setEditingRowId(null);
                    setSelectedSetting("");
                    setInputValue("");
                    setStatusChecked("active");
                  }}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
      {showDeleteConfirm && (
        <div
          id="delete-confirm-modal"
          tabIndex={-1}
          className="fixed top-0 left-0 right-0 z-50 w-full p-4 overflow-x-hidden overflow-y-auto bg-gray-800 bg-opacity-50 h-modal md:h-full"
        >
          <div className="relative w-full max-w-md h-full md:h-auto mx-auto mt-12">
            <div className="relative bg-white rounded-lg shadow dark:bg-gray-700">
              <div className="flex items-center justify-between p-4 border-b dark:border-gray-600">
                <h3 className="text-xl font-semibold text-gray-900 dark:text-white">
                  Confirm Deletion
                </h3>
                <button
                  type="button"
                  onClick={() => setShowDeleteConfirm(false)}
                  className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center dark:hover:bg-gray-600 dark:hover:text-white"
                >
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                  <span className="sr-only">Close modal</span>
                </button>
              </div>
              <div className="p-6 space-y-6">
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Are you sure you want to delete this setting? This action
                  cannot be undone.
                </p>
              </div>
              <div className="flex items-center justify-end p-6 border-t border-gray-200 rounded-b dark:border-gray-600">
                <button
                  type="button"
                  onClick={confirmDeleteSetting}
                  className="bg-red-600 text-white px-4 py-2 rounded-lg mr-2"
                >
                  Delete
                </button>
                <button
                  type="button"
                  onClick={cancelDeleteSetting}
                  className="bg-gray-200 text-gray-700 px-4 py-2 rounded-lg"
                >
                  Cancel
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default withMainComponent(Settings);
