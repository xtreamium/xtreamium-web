import React from "react";
import useCast from "./use-cast";
import { Button } from "@/components/widgets";
import { Icons } from "@/components/icons";

interface ICastButtonProps {
  streamId: number;
  onPlay: (streamId: number) => void;
}
const CastButton = ({ streamId, onPlay }: ICastButtonProps) => {
  const cast = useCast({
    initialize_media_player: "DEFAULT_MEDIA_RECEIVER_APP_ID",
    auto_initialize: true,
  });
  const handleClick = React.useCallback(async () => {
    if (cast.castReceiver) {
      await cast.handleConnection();
      onPlay(streamId);
    }
  }, [cast, onPlay, streamId]);
  return (
    <Button
      layout="link"
      size="small"
      aria-label="Delete"
      onClick={handleClick}
    >
      <Icons.cast className="w-5 h-5" aria-hidden="true" />
    </Button>
  );
};

export default CastButton;
