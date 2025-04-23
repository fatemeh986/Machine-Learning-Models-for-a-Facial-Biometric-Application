from django.contrib import admin
from .models import DefaultImage, Verification, Identification, FacialExpression, Otherestimations

admin.site.register(DefaultImage)
admin.site.register(Verification)
admin.site.register(Identification)
admin.site.register(FacialExpression)
admin.site.register(Otherestimations)