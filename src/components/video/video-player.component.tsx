import React from "react";
import mpegts from "mpegts.js";

type VideoPlayerProps = {
  videoSourceUrl: string;
  className?: string;
};

const VideoPlayer: React.FC<VideoPlayerProps> = ({
  videoSourceUrl,
  className,
}) => {
  const videoRef = React.useRef<HTMLVideoElement>(null);

  React.useEffect(() => {
    const video = videoRef.current;
    if (!video || !videoSourceUrl) {
      return;
    }

    if (!mpegts.getFeatureList().mseLivePlayback) {
      video.src = videoSourceUrl;
      video.play().catch(() => {});
      return () => {
        video.removeAttribute("src");
        video.load();
      };
    }

    let disposed = false;

    const player = mpegts.createPlayer(
      {
        type: "mpegts",
        isLive: true,
        url: videoSourceUrl,
        cors: true,
      },
      {
        enableStashBuffer: false,
        liveBufferLatencyChasing: true,
      }
    );

    player.on(mpegts.Events.ERROR, (type, detail, info) => {
      if (disposed) {
        return;
      }
      console.error("mpegts.js error", { type, detail, info });
    });

    player.attachMediaElement(video);
    player.load();
    video.play().catch(() => {});

    return () => {
      disposed = true;
      try {
        video.pause();
        player.detachMediaElement();
        player.destroy();
      } catch (err) {
        console.error("mpegts.js teardown error", err);
      }
    };
  }, [videoSourceUrl]);

  return (
    <video
      ref={videoRef}
      controls
      muted
      autoPlay
      playsInline
      className={className ?? "w-full h-full"}
    />
  );
};

export default VideoPlayer;
