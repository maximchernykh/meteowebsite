from django.db import models
from datetime import date


class Point(models.Model):
    name = models.CharField(max_length=200)
    latitude = models.FloatField()
    longitude = models.FloatField()

    def __str__(self):
        return self.name


class Station(models.Model):
    point = models.ForeignKey(Point, on_delete=models.CASCADE)
    name = models.CharField(max_length=200)
    install_date = models.DateField(default=date.today)

    def __str__(self):
        return self.name


class DataType(models.Model):
    name = models.CharField(max_length=30)
    unit = models.CharField(max_length=15)

    def __str__(self):
        return self.name


class Data(models.Model):
    station = models.ForeignKey(Station, on_delete=models.CASCADE)
    date = models.DateTimeField()
    type = models.ForeignKey(DataType, on_delete=models.CASCADE)
    value = models.FloatField()

    def __str__(self):
        return self.station.name + ", " + str(self.date) + ", " + self.type.name

    class Meta:
        verbose_name_plural = "data"
