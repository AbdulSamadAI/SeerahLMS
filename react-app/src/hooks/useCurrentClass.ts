import { useQuery } from '@tanstack/react-query';
import { supabase } from '../lib/supabase';

export const useCurrentClass = () => {
    return useQuery({
        queryKey: ['current-class-config'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('dashboard_config')
                .select('class_id')
                .single();

            if (error) {
                console.error('Error fetching current class:', error);
                return 1; // Fallback to Class 1
            }
            return data.class_id;
        }
    });
};
