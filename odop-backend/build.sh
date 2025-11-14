#!/usr/bin/env bash
# exit on error
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --no-input
python manage.py migrate

# Import product data if not already loaded
# Check if products exist before importing
PRODUCT_COUNT=$(python manage.py shell -c "from products.models import Product; print(Product.objects.count())")
if [ "$PRODUCT_COUNT" -eq "0" ]; then
    echo "No products found. Importing data..."
    python manage.py import_data odp.csv
else
    echo "Products already exist ($PRODUCT_COUNT). Skipping import."
fi
