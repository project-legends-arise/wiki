import os, re, sys

BASE = r"c:\Users\vince\Documents\GitHub\wiki"
NL = b'\r\n'

def readf(rel):
    with open(os.path.join(BASE, rel), 'rb') as f:
        return f.read()

def writef(rel, data):
    with open(os.path.join(BASE, rel), 'wb') as f:
        f.write(data)

def to_bytes(s):
    """Convert a regular string to UTF-8 bytes."""
    return s.encode('utf-8')

def find_event_block(data, pokemon_id):
    """Find event block boundaries containing a specific pokemon image ID.
    Returns (start, end) byte positions or None."""
    img = to_bytes(pokemon_id + '.png')
    pos = data.find(img)
    if pos == -1:
        print("  WARNING: Pokemon " + pokemon_id + " image not found")
        return None
    
    # Search backwards for <!--...Interactable...--> comment
    search_start = max(0, pos - 3000)
    chunk = data[search_start:pos]
    
    comment_idx = -1
    idx = 0
    while True:
        ci = chunk.find(b'<!--', idx)
        if ci == -1:
            break
        ce = chunk.find(b'-->', ci)
        if ce == -1:
            break
        comment_text = chunk[ci:ce]
        if b'Interactable' in comment_text or b'interactable' in comment_text:
            comment_idx = search_start + ci
        idx = ce + 3
    
    if comment_idx == -1:
        # Fall back to <div class="event transparent">
        div_marker = b'<div class="event transparent">'
        di = chunk.rfind(div_marker)
        if di == -1:
            di = chunk.rfind(b'<div class="event transparent"')
        if di != -1:
            comment_idx = search_start + di
        else:
            print("  WARNING: Event block start not found for " + pokemon_id)
            return None
    
    end_marker = b'</table></td></tr></table></div></div>'
    end_idx = data.find(end_marker, pos)
    if end_idx == -1:
        print("  WARNING: Event block end not found for " + pokemon_id)
        return None
    end_idx += len(end_marker)
    
    return (comment_idx, end_idx)

def find_items_table(data, search_from=0):
    """Find items table block boundaries. Returns (start, end) or None."""
    marker = b'items-table'
    pos = data.find(marker, search_from)
    if pos == -1:
        return None
    
    # Search backwards for <div class="tcontainer">
    chunk = data[max(0, pos-200):pos]
    div_idx = chunk.rfind(b'<div class="tcontainer">')
    if div_idx == -1:
        div_idx = chunk.rfind(b'<div class="tcontainer"')
    if div_idx == -1:
        print("  WARNING: tcontainer div not found before items-table")
        return None
    start = max(0, pos-200) + div_idx
    
    # Find closing </table> then </div>
    # The items table has no nested tables that would confuse us
    # Actually it does have a header row but no nested <table> tags inside items
    # Find the comment or </table> closing
    close_table = data.find(b'</table>', pos)
    if close_table == -1:
        return None
    close_table += len(b'</table>')
    
    # Find the closing </div> for tcontainer
    close_div = data.find(b'</div>', close_table)
    if close_div == -1:
        return None
    close_div += len(b'</div>')
    
    return (start, close_div)

def find_wild_table(data, search_from=0):
    """Find wild spawns table block. Returns (start, end) or None."""
    marker = b'wildspawns-table'
    pos = data.find(marker, search_from)
    if pos == -1:
        return None
    
    chunk = data[max(0, pos-200):pos]
    div_idx = chunk.rfind(b'<div class="tcontainer">')
    if div_idx == -1:
        div_idx = chunk.rfind(b'<div class="tcontainer"')
    if div_idx == -1:
        print("  WARNING: tcontainer div not found before wildspawns-table")
        return None
    start = max(0, pos-200) + div_idx
    
    # Find the closing. Wild spawns table has nested <table> inside <td class="pokemon">
    # but they close with </table></td>, not </table></div>
    # The outer table closes with </table> followed by whitespace/comments then </div>
    # Let's find the next </table> that is followed (possibly with whitespace) by </div>
    search_pos = pos
    while True:
        ct = data.find(b'</table>', search_pos)
        if ct == -1:
            return None
        after_table = ct + len(b'</table>')
        # Check what comes after (skip whitespace and comments)
        rest = data[after_table:after_table+200]
        stripped = rest.lstrip()
        if stripped.startswith(b'</div>'):
            # This is the outer table closing
            end_div = data.find(b'</div>', after_table)
            return (start, end_div + len(b'</div>'))
        elif stripped.startswith(b'</td>') or stripped.startswith(b'<'):
            # This is an inner table closing, continue searching
            search_pos = after_table
        else:
            search_pos = after_table

def find_trainers_table(data, search_from=0):
    """Find trainers table block. Returns (start, end) or None."""
    # Find <table class="trainers but NOT VITalt
    pos = search_from
    while True:
        marker = b'class="trainers'
        idx = data.find(marker, pos)
        if idx == -1:
            return None
        # Check it's not a VIT table
        line_start = data.rfind(b'\n', max(0, idx-500), idx)
        preceding = data[max(0,line_start):idx]
        if b'VIT' in preceding:
            pos = idx + len(marker)
            continue
        
        # Search backwards for <div class="tcontainer">
        chunk = data[max(0, idx-300):idx]
        div_idx = chunk.rfind(b'<div class="tcontainer">')
        if div_idx == -1:
            div_idx = chunk.rfind(b'<div class="tcontainer"')
        if div_idx == -1:
            print("  WARNING: tcontainer div not found before trainers table")
            return None
        start = max(0, idx-300) + div_idx
        
        # Find the closing </table></div> for the trainers table
        # Trainers table has nested <table class="icon"> and <table class="pkmn">
        # But they close with </table></td>, not </table></div>
        # So find </table></div> pattern
        search_pos = idx
        while True:
            ct = data.find(b'</table>', search_pos)
            if ct == -1:
                return None
            after_table = ct + len(b'</table>')
            rest = data[after_table:after_table+200]
            stripped = rest.lstrip()
            if stripped.startswith(b'</div>'):
                end_div = data.find(b'</div>', after_table)
                return (start, end_div + len(b'</div>'))
            else:
                search_pos = after_table

def remove_stray_table_tags(data):
    """Remove stray </table> tags that appear between sections."""
    # Remove </table> tags that appear between end of a </div> and <h1> or <h2>
    data = re.sub(rb'(</div>)\s*</table>\s*(<h[12]>)', rb'\1' + NL + NL + rb'\2', data)
    # Also handle case where stray </table> is between divs  
    data = re.sub(rb'(</div>)\s*</table>\s*$', rb'\1', data, flags=re.MULTILINE)
    return data

###############################################
# MEEROU EXHIBITION (3 event blocks)
###############################################
print("=" * 50)
print("Processing Meerou_Exhibition.html...")
d = readf(r"Locations\Landmarks\Meerou_Exhibition.html")

# Entei
block = find_event_block(d, '0244')
if block:
    new = to_bytes(
        '<div class="event transparent" data-wiki-table="event">\r\n'
        '  <div data-pokemon="0244" data-name="Entei" data-type="fire"\r\n'
        '       data-level="60" data-ability="Flash Fire(*)" data-item="None"\r\n'
        '       data-move1="Roar|normal|physical"\r\n'
        '       data-move2="Extransensory|normal|physical"\r\n'
        '       data-move3="Swagger|normal|physical"\r\n'
        '       data-move4="Lava Plume|normal|physical"></div>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced Entei event block")

# Suicune
block = find_event_block(d, '0245')
if block:
    new = to_bytes(
        '<div class="event transparent" data-wiki-table="event">\r\n'
        '  <div data-pokemon="0245" data-name="Suicune" data-type="water"\r\n'
        '       data-level="60" data-ability="Water Absorb(*)" data-item="None"\r\n'
        '       data-move1="Roar|normal|physical"\r\n'
        '       data-move2="Extransensory|normal|physical"\r\n'
        '       data-move3="Swagger|normal|physical"\r\n'
        '       data-move4="Lava Plume|normal|physical"></div>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced Suicune event block")

# Raikou
block = find_event_block(d, '0243')
if block:
    new = to_bytes(
        '<div class="event transparent" data-wiki-table="event">\r\n'
        '  <div data-pokemon="0243" data-name="Raikou" data-type="electric"\r\n'
        '       data-level="60" data-ability="Volt Absorb(*)" data-item="None"\r\n'
        '       data-move1="Roar|normal|physical"\r\n'
        '       data-move2="Extransensory|normal|physical"\r\n'
        '       data-move3="Swagger|normal|physical"\r\n'
        '       data-move4="Lava Plume|normal|physical"></div>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced Raikou event block")

writef(r"Locations\Landmarks\Meerou_Exhibition.html", d)
print("  Saved!")

###############################################
# SOLACEON (items + wild + cleanup)
###############################################
print("=" * 50)
print("Processing Solaceon.html...")
d = readf(r"Locations\Cities\Solaceon.html")

# Items table
block = find_items_table(d)
if block:
    new = to_bytes(
        '<div class="tcontainer">\r\n'
        '<table class="items-table round red border-bold" data-wiki-table="items">\r\n'
        '<tr data-item-id="0" data-name="Escape Rope" data-loc="Processing Room, next to"></tr>\r\n'
        '</table>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced items table")

# Wild spawns table
block = find_wild_table(d)
if block:
    new = to_bytes(
        '<div class="tcontainer">\r\n'
        '<table class="wildspawns-table round gray border-bold" data-wiki-table="wild">\r\n'
        '<tr data-method="Surfing"></tr>\r\n'
        '<tr data-pokemon="0263" data-name="Zigzagoon" data-type="normal" data-levels="5-7" data-rate="40%"></tr>\r\n'
        '<tr data-method="Super Rod"></tr>\r\n'
        '<tr data-pokemon="0532" data-name="Timburr" data-type="fighting" data-levels="9-10" data-rate="25%"></tr>\r\n'
        '</table>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced wild spawns table")

# Remove stray </table>
d = remove_stray_table_tags(d)
print("  Cleaned up stray tags")

writef(r"Locations\Cities\Solaceon.html", d)
print("  Saved!")

###############################################
# RAPIDASH RANCH (items + wild + event + trainers + cleanup)
###############################################
print("=" * 50)
print("Processing Rapidash_Ranch.html...")
d = readf(r"Locations\Landmarks\Rapidash_Ranch.html")

# Items table
block = find_items_table(d)
if block:
    new = to_bytes(
        '<div class="tcontainer">\r\n'
        '<table class="items-table round red border-bold" data-wiki-table="items">\r\n'
        '<tr data-item-id="0" data-name="Escape Rope" data-loc="Processing Room, next to"></tr>\r\n'
        '<tr data-item-id="0" data-name="TM83 (Work Up)" data-loc="Processing Room, next to"></tr>\r\n'
        '<tr data-item-id="0" data-name="Super Potion" data-loc="Processing Room, next to"></tr>\r\n'
        '<tr data-item-id="0" data-name="Magnet" data-loc="Processing Room, next to"></tr>\r\n'
        '<tr data-item-id="0" data-name="Pok\xc3\xa9 Ball" data-loc="Processing Room, next to"></tr>\r\n'
        '<tr data-item-id="0" data-name="Zinc" data-loc="Processing Room, next to"></tr>\r\n'
        '<tr data-item-id="0" data-name="X Attack" data-loc="Gifted by Roughneck"></tr>\r\n'
        '</table>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced items table")

# Wild spawns table
block = find_wild_table(d)
if block:
    new = to_bytes(
        '<div class="tcontainer">\r\n'
        '<table class="wildspawns-table round green border-bold" data-wiki-table="wild">\r\n'
        '<tr data-method="Walking"></tr>\r\n'
        '<tr data-pokemon="0263" data-name="Zigzagoon" data-type="normal" data-levels="5-7" data-rate="40%"></tr>\r\n'
        '<tr data-pokemon="0519" data-name="Pidove" data-type="normal" data-levels="5-7" data-day="35%" data-night="0%"></tr>\r\n'
        '<tr data-pokemon="0527" data-name="Woobat" data-type="psychic" data-levels="5-8" data-day="0%" data-night="35%"></tr>\r\n'
        '<tr data-method="Double-exclusive"></tr>\r\n'
        '<tr data-pokemon="0532" data-name="Timburr" data-type="fighting" data-levels="9-10" data-rate="25%"></tr>\r\n'
        '</table>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced wild spawns table")

# Event block (Rapidash 0078)
block = find_event_block(d, '0078')
if block:
    new = to_bytes(
        '<div class="event transparent" data-wiki-table="event">\r\n'
        '  <div data-pokemon="0078" data-name="Rapidash" data-type="fire"\r\n'
        '       data-level="19" data-ability="Flame Body(*)" data-item="None"\r\n'
        '       data-move1="ViceGrip|normal|physical"\r\n'
        '       data-move2="ViceGrip22|normal|physical"\r\n'
        '       data-move3="ViceGrip33|normal|physical"\r\n'
        '       data-move4="ViceGrip44|normal|physical"></div>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced Rapidash event block")

# Trainers table
block = find_trainers_table(d)
if block:
    new = to_bytes(
        '<div class="tcontainer">\r\n'
        '<table class="trainers round green border-bold" data-wiki-table="trainers">\r\n'
        '<tr><th colspan="2">After starting the investigation</th></tr>\r\n'
        '<tr data-trainer="Lass" data-trainer-name="Lass Veronica"\r\n'
        '    data-pokemon="0025" data-pkmn-name="Pikachu" data-pkmn-type="electric"\r\n'
        '    data-pkmn-level="8" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0427" data-pkmn-name-2="Buneary" data-pkmn-type-2="normal"\r\n'
        '    data-pkmn-level-2="9" data-pkmn-item-2="None"></tr>\r\n'
        '<tr data-trainer="Rancher" data-trainer-name="Rancher Emmanuel"\r\n'
        '    data-pokemon="0399" data-pkmn-name="Bidoof" data-pkmn-type="normal"\r\n'
        '    data-pkmn-level="8" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0183" data-pkmn-name-2="Marill" data-pkmn-type-2="water"\r\n'
        '    data-pkmn-level-2="9" data-pkmn-item-2="None"\r\n'
        '    data-pokemon-3="0240" data-pkmn-name-3="Magby" data-pkmn-type-3="fire"\r\n'
        '    data-pkmn-level-3="9" data-pkmn-item-3="None"></tr>\r\n'
        '</table>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced trainers table")

# Remove stray </table> and cleanup
d = remove_stray_table_tags(d)
print("  Cleaned up stray tags")

writef(r"Locations\Landmarks\Rapidash_Ranch.html", d)
print("  Saved!")

###############################################
# VEILSTONE (items + wild + event + trainers + cleanup)
###############################################
print("=" * 50)
print("Processing Veilstone.html...")
d = readf(r"Locations\Cities\Veilstone.html")

# Items table
block = find_items_table(d)
if block:
    new = to_bytes(
        '<div class="tcontainer">\r\n'
        '<table class="items-table round red border-bold" data-wiki-table="items">\r\n'
        '<tr data-item-id="0" data-name="Escape Rope" data-loc="Processing Room, next to"></tr>\r\n'
        '<tr data-item-id="0" data-name="TM83 (Work Up)" data-loc="Processing Room, next to"></tr>\r\n'
        '<tr data-item-id="0" data-name="Super Potion" data-loc="Processing Room, next to"></tr>\r\n'
        '<tr data-item-id="0" data-name="Magnet" data-loc="Processing Room, next to"></tr>\r\n'
        '<tr data-item-id="0" data-name="Pok\xc3\xa9 Ball" data-loc="Processing Room, next to"></tr>\r\n'
        '<tr data-item-id="0" data-name="Zinc" data-loc="Processing Room, next to"></tr>\r\n'
        '<tr data-item-id="0" data-name="X Attack" data-loc="Gifted by Roughneck"></tr>\r\n'
        '</table>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced items table")

# Wild spawns table
block = find_wild_table(d)
if block:
    new = to_bytes(
        '<div class="tcontainer">\r\n'
        '<table class="wildspawns-table round gray border-bold" data-wiki-table="wild">\r\n'
        '<tr data-method="Surfing"></tr>\r\n'
        '<tr data-pokemon="0263" data-name="Zigzagoon" data-type="normal" data-levels="5-7" data-rate="40%"></tr>\r\n'
        '<tr data-method="Super Rod"></tr>\r\n'
        '<tr data-pokemon="0532" data-name="Timburr" data-type="fighting" data-levels="9-10" data-rate="25%"></tr>\r\n'
        '</table>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced wild spawns table")

# Event block (Trubbish 0568)
block = find_event_block(d, '0568')
if block:
    new = to_bytes(
        '<div class="event transparent" data-wiki-table="event">\r\n'
        '  <div data-pokemon="0568" data-name="Trubbish" data-type="poison"\r\n'
        '       data-level="10" data-ability="Aftermath(*)" data-item="None"\r\n'
        '       data-move1="ViceGrip|normal|physical"\r\n'
        '       data-move2="ViceGrip22|normal|physical"\r\n'
        '       data-move3="ViceGrip33|normal|physical"\r\n'
        '       data-move4="ViceGrip44|normal|physical"></div>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced Trubbish event block")

# Trainers table (Punkster Leroy - Double Battle)
block = find_trainers_table(d)
if block:
    new = to_bytes(
        '<div class="tcontainer">\r\n'
        '<table class="trainers round gray border-bold" data-wiki-table="trainers">\r\n'
        '<tr data-trainer="Punkster_M" data-trainer-name="Punkster Leroy" data-double-battle\r\n'
        '    data-pokemon="0109" data-pkmn-name="Koffing" data-pkmn-type="poison"\r\n'
        '    data-pkmn-level="12" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0559" data-pkmn-name-2="Scraggy" data-pkmn-type-2="fighting,dark"\r\n'
        '    data-pkmn-level-2="12" data-pkmn-item-2="None"></tr>\r\n'
        '</table>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced trainers table")

# Remove stray </table> and cleanup
d = remove_stray_table_tags(d)
print("  Cleaned up stray tags")

writef(r"Locations\Cities\Veilstone.html", d)
print("  Saved!")

###############################################
# VEILSTAIN (items + wild + trainers)
###############################################
print("=" * 50)
print("Processing Veilstain.html...")
d = readf(r"Locations\Dungeons\Veilstain.html")

# Items table (Eastern complex)
block = find_items_table(d)
if block:
    new = to_bytes(
        '<div class="tcontainer">\r\n'
        '<table class="items-table round red border-bold" data-wiki-table="items">\r\n'
        '<tr data-item-id="0" data-name="Trainer Card module" data-loc="Gifted by Lark after choosing a Pok\xc3\xa9mon"></tr>\r\n'
        '<tr data-item-id="0" data-name="Pok\xc3\xa9dex module" data-loc="Gifted by Lark after choosing a Pok\xc3\xa9mon"></tr>\r\n'
        '<tr data-item-id="0" data-name="Lark\'s Autograph" data-loc="Gifted by Lark after meeting him on the west bridge"></tr>\r\n'
        '<tr data-item-id="0" data-name="Vinyl" data-loc="Tournament reward (Performer rank onwards)"></tr>\r\n'
        '</table>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced items table")

# Wild spawns table (Eastern complex)
block = find_wild_table(d)
if block:
    new = to_bytes(
        '<div class="tcontainer">\r\n'
        '<table class="wildspawns-table round green border-bold" data-wiki-table="wild">\r\n'
        '<tr data-method="Walking"></tr>\r\n'
        '<tr data-pokemon="0109" data-name="Koffing" data-type="poison" data-levels="5-7" data-rate="40%"></tr>\r\n'
        '<tr data-pokemon="0527" data-name="Woobat" data-type="psychic" data-levels="5-7" data-rate="35%"></tr>\r\n'
        '<tr data-pokemon="0543" data-name="Venipede" data-type="bug" data-levels="5-8" data-rate="25%"></tr>\r\n'
        '<tr data-method="Walking (Special)"></tr>\r\n'
        '<tr data-pokemon="0422" data-name="Shellos" data-type="water" data-levels="9-10" data-rate="25%"></tr>\r\n'
        '</table>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced wild spawns table")

# Trainers table (Eastern complex)
block = find_trainers_table(d)
if block:
    new = to_bytes(
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
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced trainers table")

writef(r"Locations\Dungeons\Veilstain.html", d)
print("  Saved!")

###############################################
# GALAXIAS PILOT PLANT (items + trainers)
###############################################
print("=" * 50)
print("Processing Galaxias_Pilot_Plant.html...")
d = readf(r"Locations\Dungeons\Galaxias_Pilot_Plant.html")

# Items table
block = find_items_table(d)
if block:
    new = to_bytes(
        '<div class="tcontainer">\r\n'
        '<table class="items-table round red border-bold" data-wiki-table="items">\r\n'
        '<tr data-item-id="0" data-name="Escape Rope" data-loc="Processing Room, next to"></tr>\r\n'
        '<tr data-item-id="0" data-name="TM95" data-loc="1F, behind boxes"></tr>\r\n'
        '<tr data-item-id="0" data-name="Lark\'s Autograph" data-loc="1F, to the left (hidden)"></tr>\r\n'
        '<tr data-item-id="0" data-name="Vinyl" data-loc="Tournament reward (Performer rank onwards)"></tr>\r\n'
        '</table>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced items table")

# Trainers table (simplified format with section headers)
block = find_trainers_table(d)
if block:
    new = to_bytes(
        '<div class="tcontainer">\r\n'
        '<table class="trainers round gray border-bold" data-wiki-table="trainers">\r\n'
        '<tr><th colspan="2">1F</th></tr>\r\n'
        '<tr data-trainer="Glx_G_M" data-trainer-name="Galaxias Scout"\r\n'
        '    data-pokemon="0543" data-pkmn-name="Venipede" data-pkmn-type="bug,poison"\r\n'
        '    data-pkmn-level="0" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0088" data-pkmn-name-2="Grimer" data-pkmn-type-2="poison"\r\n'
        '    data-pkmn-level-2="0" data-pkmn-item-2="None"></tr>\r\n'
        '<tr data-trainer="Glx_G_M" data-trainer-name="Galaxias Scout"\r\n'
        '    data-pokemon="0559" data-pkmn-name="Scraggy" data-pkmn-type="dark,fighting"\r\n'
        '    data-pkmn-level="13" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0532" data-pkmn-name-2="Timburr" data-pkmn-type-2="fighting"\r\n'
        '    data-pkmn-level-2="14" data-pkmn-item-2="None"></tr>\r\n'
        '<tr data-trainer="Glx_G_M" data-trainer-name="Galaxias Scout"\r\n'
        '    data-pokemon="0559" data-pkmn-name="Scraggy" data-pkmn-type="dark,fighting"\r\n'
        '    data-pkmn-level="13" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0532" data-pkmn-name-2="Timburr" data-pkmn-type-2="fighting"\r\n'
        '    data-pkmn-level-2="14" data-pkmn-item-2="None"></tr>\r\n'
        '<tr><th colspan="2">2F</th></tr>\r\n'
        '<tr data-trainer="Glx_G_M" data-trainer-name="Galaxias Technician"\r\n'
        '    data-pokemon="0543" data-pkmn-name="Venipede" data-pkmn-type="bug,poison"\r\n'
        '    data-pkmn-level="0" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0088" data-pkmn-name-2="Grimer" data-pkmn-type-2="poison"\r\n'
        '    data-pkmn-level-2="0" data-pkmn-item-2="None"></tr>\r\n'
        '<tr data-trainer="Glx_G_M" data-trainer-name="Galaxias Technician"\r\n'
        '    data-pokemon="0543" data-pkmn-name="Venipede" data-pkmn-type="bug,poison"\r\n'
        '    data-pkmn-level="0" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0088" data-pkmn-name-2="Grimer" data-pkmn-type-2="poison"\r\n'
        '    data-pkmn-level-2="0" data-pkmn-item-2="None"></tr>\r\n'
        '<tr><th colspan="2">3F</th></tr>\r\n'
        '<tr data-trainer="Glx_G_M" data-trainer-name="Galaxias Technician"\r\n'
        '    data-pokemon="0543" data-pkmn-name="Venipede" data-pkmn-type="bug,poison"\r\n'
        '    data-pkmn-level="0" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0088" data-pkmn-name-2="Grimer" data-pkmn-type-2="poison"\r\n'
        '    data-pkmn-level-2="0" data-pkmn-item-2="None"></tr>\r\n'
        '<tr data-trainer="Glx_G_M" data-trainer-name="Galaxias Technician"\r\n'
        '    data-pokemon="0543" data-pkmn-name="Venipede" data-pkmn-type="bug,poison"\r\n'
        '    data-pkmn-level="0" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0088" data-pkmn-name-2="Grimer" data-pkmn-type-2="poison"\r\n'
        '    data-pkmn-level-2="0" data-pkmn-item-2="None"></tr>\r\n'
        '</table>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced trainers table")

writef(r"Locations\Dungeons\Galaxias_Pilot_Plant.html", d)
print("  Saved!")

###############################################
# GALAXIAS LABS (items + event + trainers + VIT boss)
###############################################
print("=" * 50)
print("Processing Galaxias_Labs.html...")
d = readf(r"Locations\Dungeons\Galaxias_Labs.html")

# Items table
block = find_items_table(d)
if block:
    new = to_bytes(
        '<div class="tcontainer">\r\n'
        '<table class="items-table round red border-bold" data-wiki-table="items">\r\n'
        '<tr data-item-id="0" data-name="Escape Rope" data-loc="Processing Room, next to"></tr>\r\n'
        '<tr data-item-id="0" data-name="TM95" data-loc="1F, behind boxes"></tr>\r\n'
        '<tr data-item-id="0" data-name="Lark\'s Autograph" data-loc="1F, to the left (hidden)"></tr>\r\n'
        '<tr data-item-id="0" data-name="Vinyl" data-loc="Tournament reward (Performer rank onwards)"></tr>\r\n'
        '</table>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced items table")

# Event block (Klink 0599)
block = find_event_block(d, '0599')
if block:
    new = to_bytes(
        '<div class="event transparent" data-wiki-table="event">\r\n'
        '  <div data-pokemon="0599" data-name="Klink" data-type="steel"\r\n'
        '       data-level="13" data-ability="Clear Body(*)" data-item="None"\r\n'
        '       data-move1="ViceGrip|normal|physical"\r\n'
        '       data-move2="ViceGrip22|normal|physical"\r\n'
        '       data-move3="ViceGrip33|normal|physical"\r\n'
        '       data-move4="ViceGrip44|normal|physical"></div>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced Klink event block")

# Trainers table (simplified format)
block = find_trainers_table(d)
if block:
    new = to_bytes(
        '<div class="tcontainer">\r\n'
        '<table class="trainers round gray border-bold" data-wiki-table="trainers">\r\n'
        '<tr data-trainer="Glx_G_M" data-trainer-name="Galaxias Technician"\r\n'
        '    data-pokemon="0240" data-pkmn-name="Magby" data-pkmn-type="fire"\r\n'
        '    data-pkmn-level="16" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0267" data-pkmn-name-2="Beautifly" data-pkmn-type-2="bug,flying"\r\n'
        '    data-pkmn-level-2="15" data-pkmn-item-2="None"></tr>\r\n'
        '<tr data-trainer="Glx_G_M" data-trainer-name="Galaxias Technician"\r\n'
        '    data-pokemon="0550" data-pkmn-name="Basculin" data-pkmn-type="water"\r\n'
        '    data-pkmn-level="15" data-pkmn-item="None"\r\n'
        '    data-pokemon-2="0239" data-pkmn-name-2="Elekid" data-pkmn-type-2="electric"\r\n'
        '    data-pkmn-level-2="15" data-pkmn-item-2="None"\r\n'
        '    data-pokemon-3="0572" data-pkmn-name-3="Minccino" data-pkmn-type-3="normal"\r\n'
        '    data-pkmn-level-3="15" data-pkmn-item-3="None"></tr>\r\n'
        '</table>\r\n'
        '</div>')
    d = d[:block[0]] + new + d[block[1]:]
    print("  Replaced trainers table")

# VIT/Boss block (Mars & Jupiter)
# Find the VIT block - it starts with <div class="tcontainer"> containing VITalt
vit_marker = b'class="VITalt'
vit_pos = d.find(vit_marker)
if vit_pos != -1:
    # Search backwards for the input checkbox and its tcontainer div
    search_start = max(0, vit_pos - 500)
    chunk = d[search_start:vit_pos]
    
    # Find the <div class="tcontainer"> that wraps the VIT
    tcontainer_idx = chunk.rfind(b'<div class="tcontainer">')
    if tcontainer_idx == -1:
        tcontainer_idx = chunk.rfind(b'<div class="tcontainer"')
    
    if tcontainer_idx != -1:
        vit_start = search_start + tcontainer_idx
    else:
        # Try finding the <input type="checkbox"> before VIT
        input_idx = chunk.rfind(b'<input')
        if input_idx != -1:
            vit_start = search_start + input_idx
        else:
            vit_start = vit_pos
    
    # Find the end of the VIT block
    # The VIT ends with </table>\r\n</div> followed by </td>
    # Let me find the closing pattern more carefully
    # Looking at the HTML: ...Chiusura tabella Boss Trainer-->\r\n</div>\r\n</td>\r\n</tr>\r\n</table>\r\n</div></td>
    
    # The VIT block ends with the closing of the outer table and div
    # Let's find the end by looking for the closing sequence after the Pok?mon moves
    end_search = vit_pos
    # Find "Chiusura tabella Boss Trainer" comment or the end of the team div
    boss_end = d.find(b'Chiusura tabella Boss Trainer', end_search)
    if boss_end == -1:
        # No such comment, look for the end of the teamalt div
        boss_end = d.find(b'</div>', d.find(b'class="teamalt"', end_search))
    
    # Find the outer closing </table></div>
    # After the teamalt div closes, there should be </td></tr></table></div>
    outer_end = d.find(b'</table>', boss_end)
    if outer_end != -1:
        outer_end += len(b'</table>')
        # Skip whitespace
        rest = d[outer_end:outer_end+100]
        # Look for </div>
        close_div = d.find(b'</div>', outer_end)
        if close_div != -1:
            outer_end = close_div + len(b'</div>')
            # There might be </td> after
            rest2 = d[outer_end:outer_end+50].lstrip()
            if rest2.startswith(b'</td>'):
                outer_end = d.find(b'</td>', outer_end) + len(b'</td>')
    
    vit_end = outer_end
    
    new_vit = to_bytes(
        '<div data-wiki-table="vit"\r\n'
        '     data-vit-class="VITalt" data-vit-color="fire" data-vit-border="border-bold"\r\n'
        '     data-trainer="Mars" data-trainer-title="Lieutenant Duo" data-trainer-name="Mars & Jupiter"\r\n'
        '     data-trainer-subtitle="Chapter 1 Bosses"\r\n'
        '     data-trainer-2="Jupiter" data-vit-color-2="psychic"\r\n'
        '     data-reward="$2800" data-balls-full="2" data-balls-empty="4">\r\n'
        '  <div data-pokemon="0432" data-name="Purugly" data-type="normal"\r\n'
        '       data-level="16" data-ability="Defiant" data-item="Chople Berry"\r\n'
        '       data-move1="Fake Out|normal|physical"\r\n'
        '       data-move2="Scratch|normal|physical"\r\n'
        '       data-move3="Hone Claws|dark|status"\r\n'
        '       data-move4="Faint Attack|dark|physical"></div>\r\n'
        '  <div data-pokemon="0435" data-name="Skuntank" data-type="poison,dark"\r\n'
        '       data-level="16" data-ability="Keen Eye" data-item="Chople Berry"\r\n'
        '       data-move1="Fake Out|normal|physical"\r\n'
        '       data-move2="Scratch|normal|physical"\r\n'
        '       data-move3="Hone Claws|dark|status"\r\n'
        '       data-move4="Faint Attack|dark|physical"></div>\r\n'
        '</div>')
    d = d[:vit_start] + new_vit + d[vit_end:]
    print("  Replaced VIT boss block")

# Clean up stray tags
d = remove_stray_table_tags(d)
print("  Cleaned up stray tags")

writef(r"Locations\Dungeons\Galaxias_Labs.html", d)
print("  Saved!")

print("\n" + "=" * 50)
print("ALL FILES PROCESSED SUCCESSFULLY!")
