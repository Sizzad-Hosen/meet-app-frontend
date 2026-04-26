import { createApi, fetchBaseQuery } from "@reduxjs/toolkit/query/react";
import type { RootState } from "@/store/store";
import type {
  AuthResponse,
  CreateMeetingRequest,
  JoinMeetingRequest,
  LoginRequest,
  Meeting,
  RegisterRequest,
} from "@/types/api";

const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL ?? "http://localhost:8000/api/v1";

type ApiResponse<T> = {
  success: boolean;
  message: string;
  data: T;
};

export const api = createApi({
  reducerPath: "meetAppsApi",
  baseQuery: fetchBaseQuery({
    baseUrl: API_BASE_URL,
    credentials: "include",
    prepareHeaders: (headers, { getState }) => {
      const token = (getState() as RootState).auth.accessToken;

      if (token) {
        headers.set("authorization", `Bearer ${token}`);
      }

      return headers;
    },
  }),
  tagTypes: ["Auth", "Meeting", "Participant", "LiveKit"],
  endpoints: (builder) => ({
    register: builder.mutation<ApiResponse<AuthResponse>, RegisterRequest>({
      query: (body) => ({
        url: "/auth/register",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    login: builder.mutation<ApiResponse<AuthResponse>, LoginRequest>({
      query: (body) => ({
        url: "/auth/login",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Auth"],
    }),
    createMeeting: builder.mutation<ApiResponse<Meeting>, CreateMeetingRequest>({
      query: (body) => ({
        url: "/meetings/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Meeting"],
    }),
    joinMeeting: builder.mutation<ApiResponse<Meeting>, JoinMeetingRequest>({
      query: (body) => ({
        url: "/meetings/join",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Meeting", "Participant"],
    }),
    getMeeting: builder.query<ApiResponse<Meeting>, string>({
      query: (code) => `/meetings/${code}`,
      providesTags: (_result, _error, code) => [{ type: "Meeting", id: code }],
    }),
    getLiveKitToken: builder.mutation<ApiResponse<{ token: string }>, JoinMeetingRequest>({
      query: (body) => ({
        url: "/livekit/token",
        method: "POST",
        body,
      }),
      invalidatesTags: ["LiveKit"],
    }),
  }),
});

export const {
  useCreateMeetingMutation,
  useGetLiveKitTokenMutation,
  useGetMeetingQuery,
  useJoinMeetingMutation,
  useLoginMutation,
  useRegisterMutation,
} = api;
