/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import setAuthToken from "../../../../utils/setAuthToken";
import api from "../../../../utils/axios";

// const baseURL =
//   process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/v1";

interface User {
  id: string;
  fullName?: string;
  firstName?: string;
  email?: string;
  phoneNumber?: number;
  avatar?: string;
  password?: string;
  role?: {
    id: string;
    type: string;
    name: string;
    description: string;
    permissions: string[];
    createdAt: string;
    updatedAt: string;
  };
}
interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  error: string | null;
  user: User | null;
  token: string | null;
}

const initialState: AuthState = {
  isAuthenticated: false,
  isLoading: false,
  error: null,
  user: null,
  token: localStorage.getItem("token"),
};

interface LoginCredentials {
  email: string;
  password: string;
  latitude?: number;
  longitude?: number;
}
export interface forgetPasswordFormValues {
  emailOrPhoneNumber: string;
}
export interface resetPasswordFormValues {
   otp: string;
    password: string;
    confirmPassword: string;
}
export const fetchUser = createAsyncThunk(
  "auth/fetchUser",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/staff/auth`);
      return response.data.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || error.message);
    }
  }
);

export const loginUser = createAsyncThunk(
  "staff/login",
  async (credentials: LoginCredentials, { rejectWithValue }) => {
    try {
      const response = await api.post(`/staff/auth/login`, credentials, {
        headers: { "Content-Type": "application/json" },
      });
      const { accessToken, refreshToken, user } = response.data.data;

      // Save tokens in localStorage
      localStorage.setItem("token", accessToken);
      localStorage.setItem("refreshToken", refreshToken);

      setAuthToken(accessToken);

      return { token: accessToken, refreshToken, user };
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "Login failed. Please try again.";
      return rejectWithValue(errorMessage);
    }
  }
);
export const forgetPassword = createAsyncThunk(
  "staff/forgetPassword",
  async (forgetPasswordFormValues: forgetPasswordFormValues, { rejectWithValue }) => {
    try {
      const response = await api.post(`/staff/auth/forgot-password`, forgetPasswordFormValues, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "failed request. Please try again.";
      return rejectWithValue(errorMessage);
    }
  }
);
export const resetPassword = createAsyncThunk(
  "staff/reset-password",
  async (resetPasswordFormValues: resetPasswordFormValues, { rejectWithValue }) => {
    try {
      const response = await api.post(`/staff/auth/reset-password`, resetPasswordFormValues, {
        headers: { "Content-Type": "application/json" },
      });
      return response.data.data;
    } catch (error: any) {
      const errorMessage =
        error.response?.data?.message ||
        error.message ||
        "failed request. Please try again.";
      return rejectWithValue(errorMessage);
    }
  }
);


const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    logout: (state) => {
      localStorage.removeItem("token");
      localStorage.removeItem("refreshToken");
      state.isAuthenticated = false;
      setAuthToken(null);
      state.user = null;
      state.token = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(fetchUser.rejected, (state) => {
        localStorage.removeItem("token");
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      .addCase(loginUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(loginUser.fulfilled, (state, action) => {
        localStorage.setItem("token", action.payload.token);
        state.token = action.payload.token;
        state.user = action.payload.user;
        state.isLoading = false;
        state.error = null;
        state.isAuthenticated = true;
      })
      .addCase(loginUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
        state.isAuthenticated = false;
      })
      
       .addCase(forgetPassword.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(forgetPassword.fulfilled, (state, action) => {
        state.user = action.payload.user;
        state.isAuthenticated = true;
        state.isLoading = false;
        state.error = null;
      })
      .addCase(forgetPassword.rejected, (state) => {
        localStorage.removeItem("token");
        state.token = null;
        state.user = null;
        state.isAuthenticated = false;
        state.isLoading = false;
      })
      
  },
});

export const { logout } = authSlice.actions;

export default authSlice.reducer;
