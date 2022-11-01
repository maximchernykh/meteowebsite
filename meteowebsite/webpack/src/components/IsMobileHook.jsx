import React, { useLayoutEffect, useState } from "react";

export default function useIsMobile() {
  const CheckIsMobile = () => {
    return window.innerWidth < window.innerHeight;
  };

  const [isMobile, setIsMobile] = useState(CheckIsMobile());

  useLayoutEffect(() => {
    const Update = () => {
      setIsMobile(CheckIsMobile());
    };
    window.addEventListener("resize", Update);
    return () => window.removeEventListener("resize", Update);
  }, []);

  return isMobile;
}
