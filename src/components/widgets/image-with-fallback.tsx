import React from "react";

interface ImageWithFallbackProps
  extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback: string;
}
const ImageWithFallback = ({
  fallback,
  src,
  ...props
}: ImageWithFallbackProps) => {
  return (
    <img {...props} src={src} onError={(e: React.SyntheticEvent<HTMLImageElement>) => (e.currentTarget.src = fallback)} />
  );
};

export default ImageWithFallback;
