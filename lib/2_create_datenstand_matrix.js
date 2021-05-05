#!/usr/bin/env node

"use strict"



// ################################################################################
// Bibliotheken
// ################################################################################

const fs = require('fs');
const zlib = require('zlib');
const {resolve} = require('path');
const {folderTmp, minDatenstand, minMeldedatum, date2index, index2date, landkreise, landkreiseLookup} = require('./config.js');


// ################################################################################
// Hauptprogramm
// ################################################################################

(async () => {

	let result = [];

	// hole eine Liste aller RKI-Archiv-Dateien
	for (let file of getFileList()) {
		let dateIndex = date2index(file.date);
		
		console.log('   parse '+file.date);

		// lade Daten
		let fallzahlen = fs.readFileSync(file.fullname);
		fallzahlen = zlib.gunzipSync(fallzahlen);
		fallzahlen = JSON.parse(fallzahlen);

		fallzahlen.forEach(f => {
			if (f.neuerFall < 1) return;

			const datenstand = date2index(f.datenstand);
			if (datenstand != dateIndex) throw Error();

			if (!landkreiseLookup.has(f.idLandkreis)) throw Error();
			const landkreis = landkreiseLookup.get(f.idLandkreis);
			
			for (let t = 0; t <= 0; t++) {
				let index = datenstand+t - minDatenstand;
				
				if (index < 0) continue;

				if (!result[index]) result[index] = Array(landkreise.length).fill(0);
				result[index][landkreis] += f.anzahlFall;
			}
		})
	}

	// füge die Ergebnisse zu der csv-Datei hinzu
	const csv = []
	result.forEach((row,i) => {
		csv.push(index2date(i+minDatenstand)+','+row.join(','));
	})

	csv.sort();

	// Kopfzeile der csv-Datei
	csv.unshift('datenstand,'+landkreise.join(','));

	// csv-Datei speichern
	fs.writeFileSync(resolve(__dirname, '../input/matrix_fallzahlen_datenstand.csv'), csv.join('\n'));
})()



// ################################################################################
// Funktionen
// ################################################################################

function getFileList() {
	// Die Liste aller RKI-Archiv-Daten im temp folder
	let fileList = fs.readdirSync(folderTmp);

	// Liste sortieren
	fileList = fileList.sort();

	// extrahiere Datum und Dateiname
	fileList = fileList.map(filename => {
		let match = filename.match(/^data_(202\d-\d\d-\d\d)-\d\d-\d\d\.ndjson\.xz\.json\.gz$/);
		if (!match) return false;
		return {
			date: match[1],
			filename,
			fullname: resolve(folderTmp, filename),
		}
	}).filter(l => l);

	return fileList;
}
