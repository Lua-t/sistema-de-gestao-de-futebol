from django.conf import settings
from django.contrib.auth import get_user_model
from django.contrib.auth.tokens import PasswordResetTokenGenerator
from django.core.mail import send_mail
from django.utils.encoding import force_bytes
from django.utils.http import urlsafe_base64_encode
from rest_framework import status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.views import APIView
from rest_framework_simplejwt.tokens import RefreshToken

from .models import Jogador
from .serializers import JogadorSerializer, PerfilSerializer, RecuperacaoSenhaSerializer, RegistroSerializer, ResetSenhaSerializer

Organizador = get_user_model()


class RegistroView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RegistroSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        user = serializer.save()

        refresh = RefreshToken.for_user(user)
        return Response(
            {
                'refresh': str(refresh),
                'access': str(refresh.access_token),
            },
            status=status.HTTP_201_CREATED,
        )


class RecuperacaoSenhaView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = RecuperacaoSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)

        email = serializer.validated_data['email']
        user = Organizador.objects.get(email=email)

        uid = urlsafe_base64_encode(force_bytes(user.pk))
        token = PasswordResetTokenGenerator().make_token(user)
        reset_link = f"{settings.FRONTEND_URL}/reset-senha?uid={uid}&token={token}"

        send_mail(
            subject='Recuperação de senha',
            message=f'Clique no link para redefinir sua senha: {reset_link}',
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[email],
        )

        return Response({'detail': 'Email de recuperação enviado.'}, status=status.HTTP_200_OK)


class ResetSenhaView(APIView):
    permission_classes = [AllowAny]

    def post(self, request):
        serializer = ResetSenhaSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response({'detail': 'Senha redefinida com sucesso.'}, status=status.HTTP_200_OK)

class PerfilView(APIView):
    def get(self, request):
        serializer = PerfilSerializer(request.user)
        return Response(serializer.data)

    def patch(self, request):
        serializer = PerfilSerializer(request.user, data=request.data, partial=True)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)


class JogadorListCreateView(APIView):
    def get(self, request):
        jogadores = Jogador.objects.filter(organizador=request.user)
        serializer = JogadorSerializer(jogadores, many=True)
        return Response(serializer.data)

    def post(self, request):
        serializer = JogadorSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(organizador=request.user)
        return Response(serializer.data, status=status.HTTP_201_CREATED)


class JogadorDetailView(APIView):
    def get_object(self, pk, user):
        try:
            return Jogador.objects.get(pk=pk, organizador=user)
        except Jogador.DoesNotExist:
            return None

    def put(self, request, pk):
        jogador = self.get_object(pk, request.user)
        if jogador is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        serializer = JogadorSerializer(jogador, data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(serializer.data)

    def delete(self, request, pk):
        jogador = self.get_object(pk, request.user)
        if jogador is None:
            return Response(status=status.HTTP_404_NOT_FOUND)
        jogador.ativo = False
        jogador.save()
        return Response(status=status.HTTP_204_NO_CONTENT)
