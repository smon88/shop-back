export interface SessionContext {
  rt_session_id?: string;
  rt_session_token?: string;
  action?: string;
  projectId: string;
  url: string;
}

export interface SessionResponse {
  sessionId: string;
  sessionToken: string;
  session?: {
    action?: string;
  };
  action?: string;
}
