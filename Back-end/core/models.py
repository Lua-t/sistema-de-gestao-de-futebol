from django.contrib.auth.models import AbstractUser
from django.core.validators import MaxValueValidator, MinValueValidator
from django.db import models

# Create your models here.
class Organizador(AbstractUser):
    email= models.EmailField(unique=True)

    USERNAME_FIELD= 'email'
    REQUIRED_FIELDS= ['first_name']

    def __str__(self):
        return self.email
    
NIVEL_ESTRELAS_CHOICE = [(i / 2, str(i / 2)) for i in range(1, 11)]


class Jogador(models.Model):
    nome = models.CharField(max_length=150)
    nivel_estrelas = models.FloatField(
        default=1.0,
        validators=[MinValueValidator(0.5), MaxValueValidator(5.0)],
        choices=NIVEL_ESTRELAS_CHOICE,
    )
    ativo = models.BooleanField(default=True)
    organizador = models.ForeignKey(
        Organizador,
        on_delete=models.CASCADE,
        related_name='jogadores',
    )
    data_cadastro = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f'{self.nome} ({self.nivel_estrelas}*)'
