from django.db import transaction
from rest_framework import serializers

from course.models import Course  # change to your Course model
from questions.models import QuestionBank
from .models import Assessment, AssessmentQuestion


# ---- The three parts of the Angular payload ----
class BasicSerializer(serializers.Serializer):
    title = serializers.CharField(max_length=200)
    description = serializers.CharField(required=False, allow_blank=True, default="")
    departmentId = serializers.IntegerField(required=False, allow_null=True, default=None)
    courseId = serializers.IntegerField(required=False, allow_null=True, default=None)
    instructorId = serializers.IntegerField(required=False, allow_null=True, default=None)
    type = serializers.CharField(default="Quiz")


class SettingsSerializer(serializers.Serializer):
    start = serializers.DateTimeField(required=False, allow_null=True, default=None)
    end = serializers.DateTimeField(required=False, allow_null=True, default=None)
    duration = serializers.IntegerField(min_value=1, default=60)
    attempts = serializers.IntegerField(min_value=1, default=1)
    totalMarks = serializers.IntegerField(min_value=1, default=50)
    passMarks = serializers.IntegerField(min_value=0, default=25)
    resultVisibility = serializers.CharField(default="Immediately")
    negativeMarking = serializers.DecimalField(max_digits=5, decimal_places=2, min_value=0, default=0)
    shuffleQuestions = serializers.BooleanField(default=True)
    shuffleOptions = serializers.BooleanField(default=True)
    autoSubmit = serializers.BooleanField(default=True)

    def to_internal_value(self, data):
        # A draft can have empty dates ("") from the form.
        data = dict(data)
        for key in ("start", "end"):
            if data.get(key) == "":
                data[key] = None
        return super().to_internal_value(data)


class QuestionLinkSerializer(serializers.Serializer):
    questionId = serializers.PrimaryKeyRelatedField(queryset=QuestionBank.objects.all(), source="question")
    marks = serializers.IntegerField(min_value=1)


# ---- Write: POST /assessments ----
class AssessmentWriteSerializer(serializers.Serializer):
    status = serializers.ChoiceField(choices=["draft", "published"])
    basic = BasicSerializer()
    settings = SettingsSerializer()
    questions = QuestionLinkSerializer(many=True, required=False, default=list)

    def validate(self, data):
        # A draft only needs a title. Publishing needs everything.
        if data["status"] == "published":
            basic, s, items = data["basic"], data["settings"], data["questions"]
            if not basic.get("courseId"):
                raise serializers.ValidationError("Select a course.")
            if not s["start"] or not s["end"]:
                raise serializers.ValidationError("Set the opening and closing time.")
            if s["end"] <= s["start"]:
                raise serializers.ValidationError("Closing time must be after opening time.")
            if s["passMarks"] > s["totalMarks"]:
                raise serializers.ValidationError("Passing marks cannot exceed total marks.")
            if sum(i["marks"] for i in items) != s["totalMarks"]:
                raise serializers.ValidationError("Selected question marks must equal total marks.")
        return data

    @transaction.atomic
    def create(self, validated):
        b, s = validated["basic"], validated["settings"]
        course = Course.objects.filter(pk=b["courseId"]).first() if b.get("courseId") else None

        assessment = Assessment.objects.create(
            status=validated["status"],
            title=b["title"],
            description=b["description"],
            department_id=b.get("departmentId") or None,
            instructor_id=b.get("instructorId") or None,
            course=course,
            type=b["type"],
            start=s["start"],
            end=s["end"],
            duration=s["duration"],
            attempts=s["attempts"],
            total_marks=s["totalMarks"],
            pass_marks=s["passMarks"],
            result_visibility=s["resultVisibility"],
            negative_marking=s["negativeMarking"],
            shuffle_questions=s["shuffleQuestions"],
            shuffle_options=s["shuffleOptions"],
            auto_submit=s["autoSubmit"],
        )
        AssessmentQuestion.objects.bulk_create(
            [AssessmentQuestion(assessment=assessment, question=i["question"], marks=i["marks"])
             for i in validated["questions"]]
        )
        return assessment


# ---- Read: GET /assessments, GET /assessments/<id> ----
class AssessmentItemSerializer(serializers.ModelSerializer):
    questionId = serializers.IntegerField(source="question_id", read_only=True)
    text = serializers.CharField(source="question.text", read_only=True)

    class Meta:
        model = AssessmentQuestion
        fields = ["questionId", "text", "marks"]


class AssessmentReadSerializer(serializers.ModelSerializer):
    courseId = serializers.IntegerField(source="course_id", read_only=True)
    questions = AssessmentItemSerializer(source="items", many=True, read_only=True)

    class Meta:
        model = Assessment
        fields = ["id", "title", "description", "type", "status", "courseId", "start", "end",
                  "duration", "attempts", "total_marks", "pass_marks", "questions"]


# ---- Read and update: GET /assessments, GET/PATCH /assessments/<id> ----
class AssessmentSerializer(serializers.ModelSerializer):
    courseId = serializers.IntegerField(source="course_id", read_only=True)
    course_name = serializers.CharField(source="course.course_name", read_only=True, default="")
    question_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Assessment
        fields = [
            "id", "title", "description", "type", "status",
            "courseId", "course_name", "question_count",
            "start", "end", "duration", "attempts", "total_marks", "pass_marks",
            "result_visibility", "negative_marking",
            "shuffle_questions", "shuffle_options", "auto_submit",
        ]
        read_only_fields = ["id"]

    def validate(self, attrs):
        inst = self.instance

        def get(key):
            return attrs.get(key, getattr(inst, key, None))

        start, end = get("start"), get("end")
        total, passed = get("total_marks"), get("pass_marks")

        if start and end and end <= start:
            raise serializers.ValidationError("Closing time must be after opening time.")
        if total is not None and passed is not None and passed > total:
            raise serializers.ValidationError("Passing marks cannot exceed total marks.")
        if get("status") == "published" and (not start or not end):
            raise serializers.ValidationError("Set the opening and closing time before publishing.")

        # Total marks must stay equal to the marks of the questions already chosen.
        if inst and "total_marks" in attrs:
            used = sum(item.marks for item in inst.items.all())
            if used and attrs["total_marks"] != used:
                raise serializers.ValidationError(
                    f"Total marks must equal the selected questions' marks ({used})."
                )
        return attrs


# ---- Student side ----
class StudentAssessmentSerializer(serializers.ModelSerializer):
    """GET /assessments/available - the cards a student sees."""
    course_name = serializers.CharField(source="course.course_name", read_only=True, default="")
    question_count = serializers.IntegerField(read_only=True, default=0)

    class Meta:
        model = Assessment
        fields = ["id", "title", "description", "type", "course_name", "start", "end",
                  "duration", "attempts", "total_marks", "question_count"]


class ExamQuestionSerializer(serializers.ModelSerializer):
    """Questions for the exam page. Never includes the correct answer."""
    id = serializers.IntegerField(source="question_id", read_only=True)
    text = serializers.CharField(source="question.text", read_only=True)
    type = serializers.CharField(source="question.type", read_only=True)
    options = serializers.SerializerMethodField()

    class Meta:
        model = AssessmentQuestion
        fields = ["id", "text", "type", "marks", "options"]

    def get_options(self, obj):
        # Works once QuestionBank has an "options" field. Until then it is an empty list.
        return getattr(obj.question, "options", None) or []


class ExamSerializer(serializers.ModelSerializer):
    """GET /assessments/<id>/exam"""
    questions = ExamQuestionSerializer(source="items", many=True, read_only=True)

    class Meta:
        model = Assessment
        fields = ["id", "title", "description", "duration", "end", "total_marks",
                  "negative_marking", "shuffle_questions", "shuffle_options", "auto_submit", "questions"]


class SubmissionSerializer(serializers.Serializer):
    """POST /assessments/<id>/submit"""
    answers = serializers.DictField(child=serializers.CharField(allow_blank=True), required=False, default=dict)
    autoSubmitted = serializers.BooleanField(default=False)
    studentId = serializers.IntegerField(required=False, allow_null=True, default=None)