from rest_framework import viewsets
from users.models import CustomUser
from users.serializers import UserSerializer
from users.permissions import IsAdmin


class UserViewSet(viewsets.ModelViewSet):
	queryset = CustomUser.objects.all().order_by('id')
	serializer_class = UserSerializer
	permission_classes = [IsAdmin]
	http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']
