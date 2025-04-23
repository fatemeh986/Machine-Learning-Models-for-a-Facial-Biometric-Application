from .models import DefaultImage, Identification
import cv2
import numpy as np
from tensorflow.keras.models import load_model
from django.conf import settings
import base64
import mediapipe as mp
from fer import FER
from tensorflow.keras.layers import DepthwiseConv2D

# keep a handle on the original __init__
_orig_depthwise_init = DepthwiseConv2D.__init__

def _patched_depthwise_init(self, *args, **kwargs):
    # drop any 'groups' kwarg
    kwargs.pop("groups", None)
    # call the real initializer
    _orig_depthwise_init(self, *args, **kwargs)

# overwrite in place
DepthwiseConv2D.__init__ = _patched_depthwise_init


class Biometric:
    def __init__(self):
        # Initialize the recognition model only
        self.img_path = None
        model_path = settings.BASE_DIR / "weights" / "custom-cnn-full-new-weight.weights.h5"
        self.model = load_model(str(model_path), compile=False)
        gender_model_path = settings.BASE_DIR / "weights" / "mobilenet_gender_model.h5"
        self.gender_model = load_model(str(gender_model_path), compile=False)
        # Defer DB loading until explicitly requested
        # self.age_backend   = 'mtcnn' 
        self.default_path = None

    def load_default_image(self):
        """
        Synchronous method: load the default image path from the DB.
        Call this in your synchronous identification view only.
        """
        default_instance = DefaultImage.objects.first()
        if default_instance:
            self.default_path = default_instance.image.path
        return self.default_path

    def preprocess_image(self, img_path):
        image = cv2.imread(img_path)
        image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        image = cv2.resize(image, (128, 128))
        image = image / 255.0
        return np.expand_dims(image, axis=0)

    def face_verification(self):
        if not self.default_path:
            raise ValueError("No default image loaded. Call load_default_image() first.")
        img1 = self.preprocess_image(self.img_path)
        img2 = self.preprocess_image(self.default_path)

        embedding1 = self.model.predict(img1)
        embedding2 = self.model.predict(img2)

        distance = np.linalg.norm(embedding1 - embedding2)
        threshold = 0.5
        verified = distance < threshold
        return {"verified": verified, "distance": float(distance)}

    def get_embedding(self, image_path):
        preprocessed = self.preprocess_image(image_path)
        embedding = self.model.predict(preprocessed)[0]
        return embedding.tolist()

    def face_identification(self):
        img1 = self.preprocess_image(self.img_path)
        embedding1 = self.model.predict(img1)[0]

        identities = Identification.objects.exclude(embedding=None)
        min_distance = float('inf')
        identified_name = "Unknown"

        for identity in identities:
            stored_embedding = np.array(identity.embedding)
            distance = np.linalg.norm(embedding1 - stored_embedding)
            if distance < min_distance:
                min_distance = distance
                identified_name = identity.name

        threshold = 0.8
        return {
            "identified_as": identified_name if min_distance < threshold else "Unknown",
            "distance": float(min_distance)
        }
            
    def detect_face_position(self, image):
        mp_face_mesh = mp.solutions.face_mesh
        face_mesh = mp_face_mesh.FaceMesh(min_detection_confidence=0.5, min_tracking_confidence=0.5)
        image = cv2.cvtColor(cv2.flip(image, 1), cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = face_mesh.process(image)
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        img_h, img_w, _ = image.shape
        face_3d, face_2d = [], []

        if results.multi_face_landmarks:
            for face_landmarks in results.multi_face_landmarks:
                for idx, lm in enumerate(face_landmarks.landmark):
                    if idx in [33, 263, 1, 61, 291, 199]:
                        if idx == 1:
                            nose_2d = (lm.x * img_w, lm.y * img_h)
                            nose_3d = (lm.x * img_w, lm.y * img_h, lm.z * 3000)
                    x, y = int(lm.x * img_w), int(lm.y * img_h)
                    face_2d.append([x, y])
                    face_3d.append([x, y, lm.z])

            face_2d = np.array(face_2d, dtype=np.float64)
            face_3d = np.array(face_3d, dtype=np.float64)
            focal_length = img_w
            cam_matrix = np.array([[focal_length, 0, img_w/2], [0, focal_length, img_h/2], [0,0,1]])
            dist_matrix = np.zeros((4,1), dtype=np.float64)

            success, rot_vec, trans_vec = cv2.solvePnP(face_3d, face_2d, cam_matrix, dist_matrix)
            if not success:
                return "PnP solving failed"

            rmat, _ = cv2.Rodrigues(rot_vec)
            angles, *_ = cv2.RQDecomp3x3(rmat)
            # angles is a tuple; convert to array for elementwise multiplication
            ang_array = np.array(angles) * 360.0
            x_ang, y_ang, z_ang = ang_array.tolist()

            if y_ang < -10:
                text = "Left"
            elif y_ang > 10:
                text = "Right"
            elif x_ang < -10:
                text = "Down"
            elif x_ang > 10:
                text = "Up"
            else:
                text = "Forward"

            return {"Face Position": text}

        return "Face not detected"

    def detect_emotions(self, image):
        detector = FER(mtcnn=True)
        results = detector.detect_emotions(image)
        return results[0]['emotions'] if results else {}

    def facial_emotion_analysis(self, frame_data):
        img_data = base64.b64decode(frame_data.split(',')[1])
        np_arr   = np.frombuffer(img_data, np.uint8)
        img      = cv2.imdecode(np_arr, cv2.IMREAD_COLOR)

        face_pose = self.detect_face_position(img)
        emotions  = self.detect_emotions(img)

        return emotions, face_pose
    

    def estimate_age_gender(self, image: np.ndarray) -> tuple[int|None,str]:
        # AGE via DeepFace (RGB)
        age = None
        try:
            from deepface import DeepFace
            rgb = cv2.cvtColor(image, cv2.COLOR_RGBA2BGR)
            df = DeepFace.analyze(
                rgb,
                actions=['age'],
                enforce_detection=False
            )
            if isinstance(df, list):
                df = df[0]
            age = int(df.get('age', 0))
        except Exception:
            age = None

        # GENDER via your MobileNet (BGR)
        gender = "Unknown"
        try:
            small = cv2.resize(image, (128,128)) / 255.0
            pred  = self.gender_model.predict(np.expand_dims(small, axis=0))[0][0]
            gender = "Female" if pred < 0.5 else "Male"
        except Exception:
            gender = "Unknown"

        return age, gender
