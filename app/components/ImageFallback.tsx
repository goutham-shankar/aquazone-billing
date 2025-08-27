"use client";
import React, { useState } from 'react';

interface ImageFallbackProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  fallback?: React.ReactNode;
  className?: string;
}

const DefaultFallback = ({ text }: { text: string }) => (
  <div className="w-full h-full flex items-center justify-center bg-gray-800 text-gray-500 text-xs select-none">
    {text.slice(0,2).toUpperCase()}
  </div>
);

const ImageFallback: React.FC<ImageFallbackProps> = ({ src, alt, fallback, className='', ...rest }) => {
  const [error, setError] = useState(false);
  return (
    <div className={className}>
      {!error && src ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img
          src={src}
          alt={alt||''}
          onError={()=>setError(true)}
          className="w-full h-full object-cover rounded"
          {...rest}
        />
      ) : (
        <div className="w-full h-full rounded overflow-hidden">
          {fallback || <DefaultFallback text={alt || 'NA'} />}
        </div>
      )}
    </div>
  );
};

export default ImageFallback;