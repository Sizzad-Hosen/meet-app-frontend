import { baseApi } from "@/redux/api/baseApi";
import type {
  ApiResponse,
  CreatePollRequest,
  Poll,
  PollResult,
  SubmitVoteRequest,
} from "@/types/api";

export const pollApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createPoll: builder.mutation<
      ApiResponse<Poll>,
      { code: string; body: CreatePollRequest }
    >({
      query: ({ code, body }) => ({
        url: `/meetings/${code}/polls`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Poll"],
    }),
    getPolls: builder.query<ApiResponse<Poll[]>, string>({
      query: (code) => `/meetings/${code}/polls`,
      providesTags: ["Poll"],
    }),
    submitVote: builder.mutation<
      ApiResponse<Poll>,
      { code: string; pollId: string; body: SubmitVoteRequest }
    >({
      query: ({ code, pollId, body }) => ({
        url: `/meetings/${code}/polls/${pollId}/vote`,
        method: "POST",
        body,
      }),
      invalidatesTags: ["Poll"],
    }),
    getPollResults: builder.query<
      ApiResponse<PollResult>,
      { code: string; pollId: string }
    >({
      query: ({ code, pollId }) => `/meetings/${code}/polls/${pollId}/results`,
      providesTags: ["Poll"],
    }),
    closePoll: builder.mutation<ApiResponse<Poll>, { code: string; pollId: string }>(
      {
        query: ({ code, pollId }) => ({
          url: `/meetings/${code}/polls/${pollId}/close`,
          method: "POST",
        }),
        invalidatesTags: ["Poll"],
      },
    ),
  }),
});

export const {
  useClosePollMutation,
  useCreatePollMutation,
  useGetPollResultsQuery,
  useGetPollsQuery,
  useSubmitVoteMutation,
} = pollApi;
