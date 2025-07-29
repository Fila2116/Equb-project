import { createAsyncThunk, createSlice } from '@reduxjs/toolkit';
import api from '../../utils/axios';

interface BrandingState {
  logoLight: string;
  logoDark: string;
  primaryColor: string;
  secondaryColor: string;
  defaultDarkMode: boolean;
  loading: boolean;
  error: string | null;
}

const initialState: BrandingState = {
  logoLight: '',
  logoDark: '',
  primaryColor: '',
  secondaryColor: '',
  defaultDarkMode: false,
  loading: false,
  error: null,
};

export const fetchBranding = createAsyncThunk(
  'branding/fetchBranding',
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get('/branding-config');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch branding');
    }
  }
);

export const updateBranding = createAsyncThunk(
  'branding/updateBranding',
  async (data: FormData, { rejectWithValue }) => {
    try {
      const response = await api.put('/branding-config', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update branding');
    }
  }
);

const brandingSlice = createSlice({
  name: 'branding',
  initialState,
  reducers: {
    resetBranding: () => initialState,
  },
  extraReducers: (builder) => {
    builder
      // Fetch Branding
      .addCase(fetchBranding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBranding.fulfilled, (state, action) => {
        state.loading = false;
        state.logoLight = action.payload.logoLightUrl || '';
        state.logoDark = action.payload.logoDarkUrl || '';
        state.primaryColor = action.payload.primaryColor || '';
        state.secondaryColor = action.payload.secondaryColor || '';
        state.defaultDarkMode = action.payload.defaultDarkMode || false;
      })
      .addCase(fetchBranding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })

      // Update Branding
      .addCase(updateBranding.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBranding.fulfilled, (state, action) => {
        state.loading = false;
        state.logoLight = action.payload.logoLightUrl || state.logoLight;
        state.logoDark = action.payload.logoDarkUrl || state.logoDark;
        state.primaryColor = action.payload.primaryColor || state.primaryColor;
        state.secondaryColor = action.payload.secondaryColor || state.secondaryColor;
        state.defaultDarkMode = action.payload.defaultDarkMode || state.defaultDarkMode;
      })
      .addCase(updateBranding.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { resetBranding } = brandingSlice.actions;
export default brandingSlice.reducer;