"""Stage a draft, or explicitly refresh an existing published release in place."""
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
replace_published = os.environ.get('REPLACE_PUBLISHED_RELEASE') == '1'
if release['tagName'] != tag or (not release['isDraft'] and not replace_published):
    raise SystemExit('Published releases require explicit REPLACE_PUBLISHED_RELEASE=1.')
prefix = 'AtomicClockSync-' + version
names = {prefix + suffix for suffix in (
    '-arm64-mac.zip', '-windows-x64-portable.exe', '-linux-x86_64.AppImage',
    '-linux-amd64.deb', '-linux-x86_64.rpm')}
files = {file.name for file in Path('release').iterdir() if file.is_file()}
if files != names | {'SHA256SUMS.txt'}:
    raise SystemExit('Expected exactly five individual packages and checksum manifest.')
checksums = {}
for line in Path('release/SHA256SUMS.txt').read_text().splitlines():
    digest, name = line.split('  ', 1)
    if name not in names or name in checksums:
        raise SystemExit('Unexpected or duplicate checksum entry: ' + name)
    actual = hashlib.sha256()
    with Path('release', name).open('rb') as stream:
        for chunk in iter(lambda: stream.read(1024 * 1024), b''):
            actual.update(chunk)
    if actual.hexdigest() != digest:
        raise SystemExit('Checksum mismatch: ' + name)
    checksums[name] = digest
if set(checksums) != names:
    raise SystemExit('Checksum manifest must cover all five platform packages.')
subprocess.run(['gh', 'release', 'upload', tag, *[str(Path('release', name)) for name in sorted(names)],
                '--clobber'], check=True)
subprocess.run(['gh', 'release', 'upload', tag, 'release/SHA256SUMS.txt', '--clobber'], check=True)
if replace_published and not release['isDraft']:
    subprocess.run(['gh', 'release', 'edit', tag, '--notes-file', 'docs/RELEASE_CURRENT.md'], check=True)
    print('Existing published release refreshed with five packages, checksums and notes.')
else:
    print('All five packages and checksums staged; release remains a draft.')
