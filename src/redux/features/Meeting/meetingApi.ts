import { baseApi } from "@/redux/api/baseApi";
import type {
  ApiResponse,
  CreateMeetingRequest,
  CreateMeetingResponse,
  JoinMeetingRequest,
  JoinMeetingResponse,
  Meeting,
  MeetingParticipant,
  UpdateMeetingRequest,
} from "@/types/api";

export const meetingApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createMeeting: builder.mutation<
      ApiResponse<CreateMeetingResponse>,
      CreateMeetingRequest
    >({
      query: (body) => ({
        url: "/meetings/create",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Meeting"],
    }),
    getMeeting: builder.query<ApiResponse<Meeting>, string>({
      query: (code) => `/meetings/${code}`,
      providesTags: (_result, _error, code) => [{ type: "Meeting", id: code }],
    }),
    updateMeeting: builder.mutation<
      ApiResponse<Meeting>,
      { code: string; body: UpdateMeetingRequest }
    >({
      query: ({ code, body }) => ({
        url: `/meetings/${code}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { code }) => [{ type: "Meeting", id: code }],
    }),
    deleteMeeting: builder.mutation<ApiResponse<null>, string>({
      query: (code) => ({
        url: `/meetings/${code}`,
        method: "DELETE",
      }),
      invalidatesTags: ["Meeting"],
    }),
    joinMeeting: builder.mutation<ApiResponse<JoinMeetingResponse>, JoinMeetingRequest>({
      query: (body) => ({
        url: "/meetings/join",
        method: "POST",
        body,
      }),
      invalidatesTags: ["Meeting", "Participant"],
    }),
    leaveMeeting: builder.mutation<ApiResponse<null>, string>({
      query: (code) => ({
        url: `/meetings/${code}/leave`,
        method: "POST",
      }),
      invalidatesTags: ["Meeting", "Participant"],
    }),
    getWaitingRoom: builder.query<ApiResponse<MeetingParticipant[]>, string>({
      query: (code) => `/meetings/${code}/waiting-room`,
      providesTags: ["Participant"],
    }),
    admitParticipant: builder.mutation<
      ApiResponse<MeetingParticipant>,
      { code: string; userId: string }
    >({
      query: ({ code, userId }) => ({
        url: `/meetings/${code}/admit/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["Participant"],
    }),
    admitAll: builder.mutation<ApiResponse<MeetingParticipant[]>, string>({
      query: (code) => ({
        url: `/meetings/${code}/admit-all`,
        method: "POST",
      }),
      invalidatesTags: ["Participant"],
    }),
    denyParticipant: builder.mutation<
      ApiResponse<null>,
      { code: string; userId: string }
    >({
      query: ({ code, userId }) => ({
        url: `/meetings/${code}/deny/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["Participant"],
    }),
    kickParticipant: builder.mutation<
      ApiResponse<null>,
      { code: string; userId: string }
    >({
      query: ({ code, userId }) => ({
        url: `/meetings/${code}/kick/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["Participant"],
    }),
    endMeeting: builder.mutation<ApiResponse<Meeting>, string>({
      query: (code) => ({
        url: `/meetings/${code}/end`,
        method: "POST",
      }),
      invalidatesTags: ["Meeting"],
    }),
    muteParticipant: builder.mutation<
      ApiResponse<MeetingParticipant>,
      { code: string; userId: string }
    >({
      query: ({ code, userId }) => ({
        url: `/meetings/${code}/mute/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["Participant"],
    }),
    muteAll: builder.mutation<ApiResponse<MeetingParticipant[]>, string>({
      query: (code) => ({
        url: `/meetings/${code}/mute-all`,
        method: "POST",
      }),
      invalidatesTags: ["Participant"],
    }),
    assignCohost: builder.mutation<
      ApiResponse<MeetingParticipant>,
      { code: string; userId: string }
    >({
      query: ({ code, userId }) => ({
        url: `/meetings/${code}/cohost/${userId}`,
        method: "POST",
      }),
      invalidatesTags: ["Participant"],
    }),
    getParticipants: builder.query<ApiResponse<MeetingParticipant[]>, string>({
      query: (code) => `/meetings/${code}/participants`,
      providesTags: ["Participant"],
    }),
  }),
});

export const {
  useAdmitAllMutation,
  useAdmitParticipantMutation,
  useAssignCohostMutation,
  useCreateMeetingMutation,
  useDeleteMeetingMutation,
  useDenyParticipantMutation,
  useEndMeetingMutation,
  useGetMeetingQuery,
  useGetParticipantsQuery,
  useGetWaitingRoomQuery,
  useJoinMeetingMutation,
  useKickParticipantMutation,
  useLeaveMeetingMutation,
  useMuteAllMutation,
  useMuteParticipantMutation,
  useUpdateMeetingMutation,
} = meetingApi;
