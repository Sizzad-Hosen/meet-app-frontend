import { baseApi } from "@/redux/api/baseApi";
import { clearCredentials, setCredentials } from "@/redux/features/auth/authSlice";
import type {
  ApiResponse,
  AuthResponse,
  ForgotPasswordRequest,
  LoginRequest,
  RegisterRequest,
  ResetPasswordRequest,
  SendVerificationEmailRequest,
  VerifyEmailRequest,
} from "@/types/api";

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data.data));
      },
      invalidatesTags: ["Auth"],
    }),
    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data.data));
      },
      invalidatesTags: ["Auth"],
    }),
    forgotPassword: builder.mutation<
      ApiResponse<{ resetLink?: string }>,
      ForgotPasswordRequest
    >({
      query: (body) => ({
        url: "/auth/forgot-password",
        method: "POST",
        body,
      }),
    }),
    sendVerificationEmail: builder.mutation<
      ApiResponse<{ isVerified: boolean; verificationLink?: string | null }>,
      SendVerificationEmailRequest
    >({
      query: (body) => ({
        url: "/auth/send-verification-email",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    verifyEmail: builder.mutation<
      ApiResponse<{ user?: AuthResponse["user"] }>,
      VerifyEmailRequest
    >({
      query: (body) => ({
        url: "/auth/verify-email",
        method: "POST",
        body,
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        if (data.data.user) {
          dispatch(setCredentials({ user: data.data.user }));
        }
      },
      invalidatesTags: ["Auth"],
    }),
    resetPassword: builder.mutation<ApiResponse<null>, ResetPasswordRequest>({
      query: (body) => ({
        url: "/auth/reset-password",
        method: "POST",
        body,
      }),
    }),
    refreshToken: builder.mutation<ApiResponse<AuthResponse>, void>({
      query: () => ({
        url: "/auth/refresh-token",
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        const { data } = await queryFulfilled;
        dispatch(setCredentials(data.data));
      },
    }),
    logout: builder.mutation<ApiResponse<null>, void>({
      query: () => ({
        url: "/auth/logout",
        method: "POST",
      }),
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          await queryFulfilled;
        } finally {
          dispatch(clearCredentials());
        }
      },
      invalidatesTags: ["Auth"],
    }),
  }),
});

export const {
  useForgotPasswordMutation,
  useLoginMutation,
  useLogoutMutation,
  useRefreshTokenMutation,
  useRegisterMutation,
  useResetPasswordMutation,
  useSendVerificationEmailMutation,
  useVerifyEmailMutation,
} = authApi;
