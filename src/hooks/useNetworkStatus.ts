import { useEffect, useState } from "react";

export function useNetworkStatus() {
  const getInitialStatus = () => {
    if (typeof navigator === "undefined" || typeof navigator.onLine === "undefined") {
      return { isOnline: true } as const;
    }
    return { isOnline: navigator.onLine } as const;
  };

  const [state, setState] = useState(getInitialStatus);

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    const handleOnline = () => setState({ isOnline: true });
    const handleOffline = () => setState({ isOnline: false });

    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
    };
  }, []);

  return state;
}

export default useNetworkStatus;
