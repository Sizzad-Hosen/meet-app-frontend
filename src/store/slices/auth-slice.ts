import { createSlice, type PayloadAction } from "@reduxjs/toolkit";

type AuthUser = {
  id: string;
  name: string;
  email: string;
};

type AuthState = {
  accessToken: string | null;
  user: AuthUser | null;
};

const initialState: AuthState = {
  accessToken: null,
  user: null,
};

const authSlice = createSlice({
  name: "auth",
  initialState,
  reducers: {
    setCredentials: (
      state,
      action: PayloadAction<{ accessToken: string; user?: AuthUser }>,
    ) => {
      state.accessToken = action.payload.accessToken;
      state.user = action.payload.user ?? state.user;
    },
    clearCredentials: (state) => {
      state.accessToken = null;
      state.user = null;
    },
  },
});

export const { clearCredentials, setCredentials } = authSlice.actions;
export default authSlice.reducer;
