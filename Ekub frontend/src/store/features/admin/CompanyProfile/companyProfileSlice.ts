/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { isAxiosError } from "axios";
import { toast } from "sonner";
import api from "../../../../utils/axios";

const baseURL =
  process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/v1";

export interface NewCompanyProfile {
  country: string;
  city: string;
  address: string;
  email: string;
  tel: string;
  isEditing: boolean;

}
export interface CompanyProfile extends NewCompanyProfile {
  id: string;
}

interface CompanyProfilesState {
  companyProfile: CompanyProfile[];
  isLoading: boolean;
  error: any;
  successMessage: string | null;
  isVerified: boolean;
  totalPages: number;


}

const initialState: CompanyProfilesState = {
  companyProfile: [],
  isLoading: false,
  error: null,
  successMessage: null,
  isVerified: false,
  totalPages: 1,

};

export const fetchCompanyProfile = createAsyncThunk(
  "companyProfile/fetchCompanyProfile",
  async (_,
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `${baseURL}/companyProfile`
      );
      return {
        companyProfile: response.data.data.companyProfile,
        totalPages: Math.ceil(response.data.data.meta.total),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);


export const createCompanyProfile = createAsyncThunk(
  "companyProfile/createCompanyProfile",
  async (companyProfileData: NewCompanyProfile, { rejectWithValue }) => {
    try {
      const response = await api.post(`${baseURL}/companyProfile`, companyProfileData);
      return response.data.data.companyProfile;
    } catch (error: any) {
      toast.error(error.response.data.message || "Failed to create company profile");
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const updateCompanyProfile = createAsyncThunk(
  "companyProfile/updateCompanyProfile",
  async (
    { id, companyProfileData }: { id: string; companyProfileData: NewCompanyProfile },
    thunkAPI
  ) => {
    if (!id) {
      throw new Error("Company profile id is undefined");
    }
    try {
      const response = await api.patch(`${baseURL}/companyProfile/${id}`, companyProfileData);
      toast.success("Company profile updated successfully");
      return response.data.data.companyProfile;
    } catch (error: any) {
      let errors: any = [];
      if (isAxiosError(error)) {
        errors = error.response?.data.errors;
        if (errors) {
          errors.forEach((err: any) => {
            toast.error(err?.msg);
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
export const DeleteCompanyProfile = createAsyncThunk(
  "banner/deleteCompanyProfile",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      await api.delete(`${baseURL}/companyProfile/deleteCompanyProfile/${id}`);
      return {
        message: "successful deleted",
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

const companyProfileSlice = createSlice({
  name: "companyProfile",
  initialState,
  reducers: {
    toggleEditMode: (state, action) => {
      const companyProfile = state.companyProfile.find((companyProfile) => companyProfile.id === action.payload);
      if (companyProfile) {
        companyProfile.isEditing = !companyProfile.isEditing;
      }
    },
    toggleEditModeForCompanyBank: (state, action) => {
      const companyProfile = state.companyProfile.find(
        (companyProfile) => companyProfile.id === action.payload
      );
      if (companyProfile) {
        companyProfile.isEditing = !companyProfile.isEditing;
      }
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    //  NEW ACTION ADDED HERE
    resetVerification: (state) => {
      state.isVerified = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCompanyProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.companyProfile = action.payload.companyProfile.map((companyProfile: CompanyProfile) => ({
          ...companyProfile,
          isEditing: false,
        }));
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchCompanyProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
 
     
      .addCase(createCompanyProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCompanyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.companyProfile.push(action.payload);
        state.successMessage = "Company profile created successfully";
      })
      .addCase(createCompanyProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateCompanyProfile.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCompanyProfile.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const updatedCompanyProfile = action.payload;
        state.companyProfile = state.companyProfile.map((companyProfile) =>
          companyProfile.id === updatedCompanyProfile.id
            ? { ...companyProfile, ...updatedCompanyProfile, isEditing: false }
            : companyProfile
        );
        state.successMessage = "Company Profile updated successfully";
      })
      .addCase(updateCompanyProfile.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.error.message ?? "Failed to update company profile";
        if (action.error.message) {
          state.error = action.error.message;
        }
      });
  },
});

export const { toggleEditMode, clearSuccessMessage } = companyProfileSlice.actions;

export default companyProfileSlice.reducer;
