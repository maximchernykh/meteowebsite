from django.contrib import admin
from .models import Point, Station, DataType, Data

admin.site.register(Point)
admin.site.register(Station)
admin.site.register(DataType)
admin.site.register(Data)
