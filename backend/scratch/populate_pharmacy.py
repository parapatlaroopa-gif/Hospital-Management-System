import os
import sys
import django

sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), "..")))
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
django.setup()

from pharmacy.models import Medicine

# Comprehensive catalog of common clinical hospital medications
MEDICATIONS = [
    # Antibiotics & Antimicrobials
    {
        "name": "Augmentin 625 Duo (Amoxicillin + Clavulanate)",
        "category": "Tablet",
        "manufacturer": "GSK Pharmaceuticals",
        "quantity": 220,
        "price": 185.50,
        "expiry_date": "2027-11-30"
    },
    {
        "name": "Ciprofloxacin 500mg (Ciplox)",
        "category": "Tablet",
        "manufacturer": "Cipla Ltd",
        "quantity": 300,
        "price": 42.00,
        "expiry_date": "2028-02-15"
    },
    {
        "name": "Ceftriaxone 1g Injection (Monocef)",
        "category": "Injection",
        "manufacturer": "Aristo Pharma",
        "quantity": 95,
        "price": 68.00,
        "expiry_date": "2027-09-30"
    },
    {
        "name": "Doxycycline 100mg (Doxicip)",
        "category": "Capsule",
        "manufacturer": "Cipla Ltd",
        "quantity": 180,
        "price": 35.00,
        "expiry_date": "2027-12-31"
    },
    {
        "name": "Levofloxacin 500mg (Levomac)",
        "category": "Tablet",
        "manufacturer": "Macleods Pharma",
        "quantity": 140,
        "price": 89.00,
        "expiry_date": "2027-08-20"
    },

    # Analgesics & Anti-inflammatory
    {
        "name": "Dolo 650 (Paracetamol 650mg)",
        "category": "Tablet",
        "manufacturer": "Micro Labs",
        "quantity": 650,
        "price": 32.50,
        "expiry_date": "2028-06-30"
    },
    {
        "name": "Ibuprofen 400mg (Brufen)",
        "category": "Tablet",
        "manufacturer": "Abbott India",
        "quantity": 280,
        "price": 28.00,
        "expiry_date": "2027-10-15"
    },
    {
        "name": "Zerodol-P (Aceclofenac + Paracetamol)",
        "category": "Tablet",
        "manufacturer": "Ipca Laboratories",
        "quantity": 350,
        "price": 65.00,
        "expiry_date": "2028-03-31"
    },
    {
        "name": "Diclofenac 75mg/3ml Injection (Voveran)",
        "category": "Injection",
        "manufacturer": "Novartis India",
        "quantity": 110,
        "price": 35.00,
        "expiry_date": "2027-07-31"
    },
    {
        "name": "Tramadol 50mg (Tramazac)",
        "category": "Capsule",
        "manufacturer": "Zydus Cadila",
        "quantity": 120,
        "price": 75.00,
        "expiry_date": "2027-04-30"
    },

    # Cardiovascular & Antihypertensive
    {
        "name": "Telmisartan 40mg (Telma 40)",
        "category": "Tablet",
        "manufacturer": "Glenmark Pharma",
        "quantity": 400,
        "price": 125.00,
        "expiry_date": "2028-01-31"
    },
    {
        "name": "Amlodipine 5mg (Amlong)",
        "category": "Tablet",
        "manufacturer": "Micro Labs",
        "quantity": 320,
        "price": 45.00,
        "expiry_date": "2028-05-15"
    },
    {
        "name": "Atorvastatin 10mg (Atorva)",
        "category": "Tablet",
        "manufacturer": "Zydus Healthcare",
        "quantity": 260,
        "price": 98.00,
        "expiry_date": "2027-11-20"
    },
    {
        "name": "Clopidogrel 75mg (Deplatt)",
        "category": "Tablet",
        "manufacturer": "Torrent Pharma",
        "quantity": 210,
        "price": 112.00,
        "expiry_date": "2027-10-31"
    },
    {
        "name": "Losartan Potassium 50mg (Losar)",
        "category": "Tablet",
        "manufacturer": "Unichem Labs",
        "quantity": 190,
        "price": 82.00,
        "expiry_date": "2028-04-25"
    },

    # Gastrointestinal & Antacids
    {
        "name": "Pantoprazole 40mg (Pan-40)",
        "category": "Tablet",
        "manufacturer": "Alkem Laboratories",
        "quantity": 480,
        "price": 140.00,
        "expiry_date": "2028-07-31"
    },
    {
        "name": "Omeprazole 20mg (Omez)",
        "category": "Capsule",
        "manufacturer": "Dr. Reddy's Labs",
        "quantity": 380,
        "price": 62.00,
        "expiry_date": "2027-12-15"
    },
    {
        "name": "Ondansetron 4mg (Emeset)",
        "category": "Tablet",
        "manufacturer": "Cipla Ltd",
        "quantity": 240,
        "price": 48.00,
        "expiry_date": "2028-03-20"
    },
    {
        "name": "Gelusil Antacid Syrup (200ml)",
        "category": "Syrup",
        "manufacturer": "Pfizer Ltd",
        "quantity": 130,
        "price": 128.00,
        "expiry_date": "2027-08-31"
    },
    {
        "name": "Rabeprazole 20mg (Razo 20)",
        "category": "Tablet",
        "manufacturer": "Dr. Reddy's Labs",
        "quantity": 290,
        "price": 155.00,
        "expiry_date": "2028-02-28"
    },

    # Respiratory & Allergy
    {
        "name": "Cetirizine 10mg (Cetzine)",
        "category": "Tablet",
        "manufacturer": "GSK Pharma",
        "quantity": 520,
        "price": 24.00,
        "expiry_date": "2028-09-30"
    },
    {
        "name": "Montelukast + Levocetirizine (Montair-LC)",
        "category": "Tablet",
        "manufacturer": "Cipla Ltd",
        "quantity": 310,
        "price": 175.00,
        "expiry_date": "2028-01-15"
    },
    {
        "name": "Benadryl Cough Formula Syrup (100ml)",
        "category": "Syrup",
        "manufacturer": "Johnson & Johnson",
        "quantity": 160,
        "price": 115.00,
        "expiry_date": "2027-06-30"
    },
    {
        "name": "Salbutamol Expectorant Syrup (Asthalin 100ml)",
        "category": "Syrup",
        "manufacturer": "Cipla Ltd",
        "quantity": 140,
        "price": 42.00,
        "expiry_date": "2027-09-15"
    },

    # Diabetic & Metabolic
    {
        "name": "Metformin 500mg SR (Glycomet)",
        "category": "Tablet",
        "manufacturer": "USV Ltd",
        "quantity": 600,
        "price": 28.00,
        "expiry_date": "2028-08-31"
    },
    {
        "name": "Glimepiride 2mg (Amaryl)",
        "category": "Tablet",
        "manufacturer": "Sanofi India",
        "quantity": 250,
        "price": 95.00,
        "expiry_date": "2027-11-15"
    },
    {
        "name": "Human Actrapid Regular Insulin 100IU/ml",
        "category": "Injection",
        "manufacturer": "Novo Nordisk",
        "quantity": 75,
        "price": 210.00,
        "expiry_date": "2027-03-31"
    },
    {
        "name": "Vildagliptin 50mg (Galvus)",
        "category": "Tablet",
        "manufacturer": "Novartis",
        "quantity": 170,
        "price": 245.00,
        "expiry_date": "2027-10-31"
    },

    # Emergency & Critical Care Injectables
    {
        "name": "Hydrocortisone Sodium 100mg Injection (Primacort)",
        "category": "Injection",
        "manufacturer": "Macleods Pharma",
        "quantity": 85,
        "price": 54.00,
        "expiry_date": "2027-05-31"
    },
    {
        "name": "Atropine Sulphate 0.6mg/ml Injection",
        "category": "Injection",
        "manufacturer": "Neon Labs",
        "quantity": 115,
        "price": 18.00,
        "expiry_date": "2027-12-31"
    },
    {
        "name": "Adrenaline (Epinephrine) 1mg/ml Injection",
        "category": "Injection",
        "manufacturer": "Harson Labs",
        "quantity": 60,
        "price": 45.00,
        "expiry_date": "2027-08-31"
    },

    # Multivitamins & Essential Supplements
    {
        "name": "Vitamin C 500mg Chewable (Limcee)",
        "category": "Tablet",
        "manufacturer": "Abbott India",
        "quantity": 450,
        "price": 26.50,
        "expiry_date": "2028-10-31"
    },
    {
        "name": "Neurobion Forte (Vitamin B Complex + B12)",
        "category": "Tablet",
        "manufacturer": "Procter & Gamble",
        "quantity": 500,
        "price": 38.00,
        "expiry_date": "2028-12-31"
    },
    {
        "name": "Shelcal 500 (Calcium + Vitamin D3)",
        "category": "Tablet",
        "manufacturer": "Torrent Pharma",
        "quantity": 380,
        "price": 135.00,
        "expiry_date": "2028-06-15"
    },
    {
        "name": "Zincovit Multivitamin & Mineral Syrup (200ml)",
        "category": "Syrup",
        "manufacturer": "Apex Laboratories",
        "quantity": 125,
        "price": 165.00,
        "expiry_date": "2027-07-20"
    },
]

added_count = 0
for med_data in MEDICATIONS:
    med, created = Medicine.objects.get_or_create(
        name=med_data["name"],
        defaults=med_data
    )
    if created:
        added_count += 1
        print(f"Added: {med.name} ({med.category})")
    else:
        print(f"Already exists: {med.name}")

print(f"\nSuccessfully added {added_count} new medications.")
print(f"Total medications in Pharmacy: {Medicine.objects.count()}")
