import { getInfiniteUsers, getMe } from "@/lib/axios/user";
import type {
  GetMeApiResponse,
  UserDTO,
  UserListApiRequest,
  UserListResponseDTO
} from "@/lib/types/user";
import type { InfiniteData, UseInfiniteQueryOptions, UseQueryOptions } from "@tanstack/react-query";

export type UsersPage = UserListResponseDTO;

const DEFAULT_LIMIT = 10;

export const createInfiniteUsersQueryOptions = ({
  opts
}: {
  opts?: UserListApiRequest;
}): UseInfiniteQueryOptions<
  UsersPage,
  Error,
  InfiniteData<UsersPage>,
  unknown[],
  number | undefined
> => {
  return {
    // eslint-disable-next-line @tanstack/query/exhaustive-deps
    queryKey: [
      "users",
      {
        keyword: opts?.keyword,
        status: opts?.status,
        sortBy: opts?.sortBy,
        sortDir: opts?.sortDir
      },
      opts?.paging
    ],

    queryFn: ({ pageParam }) => {
      const paging = pageParam
        ? { page: pageParam, limit: opts?.paging?.limit ?? DEFAULT_LIMIT }
        : opts?.paging;

      return getInfiniteUsers({
        ...opts,
        paging
      });
    },

    getNextPageParam: (lastPage) => {
      const limit = opts?.paging?.limit ?? DEFAULT_LIMIT;
      const totalPages = Math.ceil(lastPage.total / limit);
      const nextPage = lastPage.page + 1;

      return nextPage <= totalPages ? nextPage : undefined;
    },

    initialPageParam: opts?.paging?.page ?? 1,
    refetchOnWindowFocus: false
  };
};

export const createGetMeQueryOptions = (): UseQueryOptions<UserDTO, Error> => ({
  queryKey: ["me"],
  queryFn: getMe,
  staleTime: 0,
  gcTime: 0
});
