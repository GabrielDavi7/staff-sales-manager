from rest_framework import viewsets
from users.models import CustomUser
from .serializers import UserAdminSerializer
from users.permissions import IsAdmin


class UserViewSet(viewsets.ModelViewSet):
	queryset = CustomUser.objects.all().order_by('id')
	serializer_class = UserAdminSerializer
	permission_classes = [IsAdmin]
	http_method_names = ['get', 'post', 'put', 'patch', 'head', 'options']
