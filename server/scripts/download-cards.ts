import { writeFileSync } from 'fs';
import { join } from 'path';

const BASE = 'https://raw.githubusercontent.com/tom-james-watson/wikitrivia/master/public/decks';

interface IndexNode {
    id: string;
    children?: IndexNode[];
}

console.log('Fetching deck index…');
const index = await fetch(`${BASE}/index.json`).then(r => r.json()) as IndexNode;

function extractIds(node: IndexNode): string[] {
    const ids = [node.id];
    if (node.children) ids.push(...node.children.flatMap(extractIds));
    return ids;
}

// Skip the root "all" node — it would be enormous; use category-level decks
const allIds = extractIds(index).filter(id => id !== 'all');
console.log(`Found ${allIds.length} deck IDs`);

const allCards = new Map<string, unknown>();
let fetched = 0;

for (const id of allIds) {
    try {
        const res = await fetch(`${BASE}/${id}.json`);
        if (!res.ok) continue; // some IDs may not have a corresponding file
        const cards = await res.json() as Array<Record<string, unknown>>;
        for (const card of cards) {
            if (card.qid && !allCards.has(card.qid as string)) {
                allCards.set(card.qid as string, card);
            }
        }
        fetched++;
        if (fetched % 20 === 0) console.log(`  ${fetched} decks fetched, ${allCards.size} unique cards so far…`);
    } catch {
        // skip failed fetches silently
    }
}

const out = Array.from(allCards.values());
const outPath = join(import.meta.dir, '../data/cards-raw.json');
writeFileSync(outPath, JSON.stringify(out));
console.log(`Done — ${out.length} unique cards written to server/data/cards-raw.json`);
