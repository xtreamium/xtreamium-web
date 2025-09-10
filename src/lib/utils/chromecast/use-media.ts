import { useCallback, useContext, useState, useEffect } from "react";
import castContext from "./cast-context";

interface Media {
  /**
   * @function playMedia - function to add an media url to chromecast to play, you should use this to first media before add more with the add function, and before use play function
   * @param src - this should be an media url acessible by chromecast
   * @param autoplay - this inidicate if media will play after defined, default is true
   */
  playMedia: (src: string, autoplay?: boolean) => Promise<any>;
  /**
   * @function addMedia - function to add an media url to chromecast queue
   * @param src - this should be an media url acessible by chromecast
   */
  addMedia: (src: string) => Promise<unknown>;
  /**
   * @function play - function to play media in chromecast
   */
  play: () => Promise<unknown>;
  /**
   * @function pause - function to pause media in chromecast
   */
  pause: () => Promise<unknown>;
  /**
   * this inidicate if is a media connected to chromecast
   */
  isMedia: boolean;
  /**
   * @function next - function to jump to next video in chromecast queue
   */
  next: () => Promise<unknown>;
  /**
   * @function prev - function to jump to prev video in chromecast queue
   */
  prev: () => Promise<unknown>;
  /**
   * @function to - function to jump to the time passed in seconds in chromecast playing video
   * @param seconds - time in seconds to jump to
   */
  to: (seconds: number) => Promise<unknown>;
}

function useMedia() {
  const { session, castReceiver } = useContext(castContext);
  const [media, setMedia] = useState<unknown>(null);
  const [isMedia, setIsMedia] = useState(false);
  useEffect(() => {
    if (!session && isMedia) setIsMedia(false);
  }, [session, isMedia]);

  const playMedia = useCallback(
    (src: string, autoplay?: boolean) =>
      new Promise((res, rej) => {
        if (!castReceiver || !session)
          return rej(new Error("An Error occurred"));

        const mediaInfo = new castReceiver.media.MediaInfo(src);
        const request = new castReceiver.media.LoadRequest(mediaInfo);

        request.autoplay = autoplay || true;
        session.loadMedia(
          request,
          (media: unknown) => {
            setMedia(media);
            setIsMedia(true);
            res(media);
          },
          (err: unknown) => rej(err)
        );
      }),
    [castReceiver, session]
  );

  const addMedia = useCallback(
    async (src: string) => {
      if (!castReceiver || !media) return;
      const mediaInfo = new castReceiver.media.MediaInfo(src);
      const queueItem = new castReceiver.media.QueueItem(mediaInfo);
      await media.queueAppendItem(queueItem);
    },
    [media, castReceiver]
  );

  const play = useCallback(async () => {
    if (!media) return;
    await media.play();
  }, [media]);

  const pause = useCallback(async () => {
    if (!media) return;
    await media.pause();
  }, [media]);

  const prev = useCallback(async () => {
    if (!media) return;
    await media.queuePrev();
  }, [media]);

  const next = useCallback(async () => {
    if (!media) return;
    await media.queueNext();
  }, [media]);

  const to = useCallback(
    async (seconds: number) => {
      if (!media && !castReceiver) return;

      const seek = new castReceiver.media.SeekRequest();

      seek.currentTime = seconds;

      await media.seek(seek);
    },
    [media, castReceiver]
  );

  return {
    playMedia,
    addMedia,
    play,
    pause,
    isMedia,
    next,
    prev,
    to,
  } as Media;
}

export default useMedia;
