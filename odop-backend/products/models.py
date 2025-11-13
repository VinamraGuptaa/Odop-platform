# products/models.py
from django.db import models

class Product(models.Model):
    """
    ODOP Product Model - matches your CSV structure exactly
    """
    # Basic product info
    product = models.CharField(max_length=300, verbose_name="Product Name")
    state = models.CharField(max_length=100)
    district = models.CharField(max_length=100)
    lgd_code = models.BigIntegerField(verbose_name="LGD Code")  # int64 from your data
    
    # Classification
    category = models.CharField(max_length=150)
    sector = models.CharField(max_length=150)
    
    # Details
    description = models.TextField()
    gi_status = models.CharField(max_length=100, verbose_name="GI Status")
    photo = models.URLField(blank=True, null=True)  # URLs can be empty
    ministry_department = models.CharField(max_length=300, verbose_name="Ministry/Department")
    
    # Metadata (auto-generated)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        ordering = ['state', 'district', 'product']
        # Add indexes for fast filtering/searching
        indexes = [
            models.Index(fields=['state']),
            models.Index(fields=['district']),
            models.Index(fields=['category']),
            models.Index(fields=['sector']),
            models.Index(fields=['gi_status']),
        ]
    
    def __str__(self):
        return f"{self.product} - {self.district}, {self.state}"
    
    @property
    def location(self):
        """Helper property for displaying location"""
        return f"{self.district}, {self.state}"