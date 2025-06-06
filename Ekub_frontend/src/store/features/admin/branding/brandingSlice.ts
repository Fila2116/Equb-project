import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import api from "../../../../utils/axios";

const baseURL =
  process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/v1";

export interface Branding {
  id?: number;
  appName: string;
  logoLight: string;
  logoDark: string;
  primaryColor: string;
  secondaryColor: string;
  darkMode: boolean;
  isEditing?: boolean;
  createdAt?: string;
  updatedAt?: string;
}

interface BrandingState {
  branding: Branding | null;
  isLoading: boolean;
  error: any;
  successMessage: string | null;
  status: "idle" | "loading" | "succeeded" | "failed" | "saving" | "saved";
}

const initialState: BrandingState = {
  branding: null,
  isLoading: false,
  error: null,
  successMessage: null,
  status: "idle",
};

export const fetchBranding = createAsyncThunk(
  "branding/fetchBranding",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${baseURL}/branding-config`);
      return {
        appName: response.data.appName || "",
        logoLight: response.data.logoLightUrl,
        logoDark: response.data.logoDarkUrl,
        primaryColor: response.data.primaryColor,
        secondaryColor: response.data.secondaryColor,
        darkMode: response.data.defaultDarkMode,
        id: response.data.id,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const updateBranding = createAsyncThunk(
  "branding/updateBranding",
  async (brandingData: Branding, { rejectWithValue }) => {
    try {
      // appName intentionally excluded from API request
      const apiData = {
        logoLightUrl: brandingData.logoLight,
        logoDarkUrl: brandingData.logoDark,
        primaryColor: brandingData.primaryColor,
        secondaryColor: brandingData.secondaryColor,
        defaultDarkMode: brandingData.darkMode,
      };

      const response = await api.patch(`${baseURL}/branding-config`, apiData);
      toast.success("Branding updated successfully");

      return {
        appName: brandingData.appName,
        logoLight: response.data.logoLightUrl,
        logoDark: response.data.logoDarkUrl,
        primaryColor: response.data.primaryColor,
        secondaryColor: response.data.secondaryColor,
        darkMode: response.data.defaultDarkMode,
        id: response.data.id,
        createdAt: response.data.createdAt,
        updatedAt: response.data.updatedAt,
      };
    } catch (error: any) {
      let errors: any = [];
      if (isAxiosError(error)) {
        errors = error.response?.data.errors;
        errors?.forEach((err: any) => toast.error(err?.msg));
      } else {
        errors = error?.toString();
      }
      return rejectWithValue(errors);
    }
  }
);

const brandingSlice = createSlice({
  name: "branding",
  initialState,
  reducers: {
    setField: (state, action) => {
      if (state.branding) {
        (state.branding as any)[action.payload.field] = action.payload.value;
      }
    },
    toggleEditMode: (state) => {
      if (state.branding) {
        state.branding.isEditing = !state.branding.isEditing;
      }
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBranding.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.status = "loading";
      })
      .addCase(fetchBranding.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.branding = { ...action.payload, isEditing: false };
        state.status = "succeeded";
      })
      .addCase(fetchBranding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.status = "failed";
      })
      .addCase(updateBranding.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.status = "saving";
      })
      .addCase(updateBranding.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.branding = { ...action.payload, isEditing: false };
        state.successMessage = "Branding updated successfully";
        state.status = "saved";
      })
      .addCase(updateBranding.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.status = "failed";
      });
  },
});

export const { setField, toggleEditMode, clearSuccessMessage } =
  brandingSlice.actions;

export default brandingSlice.reducer;
