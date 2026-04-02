from django.contrib.auth.models import AbstractUser
from django.db import models

# Create your models here.
class Organizador(AbstractUser):
    email= models.EmailField(unique=True)

    USERNAME_FIELD= 'email'
    REQUIRED_FIELDS= ['first_name']

    def __str__(self):
        return self.email