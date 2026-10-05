"use strict";

window.searchDictionary = async function searchDictionary(query, signal) {
  const response = await fetch("https://jotoba.de/api/search/words", {
    method: "POST",
    signal,
    headers: { Accept: "application/json", "Content-Type": "application/json" },
    body: JSON.stringify({ query, language: "English", no_english: false })
  });
  if (!response.ok) throw new Error(`Jotoba returned HTTP ${response.status}.`);
  const payload = await response.json();
  if (!Array.isArray(payload.words)) throw new Error("Jotoba returned an unsupported dictionary response.");
  // Keep the display/export record consistent across the two dictionary tools.
  return payload.words.map((word) => ({
    japanese: [{ word: word.reading?.kanji, reading: word.reading?.kana }],
    is_common: Boolean(word.common),
    audio: word.audio,
    senses: (word.senses || []).map((sense) => ({
      english_definitions: sense.glosses || [],
      parts_of_speech: (sense.pos || []).flatMap((part) => {
        if (typeof part === "string") return [part.replace(/([a-z])([A-Z])/g, "$1 $2")];
        return Object.entries(part).map(([name, subtype]) =>
          `${name}${typeof subtype === "string" && subtype !== "Normal" ? ` (${subtype})` : ""}`
            .replace(/([a-z])([A-Z])/g, "$1 $2"));
      })
    }))
  }));
};
