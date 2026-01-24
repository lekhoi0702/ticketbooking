"""
Test script to verify advertisement routes are working
"""
import sys
import os

# Add parent directory to path
sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

try:
    print("Testing imports...")
    from app import create_app
    
    print("✓ create_app imported successfully")
    
    app = create_app()
    print(f"✓ App created successfully")
    print(f"✓ Total blueprints: {len(app.blueprints)}")
    print(f"✓ Registered blueprints: {list(app.blueprints.keys())}")
    
    # Check if advertisement blueprint is registered
    if 'advertisement' in app.blueprints:
        print("✓ Advertisement blueprint is registered!")
        bp = app.blueprints['advertisement']
        print(f"  - URL prefix: {bp.url_prefix}")
        print(f"  - Routes: {[rule.rule for rule in app.url_map.iter_rules() if 'advertisement' in rule.endpoint]}")
    else:
        print("✗ Advertisement blueprint NOT registered!")
        
    print("\nAll registered routes:")
    for rule in app.url_map.iter_rules():
        if '/api/' in rule.rule:
            print(f"  {rule.rule} -> {rule.endpoint}")
    
except Exception as e:
    print(f"✗ Error: {e}")
    import traceback
    traceback.print_exc()
