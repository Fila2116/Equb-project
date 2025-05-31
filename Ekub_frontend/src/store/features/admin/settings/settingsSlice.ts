import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import axios, { isAxiosError } from "axios";
import { toast } from "sonner";

const baseURL = `${process.env.REACT_APP_BASE_URL}/setting`;

// Define Setting Interface
export interface Setting {
  id?: string;
  name: string;
  numericValue: number;
  value?: string | null;
  picture?: string | null;
  description?: string | null;
  validFrom?: string | null;
  validUntil?: string | null;
  floatValue?: number | null;
  booleanValue?: boolean | null;
  state?: string;
  createdAt?: string;
  updatedAt?: string;
  _id?: string;
}

export interface SettingsState {
  settings: Setting[];
  status: "idle" | "loading" | "succeeded" | "failed";
  error: string | null;
  meta: {
    page: number;
    limit: number;
    total: number;
  };
}
export interface NewSetting extends Omit<Setting, "id"> {}
const initialState: SettingsState = {
  settings: [],
  status: "idle",
  error: null,
  meta: {
    page: 1,
    limit: 10,
    total: 0,
  },
};

// Thunk to fetch all settings
export const fetchSettings = createAsyncThunk(
  "settings/fetchSettings",
  async (_, thunkAPI) => {
    try {
      const response = await axios.get(`${baseURL}`);
      return response.data.data;
    } catch (error) {
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

// Thunk to add a new setting
export const addSetting = createAsyncThunk(
  "settings/addSetting",
  async (setting: NewSetting, thunkAPI) => {
    try {
      const response = await axios.post(`${baseURL}`, setting);
      // console.log("add setting slice response", response.data.data);
      toast.success("Setting added successfully!");
      return response.data.data;
    } catch (error) {
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

// Thunk to update a setting by ID
export const updateSetting = createAsyncThunk(
  "settings/updateSetting",
  async (setting: Setting, thunkAPI) => {
    try {
      const response = await axios.patch(`${baseURL}/${setting.id}`, setting);

      // console.log("update setting slice response", response.data);
      return response.data.data;
    } catch (error) {
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

// Thunk to delete a setting by ID
export const deleteSetting = createAsyncThunk(
  "settings/deleteSetting",
  async (id: string, thunkAPI) => {
    try {
      await axios.delete(`${baseURL}/${id}`);
      return id;
    } catch (error) {
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

// Slice definition
const settingsSlice = createSlice({
  name: "settings",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      // Fetch all settings
      .addCase(fetchSettings.pending, (state) => {
        state.status = "loading";
      })
      .addCase(fetchSettings.fulfilled, (state, action) => {
        state.status = "succeeded";
        state.settings = action.payload.settings;
        state.meta = action.payload.meta;
      })
      .addCase(fetchSettings.rejected, (state, action) => {
        state.status = "failed";
        state.error = action.error.message || "Failed to fetch settings";
      })

      // Add new setting
      .addCase(addSetting.fulfilled, (state, action) => {
        state.settings.push(action.payload.setting);
      })

      // Update setting by ID
      .addCase(updateSetting.fulfilled, (state, action) => {
        const index = state.settings.findIndex(
          (setting) => setting._id === action.payload._id
        );
        if (index !== -1) {
          state.settings[index] = action.payload;
        }
      })

      // Delete setting by ID
      .addCase(deleteSetting.fulfilled, (state, action) => {
        state.settings = state.settings.filter(
          (setting) => setting._id !== action.payload
        );
      });
  },
});

export default settingsSlice.reducer;
