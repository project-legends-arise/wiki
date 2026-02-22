/**
 * wiki.js ? Shared utilities for the wiki
 * Include via <script src="../../src/wiki.js"></script> (adjust depth)
 *
 * Features:
 *   1. Auto-generates a Table of Contents from h2/h3/h4 headings
 *   2. Wraps sections in Toggle Headings (collapsed by default on first visit)
 *   3. Adds a "Back to top" button
 *   4. Spoiler reveal on click
 */

document.addEventListener('DOMContentLoaded', () => {

    /* „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       1.  AUTO TABLE OF CONTENTS
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ */
    const container = document.querySelector('.container');
    if (!container) return;

    const headings = container.querySelectorAll('h2, h3, h4');
    if (headings.length < 2) return;         // don't bother if <2 sections

    // Remove old Italian placeholder
    container.querySelectorAll('h3').forEach(h => {
        if (h.textContent.trim().toLowerCase().startsWith('qui ci va indice')) {
            h.remove();
        }
    });

    // Assign IDs to headings that lack them
    const usedIds = new Set();
    headings.forEach(h => {
        if (!h.id) {
            let base = h.textContent.trim()
                .replace(/[^a-zA-Z0-9 ]/g, '')
                .replace(/\s+/g, '-')
                .toLowerCase();
            while (usedIds.has(base)) base += '-2';
            h.id = base;
        }
        usedIds.add(h.id);
    });

    // Build nested OL
    const toc = document.createElement('details');
    toc.className = 'wiki-toc';
    toc.open = true;
    const summary = document.createElement('summary');
    summary.textContent = 'Contents';
    toc.appendChild(summary);

    const rootOl = document.createElement('ol');
    let currentH2Li = null;
    let currentH3Ol = null;
    let currentH3Li = null;
    let currentH4Ol = null;

    headings.forEach(h => {
        // Skip headings inside .toggle-content that aren't the main sections
        // (e.g. nested tables) ? we only index direct-child section headings
        const tag = h.tagName;
        const li = document.createElement('li');
        const a = document.createElement('a');
        a.href = '#' + h.id;
        a.textContent = h.textContent.trim();
        li.appendChild(a);

        if (tag === 'H2') {
            rootOl.appendChild(li);
            currentH2Li = li;
            currentH3Ol = null;
            currentH3Li = null;
            currentH4Ol = null;
        } else if (tag === 'H3') {
            if (!currentH3Ol) {
                currentH3Ol = document.createElement('ol');
                (currentH2Li || rootOl).appendChild(currentH3Ol);
            }
            currentH3Ol.appendChild(li);
            currentH3Li = li;
            currentH4Ol = null;
        } else if (tag === 'H4') {
            if (!currentH4Ol) {
                currentH4Ol = document.createElement('ol');
                (currentH3Li || currentH2Li || rootOl).appendChild(currentH4Ol);
            }
            currentH4Ol.appendChild(li);
        }
    });

    toc.appendChild(rootOl);

    // Insert TOC after h1 (or at top of container)
    const h1 = container.querySelector('h1');
    if (h1) {
        // Insert after the intro table if one exists, otherwise after h1
        const introTable = container.querySelector('#intro');
        const anchor = introTable || h1;
        // Walk to the next sibling that's not whitespace
        let insertBefore = anchor.nextSibling;
        while (insertBefore && insertBefore.nodeType === 3 && !insertBefore.textContent.trim()) {
            insertBefore = insertBefore.nextSibling;
        }
        container.insertBefore(toc, insertBefore);
    } else {
        container.prepend(toc);
    }


    /* „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       2.  TOGGLE HEADINGS
       Wraps every h2 section in a toggle that is
       collapsed on first visit (sessionStorage tracks
       which sections the user has opened).
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ */
    const pageKey = 'wiki_opened_' + location.pathname;
    let openedSections = {};
    try { openedSections = JSON.parse(sessionStorage.getItem(pageKey)) || {}; } catch(e) {}

    const h2s = Array.from(container.querySelectorAll(':scope > h2'));
    h2s.forEach((h2, i) => {
        const sectionId = 'ts-' + (h2.id || i);

        // Collect all siblings between this h2 and the next h2 (or end)
        const contentNodes = [];
        let sib = h2.nextSibling;
        while (sib) {
            if (sib.nodeType === 1 && sib.tagName === 'H2') break;
            if (sib.nodeType === 1 && sib.tagName === 'H1') break;
            contentNodes.push(sib);
            sib = sib.nextSibling;
        }
        if (contentNodes.length === 0) return;

        // Build the toggle structure
        const wrapper = document.createElement('div');
        wrapper.className = 'toggle-section';

        const checkbox = document.createElement('input');
        checkbox.type = 'checkbox';
        checkbox.id = sectionId;
        checkbox.className = 'toggle-check';
        // Open if user previously opened it, or always keep first section open
        checkbox.checked = openedSections[sectionId] || i === 0;

        const label = document.createElement('label');
        label.htmlFor = sectionId;
        label.className = 'toggle-heading';

        // Move the h2 inside the label
        h2.parentNode.insertBefore(wrapper, h2);
        label.appendChild(h2);
        wrapper.appendChild(checkbox);
        wrapper.appendChild(label);

        const content = document.createElement('div');
        content.className = 'toggle-content';
        contentNodes.forEach(n => content.appendChild(n));
        wrapper.appendChild(content);

        // Persist state
        checkbox.addEventListener('change', () => {
            openedSections[sectionId] = checkbox.checked;
            sessionStorage.setItem(pageKey, JSON.stringify(openedSections));
        });
    });


    /* „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       3.  BACK-TO-TOP BUTTON
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ */
    const btn = document.createElement('button');
    btn.className = 'back-to-top';
    btn.innerHTML = '£';
    btn.title = 'Back to top';
    btn.addEventListener('click', () => window.scrollTo({ top: 0 }));
    document.body.appendChild(btn);

    window.addEventListener('scroll', () => {
        btn.style.display = window.scrollY > 400 ? 'flex' : 'none';
    }, { passive: true });


    /* „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       4.  SPOILER REVEAL
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ */
    document.querySelectorAll('.spoiler').forEach(el => {
        el.addEventListener('click', () => el.classList.toggle('revealed'));
    });


    /* „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       5.  SIDEBAR QUICK-NAV
       Builds a collapsible sidebar listing sibling
       pages in the same section (uses WIKI_NAV from
       wiki-data.js).

       TOGGLE OFF:
         Set  localStorage.setItem('wiki-sidebar','off')
         in your browser console to disable the sidebar.
         To re-enable:  localStorage.removeItem('wiki-sidebar')
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ */
    const sidebarEnabled = typeof WIKI_NAV !== 'undefined'
        && localStorage.getItem('wiki-sidebar') !== 'off';
    if (sidebarEnabled) {
        // Determine current page path relative to wiki root
        const pagePath = location.pathname.replace(/\\/g, '/');

        // Find which section contains this page
        let currentSection = null;
        let currentPages   = null;
        for (const [section, pages] of Object.entries(WIKI_NAV)) {
            if (pages.some(p => pagePath.endsWith(p.href) || pagePath.endsWith('/' + p.href))) {
                currentSection = section;
                currentPages = pages;
                break;
            }
        }

        if (currentSection && currentPages && currentPages.length > 1) {
            // Resolve relative prefix from Style.css link
            const styleLink2 = document.querySelector('link[href*="Style.css"]');
            let navPrefix = '../../';
            if (styleLink2) {
                const href2 = styleLink2.getAttribute('href');
                navPrefix = href2.replace(/src\/Styles\/Style\.css$/, '');
            }

            const sidebar = document.createElement('nav');
            sidebar.className = 'wiki-sidebar';
            sidebar.innerHTML = `
                <div class="wiki-sidebar-toggle" title="Toggle sidebar">?</div>
                <div class="wiki-sidebar-content">
                    <div class="wiki-sidebar-title">${currentSection}</div>
                    <ul>${currentPages.map(p => {
                        const isCurrent = pagePath.endsWith(p.href) || pagePath.endsWith('/' + p.href);
                        return `<li${isCurrent ? ' class="current"' : ''}><a href="${navPrefix}${p.href}">${p.title}</a></li>`;
                    }).join('')}</ul>
                    <div class="wiki-sidebar-home"><a href="${navPrefix}index.html">© Home</a></div>
                </div>`;
            document.body.appendChild(sidebar);

            // Toggle collapse
            const toggleBtn = sidebar.querySelector('.wiki-sidebar-toggle');
            const collapsed = localStorage.getItem('wiki-sidebar-collapsed') === '1';
            if (collapsed) {
                sidebar.classList.add('collapsed');
                toggleBtn.textContent = '?';
            }
            toggleBtn.addEventListener('click', () => {
                sidebar.classList.toggle('collapsed');
                const isCollapsed = sidebar.classList.contains('collapsed');
                toggleBtn.textContent = isCollapsed ? '?' : '?';
                localStorage.setItem('wiki-sidebar-collapsed', isCollapsed ? '1' : '0');
            });
        }
    }


    /* „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ
       6.  PAGE FOOTER ? Last-updated & category tags
       Reads <meta name="wiki-updated">, wiki-category,
       wiki-tags and renders a footer bar at the bottom
       of .container.
       „Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ„Ÿ */
    const metaUpdated  = document.querySelector('meta[name="wiki-updated"]');
    const metaCategory = document.querySelector('meta[name="wiki-category"]');
    const metaTags     = document.querySelector('meta[name="wiki-tags"]');

    if (metaUpdated || metaTags) {
        const footer = document.createElement('div');
        footer.className = 'wiki-page-footer';

        if (metaCategory) {
            const catSpan = document.createElement('span');
            catSpan.className = 'wiki-footer-category';
            catSpan.textContent = metaCategory.content;
            footer.appendChild(catSpan);
        }

        if (metaTags) {
            const tagsDiv = document.createElement('div');
            tagsDiv.className = 'wiki-footer-tags';
            metaTags.content.split(',').forEach(t => {
                const tag = t.trim();
                if (!tag) return;
                const pill = document.createElement('span');
                pill.className = 'wiki-footer-tag';
                pill.textContent = tag;
                tagsDiv.appendChild(pill);
            });
            footer.appendChild(tagsDiv);
        }

        if (metaUpdated) {
            const dateSpan = document.createElement('span');
            dateSpan.className = 'wiki-footer-date';
            const d = new Date(metaUpdated.content + 'T00:00:00');
            const formatted = d.toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
            dateSpan.textContent = 'Last updated: ' + formatted;
            footer.appendChild(dateSpan);
        }

        container.appendChild(footer);
    }
});
