# Casio Bluetooth time profiles

This is the explicit model catalogue from `bluetooth/models.py`. Case/strap suffixes
are accepted after a known model; unknown numeric model extensions do not inherit
a profile. Modules are shown only where identified for the user’s watches.
See [procedure limits and hardware evidence](BLUETOOTH.md).

**Physically reported:** GA-B2100C / 5689, GWG-B1000 / 5713 and GST-B1000 / 5748, macOS. All other entries await a watch test.
**Excluded:** Wear OS (GSW/WSD). Unknown/older Casio models may use only an actual
dedicated current-time service, not an inferred full-protocol sequence.

| Model | Module | Full procedure | City slots | Physical time update |
| --- | --- | --- | --- | --- |
| ABL-100 | — | Standard without city names | 2 | Pending |
| ABL-100WE | — | Standard without city names | 2 | Pending |
| BSA-B100 | — | Standard without city names | 2 | Pending |
| DW-B5600 | — | Standard | 6 | Pending |
| DW-GH5600 | — | Standard | 2 | Pending |
| DW-H5600 | — | Standard | 2 | Pending |
| ECB-10 | — | Standard | 2 | Pending |
| ECB-20 | — | Standard | 2 | Pending |
| ECB-2000 | — | Standard | 2 | Pending |
| ECB-2200 | — | Standard | 2 | Pending |
| ECB-2300 | — | Standard | 2 | Pending |
| ECB-30 | — | Standard | 2 | Pending |
| ECB-40 | — | Standard | 2 | Pending |
| ECB-500 | — | Standard | 2 | Pending |
| ECB-800 | — | Standard | 2 | Pending |
| ECB-900 | — | Standard | 2 | Pending |
| ECB-950 | — | Standard | 2 | Pending |
| ECB-S10 | — | Standard | 2 | Pending |
| ECB-S100 | — | Standard | 2 | Pending |
| EQB-1000 | — | Standard without city names | 2 | Pending |
| EQB-1100 | — | Standard without city names | 2 | Pending |
| EQB-1200 | — | Standard without city names | 2 | Pending |
| EQB-1300 | — | Standard without city names | 2 | Pending |
| EQB-2000 | — | Standard without city names | 2 | Pending |
| EQB-500 | — | Standard without city names | 2 | Pending |
| EQB-501 | — | Standard without city names | 2 | Pending |
| EQB-510 | — | Standard without city names | 2 | Pending |
| EQB-600 | — | Standard without city names | 2 | Pending |
| EQB-700 | — | Standard without city names | 2 | Pending |
| EQB-800 | — | Standard without city names | 2 | Pending |
| EQB-900 | — | Standard without city names | 2 | Pending |
| F-B100W | — | Standard without city names | 2 | Pending |
| G-B001 | — | Standard | 2 | Pending |
| GA-B001 | — | Standard | 2 | Pending |
| GA-B010 | — | Standard | 2 | Pending |
| GA-B2100 | 5689 | Standard | 2 | Reported GA-B2100C on macOS |
| GBA-400 | — | Standard | 2 | Pending |
| GBA-800 | — | Standard | 2 | Pending |
| GBA-900 | — | Standard | 2 | Pending |
| GBA-950 | — | Standard | 2 | Pending |
| GBD-100 | — | Standard without city names | 2 | Pending |
| GBD-200 | — | Standard without city names | 2 | Pending |
| GBD-300 | — | Standard without city names | 2 | Pending |
| GBD-800 | — | Standard without city names | 2 | Pending |
| GBD-H1000 | — | Standard without city names | 2 | Pending |
| GBD-H2000 | — | Standard | 2 | Pending |
| GBM-2100 | — | Standard | 2 | Pending |
| GBX-100 | — | Standard without city names | 2 | Pending |
| GBX-H5600 | — | Standard without city names | 2 | Pending |
| GCW-B5000 | — | Standard | 6 | Pending |
| GD-B500 | — | Standard | 2 | Pending |
| GDG-B100 | — | Standard without city names | 2 | Pending |
| GG-B100 | — | Standard | 2 | Pending |
| GG-B100X | — | Standard | 2 | Pending |
| GM-B2100 | — | Standard | 2 | Pending |
| GM-H5600 | — | Standard | 2 | Pending |
| GMA-B800 | — | Standard | 2 | Pending |
| GMC-B100 | — | Standard | 2 | Pending |
| GMC-B2100 | — | Standard | 2 | Pending |
| GMD-B300 | — | Standard | 2 | Pending |
| GMD-B800 | — | Standard without city names | 2 | Pending |
| GMW-B5000 | — | Standard | 6 | Pending |
| GMW-BZ5000 | — | SP/MIP, complete snapshots required | 6 | Pending |
| GPR-B1000 | — | Standard | 2 | Pending |
| GPR-H1000 | — | Standard | 2 | Pending |
| GPW-2000 | — | Standard | 2 | Pending |
| GPW-G2000 | — | Standard | 2 | Pending |
| GR-B100 | — | Standard | 2 | Pending |
| GR-B200 | — | Standard | 2 | Pending |
| GR-B300 | — | Standard | 2 | Pending |
| GSR-H1000 | — | Standard | 2 | Pending |
| GST-B100 | — | Standard | 2 | Pending |
| GST-B1000 (including GST-B1000D) | 5748 | Dedicated current-time service preferred; no city-name register in full mode | 2 zone records | User-confirmed time update (macOS) |
| GST-B200 | — | Standard | 2 | Pending |
| GST-B300 | — | Standard | 2 | Pending |
| GST-B400 | — | Standard | 2 | Pending |
| GST-B500 | — | Standard | 2 | Pending |
| GST-B600 | — | Standard | 2 | Pending |
| GST-W1000 | — | Standard | 2 | Pending |
| GW-B5000 | — | Standard | 6 | Pending |
| GW-B5600 | — | Standard | 6 | Pending |
| GW-BX5600 | — | SP/MIP, complete snapshots required | 6 | Pending |
| GWF-300 | — | Standard | 2 | Pending |
| GWF-A1000 | — | Standard | 2 | Pending |
| GWG-B1000 | 5713 | Standard | 2 | User-confirmed time update (macOS) |
| GWR-B1000 | — | Standard | 6 | Pending |
| GWR-B3000 | — | Standard | 6 | Pending |
| LIW-B1000 | — | Standard | 2 | Pending |
| MRG-B1000 | — | Standard | 2 | Pending |
| MRG-B2000 | — | Standard | 2 | Pending |
| MRG-B2100 | — | Standard | 2 | Pending |
| MRG-B5000 | — | Standard | 6 | Pending |
| MRG-BF1000 | — | Standard | 2 | Pending |
| MRG-G2000 | — | Standard | 2 | Pending |
| MSG-B100 | — | Standard | 2 | Pending |
| MTG-B1000 | — | Analogue + second dial | 6 | Pending |
| MTG-B2000 | — | Standard | 2 | Pending |
| MTG-B3000 | — | Analogue + second dial | 2 | Pending |
| MTG-B3100 | — | Analogue + second dial | 2 | Pending |
| MTG-B4000 | — | Standard | 2 | Pending |
| OCW-5700 | — | Standard | 2 | Pending |
| OCW-5800 | — | Standard | 2 | Pending |
| OCW-B1200 | — | Standard | 2 | Pending |
| OCW-B1300 | — | Standard | 2 | Pending |
| OCW-B1400 | — | Standard | 2 | Pending |
| OCW-G2000 | — | Standard | 2 | Pending |
| OCW-P2000 | — | Standard | 2 | Pending |
| OCW-P3000 | — | Standard | 2 | Pending |
| OCW-S400 | — | Standard | 2 | Pending |
| OCW-S4000 | — | Standard | 2 | Pending |
| OCW-S5000 | — | Standard | 2 | Pending |
| OCW-S6000 | — | Standard | 2 | Pending |
| OCW-S7000 | — | Standard | 2 | Pending |
| OCW-SG1000 | — | Standard | 2 | Pending |
| OCW-T200 | — | Standard | 2 | Pending |
| OCW-T3000 | — | Standard | 2 | Pending |
| OCW-T4000 | — | Standard | 2 | Pending |
| OCW-T5000 | — | Standard | 2 | Pending |
| OCW-T6000 | — | Standard | 2 | Pending |
| PRJ-B001 | — | Standard | 2 | Pending |
| PRJ-BW002 | — | Standard | 6 | Pending |
| PRT-B50 | — | Standard | 2 | Pending |
| PRT-B70 | — | Standard | 2 | Pending |
| PRW-B1000 | — | Standard | 2 | Pending |
| SHB-100 | — | Standard | 2 | Pending |
| SHB-200 | — | Standard | 2 | Pending |
| STB-1000 | — | Standard | 2 | Pending |
| TRN-50 | — | Standard | 6 | Pending |
| WS-B1000 | — | Standard | 2 | Pending |

129 explicit model entries. This count is registry coverage, not a count of
hardware-certified models. Every family can also use the dedicated current-time
adapter when that service is exposed in the selected connection mode.

Capability reference: [gshock_api, pinned MIT source](https://github.com/izivkov/gshock_api/tree/f15ba343f8b805ee209c1c30dab8fc9e82a52995).
GWG-B1000 / 5713 connection instructions: [official Casio manual](https://www.casio.com/content/dam/casio/global/support/manuals/watches/pdf/57/5713/qw5713_EN.pdf).
