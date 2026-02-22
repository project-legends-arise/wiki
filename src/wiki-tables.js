/**
 * wiki-tables.js ? Plug-and-play table generator for the wiki.
 * Include BEFORE wiki.js:
 *   <script src="../../src/wiki-tables.js"></script>
 *   <script src="../../src/wiki.js"></script>
 *
 * „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
 *  HOW TO USE ? write simple data rows, the script builds the
 *  full tables automatically. Image paths are resolved from
 *  data attributes (item IDs, Pok?dex numbers, trainer names).
 * „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
 *
 *  PATH DEPTH
 *  ----------
 *  The script detects the depth from the page to /src/ automatically.
 *  It looks at the existing <link> to Style.css. Falls back to "../../src".
 *
 *  ???????????????????????????????????????????
 *  1)  ITEMS TABLE  (location pages ? 3 cols)
 *  ???????????????????????????????????????????
 *
 *  <table class="items-table round red border-bold"
 *         data-wiki-table="items">
 *    <tr data-item-id="293" data-name="Escape Rope" data-loc="1F, near stairs"></tr>
 *    <tr data-item-id="10"  data-name="Potion"      data-loc="Hidden behind crate"></tr>
 *  </table>
 *
 *  The script will:
 *    ? Add the header row (<th> Item / Location)
 *    ? Replace each <tr> with the full icon + name + location cells
 *    ? Image: src/{depth}/Item/{id}.png
 *
 *  ???????????????????????????????????????????
 *  2)  ITEMS TABLE  (docs ? 5 cols)
 *  ???????????????????????????????????????????
 *
 *  <table class="items-table round red border-bold"
 *         data-wiki-table="items-doc">
 *    <tr data-item-id="293" data-name="Spring Coin" data-pocket="General"
 *        data-effect="A prized jade-colored coin." data-price="1000 P"></tr>
 *  </table>
 *
 *  ???????????????????????????????????????????
 *  3)  ITEMS TABLE  (key items ? 4 cols)
 *  ???????????????????????????????????????????
 *
 *  <table class="items-table round red border-bold"
 *         data-wiki-table="items-key">
 *    <tr data-item-id="293" data-name="Trainer Card" data-loc="Gifted by Lark"
 *        data-purpose="Stores your trainer data."></tr>
 *  </table>
 *
 *  ???????????????????????????????????????????
 *  4)  WILD SPAWNS TABLE
 *  ???????????????????????????????????????????
 *
 *  <table class="wildspawns-table round green border-bold"
 *         data-wiki-table="wild">
 *    <tr data-pokemon="0263" data-name="Zigzagoon" data-type="normal"
 *        data-levels="5-7" data-rate="40%"></tr>
 *    <!-- Time-sensitive: use data-day / data-night instead of data-rate -->
 *    <tr data-pokemon="0519" data-name="Pidove" data-type="normal"
 *        data-levels="5-7" data-day="35%" data-night="0%"></tr>
 *    <!-- Encounter method separator -->
 *    <tr data-method="Surfing"></tr>
 *  </table>
 *
 *  ???????????????????????????????????????????
 *  5)  TRAINERS TABLE (standard)
 *  ???????????????????????????????????????????
 *
 *  <table class="trainers round gray border-bold"
 *         data-wiki-table="trainers">
 *
 *    <!-- Single-pok?mon trainer -->
 *    <tr data-trainer="Guitarist" data-trainer-name="Regina"
 *        data-pokemon="0532" data-pkmn-name="Timburr" data-pkmn-type="fighting"
 *        data-pkmn-level="8" data-pkmn-item="None"></tr>
 *
 *    <!-- Multi-pok?mon trainer: add data-pokemon-N for each extra -->
 *    <tr data-trainer="Drummer" data-trainer-name="Fabian"
 *        data-pokemon="0519" data-pkmn-name="Pidove" data-pkmn-type="normal,flying"
 *        data-pkmn-level="8" data-pkmn-item="None"
 *        data-pokemon-2="0519" data-pkmn-name-2="Pidove" data-pkmn-type-2="normal,flying"
 *        data-pkmn-level-2="9" data-pkmn-item-2="None"></tr>
 *
 *  </table>
 *
 *  Trainer images come from: src/{depth}/Trainer/{TrainerClass}.png
 *  (data-trainer value = filename without extension)
 *
 *  ???????????????????????????????????????????
 *  6)  EVENT / INTERACTABLE POK?MON
 *  ???????????????????????????????????????????
 *
 *  <div class="event transparent" data-wiki-table="event">
 *    <div data-pokemon="0387" data-name="Turtwig" data-type="grass"
 *         data-level="5" data-ability="Overgrow" data-item="Oran Berry"
 *         data-move1="Tackle|normal|physical"
 *         data-move2="Withdraw|water|status"
 *         data-move3="Sand Tomb|ground|physical"></div>
 *  </div>
 *
 *  ???????????????????????????????????????????
 *  7)  VIT / BOSS TRAINER
 *  ???????????????????????????????????????????
 *
 *  <div data-wiki-table="vit"
 *       data-vit-class="VITalt" data-vit-color="lark" data-vit-border="border-bold"
 *       data-trainer="Lark" data-trainer-title="Rising Star"
 *       data-trainer-subtitle=""
 *       data-reward="$2800" data-balls-full="2" data-balls-empty="4">
 *
 *    <!-- Each child div = one team Pok?mon (same syntax as event) -->
 *    <div data-pokemon="0531" data-name="Audino" data-type="normal"
 *         data-level="3" data-ability="Regenerator" data-item="None"
 *         data-move1="Leer|normal|status"
 *         data-move2="Tackle|normal|physical"
 *         data-move3="Odor Sleuth|normal|status"></div>
 *  </div>
 *
 *  NOTE: For dual-sprite bosses (Mars & Jupiter), use
 *        data-trainer="Mars" data-trainer-2="Jupiter"
 *        data-vit-color-2="psychic"
 *
 */

document.addEventListener('DOMContentLoaded', () => {

    /* „Ÿ„Ÿ Resolve path prefix to /src/ „Ÿ„Ÿ */
    const styleLink = document.querySelector('link[href*="Style.css"]');
    let srcPrefix = '../../src';
    if (styleLink) {
        const href = styleLink.getAttribute('href');
        srcPrefix = href.replace(/Styles\/Style\.css$/, '').replace(/\/$/, '');
    }

    const BALLFULL  = 'https://archives.bulbagarden.net/media/upload/f/fa/Ballfull.png';
    const BALLEMPTY = 'https://archives.bulbagarden.net/media/upload/7/7e/Ballempty.png';

    /* „Ÿ„Ÿ Helper: Pok?mon image path „Ÿ„Ÿ */
    function pkmnImg(dexNum) {
        return `${srcPrefix}/Pokemon/${dexNum}.png`;
    }

    /* „Ÿ„Ÿ Helper: Item image path „Ÿ„Ÿ */
    function itemImg(itemId) {
        return `${srcPrefix}/Item/${itemId}.png`;
    }

    /* „Ÿ„Ÿ Helper: Trainer image path „Ÿ„Ÿ */
    function trainerImg(name) {
        return `${srcPrefix}/Trainer/${name}.png`;
    }

    /* „Ÿ„Ÿ Helper: Build type badge(s) „Ÿ„Ÿ */
    function typeBadges(typeStr) {
        const types = typeStr.split(',').map(t => t.trim().toLowerCase());
        if (types.length === 1) {
            return `<table><tr><td class="round ${types[0]}hl">${cap(types[0])}</td></tr></table>`;
        }
        return `<table><tr><td class="roundleft ${types[0]}hl">${cap(types[0])}</td><td class="roundright ${types[1]}hl">${cap(types[1])}</td></tr></table>`;
    }

    /* „Ÿ„Ÿ Helper: capitalize „Ÿ„Ÿ */
    function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }

    /* „Ÿ„Ÿ Helper: Build move table „Ÿ„Ÿ */
    function moveHtml(moveData) {
        if (!moveData) return '';
        const parts = moveData.split('|');
        const moveName = parts[0];
        const moveType = (parts[1] || 'normal').toLowerCase();
        const moveCat  = (parts[2] || 'physical').toLowerCase();
        return `<td><table class="move round ${moveType}"><tr><th class="roundtop" colspan="2">${moveName}</th></tr><tr><td class="${moveType}hl roundbl">${cap(moveType)}</td><td class="${moveCat} roundbr">${cap(moveCat)}</td></tr></table></td>`;
    }

    /* „Ÿ„Ÿ Helper: Build full Pok?mon card (event / VIT style) „Ÿ„Ÿ */
    function pkmnCard(el) {
        const dex     = el.dataset.pokemon;
        const name    = el.dataset.name;
        const type    = el.dataset.type;
        const level   = el.dataset.level;
        const ability = el.dataset.ability || '';
        const item    = el.dataset.item || 'None';
        const primaryType = type.split(',')[0].trim().toLowerCase();

        let abilityHtml = '';
        if (ability) {
            abilityHtml = `<dt>Ability:</dt><dt>${ability}</dt>`;
        }

        // Moves (up to 4)
        const moves = [];
        for (let i = 1; i <= 4; i++) {
            if (el.dataset['move' + i]) moves.push(el.dataset['move' + i]);
        }

        let movesHtml = '';
        if (moves.length > 0) {
            // Build 2-column rows
            let rows = '';
            for (let i = 0; i < moves.length; i += 2) {
                rows += '<tr>';
                rows += moveHtml(moves[i]);
                if (moves[i + 1]) rows += moveHtml(moves[i + 1]);
                rows += '</tr>';
            }
            movesHtml = `<tr><td class="round" colspan="2"><table>${rows}</table></td></tr>`;
        }

        return `<div class="tcontainer"><table class="pkmn round ${primaryType}"><tr>
<td class="round"><img src="${pkmnImg(dex)}" alt="${name}" class="sprite-large"></td>
<td class="transparent" rowspan="2"><dl>
<dt>Type:</dt><dt>${typeBadges(type)}</dt>
${abilityHtml}
<dt>Held Item</dt><dt>${item}</dt></dl></td></tr>
<tr><td class="round">${name} Lv.&nbsp;${level}</td></tr>
${movesHtml}
</table></div>`;
    }


    /* „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       ITEMS TABLE (location pages ? 3 cols)
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ */
    document.querySelectorAll('[data-wiki-table="items"]').forEach(table => {
        const rows = Array.from(table.querySelectorAll('tr[data-item-id]'));
        const frag = document.createDocumentFragment();

        // Wrap in tcontainer if not already
        wrapTcontainer(table);

        // Build header
        const thead = document.createElement('tr');
        thead.innerHTML = '<th colspan="2">Item</th><th class="loc">Location</th>';
        table.prepend(thead);

        rows.forEach(tr => {
            const id   = tr.dataset.itemId;
            const name = tr.dataset.name;
            const loc  = tr.dataset.loc || '';
            tr.innerHTML = `<td class="icon"><img src="${itemImg(id)}" alt="${name}" class="sprite"></td><td class="name">${name}</td><td class="location">${loc}</td>`;
            tr.removeAttribute('data-item-id');
            tr.removeAttribute('data-name');
            tr.removeAttribute('data-loc');
        });

        table.removeAttribute('data-wiki-table');
    });


    /* „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       ITEMS TABLE (docs ? 5 cols)
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ */
    document.querySelectorAll('[data-wiki-table="items-doc"]').forEach(table => {
        wrapTcontainer(table);

        const thead = document.createElement('tr');
        thead.innerHTML = '<th colspan="2">Item</th><th class="loc">Pocket</th><th class="loc">Effect</th><th class="loc">Selling Price</th>';
        table.prepend(thead);

        table.querySelectorAll('tr[data-item-id]').forEach(tr => {
            const id     = tr.dataset.itemId;
            const name   = tr.dataset.name;
            const pocket = tr.dataset.pocket || '';
            const effect = tr.dataset.effect || '';
            const price  = tr.dataset.price || '';
            tr.innerHTML = `<td class="icon"><img src="${itemImg(id)}" alt="${name}" class="sprite"></td><td class="name">${name}</td><td class="location">${pocket}</td><td class="location">${effect}</td><td class="location">${price}</td>`;
            clearDataAttrs(tr);
        });
        table.removeAttribute('data-wiki-table');
    });


    /* „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       ITEMS TABLE (key items ? 4 cols)
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ */
    document.querySelectorAll('[data-wiki-table="items-key"]').forEach(table => {
        wrapTcontainer(table);

        const thead = document.createElement('tr');
        thead.innerHTML = '<th colspan="2">Item</th><th class="loc">Location</th><th class="loc">Purpose</th>';
        table.prepend(thead);

        table.querySelectorAll('tr[data-item-id]').forEach(tr => {
            const id      = tr.dataset.itemId;
            const name    = tr.dataset.name;
            const loc     = tr.dataset.loc || '';
            const purpose = tr.dataset.purpose || '';
            tr.innerHTML = `<td class="icon"><img src="${itemImg(id)}" alt="${name}" class="sprite"></td><td class="name">${name}</td><td class="location">${loc}</td><td class="location">${purpose}</td>`;
            clearDataAttrs(tr);
        });
        table.removeAttribute('data-wiki-table');
    });


    /* „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       WILD SPAWNS TABLE
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ */
    document.querySelectorAll('[data-wiki-table="wild"]').forEach(table => {
        wrapTcontainer(table);

        const thead = document.createElement('tr');
        thead.innerHTML = '<th class="name roundtl">Pokemon</th><th class="level">Levels</th><th class="rate roundtr" colspan="2">Rate</th>';
        table.prepend(thead);

        table.querySelectorAll('tr[data-pokemon], tr[data-method]').forEach(tr => {
            if (tr.dataset.method !== undefined) {
                // Encounter method separator
                tr.innerHTML = `<th colspan="4">${tr.dataset.method}</th>`;
                tr.removeAttribute('data-method');
                return;
            }
            const dex    = tr.dataset.pokemon;
            const name   = tr.dataset.name;
            const type   = (tr.dataset.type || 'normal').toLowerCase();
            const levels = tr.dataset.levels || '';
            const rate   = tr.dataset.rate;
            const day    = tr.dataset.day;
            const night  = tr.dataset.night;

            let rateHtml;
            if (day !== undefined || night !== undefined) {
                rateHtml = `<td class="day">${day || ''}</td><td class="night">${night || ''}</td>`;
            } else {
                rateHtml = `<td colspan="2">${rate || ''}</td>`;
            }

            tr.innerHTML = `<td class="pokemon"><table><tr><td><div class="bg-sprite ${type}"><img src="${pkmnImg(dex)}" alt="${name}" class="sprite-medium"></div></td><td class="name">${name}</td></tr></table></td><td class="levels">${levels}</td>${rateHtml}`;
            clearDataAttrs(tr);
        });
        table.removeAttribute('data-wiki-table');
    });


    /* „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       TRAINERS TABLE (standard)
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ */
    document.querySelectorAll('[data-wiki-table="trainers"]').forEach(table => {
        wrapTcontainer(table);

        const thead = document.createElement('tr');
        thead.innerHTML = '<th class="name">Trainer</th><th class="pokemonlist">Pok?mon</th>';
        table.prepend(thead);

        const dataRows = Array.from(table.querySelectorAll('tr[data-trainer]'));

        dataRows.forEach(tr => {
            const trainerClass = tr.dataset.trainer;
            const trainerName  = tr.dataset.trainerName || trainerClass;
            const dblBattle    = tr.dataset.doubleBattle !== undefined;

            // Gather all Pok?mon (primary + extras numbered 2..6)
            const team = [];
            // Primary
            if (tr.dataset.pokemon) {
                team.push({
                    dex:   tr.dataset.pokemon,
                    name:  tr.dataset.pkmnName || '',
                    type:  tr.dataset.pkmnType || 'normal',
                    level: tr.dataset.pkmnLevel || '?',
                    item:  tr.dataset.pkmnItem || 'None'
                });
            }
            // Additional (2..6)
            for (let i = 2; i <= 6; i++) {
                if (tr.dataset['pokemon' + i]) {
                    team.push({
                        dex:   tr.dataset['pokemon' + i],
                        name:  tr.dataset['pkmnName' + i] || '',
                        type:  tr.dataset['pkmnType' + i] || 'normal',
                        level: tr.dataset['pkmnLevel' + i] || '?',
                        item:  tr.dataset['pkmnItem' + i] || 'None'
                    });
                }
            }

            const teamCount = team.length || 1;

            // Build trainer icon cell
            let trainerIconHtml = `<table class="icon"><tr><td><img src="${trainerImg(trainerClass)}" alt="${trainerName}" class="sprite"></td></tr><tr><td>${trainerName}</td></tr>`;
            if (dblBattle) {
                trainerIconHtml += `<tr><td class="round electrichl">Double Battle</td></tr>`;
            }
            trainerIconHtml += `</table>`;

            // Build Pok?mon cells
            const pkmnCells = team.map(p => {
                const types = p.type;
                return `<td><table class="pkmn round transparent border-none"><tr><td class="round"><img src="${pkmnImg(p.dex)}" alt="${p.name}" class="sprite-medium"></td><td class="transparent" rowspan="2"><dl><dt>Type:</dt><dt>${typeBadges(types)}</dt><dt>Held Item</dt><dt>${p.item}</dt></dl></td></tr><tr><td class="round">${p.name} Lv.${p.level}</td></tr></table></td>`;
            });

            // Replace the data row with trainer row(s)
            const frag = document.createDocumentFragment();

            // First row: trainer + first Pok?mon
            const row1 = document.createElement('tr');
            row1.innerHTML = `<td${teamCount > 1 ? ` rowspan="${teamCount}"` : ''}>${trainerIconHtml}</td>${pkmnCells[0] || ''}`;
            frag.appendChild(row1);

            // Additional Pok?mon rows
            for (let i = 1; i < pkmnCells.length; i++) {
                const pRow = document.createElement('tr');
                pRow.innerHTML = pkmnCells[i];
                frag.appendChild(pRow);
            }

            tr.parentNode.insertBefore(frag, tr);
            tr.remove();
        });

        table.removeAttribute('data-wiki-table');
    });


    /* „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       EVENT / INTERACTABLE POK?MON
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ */
    document.querySelectorAll('[data-wiki-table="event"]').forEach(container => {
        const divs = Array.from(container.querySelectorAll('div[data-pokemon]'));
        divs.forEach(div => {
            const html = pkmnCard(div);
            div.outerHTML = html;
        });
        container.removeAttribute('data-wiki-table');
    });


    /* „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       VIT / BOSS TRAINER
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ */
    let vitCounter = 0;
    document.querySelectorAll('[data-wiki-table="vit"]').forEach(container => {
        vitCounter++;
        const checkboxId = 'vit-toggle-' + vitCounter;

        const vitClass  = container.dataset.vitClass  || 'VITalt';
        const vitColor  = container.dataset.vitColor  || 'normal';
        const vitBorder = container.dataset.vitBorder || 'border-bold';
        const trainerFile  = container.dataset.trainer;
        const trainerTitle = container.dataset.trainerTitle || '';
        const trainerName  = container.dataset.trainerName || trainerFile;
        const subtitle     = container.dataset.trainerSubtitle || '';
        const reward       = container.dataset.reward || '';
        const ballsFull    = parseInt(container.dataset.ballsFull || '0');
        const ballsEmpty   = parseInt(container.dataset.ballsEmpty || '0');

        // Dual trainer support
        const trainer2File  = container.dataset.trainer2 || '';
        const vitColor2     = container.dataset.vitColor2 || '';

        // Info color class: use "{color}-light" if it exists, else same
        const infoColorClass = vitColor === 'lark' ? 'lark-light' : `${vitColor} border-none`;
        const spriteColorClass = vitColor === 'lark' ? 'lark-light' : vitColor;

        // Build trainer info area
        let trainerSprites = `<td class="transparent"><div class="trainer-bgsprite ${spriteColorClass}"><img src="${trainerImg(trainerFile)}" class="sprite-large"></div></td>`;

        let infoBlock = `<td class="info round ${infoColorClass}"><dl>`;
        if (trainerTitle) infoBlock += `<dt><table-text-big><b>${trainerTitle}</b></table-text-big></dt>`;
        infoBlock += `<dt><table-text-title>${trainerName}</table-text-title></dt>`;
        if (subtitle) infoBlock += `<dt><table-text-medium><b>${subtitle}</b></table-text-medium></dt>`;
        infoBlock += `</dl></td>`;

        if (trainer2File) {
            const spriteColor2 = vitColor2 || vitColor;
            trainerSprites += infoBlock;
            trainerSprites += `<td class="transparent"><div class="trainer-bgsprite ${spriteColor2}"><img src="${trainerImg(trainer2File)}" class="sprite-large"></div></td>`;
        } else {
            trainerSprites += infoBlock;
        }

        // Pok?ball preview
        let ballsHtml = '';
        for (let i = 0; i < ballsFull; i++)  ballsHtml += `<img src="${BALLFULL}" alt="Pok?mon">`;
        for (let i = 0; i < ballsEmpty; i++) ballsHtml += `<img src="${BALLEMPTY}" alt="Empty">`;

        const rewardCell = reward
            ? `<td class="transparent"><table-text-small>Reward:<br><b>${reward}</b></table-text-small></td>`
            : '';

        const ballsCell = (ballsFull + ballsEmpty > 0)
            ? `<td class="balls-preview round ${infoColorClass}"><div>${ballsHtml}</div></td>`
            : '';

        // Build team Pok?mon cards
        const teamDivs = Array.from(container.querySelectorAll('div[data-pokemon]'));
        const teamGrid = container.dataset.vitClass === 'VIT' ? 'team' : 'teamalt';
        let teamCards = '';
        teamDivs.forEach(div => {
            // Build a card similar to event Pok?mon but inside a table directly
            const dex     = div.dataset.pokemon;
            const name    = div.dataset.name;
            const type    = div.dataset.type;
            const level   = div.dataset.level;
            const ability = div.dataset.ability || '';
            const item    = div.dataset.item || 'None';
            const primaryType = type.split(',')[0].trim().toLowerCase();

            let abilityHtml = '';
            if (ability) abilityHtml = `<dt>Ability:</dt><dt>${ability}</dt>`;

            const moves = [];
            for (let i = 1; i <= 4; i++) {
                if (div.dataset['move' + i]) moves.push(div.dataset['move' + i]);
            }
            let movesHtml = '';
            if (moves.length > 0) {
                let rows = '';
                for (let i = 0; i < moves.length; i += 2) {
                    rows += '<tr>';
                    rows += moveHtml(moves[i]);
                    if (moves[i + 1]) rows += moveHtml(moves[i + 1]);
                    rows += '</tr>';
                }
                movesHtml = `<tr><td class="round" colspan="2"><table>${rows}</table></td></tr>`;
            }

            teamCards += `<table class="pkmn round ${primaryType}"><tr>
<td class="round"><img src="${pkmnImg(dex)}" alt="${name}" class="sprite-large"></td>
<td class="transparent" rowspan="2"><dl>
<dt>Type:</dt><dt>${typeBadges(type)}</dt>
${abilityHtml}
<dt>Held Item</dt><dt>${item}</dt></dl></td></tr>
<tr><td class="round">${name} Lv.&nbsp;${level}</td></tr>
${movesHtml}
</table>`;
        });

        // Assemble full VIT HTML
        const html = `<div class="tcontainer">
<input type="checkbox" role="button" id="${checkboxId}" class="toctogglecheckbox" style="display:none">
<table class="${vitClass} expand round ${vitColor} ${vitBorder}">
<tr><td class="trainer-info transparent"><table class="transparent">
<tr>${trainerSprites}</tr>
${(rewardCell || ballsCell) ? `<tr>${rewardCell}${ballsCell}</tr>` : ''}
</table></td></tr>
<tr><td class="transparent">
<div class="toctitle"><span class="toctogglespan"><label class="toctogglelabel" for="${checkboxId}"></label></span></div>
<div class="${teamGrid}" style="background:none;">${teamCards}</div>
</td></tr></table></div>`;

        container.outerHTML = html;
    });


    /* „Ÿ„Ÿ Utility functions „Ÿ„Ÿ */
    function wrapTcontainer(table) {
        if (!table.closest('.tcontainer')) {
            const wrapper = document.createElement('div');
            wrapper.className = 'tcontainer';
            table.parentNode.insertBefore(wrapper, table);
            wrapper.appendChild(table);
        }
    }

    function clearDataAttrs(el) {
        const attrs = Array.from(el.attributes).filter(a => a.name.startsWith('data-'));
        attrs.forEach(a => el.removeAttribute(a.name));
    }
});
