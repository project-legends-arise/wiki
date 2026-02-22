import os

BASE = r"c:\Users\vince\Documents\GitHub\wiki"

# Fix double-encoded UTF-8 e-acute in affected files
# The bug: \xc3\xa9 in a Python str gets UTF-8 encoded to \xc3\x83\xc2\xa9
# Correct: should be \xc3\xa9 (UTF-8 for U+00E9 e-acute)
DOUBLE_ENCODED = b'\xc3\x83\xc2\xa9'
CORRECT = b'\xc3\xa9'

files_to_fix = [
    r"Locations\Landmarks\Rapidash_Ranch.html",
    r"Locations\Cities\Veilstone.html",
    r"Locations\Dungeons\Veilstain.html",
]

for rel in files_to_fix:
    path = os.path.join(BASE, rel)
    with open(path, 'rb') as f:
        data = f.read()
    
    count = data.count(DOUBLE_ENCODED)
    if count > 0:
        data = data.replace(DOUBLE_ENCODED, CORRECT)
        with open(path, 'wb') as f:
            f.write(data)
        print("{}: Fixed {} double-encoded e-acute(s)".format(rel, count))
    else:
        print("{}: No double-encoding found".format(rel))

print("Done!")
