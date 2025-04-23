from django.urls import path
from .views import get_data, default_image, verify_image, identify_image, get_face_expression, estimate_age_gender

urlpatterns = [
    # path("", views.index, name="index"),
    path('data/', get_data),
    path('default_img/', default_image),
    path('verify/', verify_image),
    path('identify/', identify_image),
    path('api/expressions/<int:user_id>/latest/', get_face_expression),
    path("estimate_age_gender/", estimate_age_gender),
]