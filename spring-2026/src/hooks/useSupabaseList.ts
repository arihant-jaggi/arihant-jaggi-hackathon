import { useQuery } from "@tanstack/react-query";
import type { PostgrestQueryBuilder } from "@supabase/postgrest-js";
import { supabase } from "@/lib/supabase";

type TableConfig<T> = (query: PostgrestQueryBuilder<T>) => PostgrestQueryBuilder<T>;

const fetchTable = async <T>(table: string, configure?: TableConfig<T>) => {
  let query = supabase.from<T>(table).select("*");
  if (configure) {
    query = configure(query);
  }
  const { data, error } = await query;
  if (error) {
    throw error;
  }
  return data ?? [];
};

export const useSupabaseList = <T>(
  key: string[],
  table: string,
  configure?: TableConfig<T>,
) => {
  return useQuery<T[]>({
    queryKey: ["supabase", ...key],
    queryFn: () => fetchTable<T>(table, configure),
    staleTime: 1000 * 60 * 5,
  });
};
