import api from './api'

const structuresService = {
  levelService:{
    getLevels:async (filters={})=>{
      const params = new URLSearchParams()
      if (filters.formation) params.append('formation', filters.formation)
      if (filters.search) params.append('search',filters.search)
      const response = await api.get(`/structures/levels/?${params.toString()}`)
      return response.data
    },
    createLevel: async (code) =>{
      const response = await api.post('/structures/levels/', { code })
      return response.data
    },
    updateLevel: async (id, data) => {
      const response = await api.patch(`/structures/levels/${id}/`, data)
      return response.data
    },
    popLastLevel: async () => {
      const response = await api.delete('/structures/levels/pop/')
      return response.data
    }
  },
  FormationService:{
    getFormations: async (filters={}) => {
      const params = new URLSearchParams()
      const response = await api.get(`/structures/formations/?${params.toString()}`)
      return response.data
    },
    createFormation: async (data) => {
      const response = await api.post('/structures/formations/', data)
      return response.data
    },
    updateFormation: async (id, data) => {
      const response = await api.patch(`/structures/formations/${id}/`, data)
      return response.data
    },
    deleteFormation: async (id) => {
      const response = await api.delete(`/structures/formations/${id}/`)
      return response.data
    },
    removeLevelFromFormation: async (id) => {
      const response = await api.post(`/structures/formations/${id}/remove_level/`)
      return response.data
    }
  },
  SemesterService:{
    getSemesters: async (filters={}) => {
      const params = new URLSearchParams()
      if (filters.level) params.append('level', filters.level)
      if (filters.search) params.append('search', filters.search)
      
      const response = await api.get(`/structures/semesters/?${params.toString()}`)
      return response.data
    },
    updateSemester: async (id, data) => {
      const response = await api.patch(`/structures/semesters/${id}/`, data)
      return response.data
    }
  },
  schoolYearsService:{
    getSchoolYears: async (filter = {}) => {
      const params = new URLSearchParams()
      if (filter.status) params.append('status', filter.status)
      if (filter.is_locked !== undefined) params.append('is_locked', filter.is_locked)
      if (filter.search) params.append("search", filter.search)
      const response = await api.get(`/structures/school_years/?${params.toString()}`)
      return response.data
    },
    createSchoolYear:async (data) => {
        const response = await api.post('/structures/school_years/', data)
      return response.data
    },
    retrieveSchoolYear: async (id) => {
      const response = await api.get(`/structures/school_years/${id}/`)
      return response.data
    },
    updateSchoolYear: async (id, data) => {      
      const response = await api.patch(`/structures/school_years/${id}/`, data)
      return response.data
    },
    deleteSchoolYear: async (id) => {
      const response = await api.delete(`/structures/school_years/${id}/`)
      return response.data
    },
    activateSchoolYear: async (id) => {
      const response = await api.post(`/structures/school_years/${id}/activate/`)
      return response.data
    },
    endSchoolYear: async (id) => {
      const response = await api.post(`/structures/school_years/${id}/end/`)
      return response.data
    },
    toggleLockSchoolYear: async (id) => {
      const response = await api.post(`/structures/school_years/${id}/toggle_lock/`)
      return response.data
    },
    goToFisrtPeriod: async (id) => {
      const response = await api.post(`/structures/school_years/${id}/go-first/`)
      return response.data
    },
    goToSecondPeriod: async (id) => {
      const response = await api.post(`/structures/school_years/${id}/go-seconde/`)
      return response.data
    }
  },
  studentSchoolYearsService:{
    getStudentSchoolYears: async (filters={}) =>{
      const params = new URLSearchParams()
      if (filters.school_year) params.append('school_year', filters.school_year)
      if (filters.formation) params.append('formation', filters.formation)
      if (filters.level) params.append('level', filters.level)
      if (filters.status) params.append('status', filters.status)
      const response = await api.get(`/structures/student_school_years/?${params.toString()}`)
      return response.data
    },
    deleteStudentSchoolYear: async (id) => {
      const response = await api.delete(`/structures/student_school_years/${id}/`)
      return response.data
    },
    createStudentSchoolYear: async (student_id,school_year_id,formation_id,level_id) => {
      const data = { student_id, school_year_id, formation_id, level_id }
      const response = await api.post('/structures/student_school_years/force_create/', data)
      return response.data
    },
    promoteStudentSchoolYear: async (student_id, school_year_id) => {
      const data = { student_id, school_year_id }
      const response = await api.post('/structures/student_school_years/promote/', data)
      return response.data
    }
  },
  EnrollmentService:{
    getEnrollments: async (filters={}) => {
      const params = new URLSearchParams()
      if (filters.school_year) params.append('school_year', filters.school_year)
      if (filters.formation) params.append('formation', filters.formation)
      if (filters.level) params.append('level', filters.level)
      if (filters.semester) params.append('semester', filters.semester)
      const response = await api.get(`/structures/enrollments/?${params.toString()}`)
      return response.data
    }
  },
  courseUnitService:{
    getCourseUnits: async (filters={}) => {
      const params = new URLSearchParams()
      if (filters.semester) params.append('semester', filters.semester)
      if (filters.formation) params.append('formation', filters.formation)
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active)
      const response = await api.get(`/structures/course_units/?${params.toString()}`)
      return response.data
    },
    createCourseUnit: async (data) => {
      const response = await api.post('/structures/course_units/', data)
      return response.data
    },
    updateCourseUnit: async (id, data) => {
      const response = await api.patch(`/structures/course_units/${id}/`, data)
      return response.data
    },
    deleteCourseUnit: async (id) => {
      const response = await api.delete(`/structures/course_units/${id}/`)
      return response.data
    },
    toggleActiveCourseUnit: async (id) => {
      const response = await api.post(`/structures/course_units/${id}/toggle_active/`)
      return response.data
    }
  },
  courseModuleService:{
    getCourseModules: async (filters={}) => {
      const params = new URLSearchParams()
      if (filters.semester) params.append('semester', filters.semester)
      if (filters.formation) params.append('formation', filters.formation)
      if (filters.course_unit) params.append('course_unit', filters.course_unit)
      if (filters.is_active !== undefined) params.append('is_active', filters.is_active)
      const response = await api.get(`/structures/course_modules/?${params.toString()}`)
      return response.data
    },
    createCourseModule: async (code, label, credits, min_val_score, course_unit, teacher, volume_hours) => {
      const data = { code, label, credits, min_val_score, course_unit, teacher, volume_hours }
      const response = await api.post('/structures/course_modules/', data)
      return response.data
    },
    updateCourseModule: async (id,data) => {
      const response = await api.patch(`/structures/course_modules/${id}/`, data)
      return response.data
    },
    deleteCourseModule: async (id) => {
      const response = await api.delete(`/structures/course_modules/${id}/`)
      return response.data
    },
    toggleActiveCourseModule: async (id) => {
      const response = await api.post(`/structures/course_modules/${id}/toggle_active/`)
      return response.data
    },
    assignTeacherToCourseModule: async (id, teacher_id) => {
      const data = { teacher:teacher_id }
      const response = await api.post(`/structures/course_modules/${id}/assign_teacher/`, data)
      return response.data
    },
    removeTeacherFromCourseModule: async (id) => {
      const response = await api.post(`/structures/course_modules/${id}/remove_teacher/`)
      return response.data
    }
  }
}

export default structuresService