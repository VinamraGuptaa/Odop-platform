# products/management/commands/import_data.py

import csv
from io import StringIO

from django.core.management.base import BaseCommand, CommandError

from products.models import Product


class Command(BaseCommand):
    help = "Import ODOP data from CSV file"

    def add_arguments(self, parser):
        parser.add_argument("csv_file", type=str, help="Path to the CSV file")
        parser.add_argument(
            "--clear",
            action="store_true",
            help="Clear existing data before import",
        )

    def handle(self, *args, **options):
        csv_file = options["csv_file"]

        if options["clear"]:
            self.stdout.write("Clearing existing data...")
            Product.objects.all().delete()
            self.stdout.write(self.style.SUCCESS("✅ Existing data cleared"))

        try:
            # Try different encodings
            encodings_to_try = ["utf-8", "cp1252", "iso-8859-1", "latin-1"]

            file_content = None
            used_encoding = None

            for encoding in encodings_to_try:
                try:
                    with open(csv_file, "r", encoding=encoding) as file:
                        file_content = file.read()
                        used_encoding = encoding
                        break
                except UnicodeDecodeError:
                    continue

            if file_content is None:
                raise CommandError(
                    "❌ Could not decode the CSV file with any common encoding"
                )

            self.stdout.write(
                f"📄 Successfully read file using {used_encoding} encoding"
            )

            # Now process the content
            file = StringIO(file_content)

            # Auto-detect CSV format
            sample = file_content[:1024]

            # Try to detect delimiter
            if "," in sample:
                delimiter = ","
            elif "\t" in sample:
                delimiter = "\t"
            else:
                delimiter = ","

            reader = csv.DictReader(file, delimiter=delimiter)

            # Clean up headers (remove extra spaces)
            fieldnames = [field.strip() for field in reader.fieldnames]
            reader.fieldnames = fieldnames

            self.stdout.write(f"📊 Found columns: {fieldnames}")

            # Process data
            products_created = 0
            errors = 0

            for row_num, row in enumerate(reader, start=1):
                try:
                    # Clean the data
                    cleaned_data = {}
                    for key, value in row.items():
                        if value is None or value == "":
                            cleaned_data[key] = ""
                        else:
                            cleaned_data[key] = str(value).strip()

                    # Create Product object
                    product = Product.objects.create(
                        product=cleaned_data.get("Product", ""),
                        state=cleaned_data.get("State", ""),
                        district=cleaned_data.get("District", ""),
                        lgd_code=int(cleaned_data.get("LGD Code", 0))
                        if cleaned_data.get("LGD Code")
                        else 0,
                        category=cleaned_data.get("Category", ""),
                        sector=cleaned_data.get("Sector", ""),
                        description=cleaned_data.get("Description", ""),
                        gi_status=cleaned_data.get("GI Status", ""),
                        photo=cleaned_data.get("Photo", "")
                        if cleaned_data.get("Photo")
                        else None,
                        ministry_department=cleaned_data.get(
                            "Ministry/ Department", ""
                        ),
                    )

                    products_created += 1

                    # Progress indicator
                    if products_created % 50 == 0:
                        self.stdout.write(f"📈 Imported {products_created} products...")

                except Exception as e:
                    errors += 1
                    self.stderr.write(f"❌ Error in row {row_num}: {str(e)}")

                    # Show first few errors in detail, then just count
                    if errors <= 3:
                        self.stderr.write(f"   Row data: {row}")

            # Final summary
            self.stdout.write("\n" + "=" * 50)
            self.stdout.write(self.style.SUCCESS("🎉 Import completed!"))
            self.stdout.write(f"✅ Products created: {products_created}")
            if errors > 0:
                self.stdout.write(
                    self.style.WARNING(f"⚠️  Errors encountered: {errors}")
                )
            self.stdout.write("=" * 50)

            # Quick verification
            total_in_db = Product.objects.count()
            self.stdout.write(f"📊 Total products in database: {total_in_db}")

        except FileNotFoundError:
            raise CommandError(f'❌ File "{csv_file}" not found')
        except Exception as e:
            raise CommandError(f"❌ Error reading CSV file: {e}")
