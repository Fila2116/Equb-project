import { configureStore } from "@reduxjs/toolkit";
import { TypedUseSelectorHook, useDispatch, useSelector } from "react-redux";
import rolesReducer from "./features/admin/roles/rolesSlice";
import banksReducer from "./features/admin/banks/banksSlice";
import staffReducer from "./features/admin/staff/staffSlice";
import userReducer from "./features/admin/user/usersSlice";
import equbTypeReducer from "./features/admin/equb/equbTypeSlice";
import BannerReducer from "./features/admin/banner/BannerSlice";
import equbCategoryReducer from "./features/admin/equb/equbCategoriesSlice";
import equbReducer from "./features/admin/equb/equbSlice";
import PaymentReducer from "./features/admin/Payment/PaymentSclice";
import branchReducer from "./features/admin/branch/branchSlice";
import equberReducer from "./features/admin/equber/equberSlice";
import settingsReducer from "./features/admin/settings/settingsSlice";
import authReducer from "./features/admin/auth/authSlice";
import reportsReducer from "./features/admin/report/reportSlice";
import companyProfileReducer from "./features/admin/CompanyProfile/companyProfileSlice";
import brandingReducer from './slices/brandingSlice';

export const store = configureStore({
  reducer: {
    auth: authReducer,
    staffs: staffReducer,
    users: userReducer,
    branches: branchReducer,
    roles: rolesReducer,
    banks: banksReducer,
    equbTypes: equbTypeReducer,
    equbCategories: equbCategoryReducer,
    equbs: equbReducer,
    banners: BannerReducer,
    payment: PaymentReducer,
    equbers: equberReducer,
    settings: settingsReducer,
    reports: reportsReducer,
    companyProfile: companyProfileReducer,
    branding: brandingReducer,

  },
});

export type RootState = ReturnType<typeof store.getState>;
// export type AppThunk<ReturnType = void> = ThunkAction<ReturnType,RootState,unknown,Action<string>>;

export const useAppDispatch: () => typeof store.dispatch = useDispatch;
export const useAppSelector: TypedUseSelectorHook<RootState> = useSelector;

export default store;
