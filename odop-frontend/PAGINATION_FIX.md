# Pagination Fix - All States Now Showing

## Problem
The frontend was only displaying products from 2 states, even though the database contained 1350 products across 36 states.

## Root Cause
Django REST Framework's default pagination was limiting API responses to 20 products per page. The frontend was only fetching the first page, which happened to contain products from just 2 states.

## Solution

### 1. Backend Fix (API Views)
Added explicit pagination class to the ProductViewSet in `/Users/vinamragupta/odop-platform/odop-backend/api/views.py`:

```python
from rest_framework.pagination import PageNumberPagination

class CustomPagination(PageNumberPagination):
    page_size = 20
    page_size_query_param = 'page_size'
    max_page_size = 10000

class ProductViewSet(viewsets.ReadOnlyModelViewSet):
    # ...
    pagination_class = CustomPagination
```

### 2. Frontend Fix (API Service)
Updated the API service to request larger page sizes in `/Users/vinamragupta/odop-platform/odop-frontend/src/services/api.js`:

```javascript
// Get all products with page_size=2000
getProducts: async (params = {}) => {
    const response = await api.get('/products/', {
        params: {
            ...params,
            page_size: 2000
        }
    });
    return response.data;
}
```

## Results

### Before Fix
- API Response: 20 products per page
- Frontend Display: Only 2 states visible
- Featured States: Only showing 2 states
- Map: Limited state coverage

### After Fix
- API Response: All 1350 products in single request
- Frontend Display: All 36 states visible
- Featured States: Showing all states with products
- Map: Complete state coverage

### Verification
```bash
# Test API endpoint
curl "http://127.0.0.1:8000/api/products/?page_size=2000"

# Result:
# Total count: 1350
# Results returned: 1350
# Next page: None
```

## Database Statistics
- **Total Products**: 1350
- **Total States**: 36
- **Total Districts**: 730
- **Total Categories**: 8
- **Total Sectors**: 5

### Top States by Product Count
1. Tamil Nadu - 200 products
2. Andhra Pradesh - 198 products
3. Gujarat - 145 products
4. Uttar Pradesh - 142 products
5. Karnataka - 90 products
... and 31 more states

## Impact
✅ **Featured States carousel** - Now displays all states with products (up to 15)
✅ **State filter dropdown** - Shows all 36 states
✅ **India Map** - Shows accurate product distribution across all states
✅ **Product Grid** - Can display all 1350 products
✅ **Search & Filters** - Work across entire product database

## Files Modified
1. `/Users/vinamragupta/odop-platform/odop-backend/api/views.py` - Added CustomPagination class
2. `/Users/vinamragupta/odop-platform/odop-frontend/src/services/api.js` - Added page_size parameter
3. `/Users/vinamragupta/odop-platform/odop-backend/config/settings.py` - Added PAGE_SIZE_QUERY_PARAM (for reference, but explicit pagination class takes precedence)

## Status
🎉 **FIXED** - All states and products are now properly displayed in the frontend!
