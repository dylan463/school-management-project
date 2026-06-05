import { useQuery } from '@tanstack/react-query';
import { dashboardService } from '../../services/dashboardService';

export const useManagementDashboard = () => {
  return useQuery({
    queryKey: ['management-dashboard'],
    queryFn: () => dashboardService.getManagementDashboard(),
  });
};
