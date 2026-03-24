import json
import re
import os
from pathlib import Path
from typing import Dict, List, Optional

class PortalRegistryService:
    _instance = None
    _data = None

    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(PortalRegistryService, cls).__new__(cls)
            cls._instance._load_registry()
        return cls._instance

    def _load_registry(self):
        registry_path = Path(__file__).parent.parent / "data" / "portal_registry.json"
        try:
            with open(registry_path, "r", encoding="utf-8") as f:
                self._data = json.load(f)
            # Sanity checks
            required_keys = ["urn_patterns", "timeline_buffers", "states", "national"]
            for key in required_keys:
                if key not in self._data:
                    raise ValueError(f"Portal Registry missing required key: {key}")
            
            print(f"[OK] Portal Registry loaded successfully.")
            print(f"   States: {len(self._data['states'])}")
            print(f"   URN Patterns: {len(self._data['urn_patterns'])}")
            print(f"   Timeline Buffers: {len(self._data['timeline_buffers'])}")

        except Exception as e:
            print(f"[ERROR] FAILED to load Portal Registry: {str(e)}")
            # Fail fast as requested
            raise SystemExit(1)

    def get_state_code_by_city(self, job_city: str) -> Optional[str]:
        if not job_city:
            return None
        
        for state_code, state_info in self._data["states"].items():
            cities = [c.lower() for c in state_info.get("job_cities", [])]
            if job_city.lower() in cities:
                return state_code
        return None

    def get_portal_by_city(self, job_city: str) -> Dict:
        state_code = self.get_state_code_by_city(job_city)
        if state_code:
            state_info = self._data["states"][state_code]
            return {
                "state_code": state_code,
                "portals": state_info.get("portals", {}),
                "pattern": state_info.get("pattern", "generic")
            }
        
        # Fallback to national portals
        return {
            "state_code": None,
            "portals": self._data["national"]["identity_portals"],
            "pattern": "national"
        }

    def get_timeline(self, task_type: str) -> Dict:
        return self._data["timeline_buffers"].get(task_type, {
            "first_followup_days": self._data["meta"]["default_timeline_days"]["medium"],
            "second_followup_days": self._data["meta"]["default_timeline_days"]["long"]
        })

    def get_prerequisites(self, task_type: str, state_code: Optional[str]) -> List[str]:
        all_prereqs = []
        
        # 1. Look for state-specific prerequisites for this task type
        if state_code and state_code in self._data["states"]:
            state_info = self._data["states"][state_code]
            # Some tasks have specific entries in the state object (like 'domicile', 'rent')
            if task_type in state_info:
                prereq_keys = state_info[task_type].get("prerequisites", [])
                for key in prereq_keys:
                    all_prereqs.extend(self._data["prerequisite_tags"].get(key, [key]))
            
        # 2. General fallback/defaults if needed
        if not all_prereqs:
            # Add logic here for generic task types if needed
            pass
            
        return list(set(all_prereqs))

    def get_urn_pattern(self, urn_key: str) -> Dict:
        return self._data["urn_patterns"].get(urn_key, {
            "regex": "\\b[A-Z0-9\\-]{8,20}\\b",
            "label_keywords": ["Reference No"]
        })

    def get_rent_info(self, state_code: str) -> Dict:
        if state_code and state_code in self._data["states"]:
            state_info = self._data["states"][state_code]
            return state_info.get("rent", {
                "online_primary": None,
                "offline_fallback": {"enabled": False, "notes": "Check local RTO/Registrar office."}
            })
        return {
            "online_primary": None, 
            "offline_fallback": {"enabled": False, "notes": "No state-specific rent info available."}
        }

    def get_portal_url_by_keyword(self, title: str, state_code: Optional[str] = None) -> Optional[str]:
        """Attempt to find a relevant portal URL by matching keywords in the title."""
        title_lower = title.lower()
        
        # 1. State-specific match
        if state_code and state_code in self._data["states"]:
            state_info = self._data["states"][state_code]
            portals = state_info.get("portals", {})
            for p_key, p_obj in portals.items():
                p_name = p_obj.get("name", p_key).lower()
                p_url = p_obj.get("url_home")
                if p_url and (p_name in title_lower or p_url.lower() in title_lower):
                    return p_url
            
            # Special markers for state-specific common docs
            if state_code == "MH" and ("domicile" in title_lower or "income" in title_lower or "certificate" in title_lower):
                # Look for Aaple Sarkar in MH portals
                for p_obj in portals.values():
                    if "Aaple Sarkar" in p_obj.get("name", ""):
                        return p_obj.get("url_home")
            if state_code == "KA" and ("domicile" in title_lower or "caste" in title_lower or "certificate" in title_lower or "nadakacheri" in title_lower):
                for p_obj in portals.values():
                    if "Seva Sindhu" in p_obj.get("name", ""):
                        return p_obj.get("url_home")
            if state_code == "KL" and ("certificate" in title_lower or "edistrict" in title_lower):
                for p_obj in portals.values():
                    if "eDistrict Kerala" in p_obj.get("name", ""):
                        return p_obj.get("url_home")

        # 2. National matches
        national_portals = self._data["national"]["identity_portals"]
        for p_name, p_data in national_portals.items():
            if p_name.lower() in title_lower:
                # Some are nested objects (uidai: {uidai_home: ...}), some are strings
                if isinstance(p_data, dict):
                    return p_data.get("uidai_home") or p_data.get("member_portal") or p_data.get("nsdl_home") or p_data.get("url_home")
                return p_data
                
        return None

    def extract_urn(self, text: str, urn_key: str) -> Optional[str]:
        pattern_info = self.get_urn_pattern(urn_key)
        regex_str = pattern_info["regex"]

        # Primary: Look for keyword followed by pattern
        for keyword in pattern_info.get("label_keywords", []):
            # Case insensitive search for keyword
            kw_match = re.search(re.escape(keyword), text, re.IGNORECASE)
            if kw_match:
                # Look for the regex in the text FOLLOWING the keyword (next 100 chars)
                after_text = text[kw_match.end():kw_match.end()+100]
                regex_match = re.search(regex_str, after_text)
                if regex_match:
                    return regex_match.group(0)

        # Fallback: Just look for the pattern anywhere
        regex_match = re.search(regex_str, text)
        if regex_match:
            return regex_match.group(0)

        return None

    def get_regional_office(self, portal_type: str, state_code: Optional[str]) -> Optional[Dict]:
        """
        Get regional office information for a specific portal type and state.

        Args:
            portal_type: 'epfo' or 'esic'
            state_code: Two-letter state code (e.g., 'mh', 'ka', 'tn')

        Returns:
            Dictionary with regional office info (name, address, phone) or None if not found
        """
        if not state_code:
            return None

        # Normalize state code to lowercase
        state_code = state_code.lower()

        # Look in national identity portals section
        national_portals = self._data.get("national", {}).get("identity_portals", {})

        if portal_type in national_portals:
            portal_data = national_portals[portal_type]
            regional_offices = portal_data.get("regional_offices", {})

            if state_code in regional_offices:
                return regional_offices[state_code]

        return None

# Global instance
registry = PortalRegistryService()
