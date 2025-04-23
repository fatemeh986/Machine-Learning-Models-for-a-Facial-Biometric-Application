# from django.http import HttpResponse


# def index(request):
#     return HttpResponse("Hello, world. You're at the polls index.")

from rest_framework.response import Response
from rest_framework.decorators import api_view
from .models import DefaultImage, Verification, FacialExpression, Otherestimations
from .serializers import VerificationSerializer, IdentificationSerializer
from rest_framework.parsers import MultiPartParser, FormParser
from rest_framework import permissions
from .helpers import Biometric
from django.views.decorators.http import require_GET
from django.http import JsonResponse
import cv2
from rest_framework.decorators import api_view, parser_classes
import numpy as np
import os
from tempfile import NamedTemporaryFile





@api_view(['GET'])
def get_data(request):
    return Response({"message": "Hello from Fatemeh!"})


@api_view(['GET'])
def default_image(request):
    instance = DefaultImage.objects.first()
    if instance:
        absolute_url = request.build_absolute_uri(instance.image.url)
        return Response({'url': absolute_url})
    return Response({'url': ''})


@api_view(['POST'])
def verify_image(request):
    user_file = request.FILES.get('uploadImage')
    if not user_file:
        return Response({'error': 'No image selected.'}, status=400)

    default_obj = DefaultImage.objects.first()
    if not default_obj:
        return Response({'error': 'Default image not found.'}, status=400)

    verification = Verification.objects.create(
        default_image=default_obj,
        user_image=user_file
    )

    biometric = Biometric()
    biometric.img_path = verification.user_image.path


    biometric.load_default_image()
    result = biometric.face_verification()

    verification.verified = result['verified']
    verification.distance = result['distance']
    verification.verification_status = (
        "verified" if result['verified'] else "not_verified"
    )
    verification.save()

    
    serializer = VerificationSerializer(verification, context={'request': request})
    return Response(serializer.data)



@api_view(['POST'])
def identify_image(request):

    user_file = request.FILES.get('uploadImage')
    if not user_file:
        return Response({'error': 'No image selected.'}, status=400)

    with NamedTemporaryFile(delete=False, suffix=".jpg") as temp_file:
        for chunk in user_file.chunks():
            temp_file.write(chunk)
        temp_path = temp_file.name

    try:
        biometric = Biometric()
        biometric.load_default_image()    # sets self.default_path
        biometric.img_path = temp_path         


        result = biometric.face_identification()

    except ValueError as ve:

        return Response({'error': str(ve)}, status=400)

    except Exception as e:

        return Response({'error': 'Identification failed: ' + str(e)}, status=500)

    finally:

        if os.path.exists(temp_path):
            os.remove(temp_path)

    return Response(result)


@require_GET
def get_face_expression(request,user_id):
    qs = (
        FacialExpression.objects
        .filter(user_id=user_id)
        .values("emotions", "facepositions")[:5]
    )
    data = list(qs)
    return JsonResponse(data, safe=False)


@api_view(["POST"])
@parser_classes([MultiPartParser, FormParser])
def estimate_age_gender(request):
    img_file = request.FILES.get("image")
    if not img_file:
        return Response({"error": "No image provided"}, status=400)

    data = img_file.read()
    arr  = np.frombuffer(data, np.uint8)
    img  = cv2.imdecode(arr, cv2.IMREAD_COLOR)

    bio = Biometric()
    age, gender = bio.estimate_age_gender(img)

    Otherestimations.objects.create(
        image=img_file,
        age=age,
        gender=gender
    )

    return Response({"age": age, "gender": gender})


