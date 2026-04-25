from django.test import TestCase
from django.core.exceptions import ValidationError
from django.utils import timezone
from rest_framework.test import APITestCase
from rest_framework import status

from users.models import StudentUser, TeacherUser, CustomUser
from .models import (
    Level, Formation, Semester, LevelSemester,
    SchoolYear, StudentSchoolYear, Enrollment,
    CourseUnit, CourseModule
)
from .services import (
    create_student_school_year,
    activate_school_year,
    create_year_enrollments,
    get_current_enrollment,
    activate_next_semester,
    get_current_semester_for_level,
    end_school_year
)


class SchoolYearServiceTests(TestCase):
    """Tests des services d'année scolaire"""
    
    def setUp(self):
        self.formation = Formation.objects.create(
            code="TEST",
            label="Test Formation",
            description="Formation de test"
        )
        self.level = Level.objects.create(code="L1", order=1)

        self.semestre1 = Semester.objects.create(code="S1",order=1)
        self.semestre2 = Semester.objects.create(code="S2",order=2)

        LevelSemester.objects.create(level=self.level,semester=self.semestre1)
        LevelSemester.objects.create(level=self.level,semester=self.semestre2)

        self.school_year = SchoolYear.objects.create(
            label="2024-2025",
            status=SchoolYear.Status.UPCOMING
        )
        self.student = CustomUser.objects.create_user(
            username="teststudent",
            email="test@example.com",
            password="testpass123",
            role=CustomUser.Role.STUDENT
        )
    
    def test_create_student_school_year_success(self):
        """Test création réussie d'inscription annuelle"""
        student_school_year = create_student_school_year(
            student=self.student,
            school_year=self.school_year,
            formation=self.formation,
            level=self.level
        )
        
        self.assertEqual(student_school_year.student, self.student)
        self.assertEqual(student_school_year.school_year, self.school_year)
        self.assertEqual(student_school_year.formation, self.formation)
        self.assertEqual(student_school_year.level, self.level)
        self.assertEqual(student_school_year.status, StudentSchoolYear.Status.ACTIVE)
    
    def test_create_student_school_year_success_have_enrollements(self):
        student_school_year1 = create_student_school_year(
            student=self.student,
            school_year=self.school_year,
            formation = self.formation,
            level=self.level,
        )

        student2 = CustomUser.objects.create_user(
            username="dylan",
            email="dylan@gmail.com",
            password="dylan7687",
            role = CustomUser.Role.STUDENT
        )
        student_school_year2 = create_student_school_year(
            student=student2,
            school_year=self.school_year,
            formation = self.formation,
            level=self.level,
            status=StudentSchoolYear.Status.DELIBERATING
        )

        student3 = CustomUser.objects.create_user(
            username="dylan2",
            email="dyl2an@gmail.com",
            password="dylan7687",
            role = CustomUser.Role.STUDENT
        )
        student_school_year3 = create_student_school_year(
            student=student3,
            school_year=self.school_year,
            formation = self.formation,
            level=self.level,
            status=StudentSchoolYear.Status.PROMOTED
        )

        self.assertTrue(Enrollment.objects.filter(student_school_year=student_school_year1).exists())
        self.assertTrue(Enrollment.objects.filter(student_school_year=student_school_year2).exists())
        self.assertFalse(Enrollment.objects.filter(student_school_year=student_school_year3).exists())

    def test_create_student_school_year_locked_year(self):
        """Test échec création année verrouillée"""
        self.school_year.is_locked = True
        self.school_year.save()
        
        with self.assertRaises(ValidationError) as context:
            create_student_school_year(
                student=self.student,
                school_year=self.school_year,
                formation=self.formation,
                level=self.level
            )
        
        self.assertIn("verrouillée", str(context.exception))
    
    def test_activate_school_year_success(self):
        """Test activation réussie d'année scolaire"""
        activated_year = activate_school_year(self.school_year)
        
        self.assertEqual(activated_year.status, SchoolYear.Status.ACTIVE)
        self.assertTrue(activated_year.is_locked)


class EnrollmentServiceTests(TestCase):
    """Tests des services d'enrollment"""
    
    def setUp(self):
        self.formation = Formation.objects.create(
            code="TEST",
            label="Test Formation"
        )
        self.level = Level.objects.create(code="L1", order=1)
        self.school_year = SchoolYear.objects.create(
            label="2024-2025",
            status=SchoolYear.Status.ACTIVE
        )
        self.student = CustomUser.objects.create_user(
            username="teststudent",
            email="test@example.com",
            password="testpass123",
            role=CustomUser.Role.STUDENT
        )
        
        # Créer les semestres
        self.semester1 = Semester.objects.create(code="S1", order=1)
        self.semester2 = Semester.objects.create(code="S2", order=2)
        
        # Associer les semestres au niveau
        LevelSemester.objects.create(level=self.level, semester=self.semester1)
        LevelSemester.objects.create(level=self.level, semester=self.semester2)
        
        # Créer l'inscription annuelle
        self.student_school_year = StudentSchoolYear.objects.create(
            student=self.student,
            school_year=self.school_year,
            formation=self.formation,
            level=self.level,
            status=StudentSchoolYear.Status.ACTIVE
        )
    
    def test_create_year_enrollments_success(self):
        """Test création réussie des enrollments annuels"""
        enrollments = create_year_enrollments(self.student_school_year)
        
        self.assertEqual(len(enrollments), 2)
        self.assertTrue(enrollments[0].is_current)
        self.assertFalse(enrollments[1].is_current)
        self.assertEqual(enrollments[0].semester, self.semester1)
        self.assertEqual(enrollments[1].semester, self.semester2)
    
    def test_get_current_enrollment(self):
        """Test récupération enrollment actuel"""
        # Créer les enrollments
        create_year_enrollments(self.student_school_year)
        
        current = get_current_enrollment(self.student_school_year)
        
        self.assertIsNotNone(current)
        self.assertTrue(current.is_current)
        self.assertEqual(current.semester, self.semester1)
    
    def test_activate_next_semester_success(self):
        """Test activation réussie du semestre suivant"""
        # Créer les enrollments
        create_year_enrollments(self.student_school_year)
        
        # Activer le semestre suivant
        next_enrollment = activate_next_semester(self.student_school_year)
        
        self.assertIsNotNone(next_enrollment)
        self.assertEqual(next_enrollment.semester, self.semester2)
        self.assertTrue(next_enrollment.is_current)
        
        # Vérifier que le premier n'est plus actuel
        first_enrollment = Enrollment.objects.get(semester=self.semester1)
        self.assertFalse(first_enrollment.is_current)
        self.assertEqual(first_enrollment.decision, Enrollment.Decision.PASSED)
    
    def test_get_current_semester_for_level_no_students(self):
        """Test récupération semestre actuel quand aucun étudiant"""
        current = get_current_semester_for_level(self.level, self.school_year)
        self.assertIsNone(current)
    
    def test_get_current_semester_for_level_with_students(self):
        """Test récupération semestre actuel avec des étudiants"""
        # Créer un autre étudiant avec enrollment au S2
        other_student = CustomUser.objects.create_user(
            username="otherstudent",
            email="other@example.com",
            password="testpass123",
            role=CustomUser.Role.STUDENT
        )
        
        other_ssy = StudentSchoolYear.objects.create(
            student=other_student,
            school_year=self.school_year,
            formation=self.formation,
            level=self.level,
            status=StudentSchoolYear.Status.ACTIVE
        )
        
        # Créer enrollments pour l'autre étudiant
        Enrollment.objects.create(
            student_school_year=other_ssy,
            semester=self.semester2,
            decision=Enrollment.Decision.IN_PROGRESS,
            is_current=True
        )
        
        current = get_current_semester_for_level(self.level, self.school_year)
        self.assertEqual(current, self.semester2)


class APITests(APITestCase):
    """Tests des endpoints API"""
    
    def setUp(self):
        self.formation = Formation.objects.create(
            code="TEST",
            label="Test Formation"
        )
        self.level = Level.objects.create(code="L1", order=1)

        self.school_year = SchoolYear.objects.create(
            label="2024-2025",
            status=SchoolYear.Status.ACTIVE
        )

        self.student = CustomUser.objects.create_user(
            username="teststudent",
            email="test@example.com",
            password="testpass123",
            role=CustomUser.Role.STUDENT
        )
        self.teacher = CustomUser.objects.create_user(
            username="testteacher",
            email="teacher@example.com",
            password="testpass123",
            role=CustomUser.Role.TEACHER
        )
        
        # Créer les semestres
        self.semester1 = Semester.objects.create(code="S1", order=1)
        self.semester2 = Semester.objects.create(code="S2", order=2)
        
        # Associer les semestres au niveau
        LevelSemester.objects.create(level=self.level, semester=self.semester1)
        LevelSemester.objects.create(level=self.level, semester=self.semester2)
    
    def test_student_portal_current_year(self):
        """Test endpoint année actuelle étudiant"""
        # Créer l'inscription
        self.client.force_authenticate(user=self.student)
        
        response = self.client.get('/api/structures/student/current_year/')
        
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)
        
        # Créer l'inscription annuelle
        self.ssy = StudentSchoolYear.objects.create(
            student=self.student,
            school_year=self.school_year,
            formation=self.formation,
            level=self.level,
            status=StudentSchoolYear.Status.ACTIVE
        )
        
        response = self.client.get('/api/structures/student/current_year/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('formation', response.data)
        self.assertIn('level', response.data)
        
    def test_student_portal_current_semester(self):
        """Test endpoint semestre actuel étudiant"""
        # Créer l'inscription et les enrollments
        student_school_year = StudentSchoolYear.objects.create(
            student=self.student,
            school_year=self.school_year,
            formation=self.formation,
            level=self.level,
            status=StudentSchoolYear.Status.ACTIVE
        )
        
        create_year_enrollments(student_school_year)
        
        self.client.force_authenticate(user=self.student)
        response = self.client.get('/api/structures/student/current_semester/')
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('semester', response.data)
        self.assertIn('formation', response.data)
        self.assertIn('level', response.data)
        self.assertEqual(response.data['semester']['code'], 'S1')
    
    def test_school_year_activate_and_end(self):
        """Test activation année scolaire"""
        new_school_year = SchoolYear.objects.create(
            label="2025-2026",
            status=SchoolYear.Status.UPCOMING
        )
        
        self.client.force_authenticate(user=self.teacher)
        response = self.client.post(f'/api/structures/school_years/{new_school_year.id}/activate/')
        
        # Les enseignants ne devraient pas avoir accès
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
        
        # Créer un superuser pour tester
        from users.models import CustomUser
        superuser = CustomUser.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="adminpass123"
        )
        
        self.client.force_authenticate(user=superuser)
        response = self.client.post(f'/api/structures/school_years/{new_school_year.id}/activate/')
        
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertEqual(new_school_year.status, SchoolYear.Status.UPCOMING)

        # tester la mise en fin d'une année scolaire avec des étudiant qui n'ont pas terminer leur annnée scolaire
        response = self.client.post(f'/api/structures/school_years/{self.school_year.id}/end/')

        self.assertEqual(self.school_year.status, SchoolYear.Status.ACTIVE)

        self.ssy = StudentSchoolYear.objects.create(
            student=self.student,
            school_year=self.school_year,
            formation=self.formation,
            level=self.level,
            status=StudentSchoolYear.Status.ACTIVE
        )

        self.school_year.is_locked = False
        self.school_year.save()
        # terminer l'année scolaire de tout les étudiants
        self.ssy.status = StudentSchoolYear.Status.PROMOTED
        self.ssy.save()

        response = self.client.post(f'/api/structures/school_years/{self.school_year.id}/end/')
        
        self.assertEqual(response.status_code,status.HTTP_200_OK)
        self.school_year.refresh_from_db()
        self.assertEqual(self.school_year.status, SchoolYear.Status.CLOSED)

        # essayer d'activer l'année maitenant qu'aucune années est active
        response = self.client.post(f'/api/structures/school_years/{new_school_year.id}/activate/')
        new_school_year.refresh_from_db()
        
        self.assertEqual(response.status_code,status.HTTP_200_OK)
        self.assertEqual(new_school_year.status, SchoolYear.Status.ACTIVE)
    
    def test_create_student_enrollment(self):
        """Test création inscription étudiant"""
        from users.models import CustomUser
        superuser = CustomUser.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="adminpass123"
        )
        
        self.client.force_authenticate(user=superuser)
        
        data = {
            'student_id': self.student.id,
            'school_year_id': self.school_year.id,
            'formation_id': self.formation.id,
            'level_id': self.level.id
        }
        
        response = self.client.post('/api/structures/student_school_years/create_enrollment/', data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('formation', response.data)
        self.assertIn('level', response.data)
    
    def test_enrollment_activate_next(self):
        """Test activation semestre suivant"""
        # Créer l'inscription et les enrollments
        student_school_year = StudentSchoolYear.objects.create(
            student=self.student,
            school_year=self.school_year,
            formation=self.formation,
            level=self.level,
            status=StudentSchoolYear.Status.ACTIVE
        )
        
        enrollments = create_year_enrollments(student_school_year)
        current_enrollment = enrollments[0]
        
        from users.models import CustomUser
        superuser = CustomUser.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="adminpass123"
        )
        
        self.client.force_authenticate(user=superuser)
        
        data = {'decision': 'PASSED'}
        response = self.client.post(
            f'/api/structures/enrollments/{current_enrollment.id}/activate_next/',
            data
        )
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['semester']['code'], 'S2')


class APITestsAdminportal(APITestCase):
    def setUp(self):
        self.superuser = CustomUser.objects.create_superuser(
            username="admin",
            email="admin@gmail.com",
            password="12345678"
        )
        self.student = CustomUser.objects.create(
            username="dylan",
            password="anthony345",
            email="dylananthony@gmail.com",
            role=CustomUser.Role.STUDENT
        )
        self.teacher = CustomUser.objects.create(
            username="rom",
            password="romeorererrer",
            email="romeo@gmail.com",
            role=CustomUser.Role.TEACHER
        )
    def test_student_and_teacher_list_accessibility(self):
        self.client.force_authenticate(user = self.student)
        response = self.client.get("/api/structures/admin/students/")
        self.assertEqual(response.status_code,status.HTTP_403_FORBIDDEN)
        response = self.client.get("/api/structures/admin/teachers/")
        self.assertEqual(response.status_code,status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user = self.teacher)
        response = self.client.get("/api/structures/admin/students/")
        self.assertEqual(response.status_code,status.HTTP_403_FORBIDDEN)
        response = self.client.get("/api/structures/admin/teachers/")
        self.assertEqual(response.status_code,status.HTTP_403_FORBIDDEN)

        self.client.force_authenticate(user = self.superuser)
        response = self.client.get("/api/structures/admin/students/")
        self.assertEqual(response.status_code,status.HTTP_200_OK)
        self.assertEqual(self.student.id,response.data[0]["id"])

        response = self.client.get("/api/structures/admin/teachers/")
        self.assertEqual(response.status_code,status.HTTP_200_OK)
        self.assertEqual(self.teacher.id,response.data[0]["id"])
    
    def test_students(self):
        self.client.force_authenticate(user= self.superuser)       
        response = self.client.get(f"/api/structures/admin/students/")
        self.assertEqual(response.status_code,status.HTTP_200_OK)

        self.assertEqual(len(response.data),1)

        response = self.client.get(f"/api/structures/admin/students/?search={self.student}")

        self.assertEqual(response.data[0]["username"],self.student.username)

        response = self.client.get(f"/api/structures/admin/students/?search={"nonexistant"}")
        
        self.assertEqual(len(response.data),0)


if __name__ == '__main__':
    import unittest
    unittest.main()
