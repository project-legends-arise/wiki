import os, re

BASE = r"c:\Users\vince\Documents\GitHub\wiki"

def readf(rel):
    with open(os.path.join(BASE, rel), 'rb') as f:
        return f.read()

def writef(rel, data):
    with open(os.path.join(BASE, rel), 'wb') as f:
        f.write(data)

def to_bytes(s):
    return s.encode('utf-8')

# Fix Veilstain: insert back the missing trainers section + Western complex header
d = readf(r"Locations\Dungeons\Veilstain.html")

# Find the position after the wild spawns closing </div>
# Currently: ...wild spawns...</table>\r\n</div>\r\n\r\n<h2>Trivia</h2>
# We need to insert before <h2>Trivia</h2>

insert_marker = b'<h2>Trivia</h2>'
pos = d.find(insert_marker)
if pos == -1:
    print("ERROR: Could not find <h2>Trivia</h2>")
else:
    new_content = to_bytes(
        '\r\n<h3>Western complex</h3>\r\n'
        '\r\n'
        '<h2>Trainers</h2>\r\n'
        '<h3>Eastern complex</h3>\r\n'
        '\r\n'
        '<div class="tcontainer">\r\n'
        '<table class="trainers round gray border-bold" data-wiki-table="trainers">\r\n'
        '<tr data-trainer="Roughneck" data-trainer-name="Roughneck Devid"\r\n'
        '    data-pokemon="0559" data-pkmn-name="Scraggy" data-pkmn-type="fighting,dark"\r\n'
        '    data-pkmn-level="13" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0532" data-pkmn-name-2="Timburr" data-pkmn-type-2="fighting"\r\n'
        '    data-pkmn-level-2="14" data-pkmn-item-2="None"></tr>\r\n'
        '<tr data-trainer="Punkster_F" data-trainer-name="Punkster Myrta"\r\n'
        '    data-pokemon="0543" data-pkmn-name="Venipede" data-pkmn-type="bug,poison"\r\n'
        '    data-pkmn-level="12" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0088" data-pkmn-name-2="Grimer" data-pkmn-type-2="poison"\r\n'
        '    data-pkmn-level-2="13" data-pkmn-item-2="None"></tr>\r\n'
        '<tr data-trainer="Worker" data-trainer-name="Janitor Kurt"\r\n'
        '    data-pokemon="0568" data-pkmn-name="Trubbish" data-pkmn-type="poison"\r\n'
        '    data-pkmn-level="12" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0422" data-pkmn-name-2="Shellos" data-pkmn-type-2="water,ground"\r\n'
        '    data-pkmn-level-2="14" data-pkmn-item-2="None"></tr>\r\n'
        '<tr data-trainer="Punkster_M" data-trainer-name="Punkster Leroy"\r\n'
        '    data-pokemon="0109" data-pkmn-name="Koffing" data-pkmn-type="poison"\r\n'
        '    data-pkmn-level="14" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0559" data-pkmn-name-2="Scraggy" data-pkmn-type-2="fighting,dark"\r\n'
        '    data-pkmn-level-2="13" data-pkmn-item-2="None"\r\n'
        '    data-pokemon-3="0532" data-pkmn-name-3="Timburr" data-pkmn-type-3="fighting"\r\n'
        '    data-pkmn-level-3="13" data-pkmn-item-3="None"></tr>\r\n'
        '</table>\r\n'
        '</div>\r\n\r\n')
    
    d = d[:pos] + new_content + d[pos:]
    writef(r"Locations\Dungeons\Veilstain.html", d)
    print("Veilstain: Inserted trainers section + Western complex header")
    print("Done!")
