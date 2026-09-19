// Pulls the two copies of every FAQ answer out of a page: the one the reader sees,
// and the one the FAQPage JSON-LD hands to Google. They have to say the same thing.

// <style>/<script> bodies are prose-shaped enough to fool the tag regexes below —
// nutrition.html has a CSS comment containing the literal text "<details>/<summary>".
const stripCode = (html) =>
  html.replace(/<style\b[^>]*>[\s\S]*?<\/style>/gi, '')
      .replace(/<script\b(?![^>]*application\/ld\+json)[^>]*>[\s\S]*?<\/script>/gi, '');

// Mirrors how a browser builds innerText: inline tags vanish, everything else becomes a space.
// (Collapsing <br> to nothing is what glued headings together on 2026-09-19.)
const INLINE = /<\/?(?:a|b|i|em|strong|span|bdi|small|sup|sub|u|abbr|time|mark)(?=[\s/>])[^>]*>/gi;

export const faqText = (html) =>
  html.replace(/<p class="faq-links">[\s\S]*?<\/p>/gi, '')  // related-reading row, not part of the answer
      .replace(INLINE, '')
      .replace(/<[^>]+>/g, ' ')
      .replace(/&nbsp;/g, ' ').replace(/&amp;/g, '&').replace(/&quot;/g, '"')
      .replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>')
      .replace(/\s+/g, ' ').trim();

const FAQ_Q = /<(\w+)[^>]*class="faq-q"[^>]*>([\s\S]*?)<\/\1>/g;
const FAQ_A = /<(\w+)[^>]*class="faq-a"[^>]*>([\s\S]*?)<\/\1>/g;
const contents = (re, html) => [...html.matchAll(re)].map((m) => m[2]);

/** Every Q/A pair a reader can actually see, across the three FAQ markup styles on the site. */
export function visibleFaq(html) {
  const body = stripCode(html);
  const qs = contents(FAQ_Q, body);
  const as = contents(FAQ_A, body);
  if (qs.length !== as.length) throw new Error(`faq-q/faq-a mismatch: ${qs.length} vs ${as.length}`);
  const pairs = qs.map((q, i) => ({ q: faqText(q), a: faqText(as[i]) }));
  // index/kids/pilates use a bare <details><summary>Q</summary><p>A</p></details> instead.
  for (const [, block] of body.matchAll(/<details\b[^>]*>([\s\S]*?)<\/details>/g)) {
    const sum = /<summary\b[^>]*>([\s\S]*?)<\/summary>/.exec(block);
    if (!sum || sum[0].includes('faq-q')) continue;
    pairs.push({ q: faqText(sum[1]), a: faqText(block.slice(sum.index + sum[0].length)) });
  }
  return pairs;
}

/** Every Q/A pair declared to Google in FAQPage JSON-LD. */
export function schemaFaq(html) {
  const pairs = [];
  for (const [, json] of html.matchAll(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/g)) {
    const data = JSON.parse(json);
    for (const node of [].concat(data['@graph'] || data)) {
      if (node?.['@type'] !== 'FAQPage') continue;
      for (const e of node.mainEntity || [])
        pairs.push({ q: faqText(e.name || ''), a: faqText(e.acceptedAnswer?.text || '') });
    }
  }
  return pairs;
}
