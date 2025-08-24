import { useState, useEffect, useRef } from "react";

interface UseScrollGradientReturn {
  showTopGradient: boolean;
  showBottomGradient: boolean;
  scrollRef: React.RefObject<HTMLElement | null>;
}

export function useScrollGradient(): UseScrollGradientReturn {
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);
  const scrollRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = scrollRef.current;
    if (!element) return;

    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const isAtTop = scrollTop <= 10;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      const hasOverflow = scrollHeight > clientHeight;

      setShowTopGradient(hasOverflow && !isAtTop);
      setShowBottomGradient(hasOverflow && !isAtBottom);
    };

    // Initial check
    checkScroll();

    // Add event listeners
    element.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      element.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return { showTopGradient, showBottomGradient, scrollRef };
}

// Special hook for Radix UI ScrollArea
export function useScrollAreaGradient() {
  const [showTopGradient, setShowTopGradient] = useState(false);
  const [showBottomGradient, setShowBottomGradient] = useState(false);
  const viewportRef = useRef<HTMLElement | null>(null);

  useEffect(() => {
    const element = viewportRef.current;
    if (!element) return;

    const checkScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = element;
      const isAtTop = scrollTop <= 10;
      const isAtBottom = scrollTop + clientHeight >= scrollHeight - 10;
      const hasOverflow = scrollHeight > clientHeight;

      setShowTopGradient(hasOverflow && !isAtTop);
      setShowBottomGradient(hasOverflow && !isAtBottom);
    };

    // Initial check
    checkScroll();

    // Add event listeners
    element.addEventListener("scroll", checkScroll);
    window.addEventListener("resize", checkScroll);

    return () => {
      element.removeEventListener("scroll", checkScroll);
      window.removeEventListener("resize", checkScroll);
    };
  }, []);

  return { showTopGradient, showBottomGradient, viewportRef };
}
