from django.dispatch import receiver
from .helpers import Biometric
from .models import Identification
from django.db.models.signals import post_save
from django.db import transaction



@receiver(post_save, sender=Identification)
def save_embedding(sender, instance, created, **kwargs):
    if created and instance.image:
        def process_embedding():
            try:
                biometric = Biometric()
                print("📦 Processing embedding for:", instance.image.path)
                embedding = biometric.get_embedding(instance.image.path)
                instance.embedding = embedding
                instance.save()
                print("✅ Embedding saved.")
            except Exception as e:
                print("❌ Error generating embedding:", e)

        transaction.on_commit(process_embedding)
