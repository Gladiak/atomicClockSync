"""Explicit Casio time profiles; advertising names do not certify a module.

Capability reference: izivkov/gshock_api f15ba343f8b805ee209c1c30dab8fc9e82a52995
(MIT, see LICENSE.gshock-api.txt). Unknown watches can only use the dedicated
current-time service, never a guessed full-protocol profile.
"""
from dataclasses import dataclass
import re


@dataclass(frozen=True)
class Profile:
    model: str
    driver: str = "standard"
    cities: int = 2
    states: int = 1
    city_register: int = 0x1F
    second_dial: bool = False
    module: str = ""
    verified: bool = False
    instructions: str = "manual"
    prefer_current_time: bool = False

    @property
    def reads(self):
        return (tuple(bytes([0x1D, index * 2]) for index in range(self.states)) +
                tuple(bytes([0x1E, index]) for index in range(self.cities)) +
                (tuple(bytes([self.city_register, index]) for index in range(self.cities))
                 if self.city_register else ()))


PROFILES = {}


def register(names, **options):
    for name in names.split():
        PROFILES[name] = Profile(name, **options)


register("GA-B2100", module="5689", verified=True, instructions="ga")
register("GWG-B1000", cities=6, states=3, module="5713", instructions="gwg")
register("GMW-B5000 GW-B5000 GW-B5600 MRG-B5000 DW-B5600 GCW-B5000 TRN-50 PRJ-BW002 GWR-B1000 GWR-B3000",
         cities=6, states=3)
register("GM-B2100 GBM-2100 MRG-B2100 GMC-B2100 GA-B001 GA-B010 GBA-400 GBA-800 GBA-900 GBA-950 "
         "GST-B100 GST-B200 GST-B300 GST-B400 GST-B500 GST-B600 GST-W1000 MSG-B100 "
         "G-B001 PRJ-B001 GPR-B1000 GPR-H1000 DW-H5600 DW-GH5600 GM-H5600 GBD-H2000 "
         "GSR-H1000 GD-B500 GWF-300 ECB-10 ECB-20 ECB-30 ECB-40 ECB-500 ECB-800 ECB-900 ECB-950 "
         "ECB-S10 ECB-S100 ECB-2000 ECB-2200 ECB-2300 STB-1000 SHB-100 SHB-200 GPW-2000 GPW-G2000 "
         "MRG-G2000 MRG-B1000 MRG-B2000 MRG-BF1000 LIW-B1000 GWF-A1000 GR-B100 GR-B200 GR-B300 "
         "GG-B100 GG-B100X GMC-B100 GMA-B800 GMD-B300 PRT-B50 PRT-B70 PRW-B1000 WS-B1000 "
         "OCW-G2000 OCW-S400 OCW-S4000 OCW-S5000 OCW-S6000 OCW-S7000 OCW-SG1000 OCW-T200 OCW-T3000 "
         "OCW-T4000 OCW-T5000 OCW-T6000 OCW-B1200 OCW-B1300 OCW-B1400 OCW-P2000 OCW-P3000 OCW-5700 OCW-5800 "
         "MTG-B2000 MTG-B4000")
# Casio's GST-B1000D support page links module 5748. Upstream also lists 5631,
# which is GST-B300, not evidence of a GST-B1000 variant. Its standard full
# profile is still unverified. Prefer a writable dedicated time service when
# exposed, especially in the short C-button time-correction mode.
register("GST-B1000", module="5748", instructions="gst", prefer_current_time=True)
register("GBD-800 GMD-B800 GBD-100 GBD-200 GBD-300 GBX-100 GBD-H1000 GBX-H5600 GDG-B100 "
         "ABL-100 ABL-100WE F-B100W BSA-B100 EQB-500 EQB-501 EQB-510 EQB-600 EQB-700 EQB-800 "
         "EQB-900 EQB-1000 EQB-1100 EQB-1200 EQB-1300 EQB-2000", city_register=0)
register("MTG-B1000", driver="analogue", cities=6, states=3, second_dial=True)
register("MTG-B3000 MTG-B3100", driver="analogue", city_register=0x24, second_dial=True)
register("GW-BX5600 GMW-BZ5000", driver="mip", cities=6, states=3)


def clean_name(name):
    return re.sub(r"^CASIO\s+", "", name.strip().upper()) if isinstance(name, str) else ""


def excluded(name):
    return clean_name(name).startswith(("GSW-", "WSD-"))


def resolve(name):
    clean = clean_name(name)
    # Longest match avoids GST-B100 / GST-B1000 and similar collisions. Case
    # suffixes are letters, a hyphen or '#'; unknown numeric model extensions
    # must not inherit an unrelated model's configuration layout.
    for model in sorted(PROFILES, key=len, reverse=True):
        if clean == model or (clean.startswith(model) and
                             re.fullmatch(r"(?:[A-Z#][A-Z0-9#-]*|-[A-Z0-9#-]+)", clean[len(model):])):
            return PROFILES[model]
    return None


def discoverable(name):
    return not excluded(name) and (resolve(name) is not None or
           isinstance(name, str) and bool(re.fullmatch(r"CASIO\s+[A-Z0-9#-]{3,60}", name.strip(), re.I)))


def metadata(name):
    profile = resolve(name)
    return {"model": profile.model if profile else clean_name(name),
            "module": profile.module if profile else "",
            "verified": bool(profile and profile.verified),
            "instructions": profile.instructions if profile else "manual"}
