/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../utils/axios";

const baseURL =
  process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/v1";
export interface NewEqubCategory {
  name: string;
  description: string;
  hasReason: boolean;
  needsRequest: boolean;
  isEditing: boolean;
}

export interface EqubCategory extends NewEqubCategory {
  id: string;
}

interface EqubCategoriesState {
  equbCategories: EqubCategory[];
  totalPages: number;
  isLoading: boolean;
  error: any;
  successMessage: string | null;
  limit: number;
}

const initialState: EqubCategoriesState = {
  equbCategories: [],
  totalPages: 1,
  isLoading: false,
  error: null,
  successMessage: null,
  limit: 10,
};

export const fetchEqubCategories = createAsyncThunk(
  "equbCategories/fetchEqubCategories",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `${baseURL}/equb/category?_page=${page}&_limit=${limit}`
      );
      return {
        equbCategories: response.data.data.equbCategorys,
        totalPages: Math.ceil(response.data.data.meta.total / limit),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchEqubCategory = createAsyncThunk(
  "equbCategories/fetchEqubCategory",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`${baseURL}/equb/category/${id}`);
      return response.data.data.equbCategory;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const createEqubCategory = createAsyncThunk(
  "equbCategories/createEqubCategory",
  async (equbCategoryData: NewEqubCategory, { rejectWithValue }) => {
    try {
      const response = await api.post(`${baseURL}/equb/category`, {
        ...equbCategoryData,
        hasReason: equbCategoryData.hasReason ? "yes" : "no",
        needsRequest: equbCategoryData.needsRequest ? "yes" : "no",
      });
      return response.data.data.equbCategory;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const updateEqubCategory = createAsyncThunk(
  "equbCategories/updateEqubCategory",
  async (
    {
      id,
      equbCategoryData,
    }: {
      id: string;
      equbCategoryData: NewEqubCategory;
    },
    { rejectWithValue }
  ) => {
    if (!id) {
      throw new Error("Equb category id is undefined");
    }
    try {
      const response = await api.patch(`${baseURL}/equb/category/${id}`, {
        ...equbCategoryData,
        hasReason: equbCategoryData.hasReason ? "yes" : "no",
        needsRequest: equbCategoryData.needsRequest ? "yes" : "no",
      });
      return response.data.data.equbCategory;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

const equbCategoriesSlice = createSlice({
  name: "equbCategories",
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    toggleEditMode: (state, action) => {
      const equbCategory = state.equbCategories.find(
        (equbCategory) => equbCategory.id === action.payload
      );
      if (equbCategory) {
        equbCategory.isEditing = !equbCategory.isEditing;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEqubCategories.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEqubCategories.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.equbCategories = action.payload.equbCategories;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchEqubCategories.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchEqubCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEqubCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.equbCategories = [action.payload];
      })
      .addCase(fetchEqubCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createEqubCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEqubCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.equbCategories.push(action.payload);
        state.successMessage = "Equb category created successfully";
      })
      .addCase(createEqubCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateEqubCategory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEqubCategory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const updatedEqubCategory = action.payload;
        state.equbCategories = state.equbCategories.map((equbCategory) =>
          equbCategory.id === updatedEqubCategory.id
            ? updatedEqubCategory
            : equbCategory
        );
        state.successMessage = "Equb category updated successfully";
      })
      .addCase(updateEqubCategory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSuccessMessage, toggleEditMode } =
  equbCategoriesSlice.actions;
export default equbCategoriesSlice.reducer;
