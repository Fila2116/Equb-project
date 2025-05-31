/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
import api from "../../../../utils/axios";

// const baseURL =
// process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/v1";

export interface NewRole {
  name: string;
  description: string;
  permissions: string[];
  isEditing: boolean;
}
export interface Role extends NewRole {
  id: string;
}
interface RolesState {
  roles: Role[];
  totalPages: number;
  isLoading: boolean;
  error: any;
  permissions: string[];
  successMessage: string | null;
  limit: number;
}

const initialState: RolesState = {
  roles: [],
  totalPages: 1,
  isLoading: false,
  error: null,
  permissions: [],
  successMessage: null,
  limit: 10,
};

export const fetchPermissions = createAsyncThunk(
  "roles/fetchPermissions",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/permission`);
      return response.data.data.permissions;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchRoles = createAsyncThunk(
  "roles/fetchRoles",
  async (
    {
      page = 1,
      limit = 10,
      search,
    }: { page?: number; limit?: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      let queryParams: any = {
        _page: page,
        _limit: limit,
      };
      if (search) queryParams._search = search;
      const response = await api.get(`/role?_page=${page}&_limit=${limit}`, {
        params: queryParams,
      });
      return {
        roles: response.data.data,
        totalPages: Math.ceil(response.data.data.meta.total / limit),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchRole = createAsyncThunk(
  "roles/fetchRole",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/role/${id}`);
      return response.data.data.role;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const createRole = createAsyncThunk(
  "roles/createRole",
  async (
    {
      name,
      description,
      permissions,
      isEditing,
    }: {
      name: string;
      description: string;
      permissions: string[];
      isEditing: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const roleData = { name, description, permissions, isEditing };
      const response = await api.post(`/role`, roleData);
      return response.data.data.role;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const updateRole = createAsyncThunk(
  "roles/updateRole",
  async (
    { id, roleData }: { id: string; roleData: NewRole },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/role/${id}`, roleData);
      return response.data.data.role;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

const rolesSlice = createSlice({
  name: "roles",
  initialState,
  reducers: {
    toggleEditMode: (state, action) => {
      const role = state.roles.find((role) => role.id === action.payload);
      if (role) {
        role.isEditing = !role.isEditing;
      }
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPermissions.fulfilled, (state, action) => {
        state.isLoading = false;
        state.permissions = action.payload;
      })
      .addCase(fetchPermissions.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.roles.push(action.payload);
        state.successMessage = "Role created successfully";
      })
      .addCase(createRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchRoles.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRoles.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.roles = action.payload.roles.roles.map((role: Role) => ({
          ...role,
          isEditing: false,
        }));
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchRoles.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateRole.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateRole.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const updatedRole = action.payload;
        state.roles = state.roles.map((role) =>
          role.id === updatedRole.id
            ? { ...role, ...updatedRole, isEditing: false }
            : role
        );
        state.successMessage = "Role updated successfully";
      })
      .addCase(updateRole.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { toggleEditMode, clearSuccessMessage } = rolesSlice.actions;

export default rolesSlice.reducer;
