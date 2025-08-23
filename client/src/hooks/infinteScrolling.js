import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect, useRef } from "react";

export const useInfinteScroll = (
  queryKey,
  queryFn,
  options = {},
  bottomOffset = 100,
  containerRef = null
) => {
  const {
    data,
    fetchNextPage,
    hasNextPage,
    isFetchingNextPage,
    isLoading,
    isError,
  } = useInfiniteQuery({
    queryKey: queryKey,
    queryFn: queryFn,
    getNextPageParam: (lastPage) => {
      return lastPage?.hasMore ? lastPage?.nextCursor : undefined;
    },
    ...options, // Spread all the options passed by the component
  });

  // Default ref for window scrolling if no container ref is provided
  const defaultRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      if (!hasNextPage || isFetchingNextPage) return;

      let isNearBottom = false;

      if (containerRef?.current) {
        // Custom container scrolling
        const container = containerRef.current;
        const scrollTop = container.scrollTop;
        const clientHeight = container.clientHeight;
        const scrollHeight = container.scrollHeight;

        isNearBottom = scrollTop + clientHeight >= scrollHeight - bottomOffset;
      } else {
        // Default window scrolling
        isNearBottom =
          window.innerHeight + window.scrollY >=
          document.documentElement.scrollHeight - bottomOffset;
      }

      if (isNearBottom) {
        fetchNextPage();
      }
    };

    let targetElement;
    let eventType;

    if (containerRef?.current) {
      // Use custom container for scroll events
      targetElement = containerRef.current;
      eventType = "scroll";
    } else {
      // Use window for scroll events
      targetElement = window;
      eventType = "scroll";
    }

    targetElement.addEventListener(eventType, handleScroll, { passive: true });

    return () => {
      targetElement.removeEventListener(eventType, handleScroll);
    };
  }, [
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
    containerRef,
    bottomOffset,
  ]);

  return {
    data,
    isLoading,
    isError,
    hasNextPage,
    isFetchingNextPage,
    containerRef: containerRef || defaultRef,
  };
};
