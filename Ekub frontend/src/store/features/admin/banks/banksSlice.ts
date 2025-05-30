/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { toast } from "sonner";
import api from "../../../../utils/axios";

const baseURL =
  process.env.REACT_APP_BASE_URL || "http://localhost:8000/api/v1";

export interface NewBank {
  name: string;
  description: string;
  isEditing: boolean;
}
export interface Bank extends NewBank {
  id: string;
}

export interface NewCompanyBank {
  accountName: string;
  accountNumber: string;
  isEditing: boolean;
}
export interface CompanyBank extends NewCompanyBank {
  id: string;
}

interface BanksState {
  banks: Bank[];
  companyBanks: CompanyBank[];
  totalPages: number;
  isLoading: boolean;
  error: any;
  successMessage: string | null;
  limit: number;
  isVerified: boolean;
}

const initialState: BanksState = {
  banks: [],
  companyBanks: [],
  totalPages: 1,
  isLoading: false,
  error: null,
  successMessage: null,
  limit: 10,
  isVerified: false,
};

export const fetchBanks = createAsyncThunk(
  "banks/fetchBanks",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `${baseURL}/bank?_page=${page}&_limit=${limit}`
      );
      return {
        banks: response.data.data.banks,
        totalPages: Math.ceil(response.data.data.meta.total / limit),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
export const fetchCompanyBanks = createAsyncThunk(
  "banks/fetchCompanyBanks",
  async (
    { page = 1, limit = 10 }: { page?: number; limit?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await api.get(
        `${baseURL}/company-bank?_page=${page}&_limit=${limit}`
      );
      return {
        companyBanks: response.data.data.companyBankAccounts,
        totalPages: Math.ceil(response.data.data.meta.total / limit),
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
export const fetchAllCompanyBank = createAsyncThunk(
  "company-bank/getAllCompanyBankAccounts",
  async (_, { rejectWithValue }) => {
    try {
      const response = await api.get(`${baseURL}/company-bank/getAllCompanyBankAccounts`);
      return {
        companyBanks: response.data.data.companyBankAccounts,
      };
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
export const DeleteCompanyBanks = createAsyncThunk(
  "banks/DeleteCompanyBanks",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      await api.delete(`${baseURL}/bank/deleteCompanyBank/${id}`);
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
export const DeleteBankList = createAsyncThunk(
  "banks/DeleteBankList",
  async ({ id }: { id: string }, { rejectWithValue }) => {
    try {
      await api.delete(`${baseURL}/bank/deleteBankList/${id}`);
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
export const fetchBank = createAsyncThunk(
  "banks/fetchBank",
  async (id: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`${baseURL}/bank/${id}`);
      return response.data.data;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
interface CreateBankProps {
  setOpen: React.Dispatch<React.SetStateAction<boolean>>;
  bankData: NewBank;
}
export const createBank = createAsyncThunk(
  "banks/createBank",
  async ({ setOpen, bankData }: CreateBankProps, { rejectWithValue }) => {
    try {
      const response = await api.post(`${baseURL}/bank`, bankData);
      setOpen(false);
      toast.success("Bank created successfully");
      return response.data.data.bank;
    } catch (error: any) {
      toast.error(error.response.data.message || "Failed to create bank");
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const verifyAdmin = createAsyncThunk(
  "banks/verifyAdmin",
  async (otpCode: string, { rejectWithValue }) => {
    try {
      console.log("otpCode.........",otpCode)
      const response = await api.post(`${baseURL}/staff/auth/verify`, {
        otpCode,
      });
      return response.data.data;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
//Send Otp Code to Admin
export const SendOtpToAdmin = createAsyncThunk(
  "banks/sendOtpToAdmin",
  async (_, { rejectWithValue }) => {
    try {
      console.log("Check Url.........")
      const response = await api.post(`${baseURL}/staff/auth/sendOtpToAdmin`);
      return response.data.data;
    } catch (error: any) {
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);
export const createCompanyBank = createAsyncThunk(
  "banks/createCompanyBank",
  async (bankData: NewCompanyBank, { rejectWithValue }) => {
    try {
      const response = await api.post(`${baseURL}/company-bank`, bankData);
      return response.data.data.companyBankAccount;
    } catch (error: any) {
      toast.error(error.response.data.message || "Failed to create bank");
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const updateBank = createAsyncThunk(
  "banks/updateBank",
  async (
    { id, bankData }: { id: string; bankData: NewBank },
    { rejectWithValue }
  ) => {
    if (!id) {
      throw new Error("Bank id is undefined");
    }
    try {
      const response = await api.patch(`${baseURL}/bank/${id}`, bankData);
      toast.success("Bank updated successfully");
      return response.data.data.bank;
    } catch (error: any) {
      toast.error(error.response.data.message || "Failed to update bank");
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

export const updateCompanyBank = createAsyncThunk(
  "banks/updateCompanyBank",
  async (
    { id, bankData }: { id: string; bankData: NewCompanyBank },
    { rejectWithValue }
  ) => {
    if (!id) {
      throw new Error("Company Bank id is undefined");
    }
    try {
      const response = await api.patch(
        `${baseURL}/company-bank/${id}`,
        bankData
      );
      toast.success("Company Bank updated successfully");
      return response.data.data.companyBankAccount;
    } catch (error: any) {
      toast.error(error.response.data.message || "Failed to create bank");
      const statusCode = error.response?.status;
      const message = error.response?.data?.message || "An error occurred";
      return rejectWithValue({ statusCode, message });
    }
  }
);

const banksSlice = createSlice({
  name: "banks",
  initialState,
  reducers: {
    toggleEditMode: (state, action) => {
      const bank = state.banks.find((bank) => bank.id === action.payload);
      if (bank) {
        bank.isEditing = !bank.isEditing;
      }
    },
    toggleEditModeForCompanyBank: (state, action) => {
      const bank = state.companyBanks.find(
        (bank) => bank.id === action.payload
      );
      if (bank) {
        bank.isEditing = !bank.isEditing;
      }
    },
    clearSuccessMessage: (state) => {
      state.successMessage = null;
    },
    //  NEW ACTION ADDED HERE
    resetVerification: (state) => {
      state.isVerified = false;
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBanks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBanks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.banks = action.payload.banks.map((bank: Bank) => ({
          ...bank,
          isEditing: false,
        }));
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchBanks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchCompanyBanks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchCompanyBanks.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.companyBanks = action.payload.companyBanks.map((bank: Bank) => ({
          ...bank,
          isEditing: false,
        }));
        state.totalPages = action.payload.totalPages;
      })
      .addCase(fetchCompanyBanks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      //
      .addCase(fetchAllCompanyBank.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchAllCompanyBank.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.companyBanks = action.payload.companyBanks.map((bank: Bank) => ({
          ...bank,
          isEditing: false,
        }));
      })
      .addCase(fetchAllCompanyBank.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(fetchBank.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(fetchBank.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.banks = [action.payload.bank];
      })
      .addCase(fetchBank.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(createBank.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createBank.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.banks.push(action.payload);
        state.successMessage = "Bank created successfully";
      })
      .addCase(createBank.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(verifyAdmin.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(verifyAdmin.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.isVerified = true;
      })
      .addCase(verifyAdmin.rejected, (state, action) => {
        state.isLoading = false;
        state.isVerified = false;
        state.error = action.payload;
      })
      .addCase(createCompanyBank.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(createCompanyBank.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        state.companyBanks.push(action.payload);
        state.successMessage = "Company Bank created successfully";
      })
      .addCase(createCompanyBank.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateBank.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateBank.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const updatedBank = action.payload;
        state.banks = state.banks.map((bank) =>
          bank.id === updatedBank.id
            ? { ...bank, ...updatedBank, isEditing: false }
            : bank
        );
        state.successMessage = "Bank updated successfully";
      })
      .addCase(updateBank.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(updateCompanyBank.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(updateCompanyBank.fulfilled, (state, action) => {
        state.isLoading = false;
        state.error = null;
        const updatedCompanyBank = action.payload;
        state.companyBanks = state.companyBanks.map((bank) =>
          bank.id === updatedCompanyBank.id
            ? { ...bank, ...updatedCompanyBank, isEditing: false }
            : bank
        );
        state.successMessage = "Bank updated successfully";
      })
      .addCase(updateCompanyBank.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(DeleteCompanyBanks.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(DeleteCompanyBanks.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.successMessage = "Bank deleted successfully";
      })
      .addCase(DeleteCompanyBanks.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      })
      .addCase(DeleteBankList.pending, (state) => {
        state.isLoading = true;
        state.error = null;
      })
      .addCase(DeleteBankList.fulfilled, (state) => {
        state.isLoading = false;
        state.error = null;
        state.successMessage = "Bank list deleted successfully";
      })
      .addCase(DeleteBankList.rejected, (state, action) => {
        state.isLoading = false;
        state.error = action.payload;
      });
  },
});

export const {
  toggleEditMode,
  toggleEditModeForCompanyBank,
  clearSuccessMessage,
  resetVerification
} = banksSlice.actions;

export default banksSlice.reducer;
