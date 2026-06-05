import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';

export const useStudentDashboard = () => {
  return useQuery({
    queryKey: ['student-dashboard'],
    queryFn: () => dashboardService.getStudentDashboard(),
  });
};
