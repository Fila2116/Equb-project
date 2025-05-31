/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
import { Bank } from "../banks/banksSlice";
import { Equb } from "../equb/equbSlice";
import api from "../../../../utils/axios";

// const baseURL =
//   process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/v1";
interface BankAccount {
  id: string;
  bank: Bank;
  accountNumber: String;
  accountName: String;
  isPrimary?: Boolean;
}
export interface Guarantee {
  id: string;
  picture: string;
  fullname: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
}
export interface User {
  id: string;
  username: string;
  email: string | null;
  fullName: string;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  password: string;
  avatar: string | null;
  picture: string | null;
  googleId: string | null;
  isVerified: boolean;
  decline_reason: string | null;
  passwordResetToken: string | null;
  passwordResetExpiresIn: string | null;
  state: string;
  kycId: string | null;
  profileCompletion: number;
  createdAt: string;
  updatedAt: string;
  equberUsers: { id: string }[];
  joinedEqubs?: Equb[];
  bankAccounts?: BankAccount[];
}

interface UsersState {
  users: User[];
  user: User | null;
  approved: User[];
  registered: User[];
  isLoading: boolean;
  error: any;
  totalPages: number;
}

const initialState: UsersState = {
  users: [],
  user: null,
  approved: [],
  registered: [],
  isLoading: false,
  error: null,
  totalPages: 1,
};

export const fetchApprovedUsers = createAsyncThunk(
  "users/fetchApprovedUsers",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `/user/approved?_page=${page}&_limit=${limit}`
      );
      return {
        users: response.data.data.users,
        totalPages: Math.ceil(response.data.data.meta.total / limit),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchUsers = createAsyncThunk(
  "users/fetchUsers",
  async (
    {
      page = 1,
      limit = 10,
      startDate,
      endDate,
      search,
    }: {
      page?: number;
      limit?: number;
      startDate?: string;
      endDate?: string;
      search?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      let queryParams: any = {
        _page: page,
        _limit: limit,
      };
      if (search) queryParams._search = search;
      if (startDate) queryParams.startDate = startDate;
      if (endDate) queryParams.endDate = endDate;

      const response = await api.get("/users", { params: queryParams });
      return {
        users: response.data.data.users,
        totalPages: Math.ceil(response.data.data.meta.total / limit),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchUser = createAsyncThunk(
  "users/fetchUser",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/users/${id}`);
      return response.data.data.user;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

// export const fetchUser = createAsyncThunk(
//   "users/fetchUser",
//   async (id: string) => {
//     try {
//       const response = await api.get(`/users/${id}`);
//       return response.data.data.user;
//     } catch (error: any) {
//       throw new Error(error.response.data.message);
//     }
//   }
// );

export const updateUserApproval = createAsyncThunk(
  "users/updateUser",
  async (
    { id, decision }: { id: string; decision: string },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/users/approve/${id}`, { decision });
      return response.data.data.user;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
export const deleteUser = createAsyncThunk(
  "users/deleteUser",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/users/deleteUser/${id}`);
      return "Successfully deleted";
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

const usersSlice = createSlice({
  name: "users",
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchApprovedUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchApprovedUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.approved = action.payload.users;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchApprovedUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUsers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUsers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.users = action.payload.users;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchUsers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUser.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.user = action.payload;
      })
      .addCase(fetchUser.rejected, (state, action) => {
        state.isLoading = false;
        state.user = null;
        state.error = action.payload;
      })
      .addCase(updateUserApproval.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateUserApproval.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        // Update the user in the state with the new approval status
        const updatedUser = action.payload;
        state.users = state.users.map((user) =>
          user.id === updatedUser.id ? { ...user, ...updatedUser } : user
        );
      })
      .addCase(updateUserApproval.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteUser.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteUser.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
      });
  },
});

export const { clearError } = usersSlice.actions;

export default usersSlice.reducer;
