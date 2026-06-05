import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';

export const useTeacherDashboard = () => {
  return useQuery({
    queryKey: ['teacher-dashboard'],
    queryFn: () => dashboardService.getTeacherDashboard(),
  });
};
