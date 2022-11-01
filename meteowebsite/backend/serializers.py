from rest_framework import serializers
from .models import Point, Station, Data, DataType


class DataTypeSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataType
        fields = ('name', 'unit')


class JsTimestampField(serializers.Field):
    def to_representation(self, value):
        return round(value.timestamp()*1000)


class DataAverageSerializer(serializers.ModelSerializer):
    type = DataTypeSerializer(read_only=True)
    start_date = JsTimestampField()
    end_date = JsTimestampField()
    avg = serializers.FloatField()
    min = serializers.FloatField()
    max = serializers.FloatField()
    deviation = serializers.FloatField()

    class Meta:
        model = Data
        fields = ('type', 'start_date', 'end_date', 'avg',
                  'min', 'max', 'deviation')


class StationAverageSerializer(serializers.ModelSerializer):
    data_set = DataAverageSerializer(many=True, read_only=True)

    class Meta:
        model = Station
        fields = ('name', 'data_set')


class PointAverageSerializer(serializers.ModelSerializer):
    station_set = StationAverageSerializer(many=True, read_only=True)

    class Meta:
        model = Point
        fields = ('name', 'latitude', 'longitude', 'station_set')


class DataSerializer(serializers.ModelSerializer):
    type = DataTypeSerializer(read_only=True)
    date = JsTimestampField()

    class Meta:
        model = Data
        fields = ('type', 'date', 'value')


class StationSerializer(serializers.ModelSerializer):
    data_set = DataSerializer(many=True, read_only=True)

    class Meta:
        model = Station
        fields = ('name', 'data_set')


class PointSerializer(serializers.ModelSerializer):
    station_set = StationSerializer(many=True, read_only=True)

    class Meta:
        model = Point
        fields = ('name', 'latitude', 'longitude', 'station_set')


class StationNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = Station
        fields = ('id', 'name')


class PointNameSerializer(serializers.ModelSerializer):
    station_set = StationNameSerializer(many=True, read_only=True)

    class Meta:
        model = Point
        fields = ('name', 'station_set')


class DataTypeNameSerializer(serializers.ModelSerializer):
    class Meta:
        model = DataType
        fields = ('id', 'name', 'unit')
