from django.db import models


class DefaultImage(models.Model):
    image = models.ImageField(upload_to='', default='Angelina-Julie.jpg', blank=True)

    def __str__(self):
        return self.image.url
    
    def save(self, *args, **kwargs):
        if not self.image:
            # Use the default value defined for the field
            self.image = self._meta.get_field('image').get_default()
        super().save(*args, **kwargs)


class Verification(models.Model):
    STATUS_CHOICES = [
        ('verified', 'Verified'),
        ('not_verified', 'Not Verified'),
    ]
    default_image = models.ForeignKey(DefaultImage, on_delete=models.CASCADE)
    user_image = models.ImageField(upload_to='user_uploads/', blank=True, null=True)
    verified = models.BooleanField(null=True, blank=True)
    verification_status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='not_verified')
    distance = models.FloatField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)

    
    def __str__(self):
        return f"{self.verification_status.title()} (Created at: {self.created_at})"


class Identification(models.Model):
    name = models.CharField(max_length=200)
    image = models.ImageField(upload_to="identification/")
    embedding = models.JSONField(blank=True, null=True)

    def __str__(self):
        return self.name
    

class FacialExpression(models.Model):
    user_id = models.IntegerField(null=True, blank=True)
    emotions = models.JSONField(null=True, blank=True)
    facepositions = models.CharField(max_length=50)
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["-id"]

    def __str__(self):
        return f"User {self.user_id}: {self.facepositions}"
    

class Otherestimations(models.Model):
    image = models.ImageField(upload_to="estimations/")
    age = models.IntegerField(null=True, blank=True)
    gender = models.CharField(max_length=10, blank=True)

    def __str__(self):
        return f"{self.age} – {self.gender}"
