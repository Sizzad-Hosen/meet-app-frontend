import { baseApi } from "@/redux/api/baseApi";
import type {
  ApiResponse,
  BreakoutRoom,
  BroadcastBreakoutRequest,
  CreateBreakoutRequest,
} from "@/types/api";

export const breakoutApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createBreakouts: builder.mutation<
      ApiResponse<BreakoutRoom[]>,
      { code: string; body: CreateBreakoutRequest }
    >({
      query: ({ code, body }) => ({
        url: `/meetings/${code}/breakout`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Breakout", "Participant"],
    }),
    getBreakouts: builder.query<ApiResponse<BreakoutRoom[]>, string>({
      query: (code) => `/meetings/${code}/breakout`,
      providesTags: ["Breakout"],
    }),
    joinBreakout: builder.mutation<
      ApiResponse<BreakoutRoom>,
      { code: string; roomId: string }
    >({
      query: ({ code, roomId }) => ({
        url: `/meetings/${code}/breakout/${roomId}/join`,
        method: "POST",
      }),
      invalidatesTags: ["Breakout", "Participant"],
    }),
    endAllBreakouts: builder.mutation<ApiResponse<null>, string>({
      query: (code) => ({
        url: `/meetings/${code}/breakout/end-all`,
        method: "POST",
      }),
      invalidatesTags: ["Breakout"],
    }),
    broadcastBreakout: builder.mutation<
      ApiResponse<null>,
      { code: string; body: BroadcastBreakoutRequest }
    >({
      query: ({ code, body }) => ({
        url: `/meetings/${code}/breakout/broadcast`,
        method: "POST",
        body,
      }),
    }),
  }),
});

export const {
  useBroadcastBreakoutMutation,
  useCreateBreakoutsMutation,
  useEndAllBreakoutsMutation,
  useGetBreakoutsQuery,
  useJoinBreakoutMutation,
} = breakoutApi;
