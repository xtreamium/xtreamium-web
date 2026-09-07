/**
 * Status as reported by the proxy. Mirrors Recording.Status in
 * xtreamium-proxy/Data/Models/Recording.cs — keep the two in step.
 */
export type RecordingStatus =
  | "pending"
  | "recording"
  | "complete"
  | "partial"
  | "failed";

export interface Recording {
  /** A GUID string - the proxy's Recording.Id is a Guid, and the delete route is {id:guid}. */
  id: string;
  jobId: string;
  url: string;
  title: string;
  startTime: string;
  endTime: string;
  isRecorded: boolean;
  filePath: string | null;
  status: RecordingStatus;
}
