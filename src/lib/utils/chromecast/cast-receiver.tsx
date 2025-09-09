export default interface CastReceiver {
  SessionRequest: new (...args: Array<unknown>) => unknown;
  media: {
    MediaInfo: new (p: string) => unknown;
    LoadRequest: new (p: string) => unknown;
    [key: string]: unknown;
  };
  Capability: {
    [key: string]: string;
  };
  ApiConfig: new (...args: Array<unknown>) => unknown;
  initialize: (
    ApiConfig: unknown,
    initSucess: (e: unknown) => void,
    initError: (e: unknown) => void
  ) => void;
  requestSession: (
    initSucess: (e: unknown) => void,
    initError: (e: unknown) => void
  ) => void;
}
