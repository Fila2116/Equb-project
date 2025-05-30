import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import api from "../../../../utils/axios";

interface ReportState {
  data: any[];
  loading: boolean;
  error: string | null;
  userReport: any[];
}

const initialState: ReportState = {
  data: [],
  userReport: [],
  loading: false,
  error: null,
};

// Async thunk to fetch report data
export const fetchReports = createAsyncThunk(
  "reports/fetchReports",
  async (_, thunkAPI) => {
    try {
      const response = await api.get("/report/generalReport");
      // console.log("response from report slice", response.data);

      return response.data.data; // Adjust based on your API response structure
    } catch (error: any) {
      return thunkAPI.rejectWithValue(
        error.response?.data?.message || "Failed to fetch reports"
      );
    }
  }
);

export const fetchUserReport = createAsyncThunk(
  "report/fetchUserReport",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/report/userReport/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data || "Failed to fetch data");
    }
  }
);

const reportsSlice = createSlice({
  name: "reports",
  initialState,
  reducers: {},
  extraReducers: (builder) => {
    builder
      .addCase(fetchReports.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchReports.fulfilled, (state, action) => {
        state.loading = false;
        state.data = action.payload;
      })
      .addCase(fetchReports.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchUserReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchUserReport.fulfilled, (state, action) => {
        state.loading = false;
        state.userReport = action.payload;
      })
      .addCase(fetchUserReport.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export default reportsSlice.reducer;
