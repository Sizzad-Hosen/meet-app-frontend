import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { User } from "@/types/auth";

export type AuthState = {
  accessToken: string | null;
  user: User | null;
  initialized: boolean;
};

const initialState: AuthState = {
  accessToken: null,
  user: null,
  initialized: false,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; user?: User }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user ?? state.user;
      state.initialized = true;
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.user = null;
      state.initialized = true;
    },
  },
});

export const { clearCredentials, setCredentials } = authSlice.actions;
export const authReducer = authSlice.reducer;
