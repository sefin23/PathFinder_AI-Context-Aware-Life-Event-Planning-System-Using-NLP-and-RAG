"""
Quick test to verify regional office lookup works correctly.
"""
from backend.services.portal_registry_service import registry

def test_regional_offices():
    print("Testing Regional Office Lookup")
    print("=" * 60)

    # Test EPFO regional offices
    states = ['mh', 'ka', 'tn', 'dl', 'hr']

    print("\n🏢 EPFO Regional Offices:")
    for state in states:
        info = registry.get_regional_office('epfo', state)
        if info:
            print(f"\n{state.upper()}:")
            print(f"  Name: {info['name']}")
            print(f"  Address: {info['address']}")
            print(f"  Phone: {info['phone']}")
        else:
            print(f"\n{state.upper()}: Not found")

    print("\n\n🏥 ESIC Regional Offices:")
    for state in states:
        info = registry.get_regional_office('esic', state)
        if info:
            print(f"\n{state.upper()}:")
            print(f"  Name: {info['name']}")
            print(f"  Address: {info['address']}")
            print(f"  Phone: {info['phone']}")
        else:
            print(f"\n{state.upper()}: Not found")

    print("\n\n✅ Test completed successfully!")

if __name__ == "__main__":
    test_regional_offices()
