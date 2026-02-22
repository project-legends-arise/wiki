/**
 * wiki-tables.js ? Plug-and-play table generator for the wiki.
 *
 * REQUIRED: Load wiki-data.js FIRST for auto-resolve:
 *   <script src="../../src/wiki-data.js"></script>
 *   <script src="../../src/wiki-tables.js"></script>
 *   <script src="../../src/wiki.js"></script>
 *
 * „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
 *  HOW TO USE ? write simple data rows, the script builds the
 *  full tables automatically.
 *
 *  AUTO-RESOLVE (when wiki-data.js is loaded):
 *    ? Pok?mon sprite + type are resolved from data-name alone
 *      ¨ data-pokemon and data-type are OPTIONAL
 *    ? Trainer sprite filename is resolved from data-trainer
 *      ¨ Use friendly names like "White Collar F" or exact
 *        filenames like "WhiteCollar_F" ? both work
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
 *  </table>
 *
 *  ???????????????????????????????????????????
 *  2)  ITEMS TABLE  (docs ? 5 cols)
 *  ???????????????????????????????????????????
 *
 *  <table data-wiki-table="items-doc">
 *    <tr data-item-id="293" data-name="Spring Coin" data-pocket="General"
 *        data-effect="A prized jade-colored coin." data-price="1000 P"></tr>
 *  </table>
 *
 *  ???????????????????????????????????????????
 *  3)  ITEMS TABLE  (key items ? 4 cols)
 *  ???????????????????????????????????????????
 *
 *  <table data-wiki-table="items-key">
 *    <tr data-item-id="293" data-name="Trainer Card" data-loc="Gifted by Lark"
 *        data-purpose="Stores your trainer data."></tr>
 *  </table>
 *
 *  ???????????????????????????????????????????
 *  4)  WILD SPAWNS TABLE  (auto-resolve!)
 *  ???????????????????????????????????????????
 *
 *  <table class="wildspawns-table round green border-bold"
 *         data-wiki-table="wild">
 *    <!-- Just the name ? sprite + type auto-resolved -->
 *    <tr data-name="Zigzagoon" data-levels="5-7" data-rate="40%"></tr>
 *    <!-- Time-sensitive -->
 *    <tr data-name="Pidove" data-levels="5-7" data-day="35%" data-night="0%"></tr>
 *    <!-- Encounter method separator -->
 *    <tr data-method="Surfing"></tr>
 *  </table>
 *
 *  ???????????????????????????????????????????
 *  5)  TRAINERS TABLE  (auto-resolve!)
 *  ???????????????????????????????????????????
 *
 *  <table class="trainers round gray border-bold"
 *         data-wiki-table="trainers">
 *
 *    <!-- Single Pok?mon ? no dex number or type needed -->
 *    <tr data-trainer="Guitarist" data-trainer-name="Guitarist Regina"
 *        data-pkmn-name="Timburr" data-pkmn-level="8" data-pkmn-item="None"></tr>
 *
 *    <!-- Multi Pok?mon -->
 *    <tr data-trainer="Drummer" data-trainer-name="Drummer Fabian"
 *        data-pkmn-name="Pidove" data-pkmn-level="8" data-pkmn-item="None"
 *        data-pkmn-name-2="Pidove" data-pkmn-level-2="9" data-pkmn-item-2="None"></tr>
 *
 *    <!-- Friendly alias for trainer class -->
 *    <tr data-trainer="White Collar F" data-trainer-name="White Collar Theodora"
 *        data-pkmn-name="Meowth" data-pkmn-level="10" data-pkmn-item="None"></tr>
 *
 *  </table>
 *
 *  ???????????????????????????????????????????
 *  6)  EVENT / INTERACTABLE POK?MON  (auto-resolve!)
 *  ???????????????????????????????????????????
 *
 *  <div class="event transparent" data-wiki-table="event">
 *    <div data-name="Turtwig" data-level="5" data-ability="Overgrow"
 *         data-item="Oran Berry"
 *         data-move1="Tackle|normal|physical"
 *         data-move2="Withdraw|water|status"></div>
 *  </div>
 *
 *  ???????????????????????????????????????????
 *  7)  VIT / BOSS TRAINER  (auto-resolve!)
 *  ???????????????????????????????????????????
 *
 *  <div data-wiki-table="vit"
 *       data-vit-class="VITalt" data-vit-color="lark" data-vit-border="border-bold"
 *       data-trainer="Lark" data-trainer-title="Rising Star"
 *       data-reward="$2800" data-balls-full="2" data-balls-empty="4">
 *
 *    <div data-name="Audino" data-level="3" data-ability="Regenerator"
 *         data-item="None"
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

    /* „Ÿ„Ÿ Auto-resolve: Pok?mon name ¨ { dex, type } „Ÿ„Ÿ */
    const _hasPokeDex = typeof POKEDEX !== 'undefined';
    function resolvePkmn(name) {
        if (!_hasPokeDex || !name) return null;
        return POKEDEX[name] || POKEDEX[cap(name.toLowerCase())] || null;
    }

    /* „Ÿ„Ÿ Auto-resolve: Trainer class name ¨ sprite filename „Ÿ„Ÿ */
    const _hasTrainerAliases = typeof TRAINER_ALIASES !== 'undefined';
    function resolveTrainer(classOrAlias) {
        if (!classOrAlias) return classOrAlias;
        // 1) Check alias table first (e.g. "White Collar F" ¨ "WhiteCollar_F")
        if (_hasTrainerAliases && TRAINER_ALIASES[classOrAlias]) {
            return TRAINER_ALIASES[classOrAlias];
        }
        // 2) Already a valid filename (e.g. "Guitarist") ? return as-is
        return classOrAlias;
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
        const name    = el.dataset.name;
        const lookup  = resolvePkmn(name);
        const dex     = el.dataset.pokemon || (lookup ? lookup.d : '0000');
        const type    = el.dataset.type || (lookup ? lookup.t : 'normal');
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
<td class="round"><img loading="lazy" src="${pkmnImg(dex)}" alt="${name}" class="sprite-large"></td>
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
            tr.innerHTML = `<td class="icon"><img loading="lazy" src="${itemImg(id)}" alt="${name}" class="sprite"></td><td class="name">${name}</td><td class="location">${loc}</td>`;
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
            tr.innerHTML = `<td class="icon"><img loading="lazy" src="${itemImg(id)}" alt="${name}" class="sprite"></td><td class="name">${name}</td><td class="location">${pocket}</td><td class="location">${effect}</td><td class="location">${price}</td>`;
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
            tr.innerHTML = `<td class="icon"><img loading="lazy" src="${itemImg(id)}" alt="${name}" class="sprite"></td><td class="name">${name}</td><td class="location">${loc}</td><td class="location">${purpose}</td>`;
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

        table.querySelectorAll('tr[data-pokemon], tr[data-name], tr[data-method]').forEach(tr => {
            if (tr.dataset.method !== undefined) {
                // Encounter method separator
                tr.innerHTML = `<th colspan="4">${tr.dataset.method}</th>`;
                tr.removeAttribute('data-method');
                return;
            }
            const name   = tr.dataset.name;
            const lookup = resolvePkmn(name);
            const dex    = tr.dataset.pokemon || (lookup ? lookup.d : '0000');
            const type   = (tr.dataset.type || (lookup ? lookup.t : 'normal')).toLowerCase();
            const primaryType = type.split(',')[0].trim();
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

            tr.innerHTML = `<td class="pokemon"><table><tr><td><div class="bg-sprite ${primaryType}"><img loading="lazy" src="${pkmnImg(dex)}" alt="${name}" class="sprite-medium"></div></td><td class="name">${name}</td></tr></table></td><td class="levels">${levels}</td>${rateHtml}`;
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
            const trainerClassRaw = tr.dataset.trainer;
            const trainerFile  = resolveTrainer(trainerClassRaw);
            const trainerName  = tr.dataset.trainerName || trainerClassRaw;
            const dblBattle    = tr.dataset.doubleBattle !== undefined;

            // Gather all Pok?mon (primary + extras numbered 2..6)
            const team = [];
            // Primary
            if (tr.dataset.pkmnName || tr.dataset.pokemon) {
                const pName = tr.dataset.pkmnName || '';
                const pLookup = resolvePkmn(pName);
                team.push({
                    dex:   tr.dataset.pokemon || (pLookup ? pLookup.d : '0000'),
                    name:  pName,
                    type:  tr.dataset.pkmnType || (pLookup ? pLookup.t : 'normal'),
                    level: tr.dataset.pkmnLevel || '?',
                    item:  tr.dataset.pkmnItem || 'None'
                });
            }
            // Additional (2..6)
            for (let i = 2; i <= 6; i++) {
                if (tr.dataset['pkmnName' + i] || tr.dataset['pokemon' + i]) {
                    const pName = tr.dataset['pkmnName' + i] || '';
                    const pLookup = resolvePkmn(pName);
                    team.push({
                        dex:   tr.dataset['pokemon' + i] || (pLookup ? pLookup.d : '0000'),
                        name:  pName,
                        type:  tr.dataset['pkmnType' + i] || (pLookup ? pLookup.t : 'normal'),
                        level: tr.dataset['pkmnLevel' + i] || '?',
                        item:  tr.dataset['pkmnItem' + i] || 'None'
                    });
                }
            }

            const teamCount = team.length || 1;

            // Build trainer icon cell
            let trainerIconHtml = `<table class="icon"><tr><td><img loading="lazy" src="${trainerImg(trainerFile)}" alt="${trainerName}" class="sprite"></td></tr><tr><td>${trainerName}</td></tr>`;
            if (dblBattle) {
                trainerIconHtml += `<tr><td class="round electrichl">Double Battle</td></tr>`;
            }
            trainerIconHtml += `</table>`;

            // Build Pok?mon cells
            const pkmnCells = team.map(p => {
                const types = p.type;
                return `<td><table class="pkmn round transparent border-none"><tr><td class="round"><img loading="lazy" src="${pkmnImg(p.dex)}" alt="${p.name}" class="sprite-medium"></td><td class="transparent" rowspan="2"><dl><dt>Type:</dt><dt>${typeBadges(types)}</dt><dt>Held Item</dt><dt>${p.item}</dt></dl></td></tr><tr><td class="round">${p.name} Lv.${p.level}</td></tr></table></td>`;
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
        const divs = Array.from(container.querySelectorAll('div[data-name], div[data-pokemon]'));
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
        const trainerFileRaw = container.dataset.trainer;
        const trainerFile  = resolveTrainer(trainerFileRaw);
        const trainerTitle = container.dataset.trainerTitle || '';
        const trainerName  = container.dataset.trainerName || trainerFileRaw;
        const subtitle     = container.dataset.trainerSubtitle || '';
        const reward       = container.dataset.reward || '';
        const ballsFull    = parseInt(container.dataset.ballsFull || '0');
        const ballsEmpty   = parseInt(container.dataset.ballsEmpty || '0');

        // Dual trainer support
        const trainer2Raw   = container.dataset.trainer2 || '';
        const trainer2File  = resolveTrainer(trainer2Raw);
        const vitColor2     = container.dataset.vitColor2 || '';

        // Info color class: use "{color}-light" if it exists, else same
        const infoColorClass = vitColor === 'lark' ? 'lark-light' : `${vitColor} border-none`;
        const spriteColorClass = vitColor === 'lark' ? 'lark-light' : vitColor;

        // Build trainer info area
        let trainerSprites = `<td class="transparent"><div class="trainer-bgsprite ${spriteColorClass}"><img loading="lazy" src="${trainerImg(trainerFile)}" class="sprite-large"></div></td>`;

        let infoBlock = `<td class="info round ${infoColorClass}"><dl>`;
        if (trainerTitle) infoBlock += `<dt><table-text-big><b>${trainerTitle}</b></table-text-big></dt>`;
        infoBlock += `<dt><table-text-title>${trainerName}</table-text-title></dt>`;
        if (subtitle) infoBlock += `<dt><table-text-medium><b>${subtitle}</b></table-text-medium></dt>`;
        infoBlock += `</dl></td>`;

        if (trainer2File) {
            const spriteColor2 = vitColor2 || vitColor;
            trainerSprites += infoBlock;
            trainerSprites += `<td class="transparent"><div class="trainer-bgsprite ${spriteColor2}"><img loading="lazy" src="${trainerImg(trainer2File)}" class="sprite-large"></div></td>`;
        } else {
            trainerSprites += infoBlock;
        }

        // Pok?ball preview
        let ballsHtml = '';
        for (let i = 0; i < ballsFull; i++)  ballsHtml += `<img loading="lazy" src="${BALLFULL}" alt="Pok?mon">`;
        for (let i = 0; i < ballsEmpty; i++) ballsHtml += `<img loading="lazy" src="${BALLEMPTY}" alt="Empty">`;

        const rewardCell = reward
            ? `<td class="transparent"><table-text-small>Reward:<br><b>${reward}</b></table-text-small></td>`
            : '';

        const ballsCell = (ballsFull + ballsEmpty > 0)
            ? `<td class="balls-preview round ${infoColorClass}"><div>${ballsHtml}</div></td>`
            : '';

        // Build team Pok?mon cards
        const teamDivs = Array.from(container.querySelectorAll('div[data-name], div[data-pokemon]'));
        const teamGrid = container.dataset.vitClass === 'VIT' ? 'team' : 'teamalt';
        let teamCards = '';
        teamDivs.forEach(div => {
            // Build a card similar to event Pok?mon but inside a table directly
            const name    = div.dataset.name;
            const pLookup = resolvePkmn(name);
            const dex     = div.dataset.pokemon || (pLookup ? pLookup.d : '0000');
            const type    = div.dataset.type || (pLookup ? pLookup.t : 'normal');
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
<td class="round"><img loading="lazy" src="${pkmnImg(dex)}" alt="${name}" class="sprite-large"></td>
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


    /* „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       SORTABLE TABLES  (opt-in via data-sortable)
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       Adds click-to-sort on header cells for any
       table with the data-sortable attribute OR for
       items-doc tables (auto-enabled).

       Usage:  <table data-sortable ...>
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ */
    document.querySelectorAll('table[data-sortable], .items-table, .wildspawns-table, [class*="items-doc"]').forEach(table => {
        const headerRow = table.querySelector('tr');
        if (!headerRow) return;
        const ths = Array.from(headerRow.querySelectorAll('th'));
        if (ths.length === 0) return;

        // Track sort state per column
        const sortState = {};  // colIndex ¨ 'asc' | 'desc'

        ths.forEach((th, colIdx) => {
            // Skip columns with colspan > 1 unless it's the "Item" header (colspan=2)
            const cs = parseInt(th.getAttribute('colspan') || '1');
            if (cs > 2) return;

            th.style.cursor = 'pointer';
            th.style.userSelect = 'none';
            th.title = 'Click to sort';
            const indicator = document.createElement('span');
            indicator.className = 'sort-indicator';
            indicator.textContent = ' ?';
            indicator.style.fontSize = '11px';
            indicator.style.opacity = '0.5';
            th.appendChild(indicator);

            th.addEventListener('click', () => {
                const dir = sortState[colIdx] === 'asc' ? 'desc' : 'asc';
                sortState[colIdx] = dir;

                // Reset other indicators
                ths.forEach((h, i) => {
                    const ind = h.querySelector('.sort-indicator');
                    if (ind) ind.textContent = i === colIdx
                        ? (dir === 'asc' ? ' £' : ' ¥')
                        : ' ?';
                });

                // Gather sortable rows (skip header & method separator rows)
                const rows = Array.from(table.querySelectorAll('tr')).filter(r => {
                    if (r === headerRow) return false;
                    // Skip method separators (rows that are all <th>)
                    if (r.querySelector('th') && !r.querySelector('td')) return false;
                    return true;
                });

                // Determine the actual cell index accounting for colspan
                let actualIdx = 0;
                for (let i = 0; i < colIdx; i++) {
                    actualIdx += parseInt(ths[i].getAttribute('colspan') || '1');
                }

                rows.sort((a, b) => {
                    const cellA = a.children[actualIdx];
                    const cellB = b.children[actualIdx];
                    if (!cellA || !cellB) return 0;
                    let valA = (cellA.textContent || '').trim();
                    let valB = (cellB.textContent || '').trim();

                    // Try numeric comparison
                    const numA = parseFloat(valA.replace(/[^0-9.\-]/g, ''));
                    const numB = parseFloat(valB.replace(/[^0-9.\-]/g, ''));
                    if (!isNaN(numA) && !isNaN(numB)) {
                        return dir === 'asc' ? numA - numB : numB - numA;
                    }
                    // String comparison
                    return dir === 'asc'
                        ? valA.localeCompare(valB)
                        : valB.localeCompare(valA);
                });

                // Re-append in sorted order
                const parent = rows[0]?.parentNode;
                if (parent) rows.forEach(r => parent.appendChild(r));
            });
        });

        table.removeAttribute('data-sortable');
    });


    /* „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       FILTERABLE TABLES  (opt-in via data-filterable)
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       Adds a search/filter input above the table.
       Auto-enabled for items-doc tables.

       Usage:  <table data-filterable ...>
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ */
    document.querySelectorAll('table[data-filterable], [class*="items-doc"]').forEach(table => {
        const wrapper = table.closest('.tcontainer') || table.parentElement;

        const filterInput = document.createElement('input');
        filterInput.type = 'text';
        filterInput.placeholder = 'Filter rowsc';
        filterInput.className = 'wiki-table-filter';
        wrapper.insertBefore(filterInput, table);

        filterInput.addEventListener('input', () => {
            const query = filterInput.value.trim().toLowerCase();
            const rows = Array.from(table.querySelectorAll('tr'));
            rows.forEach((r, i) => {
                if (i === 0) return; // skip header
                // Keep method separators visible
                if (r.querySelector('th') && !r.querySelector('td')) return;
                const text = (r.textContent || '').toLowerCase();
                r.style.display = !query || text.includes(query) ? '' : 'none';
            });
        });

        table.removeAttribute('data-filterable');
    });

});
