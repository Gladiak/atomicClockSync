from pathlib import Path
import hashlib
import json

root = Path(__file__).resolve().parents[1]
release = root / 'release'
metadata = json.loads((root / 'package.json').read_text())
prefix = f"{metadata['build']['productName']}-{metadata['version']}"
# Only individual current-version platform packages belong in the manifest.
patterns = ('*-mac.zip', 'windows-*-portable.exe', 'linux-*.AppImage', 'linux-*.deb', 'linux-*.rpm')
packages = sorted({file for pattern in patterns
                   for file in release.glob(f'{prefix}-{pattern}') if file.is_file()})
if not packages:
    raise SystemExit('No current-version platform packages found in release/.')

lines = []
for file in packages:
    digest = hashlib.sha256()
    with file.open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            digest.update(chunk)
    lines.append(f'{digest.hexdigest()}  {file.name}\n')

temporary = release / 'SHA256SUMS.txt.tmp'
temporary.write_text(''.join(lines), encoding='utf-8')
temporary.replace(release / 'SHA256SUMS.txt')
print(f'Created SHA256SUMS.txt for {len(packages)} individual platform packages.')
