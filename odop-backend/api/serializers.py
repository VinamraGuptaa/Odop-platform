from rest_framework import serializers
from products.models import Product

class ProductSerializer(serializers.ModelSerializer):
    location = serializers.ReadOnlyField()  # Uses the @property from model
    
    class Meta:
        model = Product
        fields = [
            'id', 
            'product', 
            'state', 
            'district', 
            'location',  # Combined district, state
            'lgd_code',
            'category', 
            'sector',
            'description', 
            'gi_status', 
            'photo', 
            'ministry_department',
            'created_at'
        ]