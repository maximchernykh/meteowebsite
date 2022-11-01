from rest_framework import viewsets
from django.db.models import Prefetch, Q, Subquery, OuterRef, Window, F, Avg, Min, Max, StdDev
from django.db.models.functions import Trunc, Extract, Ceil
from .serializers import PointSerializer, PointAverageSerializer, PointNameSerializer, DataTypeNameSerializer
from .models import Point, Station, Data, DataType
from django.utils import timezone
from dateutil.relativedelta import relativedelta


class PointView(viewsets.ReadOnlyModelViewSet):
    def get_queryset(self):
        queryset = Point.objects.all()

        stations = self.request.query_params.get('stations')
        if stations is not None:
            stations = stations.split(',')
            queryset = queryset.filter(station__id__in=stations).prefetch_related(
                Prefetch('station_set', queryset=Station.objects.filter(id__in=stations))).distinct()

        data_set_filters = []

        types = self.request.query_params.get('datatypes')
        if types is not None:
            types = types.split(',')
            queryset = queryset.filter(station__data__type__id__in=types)
            data_set_filters.append(Q(type__id__in=types))

        mode = self.request.query_params.get('mode')
        if mode == 'latest':
            subqry = Subquery(Data.objects.filter(station_id=OuterRef(
                'station_id')).order_by('type', '-date').distinct('type').values('pk'))
            data_set_filters.append(Q(pk__in=subqry))
        else:
            past_period_unit = self.request.query_params.get(
                'past_period_unit')
            if past_period_unit is not None:
                past_period_num = int(self.request.query_params.get(
                    'past_period_num', 1))
                past_date = timezone.now(
                ) - relativedelta(**{past_period_unit: past_period_num})

                queryset = queryset.filter(
                    station__data__date__gte=past_date)
                data_set_filters.append(Q(date__gte=past_date))
            else:
                start_date = self.request.query_params.get('start_date')
                if start_date is not None:
                    queryset = queryset.filter(
                        station__data__date__gte=start_date)
                    data_set_filters.append(Q(date__gte=start_date))

                end_date = self.request.query_params.get('end_date')
                if end_date is not None:
                    queryset = queryset.filter(
                        station__data__date__lte=end_date)
                    data_set_filters.append(Q(date__lte=end_date))

        query = Q()
        for item in data_set_filters:
            query &= item

        averaging_unit = self.request.query_params.get('averaging_unit')
        if averaging_unit is not None:
            self.serializer_class = PointAverageSerializer
            averaging_num = self.request.query_params.get('averaging_num', 1)
            match averaging_unit:
                case 'seconds':
                    date_expression = Extract('date', 'epoch')
                case 'minutes':
                    date_expression = Extract(
                        Trunc('date', 'minute'), 'epoch') / 60
                case 'hours':
                    date_expression = Extract(
                        Trunc('date', 'hour'), 'epoch') / 3600
                case 'days':
                    date_expression = Extract(
                        Trunc('date', 'day'), 'epoch') / 86400
                case 'weeks':
                    date_expression = Extract(
                        Trunc('date', 'week'), 'epoch') / 604800
                case 'months':
                    date_expression = Extract(
                        'date', 'year')*12 + Extract('date', 'month')
                case 'quarters':
                    date_expression = Extract(
                        'date', 'year')*4 + Extract('date', 'quarter')
                case 'years':
                    date_expression = Extract('date', 'year')
            date_expression = Ceil(date_expression / averaging_num)
            window = {
                'partition_by': [F('station_id'), F('type'), date_expression],
            }
            queryset = queryset.prefetch_related(Prefetch(
                'station_set__data_set', queryset=Data.objects.filter(query).annotate(
                    start_date=Window(
                        expression=Min('date'), **window
                    ), end_date=Window(
                        expression=Max('date'), **window
                    ), avg=Window(
                        expression=Avg('value'), **window
                    ), min=Window(
                        expression=Min('value'), **window
                    ), max=Window(
                        expression=Max('value'), **window
                    ), deviation=Window(
                        expression=StdDev('value'), **window
                    )).distinct('station_id', 'type', 'start_date'))).distinct()
        else:
            self.serializer_class = PointSerializer
            queryset = queryset.prefetch_related(Prefetch(
                'station_set__data_set', queryset=Data.objects.filter(query))).distinct()

        return queryset


class PointNamesView(viewsets.ReadOnlyModelViewSet):
    serializer_class = PointNameSerializer
    queryset = Point.objects.all()


class DataTypeView(viewsets.ReadOnlyModelViewSet):
    serializer_class = DataTypeNameSerializer
    queryset = DataType.objects.all()
