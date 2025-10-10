import React, { useState } from "react";

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
  const [hasErrored, setHasErrored] = useState(false);

  const getImageSrc = () => {
    if (hasErrored || !src || src.trim() === '') {
      return fallback;
    }
    return src;
  };

  const handleError = () => {
    if (!hasErrored) {
      setHasErrored(true);
    }
  };

  const handleLoad = () => {
    if (hasErrored) {
      setHasErrored(false);
    }
  };

  return (
    <img 
      {...props} 
      key={src}
      src={getImageSrc()} 
      onError={handleError}
      onLoad={handleLoad}
    />
  );
};

export default ImageWithFallback;
