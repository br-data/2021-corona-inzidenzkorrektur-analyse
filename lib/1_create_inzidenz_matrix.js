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

	let csv = [];

	// hole eine Liste aller RKI-Archiv-Dateien
	for (let file of getFileList()) {
		let dateIndex = date2index(file.date);
		if (dateIndex < minDatenstand) continue;

		console.log('   parse '+file.date);

		// lade Daten
		let fallzahlen = fs.readFileSync(file.fullname);
		fallzahlen = zlib.gunzipSync(fallzahlen);
		fallzahlen = JSON.parse(fallzahlen);

		// Berechne die 7-Tage-Faelle
		let inzidenz = calc7TageFaelle(fallzahlen);

		// füge die Ergebnisse zu der csv-Datei hinzu
		inzidenz.forEach((row,i) => {
			csv.push(index2date(i+minMeldedatum+7)+','+file.date+','+row.join(','));
		})
	}

	csv.sort();

	// Kopfzeile der csv-Datei
	csv.unshift('tag_nach_meldezeitraum,datenstand,'+landkreise.join(','));

	// csv-Datei speichern
	fs.writeFileSync(resolve(__dirname, '../input/matrix_fallzahlen_7tage.csv'), csv.join('\n'));
})()



// ################################################################################
// Funktionen
// ################################################################################

function calc7TageFaelle(fallzahlen) {
	const result = [];

	fallzahlen.sort((a,b) => a.meldedatum < b.meldedatum ? -1 : 1);

	fallzahlen.forEach(f => {
		if (f.neuerFall < 0) return;

		const datenstand = date2index(f.datenstand);
		if (datenstand < minDatenstand) return;

		const meldedatum = date2index(f.meldedatum);
		if (meldedatum < minMeldedatum) return;

		if (!landkreiseLookup.has(f.idLandkreis)) throw Error();
		const landkreis = landkreiseLookup.get(f.idLandkreis);
		
		for (let m = 1; m <= 7; m++) {
			let index = meldedatum+m - minDatenstand;
			
			if (index < 0) continue;
			if (index > datenstand - minDatenstand) continue;

			if (!result[index]) result[index] = Array(landkreise.length).fill(0);
			result[index][landkreis] += f.anzahlFall;
		}
	})
	return result;
}

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
