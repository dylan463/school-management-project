# timetable/tests/test_views.py
import datetime
from rest_framework.test import APITestCase
from rest_framework import status

from users.models import CustomUser
from structures.models import Formation, Level, Semester, CourseUnit, CourseModule
from timetable.models import TeacherAvailability, TimeSlot


class BaseViewTestCase(APITestCase):
    """Données partagées pour les tests de vues."""

    def setUp(self):
        # ── Utilisateurs ──
        self.admin = CustomUser.objects.create_superuser(
            username="admin", email="admin@test.com", password="admin1234",
        )
        self.teacher = CustomUser.objects.create_user(
            username="prof1", email="prof1@test.com",
            password="pass1234", role=CustomUser.Role.TEACHER,
        )
        self.teacher2 = CustomUser.objects.create_user(
            username="prof2", email="prof2@test.com",
            password="pass1234", role=CustomUser.Role.TEACHER,
        )
        self.student = CustomUser.objects.create_user(
            username="etu1", email="etu1@test.com",
            password="pass1234", role=CustomUser.Role.STUDENT,
        )

        # ── Structure académique ──
        self.formation = Formation.objects.create(code="INFO", label="Informatique")
        self.level = Level.objects.create(code="L1", order=1)
        self.semester = Semester.objects.create(code="S1", order=1, level=self.level)
        self.semester2 = Semester.objects.create(code="S2", order=2, level=self.level)

        # ── UE + EC ──
        self.ue = CourseUnit.objects.create(
            code="UE-MATH", label="Mathématiques",
            formation=self.formation,
            semester=self.semester,
        )
        self.ec = CourseModule.objects.create(
            code="EC-ALGO", label="Algorithmique",
            course_unit=self.ue, teacher=self.teacher,
        )
        self.ec2 = CourseModule.objects.create(
            code="EC-POO", label="POO",
            course_unit=self.ue, teacher=self.teacher2,
        )


# ═══════════════════════════════════════════
# TESTS DES VUES TeacherAvailability
# ═══════════════════════════════════════════

class TeacherAvailabilityViewTests(BaseViewTestCase):
    """Tests pour TeacherAvailabilityViewSet."""

    # ── Permissions ──

    def test_unauthenticated_cannot_list(self):
        """Un utilisateur non authentifié ne peut pas lister."""
        response = self.client.get('/api/timetable/availabilities/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_unauthenticated_cannot_create(self):
        response = self.client.post('/api/timetable/availabilities/', {})
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_cannot_create(self):
        """Un étudiant ne peut pas créer de disponibilité."""
        self.client.force_authenticate(user=self.student)
        data = {
            'semester': self.semester.id,
            'day': 'MON',
            'start_time': '08:00',
            'end_time': '10:00',
        }
        response = self.client.post('/api/timetable/availabilities/', data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_create(self):
        """Un enseignant peut créer une disponibilité."""
        self.client.force_authenticate(user=self.teacher)
        data = {
            'semester': self.semester.id,
            'day': 'MON',
            'start_time': '08:00',
            'end_time': '10:00',
        }
        response = self.client.post('/api/timetable/availabilities/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TeacherAvailability.objects.count(), 1)
        avail = TeacherAvailability.objects.first()
        self.assertEqual(avail.teacher, self.teacher)

    def test_teacher_can_list_own(self):
        """Un enseignant voit ses propres disponibilités."""
        self.client.force_authenticate(user=self.teacher)
        TeacherAvailability.objects.create(
            teacher=self.teacher, semester=self.semester,
            day='MON', start_time=datetime.time(8, 0),
            end_time=datetime.time(10, 0),
        )
        TeacherAvailability.objects.create(
            teacher=self.teacher2, semester=self.semester,
            day='TUE', start_time=datetime.time(8, 0),
            end_time=datetime.time(10, 0),
        )
        response = self.client.get('/api/timetable/availabilities/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        # L'enseignant ne voit que ses propres dispos
        self.assertEqual(len(response.data), 1)

    def test_admin_can_list_all(self):
        """Un admin voit toutes les disponibilités."""
        self.client.force_authenticate(user=self.admin)
        TeacherAvailability.objects.create(
            teacher=self.teacher, semester=self.semester,
            day='MON', start_time=datetime.time(8, 0),
            end_time=datetime.time(10, 0),
        )
        TeacherAvailability.objects.create(
            teacher=self.teacher2, semester=self.semester,
            day='TUE', start_time=datetime.time(8, 0),
            end_time=datetime.time(10, 0),
        )
        response = self.client.get('/api/timetable/availabilities/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_admin_filter_by_semester(self):
        """Un admin peut filtrer par semestre."""
        self.client.force_authenticate(user=self.admin)
        TeacherAvailability.objects.create(
            teacher=self.teacher, semester=self.semester,
            day='MON', start_time=datetime.time(8, 0),
            end_time=datetime.time(10, 0),
        )
        TeacherAvailability.objects.create(
            teacher=self.teacher, semester=self.semester2,
            day='TUE', start_time=datetime.time(8, 0),
            end_time=datetime.time(10, 0),
        )
        response = self.client.get(
            f'/api/timetable/availabilities/?semester={self.semester.id}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_teacher_can_update_own(self):
        """Un enseignant peut modifier sa propre disponibilité."""
        self.client.force_authenticate(user=self.teacher)
        avail = TeacherAvailability.objects.create(
            teacher=self.teacher, semester=self.semester,
            day='MON', start_time=datetime.time(8, 0),
            end_time=datetime.time(10, 0),
        )
        data = {
            'semester': self.semester.id,
            'day': 'TUE',
            'start_time': '09:00',
            'end_time': '11:00',
        }
        response = self.client.put(
            f'/api/timetable/availabilities/{avail.id}/', data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        avail.refresh_from_db()
        self.assertEqual(avail.day, 'TUE')

    def test_teacher_cannot_update_other(self):
        """Un enseignant ne peut pas modifier la dispo d'un autre."""
        self.client.force_authenticate(user=self.teacher)
        avail = TeacherAvailability.objects.create(
            teacher=self.teacher2, semester=self.semester,
            day='MON', start_time=datetime.time(8, 0),
            end_time=datetime.time(10, 0),
        )
        data = {
            'semester': self.semester.id,
            'day': 'TUE',
            'start_time': '09:00',
            'end_time': '11:00',
        }
        response = self.client.put(
            f'/api/timetable/availabilities/{avail.id}/', data
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_can_delete_own(self):
        """Un enseignant peut supprimer sa propre disponibilité."""
        self.client.force_authenticate(user=self.teacher)
        avail = TeacherAvailability.objects.create(
            teacher=self.teacher, semester=self.semester,
            day='MON', start_time=datetime.time(8, 0),
            end_time=datetime.time(10, 0),
        )
        response = self.client.delete(
            f'/api/timetable/availabilities/{avail.id}/'
        )
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(TeacherAvailability.objects.count(), 0)

    def test_teacher_cannot_delete_other(self):
        """Un enseignant ne peut pas supprimer la dispo d'un autre."""
        self.client.force_authenticate(user=self.teacher)
        avail = TeacherAvailability.objects.create(
            teacher=self.teacher2, semester=self.semester,
            day='MON', start_time=datetime.time(8, 0),
            end_time=datetime.time(10, 0),
        )
        response = self.client.delete(
            f'/api/timetable/availabilities/{avail.id}/'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── Validation ──

    def test_create_invalid_time_range(self):
        """end_time <= start_time doit échouer."""
        self.client.force_authenticate(user=self.teacher)
        data = {
            'semester': self.semester.id,
            'day': 'MON',
            'start_time': '10:00',
            'end_time': '08:00',
        }
        response = self.client.post('/api/timetable/availabilities/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_create_same_start_end_time(self):
        """start_time == end_time doit échouer."""
        self.client.force_authenticate(user=self.teacher)
        data = {
            'semester': self.semester.id,
            'day': 'MON',
            'start_time': '10:00',
            'end_time': '10:00',
        }
        response = self.client.post('/api/timetable/availabilities/', data)
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


# ═══════════════════════════════════════════
# TESTS DES VUES TimeSlot
# ═══════════════════════════════════════════

class TimeSlotViewTests(BaseViewTestCase):
    """Tests pour TimeSlotViewSet."""

    # ── Permissions ──

    def test_unauthenticated_cannot_list(self):
        response = self.client.get('/api/timetable/timeslots/')
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_student_cannot_create(self):
        """Un étudiant ne peut pas créer de créneau."""
        self.client.force_authenticate(user=self.student)
        response = self.client.post('/api/timetable/timeslots/', {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_cannot_create(self):
        """Un enseignant ne peut pas créer de créneau."""
        self.client.force_authenticate(user=self.teacher)
        response = self.client.post('/api/timetable/timeslots/', {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_admin_can_create(self):
        """Un admin peut créer un créneau."""
        self.client.force_authenticate(user=self.admin)
        data = {
            'semester': self.semester.id,
            'course_component': self.ec.id,
            'teacher': self.teacher.id,
            'day': 'MON',
            'start_time': '08:00',
            'end_time': '10:00',
            'room': 'A101',
        }
        response = self.client.post('/api/timetable/timeslots/', data)
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertEqual(TimeSlot.objects.count(), 1)

    def test_admin_can_list_all(self):
        """Un admin voit tous les créneaux."""
        self.client.force_authenticate(user=self.admin)
        TimeSlot.objects.create(
            semester=self.semester, course_component=self.ec,
            teacher=self.teacher, day='MON',
            start_time=datetime.time(8, 0), end_time=datetime.time(10, 0),
        )
        TimeSlot.objects.create(
            semester=self.semester, course_component=self.ec2,
            teacher=self.teacher2, day='TUE',
            start_time=datetime.time(8, 0), end_time=datetime.time(10, 0),
        )
        response = self.client.get('/api/timetable/timeslots/')
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 2)

    def test_admin_filter_by_semester(self):
        """Un admin peut filtrer les créneaux par semestre."""
        self.client.force_authenticate(user=self.admin)
        TimeSlot.objects.create(
            semester=self.semester, course_component=self.ec,
            teacher=self.teacher, day='MON',
            start_time=datetime.time(8, 0), end_time=datetime.time(10, 0),
        )
        response = self.client.get(
            f'/api/timetable/timeslots/?semester={self.semester.id}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(len(response.data), 1)

    def test_admin_can_update(self):
        """Un admin peut modifier un créneau."""
        self.client.force_authenticate(user=self.admin)
        ts = TimeSlot.objects.create(
            semester=self.semester, course_component=self.ec,
            teacher=self.teacher, day='MON',
            start_time=datetime.time(8, 0), end_time=datetime.time(10, 0),
            room='A101',
        )
        data = {
            'semester': self.semester.id,
            'course_component': self.ec.id,
            'teacher': self.teacher.id,
            'day': 'TUE',
            'start_time': '09:00',
            'end_time': '11:00',
            'room': 'B202',
        }
        response = self.client.put(
            f'/api/timetable/timeslots/{ts.id}/', data
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ts.refresh_from_db()
        self.assertEqual(ts.day, 'TUE')
        self.assertEqual(ts.room, 'B202')

    def test_admin_can_delete(self):
        """Un admin peut supprimer un créneau."""
        self.client.force_authenticate(user=self.admin)
        ts = TimeSlot.objects.create(
            semester=self.semester, course_component=self.ec,
            teacher=self.teacher, day='MON',
            start_time=datetime.time(8, 0), end_time=datetime.time(10, 0),
        )
        response = self.client.delete(f'/api/timetable/timeslots/{ts.id}/')
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)
        self.assertEqual(TimeSlot.objects.count(), 0)

    def test_teacher_cannot_update(self):
        """Un enseignant ne peut pas modifier un créneau."""
        self.client.force_authenticate(user=self.teacher)
        ts = TimeSlot.objects.create(
            semester=self.semester, course_component=self.ec,
            teacher=self.teacher, day='MON',
            start_time=datetime.time(8, 0), end_time=datetime.time(10, 0),
        )
        response = self.client.put(f'/api/timetable/timeslots/{ts.id}/', {})
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_teacher_cannot_delete(self):
        """Un enseignant ne peut pas supprimer un créneau."""
        self.client.force_authenticate(user=self.teacher)
        ts = TimeSlot.objects.create(
            semester=self.semester, course_component=self.ec,
            teacher=self.teacher, day='MON',
            start_time=datetime.time(8, 0), end_time=datetime.time(10, 0),
        )
        response = self.client.delete(f'/api/timetable/timeslots/{ts.id}/')
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    # ── Actions publish ──

    def test_publish_single_timeslot(self):
        """POST publish/ publie un seul créneau."""
        self.client.force_authenticate(user=self.admin)
        ts = TimeSlot.objects.create(
            semester=self.semester, course_component=self.ec,
            teacher=self.teacher, day='MON',
            start_time=datetime.time(8, 0), end_time=datetime.time(10, 0),
        )
        response = self.client.post(
            f'/api/timetable/timeslots/{ts.id}/publish/'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        ts.refresh_from_db()
        self.assertTrue(ts.is_published)

    def test_publish_single_forbidden_for_teacher(self):
        """Un enseignant ne peut pas publier."""
        self.client.force_authenticate(user=self.teacher)
        ts = TimeSlot.objects.create(
            semester=self.semester, course_component=self.ec,
            teacher=self.teacher, day='MON',
            start_time=datetime.time(8, 0), end_time=datetime.time(10, 0),
        )
        response = self.client.post(
            f'/api/timetable/timeslots/{ts.id}/publish/'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_publish_all_for_semester(self):
        """POST publish_all/?semester=X publie tous les créneaux."""
        self.client.force_authenticate(user=self.admin)
        TimeSlot.objects.create(
            semester=self.semester, course_component=self.ec,
            teacher=self.teacher, day='MON',
            start_time=datetime.time(8, 0), end_time=datetime.time(10, 0),
        )
        TimeSlot.objects.create(
            semester=self.semester, course_component=self.ec2,
            teacher=self.teacher2, day='TUE',
            start_time=datetime.time(8, 0), end_time=datetime.time(10, 0),
        )
        response = self.client.post(
            f'/api/timetable/timeslots/publish_all/?semester={self.semester.id}'
        )
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['publié'], 2)
        self.assertEqual(
            TimeSlot.objects.filter(is_published=True).count(), 2
        )

    def test_publish_all_missing_semester_param(self):
        """publish_all sans paramètre semester retourne 400."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.post('/api/timetable/timeslots/publish_all/')
        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_publish_all_invalid_semester(self):
        """publish_all avec un semester inexistant retourne 404."""
        self.client.force_authenticate(user=self.admin)
        response = self.client.post(
            '/api/timetable/timeslots/publish_all/?semester=99999'
        )
        self.assertEqual(response.status_code, status.HTTP_404_NOT_FOUND)

    def test_publish_all_forbidden_for_student(self):
        """Un étudiant ne peut pas publier en masse."""
        self.client.force_authenticate(user=self.student)
        response = self.client.post(
            f'/api/timetable/timeslots/publish_all/?semester={self.semester.id}'
        )
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)
