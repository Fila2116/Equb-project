import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
import { Role } from "../roles/rolesSlice";
import { toast } from "sonner";
import api from "../../../../utils/axios";

// const baseURL =
//   process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/v1";

export interface NewStaff {
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  avatar: string | File | null;
  role: Role;
  isEditing: boolean;
  password: string;
}

export interface Staff extends Omit<NewStaff, "avatar"> {
  id: string;
  avatar: string;
  password: string;
  state: string;
}

interface StaffsState {
  staffs: Staff[];
  totalPages: number;
  isLoading: boolean;
  error: any;
  successMessage: string | null;
  limit: number;
}

const initialState: StaffsState = {
  staffs: [],
  totalPages: 1,
  isLoading: false,
  error: null,
  successMessage: null,
  limit: 10,
};

export const fetchStaffs = createAsyncThunk(
  "staffs/fetchStaffs",
  async (
    {
      page = 1,
      limit = 10,
      search,
    }: { page?: number; limit?: number; search?: string },
    { rejectWithValue }
  ) => {
    try {
      let queryParams: any = {
        _page: page,
        _limit: limit,
      };
      if (search) queryParams._search = search;
      const response = await api.get(`/staff?_page=${page}&_limit=${limit}`, {
        params: queryParams,
      });
      return {
        staffs: response.data.data.staffs,
        totalPages: Math.ceil(response.data.data.meta.total / limit),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchStaff = createAsyncThunk(
  "staffs/fetchStaff",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/staff/${id}`);
      return response.data.data.staff;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
export const deleteStaff = createAsyncThunk(
  "staffs/deleteStaff",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.delete(`/staff/deleteStaff/${id}`);
      return response.data;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const createStaff = createAsyncThunk(
  "staffs/createStaff",
  async (staffData: NewStaff) => {
    try {
      const formData = new FormData();
      formData.append("firstName", staffData.firstName);
      formData.append("lastName", staffData.lastName);
      formData.append("email", staffData.email);
      formData.append("phoneNumber", staffData.phoneNumber);
      formData.append("roleId", staffData.role.id);
      formData.append("password", staffData.password);

      if (staffData.avatar instanceof File) {
        formData.append("avatar", staffData.avatar);
      } else if (staffData.avatar) {
        formData.append("avatar", staffData.avatar);
      }

      // Log formData contents
      // for (let [key, value] of formData.entries()) {
      //   console.log(`${key}: ${value}`);
      // }

      const response = await api.post(`/staff`, formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });
      return response.data.data.staff;
    } catch (error: any) {
      console.error("Error creating staff:", error);
      // console.log("Error response data:", error.response?.data); // Log the error response data
      toast.error(error.response?.data?.message || "Failed to create staff");
      // const statusCode = error.response?.status;
      // const message = error.response?.data?.message || "An error occurred";
      // return rejectWithValue({ statusCode, message });
    }
  }
);

export const updateStaff = createAsyncThunk(
  "staffs/updateStaff",
  async (
    {
      id,
      staffData,
      resetPassword,
    }: {
      id: string;
      staffData: Staff;
      resetPassword: boolean;
    },
    { rejectWithValue }
  ) => {
    try {
      const updateData: any = {
        ...staffData,
        roleId: staffData.role.id,
      };
      if (resetPassword) {
        updateData.password = staffData.password;
      }

      const response = await api.patch(`/staff/${id}`, updateData);
      return response.data.data.staff;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

const staffSlice = createSlice({
  name: "staffs",
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    toggleEditMode: (state, action) => {
      const staff = state.staffs.find((staff) => staff.id === action.payload);
      if (staff) {
        staff.isEditing = !staff.isEditing;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchStaffs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStaffs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.staffs = action.payload.staffs.map((staff: Staff) => ({
          ...staff,
          isEditing: false,
        }));
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchStaffs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const fetchedStaff = action.payload;
        state.staffs = state.staffs.map((staff) =>
          staff.id === fetchedStaff.id ? fetchedStaff : staff
        );
      })
      .addCase(fetchStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(createStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.successMessage = "Staff member created successfully";
        state.staffs.push(action.payload);
      })
      .addCase(createStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(updateStaff.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const updatedStaff = action.payload;
        state.staffs = state.staffs.map((staff) =>
          staff.id === updatedStaff.id
            ? { ...staff, ...updatedStaff, isEditing: false }
            : staff
        );
        state.successMessage = "Staff member updated successfully";
      })
      .addCase(updateStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteStaff.pending, (state) => {
        state.isLoading = true;
        state.error = null;
        state.successMessage = null;
      })
      .addCase(deleteStaff.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.successMessage = "Staff member deleted successfully";
      })
      .addCase(deleteStaff.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSuccessMessage, toggleEditMode } = staffSlice.actions;
export default staffSlice.reducer;
