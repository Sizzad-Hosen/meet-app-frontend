import { createSlice, type PayloadAction } from "@reduxjs/toolkit";
import type { AuthUser } from "@/types/api";

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
};

const initialState: AuthState = {
  accessToken: null,
  user: null,
};

function persistAuth(state: AuthState) {
  if (typeof window === "undefined") {
    return;
  }

  if (!state.accessToken && !state.user) {
    window.localStorage.removeItem("meet-app-auth");
    return;
  }

  window.localStorage.setItem("meet-app-auth", JSON.stringify(state));
}

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    hydrateCredentials: (_state, action: PayloadAction<AuthState>) =>
      action.payload,
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken?: string | null; user?: AuthUser | null }>,
    ) => {
      state.accessToken = action.payload.accessToken ?? state.accessToken;
      state.user = action.payload.user ?? state.user;
      persistAuth(state);
    },
    setAccessToken: (state, action: PayloadAction<string>) => {
      state.accessToken = action.payload;
      persistAuth(state);
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.user = null;
      persistAuth(state);
    },
  },
});

export const {
  clearCredentials,
  hydrateCredentials,
  setAccessToken,
  setCredentials,
} = authSlice.actions;

export default authSlice.reducer;
