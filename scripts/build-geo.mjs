/**
 * Extrait de Natural Earth (world-atlas, 1:10m, domaine public) les pays
 * d'Afrique de l'Ouest, pour dessiner côtes et frontières exactes au moment
 * où la caméra approche du Sénégal. Sortie : public/geo/west-africa.json.
 *   node scripts/build-geo.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { createRequire } from "node:module";
import { feature } from "topojson-client";

const require = createRequire(import.meta.url);
const topo = JSON.parse(readFileSync(require.resolve("world-atlas/countries-10m.json"), "utf8"));
const countries = feature(topo, topo.objects.countries);

// Emprise de la texture régionale (doit rester identique à content/journey.ts → REGION).
const BBOX = { west: -26, east: -2, south: 4, north: 28 };

const inBox = ([lon, lat]) => lon >= BBOX.west - 2 && lon <= BBOX.east + 2 && lat >= BBOX.south - 2 && lat <= BBOX.north + 2;
const round = (v) => Math.round(v * 1000) / 1000;

const out = [];
for (const f of countries.features) {
  const polys = f.geometry?.type === "Polygon" ? [f.geometry.coordinates] : f.geometry?.type === "MultiPolygon" ? f.geometry.coordinates : [];
  const rings = [];
  for (const poly of polys) {
    for (const ring of poly) {
      if (ring.some(inBox)) rings.push(ring.map(([lon, lat]) => [round(lon), round(lat)]));
    }
  }
  if (rings.length) out.push({ id: f.id, name: f.properties.name, rings });
}

// France métropolitaine (approche de la France au début du voyage) : pays voisins inclus.
const FR = { west: -6, east: 10, south: 41, north: 52 };
const inFr = ([lon, lat]) => lon >= FR.west - 3 && lon <= FR.east + 3 && lat >= FR.south - 3 && lat <= FR.north + 3;
const fr = [];
for (const f of countries.features) {
  const polys = f.geometry?.type === "Polygon" ? [f.geometry.coordinates] : f.geometry?.type === "MultiPolygon" ? f.geometry.coordinates : [];
  const rings = [];
  for (const poly of polys) for (const ring of poly) if (ring.some(inFr)) rings.push(ring.map(([lon, lat]) => [round(lon), round(lat)]));
  if (rings.length) fr.push({ id: f.id, name: f.properties.name, rings });
}

mkdirSync("public/geo", { recursive: true });
writeFileSync("public/geo/france.json", JSON.stringify({ source: "Natural Earth 1:10m via world-atlas@2.0.2 (domaine public)", bbox: FR, countries: fr }));
console.log("France :", fr.map((c) => c.name).join(", "));
const data = { source: "Natural Earth 1:10m via world-atlas@2.0.2 (domaine public)", bbox: BBOX, countries: out };
writeFileSync("public/geo/west-africa.json", JSON.stringify(data));
console.log(out.map((c) => c.name).join(", "));
console.log(`${(JSON.stringify(data).length / 1024).toFixed(0)} KB`);
