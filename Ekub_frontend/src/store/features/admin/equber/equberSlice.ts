import { createAsyncThunk, createSlice, PayloadAction } from "@reduxjs/toolkit";
import { toast } from "sonner";
// import { User } from "../user/usersSlice";
import api from "../../../../utils/axios";
import { User } from "../user/usersSlice";

// const baseURL =
//   process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/v1";

export interface UserEquber {
  id: string;
  stake: number;
  equber: Equber;
  user: User;
  paymentScore: number;
  guarantee?: EquberGuarantee;
}

// interface WinnerUser {
//   id: string;
//   username: string;
//   email: string;
//   fullName: string;
//   firstName: string;
//   lastName: string;
//   phoneNumber: string;
//   password: string;
//   avatar: string;
//   googleId: string | null;
//   isVerified: boolean;
//   decline_reason: string | null;
//   passwordResetToken: string | null;
//   passwordResetExpiresIn: string | null;
//   state: string;
//   kycId: string;
//   profileCompletion: number;
//   createdAt: string;
//   updatedAt: string;
// }

export interface EquberGuarantee {
  id: string;
  picture: string;
  fullName: string | null;
  firstName: string;
  lastName: string;
  phoneNumber: string;
  createdAt: string;
  updatedAt: string;
}

export interface EquberUser {
  id: string;
  userId: string;
  guaranteeId: string | null;
  stake: number;
  hasTakenEqub: boolean;
  hasClaimed: boolean;
  claimAmount: number;
  equberId: string;
  equberRequestId: string | null;
  totalPaid: number;
  paidRound: number;
  paymentScore: number;
  paymentScoreCalculatedRound: number;
  state: string;
  createdAt: string;
  updatedAt: string;
  user: User;
  guarantee?: EquberGuarantee;
  guaranteeUser?: User;
  calculatedPaidAmount?: number;
}

interface Winner {
  id: string;
  lotteryNumber: string;
  calculatedPaidAmount: number;
  hasWonEqub: boolean;
  isNotified: boolean;
  equbId: string;
  isGruop: boolean;
  dividedBy: number;
  filledPercent: number;
  totalPaid: number;
  paidRound: number;
  financePoint: number;
  kycPoint: number;
  adminPoint: number;
  totalEligibilityPoint: number;
  included: boolean;
  excluded: boolean;
  show: boolean;
  winRound: number;
  state: string;
  createdAt: string;
  updatedAt: string;
  users: EquberUser[];
}
export interface Equber {
  id: string;
  lotteryNumber: string;
  hasWonEqub: boolean;
  isNotified: boolean;
  equbId: string;
  isGruop: boolean;
  dividedBy: number;
  filledPercent: number;
  totalPaid: number;
  paidRound: number;
  financePoint: number;
  kycPoint: number;
  adminPoint: number;
  totalEligibilityPoint: number;
  included: boolean;
  excluded: boolean;
  show: boolean;
  winRound: number | null;
  state: string;
  createdAt: string;
  updatedAt: string;
  users: EquberUser[];
  isEditing?: boolean;
}
interface EquberPaymentHistory {
  id: string;
  round: number;
  expectedAmount: number;
  totalPaid: number;
  equberId: string;
  createdAt: string;
  updatedAt: string;
}

interface EquberState {
  allEquber: Equber[];
  allExportEquber: Equber[];
  Winners: Winner[];
  equber: Equber | null;
  EquberPaymentHistory: EquberPaymentHistory[];
  totalPages: number;
  isLoading: boolean;
  error: any;
  successMessage: string | null;
  limit: number;
  MarkAsPaid: boolean;
  userPayment: any[];
}

const initialState: EquberState = {
  allEquber: [],
  allExportEquber:[],
  Winners: [],
  userPayment: [],
  EquberPaymentHistory: [],
  MarkAsPaid: false,
  equber: null,
  totalPages: 1,
  isLoading: false,
  error: null,
  successMessage: null,
  limit: 10,
};

export const fetchChartData = createAsyncThunk(
  "equbers/fetchChartData",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/equbs/charts/${id}`);
      return response.data;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      toast.error(message);
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchUserPayment = createAsyncThunk(
  "equbers/fetchUserPayment",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/equbs/userPayment/${id}`);
      return response.data.data.payments;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      toast.error(message);
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchAllEqubers = createAsyncThunk(
  "equbers/fetchAllEqubers",
  async (
    {
      id,
      page = 1,
      limit = 10,
      search,
      sortBy,
      lotteryNumber,
      startDate,
      endDate,

    }: {
      id: string;
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      lotteryNumber?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      let queryParams: any = {
        _page: page,
        _limit: limit,
      };
      if (search) queryParams._search = search;
      if (sortBy) queryParams.sortBy = sortBy;
      if (lotteryNumber) queryParams.lotteryNumber = lotteryNumber;
      if (startDate) queryParams.startDate = startDate;
      if (endDate) queryParams.endDate = endDate;
      const response = await api.get(`/equbs/members/${id}`, {
        params: queryParams,
      });
      return {
        equbers: response.data.data.members,
        totalPages: Math.ceil(response.data.data.meta.total / limit),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      toast.error(message);
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchAllExportEqubers = createAsyncThunk(
  "equbers/fetchAllExportEqubers",
  async (
    {
      id,
      search,
      sortBy,
      lotteryNumber,
      startDate,
      endDate,

    }: {
      id: string;
      search?: string;
      sortBy?: string;
      lotteryNumber?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      let queryParams: any = {};
      if (search) queryParams._search = search;
      if (sortBy) queryParams.sortBy = sortBy;
      if (lotteryNumber) queryParams.lotteryNumber = lotteryNumber;
      if (startDate) queryParams.startDate = startDate;
      if (endDate) queryParams.endDate = endDate;
      const response = await api.get(`/equbs/exportMembers/${id}`, {
        params: queryParams,
      });
      return {
        equbers: response.data.data.members,
        totalPages: Math.ceil(response.data.data.meta.total),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      toast.error(message);
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchAllWinners = createAsyncThunk(
  "equbers/fetchAllWinners",
  async (
    {
      id,
      page = 1,
      limit = 10,
      search,
      sortBy,
      lotteryNumber,
      startDate,
      endDate,
    }: {
      id: string;
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      lotteryNumber?: string;
      startDate?: string;
      endDate?: string;
    },
    { rejectWithValue }
  ) => {
    let queryParams: any = {
      _page: page,
      _limit: limit,
    };
    if (search) queryParams._search = search;
    if (sortBy) queryParams.sortBy = sortBy;
    if (lotteryNumber) queryParams.lotteryNumber = lotteryNumber;
    if (startDate) queryParams.startDate = startDate;
    if (endDate) queryParams.endDate = endDate;
    try {
      const response = await api.get(`equbs/winner/${id}`, {
        params: queryParams,
      });
      return {
        Winners: response.data.data.Winners,
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      toast.error(message);
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchEquber = createAsyncThunk(
  "equber/fetchEquber",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/equbs/member/${id}`);
      // console.log("Fetched Equber:", response.data.data.member); // Log the response
      return response.data.data.member;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      toast.error(message);
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const updateMarkAsPaid = createAsyncThunk(
  "equber/updateMarkAsPaid",
  async (
    { id, reference }: { id: String; reference: String },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.post(`/equbs/mark-paid/${id}`, reference);
      return response.data.data;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      toast.error(message);
      return rejectWithValue({ statusCode, message });
    }
  }
);
export const updateEquber = createAsyncThunk(
  "equber/updateEquber",
  async (
    { id, equberData }: { id: string; equberData: Equber },
    { rejectWithValue }
  ) => {
    try {
      // console.log("Request Data:", equberData);
      const response = await api.patch(`/equbs/member/${id}`, equberData);
      // console.log("Response Data:", response.data);
      return response.data.data.member;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      toast.error(message);
      return rejectWithValue({ statusCode, message });
    }
  }
);

const equberSlice = createSlice({
  name: "equbers",
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    toggleEditMode: (state, action: PayloadAction<string>) => {
      const equber = state.allEquber.find(
        (equber) => equber.id === action.payload
      );
      if (equber) {
        equber.isEditing = !equber.isEditing;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllEqubers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllEqubers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allEquber = action.payload.equbers;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllEqubers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllExportEqubers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllExportEqubers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.allExportEquber = action.payload.equbers;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllExportEqubers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchEquber.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEquber.fulfilled, (state, action) => {
        state.isLoading = false;
        state.equber = action.payload;
      })
      .addCase(fetchEquber.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateEquber.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEquber.fulfilled, (state, action) => {
        state.isLoading = false;
        state.successMessage = "Equber updated successfully";
        const updatedEquber = action.payload;
        const index = state.allEquber.findIndex(
          (equber) => equber.id === updatedEquber.id
        );
        if (index !== -1) {
          state.allEquber[index] = updatedEquber;
        }
        if (state.equber && state.equber.id === updatedEquber.id) {
          state.equber = updatedEquber;
        }
      })
      .addCase(updateEquber.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchAllWinners.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllWinners.fulfilled, (state, action) => {
        state.isLoading = false;
        state.Winners = action.payload.Winners;
        // state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllWinners.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateMarkAsPaid.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateMarkAsPaid.fulfilled, (state, action) => {
        state.isLoading = false;
        state.MarkAsPaid = action.payload.hasTakenEqub;
        // state.totalPages = action.payload.totalPages;
      })
      .addCase(updateMarkAsPaid.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchChartData.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchChartData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.EquberPaymentHistory = action.payload;
        // state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchChartData.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchUserPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchUserPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.userPayment = action.payload;
        // state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchUserPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const { clearSuccessMessage, toggleEditMode } = equberSlice.actions;
export default equberSlice.reducer;
