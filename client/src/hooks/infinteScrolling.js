import { useInfiniteQuery } from "@tanstack/react-query";
import { useEffect } from "react";

export const useInfinteScroll = (
  queryKey,
  queryFn,
  options = {},
  bottomOffset = 100
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

  useEffect(() => {
    const handleScroll = () => {
      const bottom =
        window.innerHeight + window.scrollY >=
        document.documentElement.scrollHeight - bottomOffset;

      if (bottom && hasNextPage && !isFetchingNextPage) {
        fetchNextPage();
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => {
      window.removeEventListener("scroll", handleScroll);
    };
  }, [hasNextPage, isFetchingNextPage, fetchNextPage]);

  return { data, isLoading, isError, hasNextPage, isFetchingNextPage };
};
