/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import { Staff } from "../staff/staffSlice";
import api from "../../../../utils/axios";

const baseURL =
  process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/v1";

export interface NewBranch {
  name: string;
  city: string;
  phoneNumber: string;
  isEditing: boolean;
}
export interface Branch extends NewBranch {
  id: string;
  state?: string;
  staffs?: Staff[];
}

interface BranchsState {
  branches: Branch[];
  totalPages: number;
  isLoading: boolean;
  error: any;
  successMessage: string | null;
  limit: number;
}

const initialState: BranchsState = {
  branches: [],
  totalPages: 1,
  isLoading: false,
  error: null,
  successMessage: null,
  limit: 10,
};

export const fetchBranches = createAsyncThunk(
  "branch/fetchBranches",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `${baseURL}/branch?_page=${page}&_limit=${limit}`
      );
      return {
        branches: response.data.data.branches,
        totalPages: Math.ceil(response.data.data.meta.total / limit),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchBranch = createAsyncThunk(
  "branch/fetchBranch",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`${baseURL}/branch/${id}`);
      return response.data.data;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const createBranch = createAsyncThunk(
  "branch/createBranch",
  async (branchData: NewBranch, { rejectWithValue }) => {
    try {
      const response = await api.post(`${baseURL}/branch`, branchData);
      return response.data.data.branch;
    } catch (error: any) {
      toast.error(error.response.data.message || "Failed to create branch");
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const updateBranch = createAsyncThunk(
  "branch/updateBranch",
  async (
    { id, branchData }: { id: string; branchData: NewBranch },
    thunkAPI
  ) => {
    if (!id) {
      throw new Error("Branch id is undefined");
    }
    try {
      const response = await api.patch(`${baseURL}/branch/${id}`, branchData);
      toast.success("Branch created successfully");
      return response.data.data.branch;
    } catch (error: any) {
      //   toast.error(error.response.data.message || "Failed to create branch");
      //   throw new Error(error.response.data.message);
      let errors: any = [];
      if (isAxiosError(error)) {
        errors = error.response?.data.errors;
        if (errors) {
          errors.forEach((err: any) => {
            toast.error(err?.msg);
            // store.dispatch(setAlert({ alertType: 'error', msg: err?.msg }))
          });
        }
      } else {
        errors = error && error.toString();
      }
      console.error(errors);
      return thunkAPI.rejectWithValue(errors);
    }
  }
);

const branchesSlice = createSlice({
  name: "branch",
  initialState,
  reducers: {
    toggleEditMode: (state, action) => {
      const branch = state.branches.find(
        (branch) => branch.id === action.payload
      );
      if (branch) {
        branch.isEditing = !branch.isEditing;
      }
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranches.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBranches.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.branches = action.payload.branches.map((branch: Branch) => ({
          ...branch,
          isEditing: false,
        }));
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchBranches.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchBranch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBranch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.branches = [action.payload.branch];
      })
      .addCase(fetchBranch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createBranch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBranch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.branches.push(action.payload);
        state.successMessage = "Branch created successfully";
      })
      .addCase(createBranch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateBranch.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBranch.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const updatedBranch = action.payload;
        state.branches = state.branches.map((branch) =>
          branch.id === updatedBranch.id
            ? { ...branch, ...updatedBranch, isEditing: false }
            : branch
        );
        state.successMessage = "Branch updated successfully";
      })
      .addCase(updateBranch.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to update branch";
        if (action.error.message) {
          state.error = action.error.message;
        }
      });
  },
});

export const { toggleEditMode, clearSuccessMessage } = branchesSlice.actions;

export default branchesSlice.reducer;
