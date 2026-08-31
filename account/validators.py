from django.core.exceptions import ValidationError
from django.contrib.auth.password_validation import CommonPasswordValidator as _CommonPasswordValidator
from django.contrib.auth.password_validation import MinimumLengthValidator as _MinimumLengthValidator
from django.contrib.auth.password_validation import NumericPasswordValidator as _NumericPasswordValidator
from django.contrib.auth.password_validation import UserAttributeSimilarityValidator as _UserAttributeSimilarityValidator


class CommonPasswordValidator(_CommonPasswordValidator):
    def validate(self, password, user=None):
        if password.lower().strip() in self.passwords:
            raise ValidationError(
                "This password is too easy to guess. Please choose something more unique.",
                code='password_too_common',
            )


class MinimumLengthValidator(_MinimumLengthValidator):
    def validate(self, password, user=None):
        if len(password) < self.min_length:
            raise ValidationError(
                f"Your password needs at least {self.min_length} characters.",
                code='password_too_short',
            )


class NumericPasswordValidator(_NumericPasswordValidator):
    def validate(self, password, user=None):
        if password.isdigit():
            raise ValidationError(
                "Your password can't be entirely numbers.",
                code='password_entirely_numeric',
            )


class UserAttributeSimilarityValidator(_UserAttributeSimilarityValidator):
    def validate(self, password, user=None):
        try:
            super().validate(password, user)
        except ValidationError:
            raise ValidationError(
                "Your password is too similar to your email or other personal info.",
                code='password_too_similar',
            )