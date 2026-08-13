import { normalizeMeetingCode } from "@/lib/meeting-code";
import { baseApi, type ApiResponse } from "@/redux/api/baseApi";
import type {
  AdmitParticipantResponse,
  CreateMeetingRequest,
  CreateMeetingResponse,
  JoinMeetingRequest,
  JoinMeetingResponse,
  Meeting,
  MeetingDetails,
  Participant,
} from "@/types/meeting";

type UpdateMeetingArgument = {
  code: string;
  body: Partial<Meeting>;
};

type ParticipantActionArgument = {
  code: string;
  userId: string;
  action: "deny" | "kick" | "mute" | "cohost";
};

export const meetingsApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    createMeeting: builder.mutation<
      ApiResponse<CreateMeetingResponse>,
      CreateMeetingRequest
    >({
      query: (body) => ({ url: "/meetings/create", method: "POST", body }),
      invalidatesTags: ["Meeting"],
    }),
    joinMeeting: builder.mutation<
      ApiResponse<JoinMeetingResponse>,
      JoinMeetingRequest
    >({
      query: ({ joinCode }) => ({
        url: "/meetings/join",
        method: "POST",
        body: { joinCode: normalizeMeetingCode(joinCode) },
      }),
      invalidatesTags: ["Meeting", "Participant"],
    }),
    getMeeting: builder.query<ApiResponse<MeetingDetails>, string>({
      query: (code) => `/meetings/${code}`,
      providesTags: (_result, _error, code) => [{ type: "Meeting", id: code }],
    }),
    updateMeeting: builder.mutation<
      ApiResponse<Meeting>,
      UpdateMeetingArgument
    >({
      query: ({ code, body }) => ({
        url: `/meetings/${code}`,
        method: "PUT",
        body,
      }),
      invalidatesTags: (_result, _error, { code }) => [
        { type: "Meeting", id: code },
      ],
    }),
    deleteMeeting: builder.mutation<
      ApiResponse<{ deleted: boolean }>,
      string
    >({
      query: (code) => ({ url: `/meetings/${code}`, method: "DELETE" }),
      invalidatesTags: ["Meeting", "Participant"],
    }),
    getWaitingRoom: builder.query<ApiResponse<Participant[]>, string>({
      query: (code) => `/meetings/${code}/waiting-room`,
      providesTags: (_result, _error, code) => [
        { type: "Participant", id: `waiting-${code}` },
      ],
    }),
    getParticipants: builder.query<ApiResponse<Participant[]>, string>({
      query: (code) => `/meetings/${code}/participants`,
      providesTags: (_result, _error, code) => [
        { type: "Participant", id: code },
      ],
    }),
    admitParticipant: builder.mutation<
      ApiResponse<AdmitParticipantResponse>,
      { code: string; userId: string }
    >({
      query: ({ code, userId }) => ({
        url: `/meetings/${code}/admit/${userId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { code }) => [
        { type: "Participant", id: `waiting-${code}` },
        { type: "Participant", id: code },
        { type: "Meeting", id: code },
      ],
    }),
    admitAll: builder.mutation<
      ApiResponse<AdmitParticipantResponse[]>,
      string
    >({
      query: (code) => ({
        url: `/meetings/${code}/admit-all`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, code) => [
        { type: "Participant", id: `waiting-${code}` },
        { type: "Participant", id: code },
      ],
    }),
    participantAction: builder.mutation<
      ApiResponse<Participant>,
      ParticipantActionArgument
    >({
      query: ({ code, userId, action }) => ({
        url: `/meetings/${code}/${action}/${userId}`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, { code }) => [
        { type: "Participant", id: `waiting-${code}` },
        { type: "Participant", id: code },
      ],
    }),
    muteAll: builder.mutation<ApiResponse<{ muted: boolean }>, string>({
      query: (code) => ({
        url: `/meetings/${code}/mute-all`,
        method: "POST",
      }),
      invalidatesTags: (_result, _error, code) => [
        { type: "Participant", id: code },
      ],
    }),
    leaveMeeting: builder.mutation<ApiResponse<{ left: boolean }>, string>({
      query: (code) => ({
        url: `/meetings/${code}/leave`,
        method: "POST",
      }),
      invalidatesTags: ["Meeting", "Participant"],
    }),
    endMeeting: builder.mutation<ApiResponse<Meeting>, string>({
      query: (code) => ({
        url: `/meetings/${code}/end`,
        method: "POST",
      }),
      invalidatesTags: ["Meeting", "Participant"],
    }),
  }),
  overrideExisting: false,
});

export const {
  useAdmitAllMutation,
  useAdmitParticipantMutation,
  useCreateMeetingMutation,
  useDeleteMeetingMutation,
  useEndMeetingMutation,
  useGetMeetingQuery,
  useGetParticipantsQuery,
  useGetWaitingRoomQuery,
  useJoinMeetingMutation,
  useLeaveMeetingMutation,
  useMuteAllMutation,
  useParticipantActionMutation,
  useUpdateMeetingMutation,
} = meetingsApi;
