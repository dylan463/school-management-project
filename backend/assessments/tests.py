from django.test import TestCase
from structures.models import Mention, User, Role, Formation, Semester, SchoolYear, CourseUnit, CourseModule
from assessments.models import Enrollment, EnrollmentResult, Assessment, Grade, Debt
from assessments.services import toggle_assessment_publication

class AssessmentPublicationTestCase(TestCase):
    def setUp(self):
        # Create Mention
        self.mention = Mention.objects.create(text="Informatique", code="INFO")
        
        # Create user (student)
        self.student = User.objects.create(
            username="student1",
            first_name="John",
            last_name="Doe",
            role=Role.STUDENT,
            mention=self.mention
        )
        
        # Create Formation, Semester, SchoolYear
        self.formation = Formation.objects.create(
            mention=self.mention,
            text="Licence Informatique",
            code="L_INFO"
        )
        
        self.semester = Semester.objects.create(
            mention=self.mention,
            code="S1",
            order=1
        )
        
        self.school_year = SchoolYear.objects.create(
            mention=self.mention,
            text="2025-2026",
            status=SchoolYear.Status.ACTIVE
        )
        
        # Create CourseUnit and CourseModule
        self.course_unit = CourseUnit.objects.create(
            code="UE-MATH",
            text="Mathematiques",
            formation=self.formation
        )
        
        self.course_module = CourseModule.objects.create(
            code="EC-ALGEBRE",
            text="Algebre",
            course_unit=self.course_unit,
            semester=self.semester
        )
        
        # Create Assessment
        self.assessment = Assessment.objects.create(
            name="Examen Final",
            type="Exam",
            session="NORMAL",
            course_module=self.course_module,
            school_year=self.school_year,
            grade_weight=1.0
        )
        
        # Create Enrollment
        self.enrollment = Enrollment.objects.create(
            student=self.student,
            formation=self.formation,
            semester=self.semester,
            school_year=self.school_year
        )
        
        # Create a Grade so they have a grade in the assessment
        self.grade = Grade.objects.create(
            enrollment=self.enrollment,
            assessment=self.assessment,
            score=15.0
        )

    def test_toggle_publication_success(self):
        # Call the toggle function
        toggle_assessment_publication(self.assessment)
        self.assessment.refresh_from_db()
        self.assertTrue(self.assessment.is_published)
