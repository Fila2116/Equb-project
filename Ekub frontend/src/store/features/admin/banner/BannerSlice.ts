import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";
import api from "../../../../utils/axios";

const baseURL =
  process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/v1";

export interface NewBanner {
  // Add id to identify banners
  name: string;
  picture: string | File | null;
  state: string;
  validFrom: string;
  validUntil: string;
  isEditing: boolean;
}
export interface Banner extends NewBanner {
  id: string;
  // state?:string;
}
interface UpdateBannerParams {
  bannerData: NewBanner;
  id: string;
}
interface BannersState {
  banners: Banner[];
  totalPages: number;
  isLoading: boolean;
  error: any;
  successMessage: string | null;
  limit: number;
}

const initialState: BannersState = {
  banners: [],
  totalPages: 1,
  isLoading: false,
  error: null,
  successMessage: null,
  limit: 10,
};
export const fetchBanners = createAsyncThunk(
  "banner/fetchBanners",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `${baseURL}/banner?_page=${page}&_limit=${limit}`
      );
      return {
        banners: response.data.data.banners,
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
  "banner/fetchBanner",
  async ({ id }: UpdateBannerParams, { rejectWithValue }) => {
    try {
      const response = await api.get(`${baseURL}/banner/${id}`);
      return response.data.data;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

// export const fetchBanners = createAsyncThunk("banner/fetchBanners", async () => {
//   const response = await api.get(`${baseURL}/banner`);
//   return response.data.data.banners;
// });
interface createBannerProps {
  bannerData: NewBanner;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
export const createBanner = createAsyncThunk(
  "banner/createBanner",
  async ({ bannerData, setOpen }: createBannerProps, { rejectWithValue }) => {
    try {
      // let picture = bannerData.picture;
      
      if (bannerData.picture instanceof File) {
        const formData = new FormData();
        formData.append("picture", bannerData.picture);
        formData.append("validFrom", bannerData.validFrom);
        formData.append("validUntil", bannerData.validUntil);
        formData.append("state", bannerData.state);
        formData.append("name", bannerData.name);

        const response = await api.post(`${baseURL}/banner`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
        });
        setOpen(false);
        toast.success(" Successfully created");
        return response.data.data.banner;
      }
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const updateBanner = createAsyncThunk(
  "banner/updateBanner",
  async ({ bannerData, id }: UpdateBannerParams, { rejectWithValue }) => {
    try {
      const response = await api.patch(`${baseURL}/banner/${id}`, {
        ...bannerData,
      });

      return response.data.data.banner;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
export const DeleteBanner = createAsyncThunk(
  "banner/deleteBanner",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      await api.delete(`${baseURL}/banner/deleteBanner/${id}`);
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
const bannersSlice = createSlice({
  name: "banner",
  initialState,
  reducers: {
    toggleEditMode: (state, action) => {
      const branch = state.banners.find(
        (banner) => banner.id === action.payload
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
      .addCase(fetchBanners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBanners.fulfilled, (state, action) => {
        state.isLoading = false;
        // state.banners = action.payload;
        state.banners = action.payload.banners.map((banner: Banner) => ({
          ...banner,
          isEditing: false,
        }));
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchBanners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.banners.push(action.payload);
        state.successMessage = "Banner created successfully";
      })
      .addCase(createBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateBanner.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBanner.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const index = state.banners.findIndex(
          (banner) => banner.id === action.payload.id
        );
        if (index !== -1) {
          state.banners[index] = action.payload;
        }
        state.successMessage = "Banner updated successfully";
      })
      .addCase(updateBanner.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSuccessMessage, toggleEditMode } = bannersSlice.actions;

export default bannersSlice.reducer;
