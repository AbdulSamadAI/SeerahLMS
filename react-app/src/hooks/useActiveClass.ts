import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useActiveClass = () => {
    const { data: config, isLoading } = useQuery({
        queryKey: ['dashboard-config'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('dashboard_config')
                .select('class_id')
                .single();
            if (error) throw error;
            return data;
        },
        staleTime: 1000 * 60 * 5, // 5 minutes
    });

    return {
        activeClass: (config as any)?.class_id || 1,
        isLoading
    };
};
