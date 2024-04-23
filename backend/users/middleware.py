from django.core.exceptions import ValidationError
from django.http import JsonResponse

class ValidationErrorMiddleware:
    def __init__(self, get_response):
        self.get_response = get_response

    def __call__(self, request):
        try:
            response = self.get_response(request)
        except ValidationError as e:
            return JsonResponse({'error': str(e)}, status=400)