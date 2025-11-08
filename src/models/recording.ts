export interface Recording {
  id: number;
  jobId: string;
  url: string;
  title: string;
  startTime: string;
  endTime: string;
  isRecorded: boolean;
  filePath: string | null;
}
