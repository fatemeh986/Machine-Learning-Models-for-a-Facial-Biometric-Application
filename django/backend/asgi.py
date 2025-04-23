"""
ASGI config for backend project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/5.1/howto/deployment/asgi/
"""

import os
os.environ.setdefault("DJANGO_SETTINGS_MODULE", "backend.settings")

import django
django.setup()

from django.core.asgi import get_asgi_application
import socketio
from asgiref.sync import sync_to_async
from api.helpers import Biometric
from api.models import FacialExpression



sio = socketio.AsyncServer(async_mode="asgi", cors_allowed_origins="*")

django_asgi_app = get_asgi_application()
application = socketio.ASGIApp(sio, django_asgi_app)

@sync_to_async
def save_expression(user_id, emotions, face_pose):
    FacialExpression.objects.create(
        user_id=user_id,
        emotions=emotions,
        facepositions=face_pose.get("Face Positions", ""),
    )

@sio.event
async def connect(sid, environ):
    print("Client connected:", sid)

@sio.event
async def disconnect(sid):
    print("Client disconnected:", sid)

@sio.event
async def video_frame(sid, data):
    """
    data: { frame_data: "data:image/jpeg;base64,/…"}
    """
    frame = data.get('frame_data')
    user_id = data.get("user")
    print(f"frame data : {frame}")


    biometric = Biometric()
    emotions, face_pose = biometric.facial_emotion_analysis(frame)
    print(emotions)
    print(face_pose)
    await save_expression(user_id, emotions, face_pose)

    await sio.emit("emotion_update", {"emotions": emotions, "face_position": face_pose.get("Face Position", face_pose),}, to=sid)
