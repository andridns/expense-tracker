"""
Import script to load rent expense data from JSON file into database
"""
import sys
import json
from pathlib import Path
from decimal import Decimal

# Add parent directory to path
sys.path.insert(0, str(Path(__file__).parent.parent))

from app.database import SessionLocal
from app.models.rent_expense import RentExpense


def load_json_data(json_path: Path):
    """Load JSON data from file"""
    with open(json_path, 'r', encoding='utf-8') as f:
        return json.load(f)


def convert_to_decimal(value):
    """Convert value to Decimal, handling None"""
    if value is None:
        return None
    return Decimal(str(value))


def import_rent_expenses(json_path: Path):
    """Import rent expenses from JSON file"""
    db = SessionLocal()
    
    try:
        print(f"Loading data from {json_path}...")
        data = load_json_data(json_path)
        
        if not isinstance(data, list):
            print("Error: JSON file should contain an array of rent expenses")
            return
        
        print(f"Found {len(data)} rent expense records")
        
        imported_count = 0
        updated_count = 0
        skipped_count = 0
        
        for item in data:
            period = item.get('period')
            if not period:
                print(f"Warning: Skipping record without period: {item}")
                skipped_count += 1
                continue
            
            # Check if record already exists
            existing = db.query(RentExpense).filter(RentExpense.period == period).first()
            
            # Extract summary data
            summary = item.get('summary', {})
            electric_m1 = item.get('electric_m1', {})
            water_m1 = item.get('water_m1', {})
            meta = item.get('meta', {})
            
            # Prepare data
            rent_expense_data = {
                'period': period,
                'currency': item.get('currency', 'IDR'),
                
                # Summary fields
                'sinking_fund_idr': convert_to_decimal(summary.get('sinking_fund_idr', 0)),
                'service_charge_idr': convert_to_decimal(summary.get('service_charge_idr', 0)),
                'ppn_service_charge_idr': convert_to_decimal(summary.get('ppn_service_charge_idr', 0)),
                'electric_m1_total_idr': convert_to_decimal(summary.get('electric_m1_total_idr', 0)),
                'water_m1_total_idr': convert_to_decimal(summary.get('water_m1_total_idr', 0)),
                'fitout_idr': convert_to_decimal(summary.get('fitout_idr', 0)),
                'total_idr': convert_to_decimal(summary.get('total_idr', 0)),
                
                # Electricity breakdown
                'electric_usage_idr': convert_to_decimal(electric_m1.get('usage_idr')),
                'electric_ppn_idr': convert_to_decimal(electric_m1.get('ppn_idr')),
                'electric_area_bersama_idr': convert_to_decimal(electric_m1.get('area_bersama_idr')),
                'electric_pju_idr': convert_to_decimal(electric_m1.get('pju_idr')),
                'electric_kwh': convert_to_decimal(electric_m1.get('kwh')),
                'electric_tarif_per_kwh': convert_to_decimal(electric_m1.get('tarif_per_kwh')),
                
                # Water breakdown
                'water_usage_potable_idr': convert_to_decimal(water_m1.get('usage_potable_idr')),
                'water_non_potable_idr': convert_to_decimal(water_m1.get('non_potable_idr')),
                'water_air_limbah_idr': convert_to_decimal(water_m1.get('air_limbah_idr')),
                'water_ppn_air_limbah_idr': convert_to_decimal(water_m1.get('ppn_air_limbah_idr')),
                'water_pemeliharaan_idr': convert_to_decimal(water_m1.get('pemeliharaan_idr')),
                'water_area_bersama_idr': convert_to_decimal(water_m1.get('area_bersama_idr')),
                'water_m3': convert_to_decimal(water_m1.get('m3')),
                'water_tarif_per_m3': convert_to_decimal(water_m1.get('tarif_per_m3')),
                
                # Meta
                'source': meta.get('source'),
            }
            
            if existing:
                # Update existing record
                for key, value in rent_expense_data.items():
                    setattr(existing, key, value)
                updated_count += 1
                print(f"Updated: {period}")
            else:
                # Create new record
                rent_expense = RentExpense(**rent_expense_data)
                db.add(rent_expense)
                imported_count += 1
                print(f"Imported: {period}")
        
        # Commit all changes
        db.commit()
        print(f"\nImport completed!")
        print(f"  - Imported: {imported_count} records")
        print(f"  - Updated: {updated_count} records")
        print(f"  - Skipped: {skipped_count} records")
        
    except FileNotFoundError:
        print(f"Error: File not found: {json_path}")
        sys.exit(1)
    except json.JSONDecodeError as e:
        print(f"Error: Invalid JSON format: {e}")
        sys.exit(1)
    except Exception as e:
        db.rollback()
        print(f"Error: {e}")
        import traceback
        traceback.print_exc()
        sys.exit(1)
    finally:
        db.close()


if __name__ == "__main__":
    # Default path: rent-tracker/hvj_monthly_expenses.json relative to project root
    project_root = Path(__file__).parent.parent.parent
    default_json_path = project_root / "rent-tracker" / "hvj_monthly_expenses.json"
    
    # Allow custom path via command line argument
    if len(sys.argv) > 1:
        json_path = Path(sys.argv[1])
    else:
        json_path = default_json_path
    
    if not json_path.exists():
        print(f"Error: JSON file not found at {json_path}")
        print(f"Usage: python scripts/import_rent_expenses.py [path_to_json_file]")
        sys.exit(1)
    
    import_rent_expenses(json_path)
