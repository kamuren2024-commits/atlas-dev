import type {
  CalendarProviderType,
  CalendarSyncStatus,
  MeetingEntity,
  MeetingProviderMetadata,
  MeetingProviderType,
  ProviderConnectionStatus,
} from './types';

export interface MeetingProviderConfig {
  providerType: MeetingProviderType;
  oauthEnabled: boolean;
  webhookEnabled?: boolean;
  joinUrl?: string;
  externalMeetingId?: string;
}

export interface CalendarSyncConfig {
  provider: CalendarProviderType;
  syncStatus: CalendarSyncStatus;
  eventId?: string;
  organizer?: string;
  attendees?: string[];
  reminders?: string[];
  recurring?: boolean;
}

export interface MeetingProvider {
  readonly type: MeetingProviderType;
  getMetadata(meeting: MeetingEntity): MeetingProviderMetadata;
  createMeeting(meeting: Partial<MeetingEntity>): Promise<MeetingProviderConfig>;
  updateMeeting(meetingId: string, changes: Partial<MeetingEntity>): Promise<MeetingProviderConfig>;
  cancelMeeting(meetingId: string, reason?: string): Promise<void>;
  getJoinUrl(meeting: MeetingEntity): string | undefined;
}

export interface CalendarProvider {
  readonly type: CalendarProviderType;
  syncMeeting(meeting: MeetingEntity): Promise<CalendarSyncConfig>;
  createEvent(meeting: MeetingEntity): Promise<CalendarSyncConfig>;
  cancelEvent(eventId: string, reason?: string): Promise<void>;
}

export class ZoomMeetingProvider implements MeetingProvider {
  readonly type: MeetingProviderType = 'ZOOM';

  getMetadata(meeting: MeetingEntity): MeetingProviderMetadata {
    return {
      type: 'ZOOM',
      label: 'Zoom',
      oauth_enabled: true,
      connection_status: 'CONNECTED',
      join_url: meeting.provider?.join_url || meeting.provider?.meeting_url || 'https://zoom.us/j/placeholder',
      meeting_url: meeting.provider?.meeting_url || 'https://zoom.us/j/placeholder',
      external_meeting_id: meeting.provider?.external_meeting_id || 'ZOOM_MEETING_01',
      webhooks_enabled: true,
      calendar_provider: 'OUTLOOK',
      calendar_sync_status: 'SYNCED',
      last_sync_at: new Date().toISOString(),
    };
  }

  async createMeeting(meeting: Partial<MeetingEntity>): Promise<MeetingProviderConfig> {
    const externalMeetingId = `zoom_${Date.now()}`;
    return {
      providerType: 'ZOOM',
      oauthEnabled: true,
      webhookEnabled: true,
      joinUrl: `https://zoom.us/j/${externalMeetingId}`,
      externalMeetingId,
    };
  }

  async updateMeeting(meetingId: string, changes: Partial<MeetingEntity>): Promise<MeetingProviderConfig> {
    return {
      providerType: 'ZOOM',
      oauthEnabled: true,
      joinUrl: changes.provider?.join_url || `https://zoom.us/j/${meetingId}`,
      externalMeetingId: changes.provider?.external_meeting_id || meetingId,
      webhookEnabled: true,
    };
  }

  async cancelMeeting(meetingId: string, reason?: string): Promise<void> {
    void meetingId;
    void reason;
  }

  getJoinUrl(meeting: MeetingEntity): string | undefined {
    return meeting.provider?.join_url || meeting.provider?.meeting_url || `https://zoom.us/j/${meeting.id}`;
  }
}

export class TeamsMeetingProvider implements MeetingProvider {
  readonly type: MeetingProviderType = 'MICROSOFT_TEAMS';

  getMetadata(meeting: MeetingEntity): MeetingProviderMetadata {
    return {
      type: 'MICROSOFT_TEAMS',
      label: 'Microsoft Teams',
      oauth_enabled: true,
      connection_status: 'PENDING',
      join_url: meeting.provider?.join_url || 'https://teams.microsoft.com/l/meetup-join/placeholder',
      meeting_url: meeting.provider?.meeting_url || 'https://teams.microsoft.com/l/meetup-join/placeholder',
      external_meeting_id: meeting.provider?.external_meeting_id || 'TEAMS_MEETING_01',
      calendar_provider: 'OUTLOOK',
      calendar_sync_status: 'PENDING',
    };
  }

  async createMeeting(meeting: Partial<MeetingEntity>): Promise<MeetingProviderConfig> {
    return {
      providerType: 'MICROSOFT_TEAMS',
      oauthEnabled: true,
      joinUrl: `https://teams.microsoft.com/l/meetup-join/${meeting.id || 'placeholder'}`,
      externalMeetingId: `teams_${meeting.id || 'placeholder'}`,
    };
  }

  async updateMeeting(meetingId: string, changes: Partial<MeetingEntity>): Promise<MeetingProviderConfig> {
    return {
      providerType: 'MICROSOFT_TEAMS',
      oauthEnabled: true,
      joinUrl: changes.provider?.join_url || `https://teams.microsoft.com/l/meetup-join/${meetingId}`,
      externalMeetingId: changes.provider?.external_meeting_id || meetingId,
    };
  }

  async cancelMeeting(meetingId: string, reason?: string): Promise<void> {
    void meetingId;
    void reason;
  }

  getJoinUrl(meeting: MeetingEntity): string | undefined {
    return meeting.provider?.join_url || `https://teams.microsoft.com/l/meetup-join/${meeting.id}`;
  }
}

export class GoogleMeetProvider implements MeetingProvider {
  readonly type: MeetingProviderType = 'GOOGLE_MEET';

  getMetadata(meeting: MeetingEntity): MeetingProviderMetadata {
    return {
      type: 'GOOGLE_MEET',
      label: 'Google Meet',
      oauth_enabled: true,
      connection_status: 'DISCONNECTED',
      join_url: meeting.provider?.join_url || 'https://meet.google.com/placeholder',
      meeting_url: meeting.provider?.meeting_url || 'https://meet.google.com/placeholder',
      external_meeting_id: meeting.provider?.external_meeting_id || 'GMEET_MEETING_01',
      calendar_provider: 'GOOGLE_CALENDAR',
      calendar_sync_status: 'PENDING',
    };
  }

  async createMeeting(meeting: Partial<MeetingEntity>): Promise<MeetingProviderConfig> {
    return {
      providerType: 'GOOGLE_MEET',
      oauthEnabled: true,
      joinUrl: `https://meet.google.com/${meeting.id || 'placeholder'}`,
      externalMeetingId: `gmeet_${meeting.id || 'placeholder'}`,
    };
  }

  async updateMeeting(meetingId: string, changes: Partial<MeetingEntity>): Promise<MeetingProviderConfig> {
    return {
      providerType: 'GOOGLE_MEET',
      oauthEnabled: true,
      joinUrl: changes.provider?.join_url || `https://meet.google.com/${meetingId}`,
      externalMeetingId: changes.provider?.external_meeting_id || meetingId,
    };
  }

  async cancelMeeting(meetingId: string, reason?: string): Promise<void> {
    void meetingId;
    void reason;
  }

  getJoinUrl(meeting: MeetingEntity): string | undefined {
    return meeting.provider?.join_url || `https://meet.google.com/${meeting.id}`;
  }
}

export class InternalMeetingProvider implements MeetingProvider {
  readonly type: MeetingProviderType = 'INTERNAL';

  getMetadata(meeting: MeetingEntity): MeetingProviderMetadata {
    return {
      type: 'INTERNAL',
      label: 'Internal / Physical Meeting',
      oauth_enabled: false,
      connection_status: 'CONNECTED',
      join_url: meeting.provider?.join_url || `https://atlas.local/meetings/${meeting.id}`,
      meeting_url: meeting.provider?.meeting_url || `https://atlas.local/meetings/${meeting.id}`,
      external_meeting_id: meeting.provider?.external_meeting_id || meeting.id,
      calendar_provider: 'INTERNAL',
      calendar_sync_status: 'SYNCED',
    };
  }

  async createMeeting(meeting: Partial<MeetingEntity>): Promise<MeetingProviderConfig> {
    return {
      providerType: 'INTERNAL',
      oauthEnabled: false,
      joinUrl: `https://atlas.local/meetings/${meeting.id || 'internal'}`,
      externalMeetingId: meeting.id || 'internal_meeting',
    };
  }

  async updateMeeting(meetingId: string, changes: Partial<MeetingEntity>): Promise<MeetingProviderConfig> {
    return {
      providerType: 'INTERNAL',
      oauthEnabled: false,
      joinUrl: changes.provider?.join_url || `https://atlas.local/meetings/${meetingId}`,
      externalMeetingId: changes.provider?.external_meeting_id || meetingId,
    };
  }

  async cancelMeeting(meetingId: string, reason?: string): Promise<void> {
    void meetingId;
    void reason;
  }

  getJoinUrl(meeting: MeetingEntity): string | undefined {
    return meeting.provider?.join_url || `https://atlas.local/meetings/${meeting.id}`;
  }
}

export class OutlookCalendarProvider {
  readonly type: CalendarProviderType = 'OUTLOOK';

  async syncMeeting(meeting: MeetingEntity): Promise<CalendarSyncConfig> {
    return {
      provider: 'OUTLOOK',
      syncStatus: 'SYNCED',
      eventId: `OUTLOOK_${meeting.id}`,
      organizer: meeting.chair || 'Operations Director',
      attendees: (meeting.participants || []).map(p => p.email || p.name),
      reminders: ['15 minutes', '1 day'],
      recurring: false,
    };
  }

  async createEvent(meeting: MeetingEntity): Promise<CalendarSyncConfig> {
    return this.syncMeeting(meeting);
  }

  async cancelEvent(eventId: string, reason?: string): Promise<void> {
    void eventId;
    void reason;
  }
}

export class GoogleCalendarProvider {
  readonly type: CalendarProviderType = 'GOOGLE_CALENDAR';

  async syncMeeting(meeting: MeetingEntity): Promise<CalendarSyncConfig> {
    return {
      provider: 'GOOGLE_CALENDAR',
      syncStatus: 'PENDING',
      eventId: `GOOGLE_${meeting.id}`,
      organizer: meeting.chair || 'Operations Director',
      attendees: (meeting.participants || []).map(p => p.email || p.name),
      reminders: ['10 minutes'],
      recurring: meeting.meeting_type === 'BOARD' || meeting.meeting_type === 'COMMITTEE',
    };
  }

  async createEvent(meeting: MeetingEntity): Promise<CalendarSyncConfig> {
    return this.syncMeeting(meeting);
  }

  async cancelEvent(eventId: string, reason?: string): Promise<void> {
    void eventId;
    void reason;
  }
}

export function getMeetingProvider(type: MeetingProviderType = 'INTERNAL'): MeetingProvider {
  switch (type) {
    case 'ZOOM':
      return new ZoomMeetingProvider();
    case 'MICROSOFT_TEAMS':
      return new TeamsMeetingProvider();
    case 'GOOGLE_MEET':
      return new GoogleMeetProvider();
    default:
      return new InternalMeetingProvider();
  }
}

export function getCalendarProvider(type: CalendarProviderType = 'INTERNAL'): CalendarProvider {
  switch (type) {
    case 'OUTLOOK':
      return new OutlookCalendarProvider();
    case 'GOOGLE_CALENDAR':
      return new GoogleCalendarProvider();
    default:
      return new OutlookCalendarProvider();
  }
}

export function enrichMeetingProviderMetadata(meeting: MeetingEntity, providerType?: MeetingProviderType): MeetingProviderMetadata {
  const type = providerType || meeting.provider?.type || 'INTERNAL';
  return getMeetingProvider(type).getMetadata(meeting);
}

export function enrichCalendarMetadata(meeting: MeetingEntity, providerType: CalendarProviderType = 'OUTLOOK'): Promise<CalendarSyncConfig> {
  return getCalendarProvider(providerType).syncMeeting(meeting);
}

export function normalizeProviderStatus(status?: ProviderConnectionStatus): ProviderConnectionStatus {
  return status || 'CONNECTED';
}
