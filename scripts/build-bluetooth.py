"""Create a self-contained local BLE worker, including dependency notices."""
import importlib.metadata
import hashlib
import json
from pathlib import Path
import shutil
import subprocess
import sys

root = Path(__file__).resolve().parent.parent
platform, arch = sys.argv[1:]
target = root / "build" / "bluetooth" / f"{platform}-{arch}"
target.mkdir(parents=True, exist_ok=True)
subprocess.run([
    sys.executable, "-m", "PyInstaller", "--noconfirm", "--clean", "--onedir",
    "--name", "atomic-bluetooth", "--collect-submodules", "bleak", "--copy-metadata", "bleak",
    "--distpath", str(target), "--workpath", str(root / "build/bluetooth/work" / f"{platform}-{arch}"),
    "--specpath", str(root / "build/bluetooth"), str(root / "bluetooth/helper.py"),
], check=True)
output = target / "atomic-bluetooth"
(output / 'build-info.json').write_text(json.dumps({
    'platform': platform, 'arch': arch,
    'sources': {name: hashlib.sha256((root / 'bluetooth' / name).read_bytes()).hexdigest()
                for name in sorted([file.name for file in (root / 'bluetooth').glob('*.py')] + ['requirements.txt'])},
}))
notices = output / "THIRD_PARTY_LICENSES"
notices.mkdir(exist_ok=True)
shutil.copy2(root / "bluetooth/LICENSE.gshock-api.txt", notices / "gshock-api.txt")
# Include notices for installed runtime dependencies (including Python bridges).
for distribution in importlib.metadata.distributions():
    for file in distribution.files or []:
        if any(part.lower().startswith(("license", "copying", "copyright")) for part in file.parts):
            source = Path(distribution.locate_file(file))
            if source.is_file():
                destination = notices / distribution.metadata["Name"] / file.name
                destination.parent.mkdir(exist_ok=True)
                shutil.copy2(source, destination)
executable = output / ("atomic-bluetooth.exe" if platform == "win32" else "atomic-bluetooth")
subprocess.run([str(executable), "--self-test"], check=True)
print(f"Bluetooth worker ready: {output}")
