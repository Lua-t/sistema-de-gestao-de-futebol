from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.utils.encoding import force_str
from django.utils.http import urlsafe_base64_decode
from rest_framework import serializers

Organizador = get_user_model()


class RegistroSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True, min_length=8)

    class Meta:
        model = Organizador
        fields = ('first_name', 'email', 'password')

    def create(self, validated_data):
        return Organizador.objects.create_user(
            username=validated_data['email'],
            email=validated_data['email'],
            first_name=validated_data['first_name'],
            password=validated_data['password'],
        )


class RecuperacaoSenhaSerializer(serializers.Serializer):
    email = serializers.EmailField()

    def validate_email(self, value):
        if not Organizador.objects.filter(email=value).exists():
            raise serializers.ValidationError('Nenhum usuário encontrado com este email.')
        return value


class ResetSenhaSerializer(serializers.Serializer):
    uid = serializers.CharField()
    token = serializers.CharField()
    nova_senha = serializers.CharField(min_length=8, write_only=True)

    def validate(self, attrs):
        try:
            uid = force_str(urlsafe_base64_decode(attrs['uid']))
            user = Organizador.objects.get(pk=uid)
        except (Organizador.DoesNotExist, ValueError, TypeError):
            raise serializers.ValidationError({'uid': 'Link inválido.'})

        if not PasswordResetTokenGenerator().check_token(user, attrs['token']):
            raise serializers.ValidationError({'token': 'Token inválido ou expirado.'})

        attrs['user'] = user
        return attrs

    def save(self):
        user = self.validated_data['user']
        user.set_password(self.validated_data['nova_senha'])
        user.save()

class PerfilSerializer(serializers.ModelSerializer):
    class Meta:
        model = Organizador
        fields=('first_name','last_name', 'email')