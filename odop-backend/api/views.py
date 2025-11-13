from rest_framework import viewsets, filters
from rest_framework.decorators import action, api_view
from rest_framework.response import Response
from rest_framework.pagination import PageNumberPagination
from django_filters.rest_framework import DjangoFilterBackend
from django.db.models import Count
from django.http import HttpResponse
from django.views.decorators.cache import cache_page
from products.models import Product
from .serializers import ProductSerializer
import urllib.request
import re

class CustomPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 10000

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    """
    API endpoints for ODOP Products
    Provides list, detail, and filtering capabilities
    """
    queryset = Product.objects.all()
    serializer_class = ProductSerializer
    pagination_class = CustomPagination

    # Enable filtering, searching, and ordering
    filter_backends = [DjangoFilterBackend, filters.SearchFilter, filters.OrderingFilter]
    filterset_fields = ['state', 'district', 'category', 'sector', 'gi_status']
    search_fields = ['product', 'description', 'district', 'state']
    ordering_fields = ['product', 'state', 'district', 'created_at']
    ordering = ['state', 'district', 'product']  # Default ordering
    
    @action(detail=False, methods=['get'])
    def stats(self, request):
        """
        Get basic statistics about the ODOP data
        /api/products/stats/
        """
        queryset = self.get_queryset()
        stats = {
            'total_products': queryset.count(),
            'total_states': queryset.values('state').distinct().count(),
            'total_districts': queryset.values('district').distinct().count(),
            'total_categories': queryset.values('category').distinct().count(),
            'total_sectors': queryset.values('sector').distinct().count(),
        }
        return Response(stats)
    
    @action(detail=False, methods=['get'])
    def filters(self, request):
        """
        Get all available filter options
        /api/products/filters/
        """
        queryset = self.get_queryset()
        filters_data = {
            'states': list(queryset.values_list('state', flat=True).distinct().order_by('state')),
            'districts': list(queryset.values_list('district', flat=True).distinct().order_by('district')),
            'categories': list(queryset.values_list('category', flat=True).distinct().order_by('category')),
            'sectors': list(queryset.values_list('sector', flat=True).distinct().order_by('sector')),
            'gi_statuses': list(queryset.values_list('gi_status', flat=True).distinct().order_by('gi_status')),
        }
        return Response(filters_data)


@api_view(['GET'])
@cache_page(60 * 60 * 24)  # Cache for 24 hours
def proxy_drive_image(request):
    """
    Proxy endpoint to fetch Google Drive images and bypass CORS
    /api/proxy-image/?url=<drive_url>
    Cached for 24 hours to improve performance
    """
    url = request.GET.get('url')

    if not url:
        return HttpResponse('No URL provided', status=400)

    # Extract file ID from Google Drive URL
    match = re.search(r'/d/([a-zA-Z0-9_-]+)', url)
    if not match:
        return HttpResponse('Invalid Google Drive URL', status=400)

    file_id = match.group(1)
    drive_url = f'https://drive.usercontent.google.com/download?id={file_id}&export=view'

    try:
        with urllib.request.urlopen(drive_url, timeout=15) as response:
            # Return the image with proper content type and cache headers
            content_type = response.headers.get('content-type', 'image/jpeg')
            image_data = response.read()
            http_response = HttpResponse(image_data, content_type=content_type)
            http_response['Cache-Control'] = 'public, max-age=86400'  # Cache for 24 hours
            return http_response
    except Exception as e:
        return HttpResponse(f'Error fetching image: {str(e)}', status=500)