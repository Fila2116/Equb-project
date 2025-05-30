/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { EqubCategory } from "./equbCategoriesSlice";
import { EqubType } from "./equbTypeSlice";
import { toast } from "sonner";
import { Branch } from "../branch/branchSlice";
import { Equber } from "../equber/equberSlice";
import api from "../../../../utils/axios";

// const baseURL =
//   process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/v1";

export interface LotteryRequest {
  id: string;
  itemName: string;
  description: string;
  amount: number;
  equberId: string;
  state: string;
  createdAt: string;
  updatedAt: string;
  equber: Equber;
}

export interface LotteryDate {
  id: string;
  currentRoundWinners: number;
  nextRoundTime: string;
  nextRoundDate: string;
  nextRoundLotteryType?: "finance" | "request";
  notifyAllMembers: boolean;
}

export interface Equb {
  id: string;
  name?: string;
  description?: string;
  equbType?: EqubType;
  equbTypeId?: string;
  equbCategoryId?: string;
  equbCategory?: EqubCategory;
  numberOfEqubers?: number;
  currentRoundWinners?: number;
  equbAmount?: number;
  startDate?: string;
  endDate?: string;
  goal?: string;
  groupLimit: number;
  currentRound?: number;
  serviceCharge: number;
  nextRoundDate?: string;
  nextRoundTime?: string;
  branch?: Branch;
  branchId?: string;
  isEditing?: boolean;
  status?: string;
  other?: string;
  notifyAllMembers?: boolean;
  nextRoundLotteryType?: "finance" | "request";
}

export interface NewEqub extends Omit<Equb, "id"> { }

interface Percentages {
  registering: number;
  active: number;
  closed: number;
}
export interface EqubStats {
  totalEqubers: number;
  totalEqubs: number;
  registeringCount: number;
  activeCount: number;
  closedCount: number;
  percentages: Percentages;
}
export interface EqubProfileStats {
  currentRound: number;
  equbAmount: number;
  totalMembers: number;
  totalPaidAmount: number;
  totalPaidMembers: number;
  totalUnPaidAmount: number;
  totalUnPaidMembers: number;
}

interface Claimer {
  id: string;
  userId: string;
  guaranteeUserId: string;
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
  calculatedPaidAmount: number;
  createdAt: string;
  updatedAt: string;
  equber: {
    equb: {
      id: string;
      name: string;
    };
  };
  user: {
    id: string;
    fullName: string;
    email: string;
  };
}


interface paymentsHistoryList {
  id: string;
  amount: number;
  createdAt: Date;
  payment: {
    type: string;
    paymentMethod: string;
    equb: {
      id: string;
      name: string;
    };
  };
  equberUser: {
    paymentScoreCalculatedRound: number;
    equber: {
      lotteryNumber: string;
    };
    stake: number;
    calculatedPaidAmount: number
    user: {
      fullName: string;
      phoneNumber: string;
    };
  };
}

interface paymentHistory {
  paymentHistory: paymentsHistoryList[];
  totalPaid: number | undefined;
  totalReceived: number | undefined;
}

interface EqubState {
  allEqubs: Equb[];
  lotteryRequests: LotteryRequest[];
  equb: Equb | null;
  registering: Equb[];
  running: Equb[];
  closed: Equb[];
  totalPages: number;
  isLoading: boolean;
  error: any;
  successMessage: string | null;
  limit: number;
  task: "" | "fetch-equbs" | "fetch-lottery-requests";
  stats: EqubStats | null;
  equbProfile: EqubProfileStats | null;
  financeAndCar: any[];
  financeAndHouse: any[];
  financeAndTravel: any[];
  specialFinance: any[];
  Claimer: Claimer[];
  paymentHistory: paymentHistory | null;
}

const initialState: EqubState = {
  allEqubs: [],
  stats: null,
  equbProfile: null,
  lotteryRequests: [],
  Claimer: [],
  equb: null,
  registering: [],
  running: [],
  closed: [],
  totalPages: 1,
  isLoading: false,
  error: null,
  successMessage: null,
  limit: 10,
  task: "",
  financeAndCar: [],
  financeAndHouse: [],
  financeAndTravel: [],
  specialFinance: [],
  paymentHistory: null,

};

// Fetch all Equbs
export const fetchAllEqubs = createAsyncThunk(
  "equbs/fetchAllEqubs",
  async (
    {
      page = 1,
      limit = 10,
      search,
      sortBy,
      equbType,
      equbCategory,
      startDate,
      endDate,
    }: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
      equbCategory?: string;
      equbType?: string;
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
      if (equbType && equbType !== "all") queryParams.equbType = equbType;
      if (equbCategory && equbCategory !== "all")
        queryParams.equbCategory = equbCategory;
      if (startDate) queryParams.startDate = startDate;
      if (endDate) queryParams.endDate = endDate;

      const response = await api.get(`/equbs`, {
        params: queryParams,
      });

      // console.log(`response.data.data.equbs`, response.data.data.equbs);
      return {
        equbs: response.data.data.equbs,
        totalPages: Math.ceil(response.data.data.meta.total / limit),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchEqubClaimers = createAsyncThunk(
  "equbs/fetchEqubClaimers",
  async ({
    search,
    equb,
    startDate,
    endDate,
  }: {

    search?: string;
    equb?: string;
    startDate?: string;
    endDate?: string;
  }, { rejectWithValue }) => {
    try {
      let queryParams: any = {};
      if (search) queryParams._search = search;
      if (equb) queryParams.equb = equb;
      if (startDate) queryParams.startDate = startDate;
      if (endDate) queryParams.endDate = endDate;
      const response = await api.get(`equbs/getEqubClaimer`, {
        params: queryParams,
      });
      return response.data.data.equbers;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
export const fetchPaymentHistory = createAsyncThunk(
  "equbs/fetchPaymentHistory",
  async ({
    search,
    equb,
    startDate,
    endDate,
  }: {

    search?: string;
    equb?: string;
    startDate?: string;
    endDate?: string;
  }, { rejectWithValue }) => {
    try {
      let queryParams: any = {};
      if (search) queryParams._search = search;
      if (equb) queryParams.equb = equb;
      if (startDate) queryParams.startDate = startDate;
      if (endDate) queryParams.endDate = endDate;
      const response = await api.get(`equbs/getPaymentHistory`, {
        params: queryParams,
      });
      return response.data.data;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
export const fetchAllEqub = createAsyncThunk(
  "equbs/getAllEqub",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("equbs/getAllEqub");
      return response.data.data;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
//fetch equbs stats
export const fetchEqubStats = createAsyncThunk(
  "stats/fetchEqubStats",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/equbs/stats`);
      // console.log("response", response.data);
      return response.data;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
export const financeAndOther = createAsyncThunk(
  "stats/finananceAndOther",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/equbs/financeAndOther`);
      // console.log("response", response.data);
      return response.data;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
// fetchLotteryRequests
export const fetchLotteryRequests = createAsyncThunk(
  "lotteryRequests/fetchLotteryRequests",
  async (
    {
      equbId,
      page = 1,
      limit = 10,
      search,
      sortBy,
    }: {
      equbId: string;
      page: number;
      limit: number;
      search?: string;
      sortBy?: string;
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
      const response = await api.get(`/equbs/requests/${equbId}`, {
        params: queryParams,
      });
      // console.log("response.data.data.", response.data.data);
      return response.data.data.requests;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

// Fetch running Equbs
export const fetchRunningEqubs = createAsyncThunk(
  "equbs/fetchRunningEqubs",
  async (
    {
      page = 1,
      limit = 5,
      search,
      sortBy,
    }: {
      page?: number;
      limit?: number;
      search?: string;
      sortBy?: string;
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
      const response = await api.get(`/equbs/running`, {
        params: queryParams,
      });
      return {
        equbs: response.data.data.runningEqubs,
        totalPages: Math.ceil(response.data.data.meta.total / limit),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

// Fetch registering Equbs
export const fetchRegisteringEqubs = createAsyncThunk(
  "equbs/fetchRegisteringEqubs",
  async (
    {
      page = 1,
      limit = 10,
      search,
      sortBy,
    }: { page?: number; limit?: number; search?: string; sortBy?: string },
    { rejectWithValue }
  ) => {
    try {
      let queryParams: any = {
        _page: page,
        _limit: limit,
      };
      if (search) queryParams._search = search;
      if (sortBy) queryParams.sortBy = sortBy;

      const response = await api.get(`/equbs/registering`, {
        params: queryParams,
      });
      return {
        equbs: response.data.data.registeringEqubs,
        totalPages: Math.ceil(response.data.data.meta.total / limit),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

// Fetch closed Equbs
export const fetchClosedEqubs = createAsyncThunk(
  "equbs/fetchClosedEqubs",
  async (
    {
      page = 1,
      limit = 10,
      search,
      sortBy,
    }: { page?: number; limit?: number; sortBy?: string; search?: string },
    { rejectWithValue }
  ) => {
    try {
      let queryParams: any = {
        _page: page,
        _limit: limit,
      };
      if (search) queryParams._search = search;
      if (sortBy) queryParams.sortBy = sortBy;

      const response = await api.get(`/equbs/closed`, {
        params: queryParams,
      });
      return {
        equbs: response.data.data.closedEqubs,
        totalPages: Math.ceil(response.data.data.meta.total / limit),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
interface updateSetLotteryProps {
  equbData: LotteryDate;
  setOpen?: React.Dispatch<React.SetStateAction<boolean>>;
}
export const updateSetLottery = createAsyncThunk(
  "lottery/updateSetLottery",
  async ({ setOpen, equbData }: updateSetLotteryProps, { rejectWithValue }) => {
    try {
      // const response = await api.patch(`/equbs/lottery/${id}`, lotteryData);
      const response = await api.patch(
        `/equbs/lottery/${equbData.id}`,
        equbData
      );
      setOpen && setOpen(false);
      // console.log(response.data.data);
      toast.success("Lottery updated successfully");
      return { equb: response.data.data.equb };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

// Fetch a single Equb
export const fetchEqub = createAsyncThunk(
  "equbs/fetchEqub",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/equbs/${id}`);
      // console.log(response.data.data.equb);
      return response.data.data.equb;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchEqubProfileStats = createAsyncThunk(
  "equbs/fetchEqubProfileStats",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/equbs/stat/${id}`);
      // console.log("fetchEqubProfileStats", response.data.data.stats);
      return response.data.data.stat;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchFinanceAndOther = createAsyncThunk(
  "equbs/fetchFinanceAndOther",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get("/equbs/financeAndOther");
      return {
        financeAndCar: response.data.financeAndCar,
        financeAndHouse: response.data.financeAndHouse,
        financeAndTravel: response.data.financeAndTravel,
        specialFinance: response.data.specialFinance,
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
export const closeEqub = createAsyncThunk(
  "equbs/closeEqub",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      const response = await api.patch(`/equbs/closeEqub/${id}`);
      return response.data;
    } catch (error: any) {
      // Ensure error handling is more robust and typed
      const statusCode = error.response?.status || 500; // Default to 500 if status is undefined
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
export const deleteEqub = createAsyncThunk(
  "equbs/deleteEqub",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      await api.delete(`/equbs/deleteEqub/${id}`);
      return "Successfully Deleted ";
    } catch (error: any) {
      // Ensure error handling is more robust and typed
      const statusCode = error.response?.status || 500; // Default to 500 if status is undefined
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

interface CreateEqubProps {
  equbData: NewEqub;
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
}
// Create an Equb
export const createEqub = createAsyncThunk(
  "equbs/createEqub",
  async ({ equbData, setOpen }: CreateEqubProps, { rejectWithValue }) => {
    try {
      const response = await api.post(`/equbs`, {
        ...equbData,
        branchId: equbData.branch?.id,
      });
      setOpen(false);
      toast.success("Equb created successfully.");
      return response.data.data.equb;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

// Update an Equb
export const updateEqub = createAsyncThunk(
  "equbs/updateEqub",
  async (
    { id, equbData }: { id: string; equbData: Equb },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.patch(`/equbs/${id}`, equbData);
      // console.log(response.data);
      return response.data.data.equb;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

const equbSlice = createSlice({
  name: "equbs",
  initialState,
  reducers: {
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    toggleEditMode: (state, action) => {
      const equb = state.allEqubs.find((equb) => equb.id === action.payload);
      if (equb) {
        equb.isEditing = !equb.isEditing;
      }
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchAllEqubs.pending, (state) => {
        state.isLoading = true;
        state.task = "fetch-equbs";
        state.error = null;
      })
      .addCase(fetchAllEqubs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.allEqubs = action.payload.equbs;
        state.task = "";
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchAllEqubs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.task = "";
      })
      .addCase(fetchRunningEqubs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRunningEqubs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.running = action.payload.equbs;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchRunningEqubs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchRegisteringEqubs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchRegisteringEqubs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.registering = action.payload.equbs;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchRegisteringEqubs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchClosedEqubs.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchClosedEqubs.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.closed = action.payload.equbs;
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchClosedEqubs.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchEqub.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEqub.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.equb = action.payload;
      })
      .addCase(fetchEqub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createEqub.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createEqub.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.allEqubs.push(action.payload);
        state.successMessage = "Equb created successfully";
      })
      .addCase(createEqub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateEqub.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateEqub.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const updatedEqub = action.payload;
        const index = state.allEqubs.findIndex(
          (equb) => equb.id === updatedEqub.id
        );
        if (index !== -1) {
          state.allEqubs[index] = updatedEqub;
        }
        state.successMessage = "Equb updated successfully";
      })
      .addCase(updateEqub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateSetLottery.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateSetLottery.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.successMessage = "Equb updated successfully!";
        state.equb = action.payload.equb;
      })
      .addCase(updateSetLottery.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchLotteryRequests.pending, (state) => {
        state.isLoading = true;
        state.task = "fetch-lottery-requests";
        state.error = null;
      })
      .addCase(fetchLotteryRequests.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.lotteryRequests = action.payload;
        state.totalPages = action.payload.totalPages;
        state.task = "";
      })
      .addCase(fetchLotteryRequests.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
        state.task = "";
      })
      .addCase(fetchEqubStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEqubStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.stats = action.payload;
      })
      .addCase(fetchEqubStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchEqubProfileStats.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEqubProfileStats.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.equbProfile = action.payload;
      })
      .addCase(fetchEqubProfileStats.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchFinanceAndOther.fulfilled, (state, action) => {
        state.financeAndCar = action.payload.financeAndCar;
        state.financeAndHouse = action.payload.financeAndHouse;
        state.financeAndTravel = action.payload.financeAndTravel;
        state.specialFinance = action.payload.specialFinance;
      })
      .addCase(closeEqub.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(closeEqub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(closeEqub.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.successMessage = "Equb closed successfully";
      })
      .addCase(deleteEqub.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(deleteEqub.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(deleteEqub.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.successMessage = "Equb closed successfully";
      })
      .addCase(fetchEqubClaimers.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchEqubClaimers.fulfilled, (state, action) => {
        state.isLoading = false;
        state.Claimer = action.payload;
      })
      .addCase(fetchEqubClaimers.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPaymentHistory.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchPaymentHistory.fulfilled, (state, action) => {
        state.isLoading = false;
        state.paymentHistory = action.payload;
      })
      .addCase(fetchPaymentHistory.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload as string;
      });

  },
});

export const { clearSuccessMessage, toggleEditMode } = equbSlice.actions;

export default equbSlice.reducer;
