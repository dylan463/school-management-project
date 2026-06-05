import api from './api';

export const dashboardService = {
  getTeacherDashboard: async () => {
    const response = await api.get('/portal/dashboard/teacher/');
    return response.data;
  },
  getManagementDashboard: async () => {
    const response = await api.get('/portal/dashboard/management/');
    return response.data;
  },
  getStudentDashboard: async () => {
    const response = await api.get('/portal/dashboard/student/');
    return response.data;
  },
};
