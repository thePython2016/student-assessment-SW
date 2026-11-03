class StudentAssessmentSerializer(serializers.ModelSerializer):

    course_name = serializers.CharField(
        source='course.course_name',
        read_only=True
    )

    question_count = serializers.IntegerField(
        read_only=True,
        default=0
    )

    class Meta:
        model = Assessment
        fields = [
            'id',
            'title',
            'description',
            'type',
            'course_name',
            'start',
            'end',
            'duration',
            'attempts',
            'total_marks',
            'question_count',
        ]