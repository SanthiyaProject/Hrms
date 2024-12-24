from django.contrib.auth.models import User
from rest_framework.response import Response
from rest_framework.decorators import api_view, permission_classes, authentication_classes
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework.views import APIView
from rest_framework_simplejwt.views import TokenObtainPairView, TokenRefreshView
from .serializers import  UserRegisterSerializer, UserSerializer, ChangePasswordSerializer
from rest_framework.authentication import TokenAuthentication
from django.contrib.auth import authenticate, update_session_auth_hash
from rest_framework_simplejwt.tokens import RefreshToken
from .serializers import RequestSerializer
from rest_framework import status
from django.core.cache import cache
from base.utils import send_otp
from django.http import JsonResponse
from base.models import UserRequest


@api_view(['GET'])
@authentication_classes([TokenAuthentication])
@permission_classes([IsAuthenticated])
def protected_view(request):
    return Response({"message": "You have accessed a protected endpoint!"})

@api_view(['GET'])
@permission_classes([IsAuthenticated])
def get_username(request, pk=None):
    user = User.objects.get(id=pk)
    username = user.username
    return Response({'username': username})

@api_view(['POST'])
@permission_classes([AllowAny])
def register(request):
    email = request.data['email']
    if User.objects.filter(email=email).exists():
        return Response({"error": "User already exists."}, status=status.HTTP_400_BAD_REQUEST)

    serializer = UserRegisterSerializer(data=request.data)
    if serializer.is_valid():
        user = serializer.save()
        user.is_active = False  
        user.save()
        return Response({"message": "User registered successfully. Awaiting admin approval."}, status=status.HTTP_201_CREATED)
    return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

class CustomTokenObtainPairView(TokenObtainPairView):
    def post(self, request, *args, **kwargs):
        email = request.data.get("email")
        password = request.data.get("password")
        
        print(email, password)
        print(request.data)
        # input()
        user = authenticate(request, username=email, password=password)
        print(user)
        if user is not None:
            if not user.is_active:
                return Response({"error": "Account not approved by admin."}, status=status.HTTP_403_FORBIDDEN)
            refresh = RefreshToken.for_user(user)
            
            response_data = {
                'success': True,
                'email': user.email,            
                'token': str(refresh.access_token),
            }

            res = Response(response_data)
            res.set_cookie(
                key='access_token',
                value=str(refresh.access_token),
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            res.set_cookie(
                key='refresh_token',
                value=str(refresh),
                httponly=True,
                secure=True,
                samesite='None',
                path='/'
            )
            return res
        
        else:
           
            return Response({"error": "Invalid credentials."}, status=status.HTTP_401_UNAUTHORIZED)
        
class CustomTokenRefreshView(TokenRefreshView):
    def post(self, request, *args, **kwargs):
        try:
            refresh_token = request.COOKIES.get('refresh_token')

            request.data['refresh'] = refresh_token

            response = super().post(request, *args, **kwargs)
            
            tokens = response.data
            access_token = tokens['access']

            res = Response()

            res.data = {'refreshed': True}

            res.set_cookie(
                key='access_token',
                value=access_token,
                httponly=True,
                secure=False,
                samesite='None',
                path='/'
            )
            return res

        except Exception as e:
            print(e)
            return Response({'refreshed': False})


@api_view(['POST'])
@permission_classes([IsAuthenticated])
def logout(request):

    try:

        res = Response()
        res.data = {'success':True}
        res.delete_cookie('access_token', path='/', samesite='None')
        res.delete_cookie('response_token', path='/', samesite='None')

        return res

    except Exception as e:
        print(e)
        return Response({'success':False})



@api_view(['GET'])
@permission_classes([IsAuthenticated])
def is_logged_in(request):
    serializer = UserSerializer(request.user, many=False)
    return Response(serializer.data)

class ForgotPasswordView(APIView):
    permission_classes = []

    def post(self, request):
        email = request.data.get('email')
        try:
            otp = send_otp(email)
            cache.set(f'otp_{email}', otp, timeout=600)  # OTP expires in 5 minutes
            return Response({"message": "OTP sent for password reset."}, status=status.HTTP_200_OK)
        except User.DoesNotExist:
            return Response({"error": "User not found."}, status=status.HTTP_404_NOT_FOUND)

class ResetPasswordView(APIView):
    permission_classes = []

    def post(self, request):
        user = User.objects.get(email=request.data['email'])

        email = request.data.get('email')
        otp = request.data.get('otp')
        new_password = request.data.get('new_password')
        
        # cached_otp = cache.get(f'otp_{email}')
        # print(cached_otp)
        if otp :
            user = User.objects.get(email=email)
            user.set_password(new_password)
            user.save()
            cache.delete(f'otp_{email}')
            return Response({"message": "Password reset successfully."}, status=status.HTTP_200_OK)
        return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)
@api_view(['POST'])
@permission_classes([IsAuthenticated])
def change_password_view(request):
    if request.method == 'POST':
        serializer = ChangePasswordSerializer(data=request.data)
        if serializer.is_valid():
            user = request.user
            if user.check_password(serializer.data.get('old_password')):
                user.set_password(serializer.data.get('new_password'))
                user.save()
                update_session_auth_hash(request, user)  # To update session after password change
                return Response({'message': 'Password changed successfully.'}, status=status.HTTP_200_OK)
            return Response({'error': 'Incorrect old password.'}, status=status.HTTP_400_BAD_REQUEST)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)

@api_view(['POST'])
@permission_classes([AllowAny])
def verify_email(request):
    email = request.data.get('email')
    otp = request.data.get('otp')
    cached_otp = cache.get(f'otp_{email}')
    
    if cached_otp and str(cached_otp) == otp:
        user = User.objects.get(email=email)
        user.is_email_verified = True
        user.save()
        cache.delete(f'otp_{email}')
        return Response({"message": "Email verified successfully."}, status=status.HTTP_200_OK)
    return Response({"error": "Invalid or expired OTP."}, status=status.HTTP_400_BAD_REQUEST)

@api_view(['GET'])
def get_pending_users(request):
    pending_users = User.objects.filter(is_active=False)

    user_list = [
        {
            "id": user.id,
            "username": user.username,
            "email": user.email,
        }
        for user in pending_users
    ]

    return JsonResponse(user_list, safe=False)


@api_view(['GET', 'POST'])
def get_user_request(request):
    if request.method == 'GET':
        # Handle GET request - fetch all user requests
        queryset = UserRequest.objects.all()
        serializer = RequestSerializer(queryset, many=True)
        return Response(serializer.data)

    elif request.method == 'POST':
        # Handle POST request - create a new user request
        serializer = RequestSerializer(data=request.data)
        if serializer.is_valid():
            serializer.save()  # Save the new user request
            return Response(serializer.data, status=201)  # Return the created data with status 201 (Created)
        return Response(serializer.errors,status=400)