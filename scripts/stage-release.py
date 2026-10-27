"""Stage this exact build in an existing draft; never publish a release."""
from pathlib import Path
import hashlib
import json
import os
import subprocess


def output(*args):
    return subprocess.check_output(args, text=True).strip()


root = Path(__file__).resolve().parent.parent
os.chdir(root)
version = json.loads(Path('package.json').read_text())['version']
tag = os.environ['RELEASE_TAG']
if tag != 'v' + version:
    raise SystemExit('Release tag must match package.json version.')
if output('git', 'rev-parse', tag + '^{}') != output('git', 'rev-parse', 'HEAD'):
    raise SystemExit('Release tag must point to the exact workflow commit.')
release = json.loads(output('gh', 'release', 'view', tag, '--json', 'isDraft,tagName'))
if not release['isDraft'] or release['tagName'] != tag:
    raise SystemExit('Only an existing matching draft release can be updated.')
prefix = 'AtomicClockSync-' + version
names = {prefix + suffix for suffix in (
    '-arm64-mac.zip', '-windows-x64-portable.exe', '-linux-x86_64.AppImage',
    '-linux-amd64.deb', '-linux-x86_64.rpm')}
files = {file.name for file in Path('release').iterdir() if file.is_file()}
if files != names | {'SHA256SUMS.txt'}:
    raise SystemExit('Expected exactly five individual packages and checksum manifest.')
for line in Path('release/SHA256SUMS.txt').read_text().splitlines():
    digest, name = line.split('  ', 1)
    if name not in names or hashlib.sha256(Path('release', name).read_bytes()).hexdigest() != digest:
        raise SystemExit('Checksum mismatch: ' + name)
subprocess.run(['gh', 'release', 'upload', tag, *[str(Path('release', name)) for name in sorted(names)],
                'release/SHA256SUMS.txt', '--clobber'], check=True)
print('All five packages and checksums staged; release remains a draft.')
