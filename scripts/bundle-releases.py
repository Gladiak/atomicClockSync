from pathlib import Path
import hashlib, json, struct, zipfile

root = Path(__file__).resolve().parents[1]
release = root / 'release'
version = json.loads((root / 'package.json').read_text())['version']
mac = release / f'Atomic Clock Sync-{version}-arm64-mac.zip'
windows = release / f'Atomic Clock Sync-{version}-windows-x64-portable.exe'
assert mac.is_file() and windows.is_file()
with zipfile.ZipFile(mac) as archive:
    assert archive.testzip() is None, 'Invalid macOS archive'
with windows.open('rb') as stream:
    header = stream.read(64)
    assert header[:2] == b'MZ'
    stream.seek(struct.unpack_from('<I', header, 0x3c)[0])
    assert stream.read(4) == b'PE\0\0', 'Invalid portable executable'
payloads = [(mac, 'macOS/' + mac.name), (windows, 'Windows/' + windows.name)]
digests = {name: hashlib.sha256(file.read_bytes()).hexdigest() for file, name in payloads}
readme = f"""ATOMIC CLOCK SYNC {version}

CONTENTS
macOS/: app for Apple Silicon Macs (arm64), supplied as a ZIP archive.
Windows/: portable Windows x64 executable; no installation required.

GETTING STARTED
Mac: extract the ZIP in macOS/ and open Atomic Clock Sync.app or copy it to
Applications. Quit the previous version with Cmd+Q before opening the new one.
Windows: extract the executable in Windows/ and run it.
Node.js is not required to use the packaged apps.

LOCAL DATA
Profiles, preferences, trial history and personal keepsakes are stored
in the local user profile.
Portable means installation-free; settings are not stored inside the EXE.

VALIDATION
The macOS app has a local ad-hoc signature and is not notarized.
The Windows app is unsigned. Its package contents have been verified,
but it has not been run on a Windows system.
SHA256SUMS.txt lists the two package hashes with relative paths.
"""
bundle = release / f'Atomic Clock Sync-{version}-macOS-Windows.zip'
temporary = bundle.with_suffix('.zip.tmp')
with zipfile.ZipFile(temporary, 'w', compression=zipfile.ZIP_STORED) as archive:
    for file, name in payloads:
        archive.write(file, name)
    archive.writestr('README.txt', readme)
    archive.writestr('SHA256SUMS.txt', ''.join(f'{digest}  {name}\n' for name, digest in digests.items()))
with zipfile.ZipFile(temporary) as archive:
    assert archive.testzip() is None
    assert set(archive.namelist()) == {name for _, name in payloads} | {'README.txt', 'SHA256SUMS.txt'}
    for name, digest in digests.items():
        assert hashlib.sha256(archive.read(name)).hexdigest() == digest
    with zipfile.ZipFile(mac) as mac_archive:
        import plistlib
        info = plistlib.loads(mac_archive.read('Atomic Clock Sync.app/Contents/Info.plist'))
        assert info['CFBundleShortVersionString'] == version
        assert hashlib.sha256(mac_archive.read('Atomic Clock Sync.app/Contents/Resources/app.asar')).digest() == hashlib.sha256((release / 'mac-arm64/Atomic Clock Sync.app/Contents/Resources/app.asar').read_bytes()).digest()
temporary.replace(bundle)
# Linux packages are published separately; do not wrap AppImages in another ZIP.
linux = [release / f'Atomic Clock Sync-{version}-linux-{arch}.{ext}'
         for arch, ext in [('x86_64', 'AppImage'), ('amd64', 'deb')]]
packages = [mac, windows, bundle] + [file for file in linux if file.is_file()]
(release / 'SHA256SUMS.txt').write_text(''.join(f'{hashlib.sha256(file.read_bytes()).hexdigest()}  {file.name}\n' for file in packages))
print(f'Created and verified: {bundle.name} ({bundle.stat().st_size / 1024**2:.1f} MiB)')
print('Contents:')
with zipfile.ZipFile(bundle) as archive:
    for info in archive.infolist(): print(f'  {info.filename}: {info.file_size:,} bytes')
