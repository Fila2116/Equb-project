import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
// import axios from "axios";
import { toast } from "sonner";
import { Equber } from "../equber/equberSlice";
import { User } from "../user/usersSlice";
import { Equb } from "../equb/equbSlice";
import api from "../../../../utils/axios";
// const baseURL = process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/v1";
export interface NewPayment {
  amount: number;
  paymentMethod: string;
  approved: string;
  state: string;
  user: User;
  picture: string;
  isEditing: boolean;
  equbber: Equber;
  equberRequests: Equber[];
}
export interface Payment extends NewPayment {
  id: string;
  equb: Equb;
}
export interface PaymentExport extends NewPayment {
  id: string;
  equb: Equb;
}
interface PaymentState {
  payments: Payment[];
  paymentExport: Payment[];
  totalPages: number;
  isLoading: boolean;
  task: "" | "fetch-payments" | "update-payment";
  error: any;
  successMessage: string | null;
  count: number;
}
const initialState: PaymentState = {
  payments: [],
  paymentExport:[],
  totalPages: 1,
  isLoading: false,
  task: "",
  error: null,
  count: 0,
  successMessage: null,
};

export const fetchPayment = createAsyncThunk(
  "payments/fetchPayment",
  async (
    {
      page = 1,
      limit = 10,
      isApproved,
      search,
      sortBy,
      startDate,
      endDate,
      equbId,
      companyBankId
    }: {
      page?: number;
      limit?: number;
      isApproved?: string;
      search?: string;
      sortBy?: string;
      paymentMethod?: string;
      startDate?: string;
      endDate?: string;
      equbId?: string;
      companyBankId?: string;
    },
    { rejectWithValue }
  ) => {
    try {
      // const response = await axios.get(
      //     `${baseURL}/payment?_page=${page}&_limit=${limit}&_approved=${isApproved? 'true' : 'false'}`
      // );
      const params: any = {
        _page: page,
        _limit: limit,
      };
      if (isApproved === "approved") params.approved = true;
      if (isApproved === "not_approved") params.approved = false;

      if (search) params._search = search;
      if (sortBy) params.sortBy = sortBy;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      // if (paymentMethod) params.paymentMethod = paymentMethod;
      if (companyBankId) params.companyBankId = companyBankId;
      if (equbId) params.equbId = equbId;



      const response = await api.get(`/payment`, { params: params });
      return {
        paymentS: response.data.data.payments,
        totalPages: Math.ceil(response.data.data.meta.total / limit),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const fetchExportPayment = createAsyncThunk(
  "payments/fetchExportPayment",
  async (
    {
      isApproved,
      search,
      sortBy,
      startDate,
      endDate,
      equbId,
      companyBankId
    }: {
      isApproved?: string;
      search?: string;
      sortBy?: string;
      paymentMethod?: string;
      startDate?: string;
      endDate?: string;
      equbId?: string;
      companyBankId?: string;
    },
    { rejectWithValue }
  ) => {
    try {
    
      const params: any = {};
      if (isApproved === "approved") params.approved = true;
      if (isApproved === "not_approved") params.approved = false;

      if (search) params._search = search;
      if (sortBy) params.sortBy = sortBy;
      if (startDate) params.startDate = startDate;
      if (endDate) params.endDate = endDate;
      // if (paymentMethod) params.paymentMethod = paymentMethod;
      if (companyBankId) params.companyBankId = companyBankId;
      if (equbId) params.equbId = equbId;

      const response = await api.get(`/payment/paymentExport`, { params: params });
      return {
        payments: response.data.data.payments,
        totalPages: Math.ceil(response.data.data.meta.total),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);


export const getPendingPayments = createAsyncThunk(
  "payment/getPendingPayments",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`/payment/getPendingPayments`);
      return response.data.data.count;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const updatePayment = createAsyncThunk(
  "payment/updatePayment",
  async (
    { id, approved }: { id: string; approved: string },
    { rejectWithValue }
  ) => {
    if (!id) {
      throw new Error("Payment ID is required");
    }
    try {
      const response = await api.patch(`/payment/${id}`, { approved });
      toast.success("payment updated successfully");
      // console.log("response.data.data.payment", response.data.data.payment);
      return { payment: response.data.data.payment };
    } catch (error: any) {
      toast.error(error.response.data.message) || "Failed to update payment";
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

const paymentSlice = createSlice({
  name: "payment",
  initialState,
  reducers: {
    toggleEditMode: (state, action) => {
      const payment = state.payments.find(
        (payment) => payment.id === action.payload
      );
      if (payment) {
        payment.isEditing = !payment.isEditing;
      }
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchPayment.pending, (state) => {
        state.isLoading = true;
        state.task = "fetch-payments";
        state.error = null;
      })
      .addCase(fetchPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.task = "";
        state.payments = action.payload.paymentS.map((payment: Payment) => ({
          ...payment,
          isEditing: false,
        }));
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.task = "";
        state.error = action.payload;
        toast.error(action.error.message);
      })

       .addCase(fetchExportPayment.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchExportPayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.task = "";
        state.paymentExport = action.payload.payments.map((payment: PaymentExport) => ({
          ...payment,
          isEditing: false,
        }));
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchExportPayment.rejected, (state, action) => {
        state.isLoading = false;
        state.task = "";
        state.error = action.payload;
        toast.error(action.error.message);
      })
      .addCase(updatePayment.pending, (state) => {
        state.isLoading = true;
        state.task = "update-payment";
        state.error = null;
      })
      .addCase(updatePayment.fulfilled, (state, action) => {
        state.isLoading = false;
        state.task = "";
        state.error = null;
        const { payment } = action.payload;
        if (payment.approved) {
          state.payments = state.payments.map((pay) => {
            if (pay.id === payment.id) return payment;
            return pay;
          });
        } else {
          state.payments = state.payments.filter(
            (pay) => pay.id !== payment.id
          );
        }
        state.successMessage = "Bank updated successfully";
      })
      .addCase(updatePayment.rejected, (state, action) => {
        state.isLoading = false;
        state.task = "";
        state.error = action.payload;
      })
      .addCase(getPendingPayments.pending, (state) => {
        state.isLoading = true;
        state.task = "fetch-payments";
        state.error = null;
      })
      .addCase(getPendingPayments.fulfilled, (state, action) => {
        state.isLoading = false;
        state.count = action.payload;
      })
      .addCase(getPendingPayments.rejected, (state, action) => {
        state.isLoading = false;
        state.task = "";
        state.error = action.payload;
        toast.error(action.error.message);
      });
  },
});
export const { clearSuccessMessage, toggleEditMode } = paymentSlice.actions;
export default paymentSlice.reducer;
