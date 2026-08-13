import { baseApi, type ApiResponse } from "@/redux/api/baseApi";
import type {
  AuthResponse,
  LoginRequest,
  RefreshTokenResponse,
  RegisterRequest,
} from "@/types/auth";
import { clearCredentials, setCredentials } from "./authSlice";

const saveCredentials = async (
  queryFulfilled: PromiseLike<{ data: ApiResponse<AuthResponse> }>,
  dispatch: (action: ReturnType<typeof setCredentials>) => void,
) => {
  const { data } = await queryFulfilled;
  dispatch(setCredentials(data.data));
};

const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (body) => ({ url: "/auth/login", method: "POST", body }),
      onQueryStarted: async (_argument, { dispatch, queryFulfilled }) => {
        try { await saveCredentials(queryFulfilled, dispatch); } catch { /* UI handles the error. */ }
      },
    }),
    register: builder.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
      query: (body) => ({ url: "/auth/register", method: "POST", body }),
      onQueryStarted: async (_argument, { dispatch, queryFulfilled }) => {
        try { await saveCredentials(queryFulfilled, dispatch); } catch { /* UI handles the error. */ }
      },
    }),
    refreshToken: builder.mutation<ApiResponse<RefreshTokenResponse>, void>({
      query: () => ({ url: "/auth/refresh-token", method: "POST" }),
      onQueryStarted: async (_argument, { dispatch, queryFulfilled }) => {
        try {
          const { data } = await queryFulfilled;
          dispatch(setCredentials(data.data));
        } catch {
          dispatch(clearCredentials());
        }
      },
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({ url: "/auth/logout", method: "POST" }),
      onQueryStarted: async (_argument, { dispatch, queryFulfilled }) => {
        try { await queryFulfilled; } finally {
          dispatch(clearCredentials());
          dispatch(baseApi.util.resetApiState());
        }
      },
    }),
  }),
});

export const {
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useRegisterMutation,
} = authApi;
