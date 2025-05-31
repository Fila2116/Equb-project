import { useEffect, useState } from "react";
import Select from "react-select";
import { useAppDispatch, useAppSelector } from "../../../../store/store";
import {
  createRole,
  fetchPermissions,
  clearSuccessMessage,
} from "../../../../store/features/admin/roles/rolesSlice";
import { UnknownAction } from "@reduxjs/toolkit";
import ConnectionErrorPage from "../../../../utils/ErrorPage";

const CreateRoles: React.FC = () => {
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedPermissions, setSelectedPermissions] = useState<string[]>([]);
  const { isLoading, successMessage, error } = useAppSelector(
    (state) => state.roles
  );
  const permissions = useAppSelector((state) => state.roles.permissions);
  const dispatch = useAppDispatch();

  useEffect(() => {
    dispatch(fetchPermissions() as any);
  }, [dispatch]);

  const handlePermissionChange = (selectedOptions: any) => {
    const selectedValues = selectedOptions
      ? selectedOptions.map((option: any) => option.value)
      : [];
    setSelectedPermissions(selectedValues);
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    dispatch(
      createRole({
        name,
        description,
        permissions: selectedPermissions,
        isEditing: false,
      }) as unknown as UnknownAction
    );
    
  };
  // useEffect(() => {
  //   if (!error) {
  //     setName("");
  //     setDescription("");
  //     setSelectedPermissions([]);
  //   }
  // }, [error]);

  useEffect(() => {
    if (successMessage) {
      setName("");
      setDescription("");
      setSelectedPermissions([]);
    }
  }, [successMessage]);

  //for clearing success message
  useEffect(() => {
    const timer = setTimeout(() => {
      dispatch(clearSuccessMessage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [successMessage, dispatch]);
  if (error) {
    return <ConnectionErrorPage error={error} />;
  }
  return (
    <div>
      <form onSubmit={handleSubmit}>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="name"
          >
            Role name
          </label>
          <input
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="name"
            type="text"
            placeholder="Name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="description"
          >
            Role description
          </label>
          <textarea
            className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline"
            id="description"
            placeholder="Description"
            value={description}
            onChange={(e) => setDescription(e.target.value)}
            required
          />
        </div>
        <div className="mb-4">
          <label
            className="block text-gray-700 text-sm font-bold mb-2"
            htmlFor="permissions"
          >
            Add Permission
          </label>
          <Select
            defaultValue={[]}
            isMulti
            name="permissions"
            options={
              permissions.map((permission) => ({
                value: permission,
                label: permission,
              })) as any
            }
            onChange={handlePermissionChange}
            className="basic-multi-select"
            classNamePrefix="select"
            value={permissions
              .filter((permission) => selectedPermissions.includes(permission))
              .map((permission) => ({ value: permission, label: permission }))}
            required
          />
        </div>
        {successMessage && (
          <div className="text-green-500">{successMessage}</div>
        )}
        <div className="flex items-center justify-between">
          <button
            className={`bg-btnColor hover:bg-primary text-white font-bold py-2 px-4 rounded focus:outline-none focus:shadow-outline ${
              isLoading && "opacity-50 cursor-not-allowed"
            }`}
            type="submit"
            disabled={isLoading}
          >
            {isLoading ? "Creating..." : "Create Role"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default CreateRoles;
