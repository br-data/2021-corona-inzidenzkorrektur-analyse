#!/usr/bin/env node

"use strict"



// ################################################################################
// Bibliotheken
// ################################################################################

const fs = require('fs');
const https = require('https');
const child_process = require('child_process');
const zlib = require('zlib');
const {resolve} = require('path');
const {folderTmp,date2index,bucketPath,minMeldedatum,landkreiseLookup} = require('./config.js');


// ################################################################################
// Hauptprogramm
// ################################################################################

(async () => {
	// lege das temporäre Verzeichnis an
	fs.mkdirSync(folderTmp, {recursive:true});

	// hole eine Liste aller RKI-Archiv-Dateien
	for (let file of await getFileList()) {
		let dateIndex = date2index(file.date);
		if (dateIndex < minMeldedatum) continue;

		// generiere einen Dateinamen für die temporäre Datei
		let tmpFilename = resolve(folderTmp, file.filename+'.json.gz');

		// wenn die temporäre Datei bereits existiert, dann gebe die Daten daraus zurück
		if (fs.existsSync(tmpFilename)) continue;

		console.log('   download '+file.date);

		let datenstand = date2index(file.date);

		// Bereite die Arrays für die Ergebnisse vor
		let result = new Map();

		// lade die RKI-Archiv-Datei runter
		let buffer = await fetchHttps(file.fullname);

		// dekomprimiere die Archiv-Datei und lese sie zeilenweise ein.
		for await (let line of lineXzipReader(buffer)) {
			line = JSON.parse(line);

			// Wenn der Datenstand in der Datei nicht dem Datenstand im Dateinamen entspricht
			// dann ist irgendwas nicht richtig
			if (date2index(line.DatenstandISO) !== datenstand) throw Error();

			// kennen wir die Landkreis-ID?
			if (!landkreiseLookup.has(line.IdLandkreis)) throw Error();

			let key = [line.DatenstandISO, line.MeldedatumISO, line.NeuerFall, line.IdLandkreis].join('_');

			if (!result.has(key)) result.set(key, {
				datenstand: line.DatenstandISO,
				meldedatum: line.MeldedatumISO,
				neuerFall: line.NeuerFall,
				idLandkreis: line.IdLandkreis,
				anzahlFall: 0,
			})

			result.get(key).anzahlFall += line.AnzahlFall;
		}

		// speichere die Daten als temporäre Datei
		result = Array.from(result.values());
		result = JSON.stringify(result);
		result = zlib.gzipSync(result);

		fs.writeFileSync(tmpFilename, result);
	}
})()



// ################################################################################
// Funktionen
// ################################################################################

async function getFileList() {
	// Die Liste aller RKI-Archiv-Daten befindet sich in index.txt
	let fileList = await fetchHttps(bucketPath+'index.txt');

	// Listenstring splitten, säuber und sortieren
	fileList = fileList.toString().split('\n').filter(l => l.length > 1).sort();

	// extrahiere Datum und Dateiname
	fileList = fileList.map(filename => ({
		date: filename.match(/^data_(202\d-\d\d-\d\d)-\d\d-\d\d\.ndjson\.xz$/)[1],
		filename,
		fullname: bucketPath+filename,
	}))

	// überprüfe, dass es zu jedem Tag maximal eine Datei gibt
	let dates = new Set(fileList.map(f => f.date));
	if (dates.size !== fileList.length) throw Error('multiple files at the same day')

	return fileList;
}

function fetchHttps(url) {
	// Verwende https, um Dateien als Buffer runterzuladen
	return new Promise((resolve, reject) => {
		https.get(url, response => {
			if (response.statusCode !== 200) return reject(response);
			let buf = [];
			response.on('data', data => buf.push(data));
			response.on('end', () => resolve(Buffer.concat(buf)));
			response.on('error', reject);
		}).on('error', reject)
	});
}

async function* lineXzipReader(bufferIn) {
	// nutze xz um die Daten zu entpacken
	const xz = child_process.spawn('xz', ['-d']);
	xz.on('error', err => {
		console.log('xz bricht ab mit dem Fehler:', JSON.stringify(err, null, '   '));
		switch (err.code) {
			case 'ENOENT': console.log('Hinweis: Ist xz korrekt installiert?'); break;
		}
		throw Error('xz funktioniert nicht');
	});
	xz.stderr.on('data', data => console.error(`stderr: ${data}`));

	// übergebe den buffer an xz
	xz.stdin.end(bufferIn);

	// merge die Antworten und gebe sie zeilenweise zurück
	let buffer = Buffer.alloc(0);
	for await (let block of xz.stdout) {
		buffer = Buffer.concat([buffer, block]);

		let pos, lastPos = 0;
		while ((pos = buffer.indexOf(10, lastPos)) >= 0) {
			yield buffer.slice(lastPos, pos).toString();
			lastPos = pos+1;
		}
		buffer = buffer.slice(lastPos);
	}
	if (buffer.length > 0) yield buffer.toString();
}
