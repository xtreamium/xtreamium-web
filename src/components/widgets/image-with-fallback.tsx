import React, { useState, useEffect } from "react";

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
  const [imgSrc, setImgSrc] = useState(src || fallback);
  const [hasErrored, setHasErrored] = useState(false);

  useEffect(() => {
    if (!src || src.trim() === '') {
      setImgSrc(fallback);
      setHasErrored(true);
    } else {
      setImgSrc(src);
      setHasErrored(false);
    }
  }, [src, fallback]);

  const handleError = () => {
    if (!hasErrored) {
      setHasErrored(true);
      setImgSrc(fallback);
    }
  };

  return (
    <img 
      {...props} 
      src={imgSrc} 
      onError={handleError}
    />
  );
};

export default ImageWithFallback;
