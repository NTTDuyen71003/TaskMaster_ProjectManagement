import { useQuery } from "@tanstack/react-query";
import { getAllWorkspacesUserIsMemberQueryFn } from "@/lib/api";
import { CustomError } from "@/types/custom-error.type";

const useGetAllWorkspacesQuery = () => {
    const query = useQuery<any, CustomError>({
        queryKey: ["userWorkspaces"],
        queryFn: getAllWorkspacesUserIsMemberQueryFn,
        staleTime: 0,
        retry: 2,
    });

    return query;
};

export default useGetAllWorkspacesQuery;