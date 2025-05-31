/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../utils/axios";
// import axios from "axios";

const baseURL =
  process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/v1";

export interface NewEqubType {
  name: string;
  description: string;
  interval: number;
  isEditing: boolean;
}

export interface EqubType extends NewEqubType {
  id: string;
}

interface EqubTypesState {
  equbTypes: EqubType[];
  totalPages: number;
  isLoading: boolean;
  error: any;
  successMessage: string | null;
  limit: number;
}

const initialState: EqubTypesState = {
  equbTypes: [],
  totalPages: 1,
  isLoading: false,
  error: null,
  successMessage: null,
  limit: 10,
};

export const fetchEqubTypes = createAsyncThunk(
  "equbTypes/fetchEqubTypes",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `${baseURL}/equb/type?_page=${page}&_limit=${limit}`
      );
      return {
        equbTypes: response.data.data.equbTypes,
        totalPages: Math.ceil(response.data.data.meta.total / limit),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchEqubType = createAsyncThunk(
  "equbTypes/fetchEqubType",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`${baseURL}/equb/type/${id}`);
      return response.data.data.equbType;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const createEqubType = createAsyncThunk(
  "equbTypes/createEqubType",
  async (equbTypeData: NewEqubType, { rejectWithValue }) => {
    try {
      const response = await api.post(`${baseURL}/equb/type`, equbTypeData);
      return response.data.data.equbType;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const updateEqubType = createAsyncThunk(
  "equbTypes/updateEqubType",
  async (
    { id, equbTypeData }: { id: string; equbTypeData: NewEqubType },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(
        `${baseURL}/equb/type/${id}`,
        equbTypeData
      );
      return response.data.data.equbType;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

const equbTypeSlice = createSlice({
  name: "equbTypes",
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    toggleEditMode: (state, action) => {
      const equbType = state.equbTypes.find(
        (equbType) => equbType.id === action.payload
      );
      if (equbType) {
        equbType.isEditing = !equbType.isEditing;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchEqubTypes.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEqubTypes.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.equbTypes = action.payload.equbTypes;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchEqubTypes.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateEqubType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEqubType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const updatedEqubType = action.payload;
        state.equbTypes = state.equbTypes.map((equbType) =>
          equbType.id === updatedEqubType.id ? updatedEqubType : equbType
        );
        state.successMessage = "Equb type updated successfully";
      })
      .addCase(updateEqubType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createEqubType.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEqubType.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.equbTypes.push(action.payload);
        state.successMessage = "Equb type created successfully";
      })
      .addCase(createEqubType.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSuccessMessage, toggleEditMode } = equbTypeSlice.actions;
export default equbTypeSlice.reducer;
