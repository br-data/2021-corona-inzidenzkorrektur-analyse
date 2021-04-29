#!/usr/bin/env node

"use strict"



// ################################################################################
// Bibliotheken
// ################################################################################

const fs = require('fs');
const https = require('https');
const child_process = require('child_process');
const {resolve} = require('path');



// ################################################################################
// Konstanten
// ################################################################################

// wo liegen die RKI-Rohdaten
const bucketPath = 'https://storage.googleapis.com/brdata-public-data/rki-corona-archiv/2_parsed/';
// Verzeichnis für temporäre Dateien
const folderTmp = resolve(__dirname, 'tmp_matrix');
// minimaler Datenstand
const minDatenstand = date2index('2021-01-01');
const minMeldedatum = minDatenstand-7;
// Liste der Landkreis-IDs
const landkreise = '01001,01002,01003,01004,01051,01053,01054,01055,01056,01057,01058,01059,01060,01061,01062,02000,03101,03102,03103,03151,03153,03154,03155,03157,03158,03159,03241,03251,03252,03254,03255,03256,03257,03351,03352,03353,03354,03355,03356,03357,03358,03359,03360,03361,03401,03402,03403,03404,03405,03451,03452,03453,03454,03455,03456,03457,03458,03459,03460,03461,03462,04011,04012,05111,05112,05113,05114,05116,05117,05119,05120,05122,05124,05154,05158,05162,05166,05170,05314,05315,05316,05334,05358,05362,05366,05370,05374,05378,05382,05512,05513,05515,05554,05558,05562,05566,05570,05711,05754,05758,05762,05766,05770,05774,05911,05913,05914,05915,05916,05954,05958,05962,05966,05970,05974,05978,06411,06412,06413,06414,06431,06432,06433,06434,06435,06436,06437,06438,06439,06440,06531,06532,06533,06534,06535,06611,06631,06632,06633,06634,06635,06636,07111,07131,07132,07133,07134,07135,07137,07138,07140,07141,07143,07211,07231,07232,07233,07235,07311,07312,07313,07314,07315,07316,07317,07318,07319,07320,07331,07332,07333,07334,07335,07336,07337,07338,07339,07340,08111,08115,08116,08117,08118,08119,08121,08125,08126,08127,08128,08135,08136,08211,08212,08215,08216,08221,08222,08225,08226,08231,08235,08236,08237,08311,08315,08316,08317,08325,08326,08327,08335,08336,08337,08415,08416,08417,08421,08425,08426,08435,08436,08437,09161,09162,09163,09171,09172,09173,09174,09175,09176,09177,09178,09179,09180,09181,09182,09183,09184,09185,09186,09187,09188,09189,09190,09261,09262,09263,09271,09272,09273,09274,09275,09276,09277,09278,09279,09361,09362,09363,09371,09372,09373,09374,09375,09376,09377,09461,09462,09463,09464,09471,09472,09473,09474,09475,09476,09477,09478,09479,09561,09562,09563,09564,09565,09571,09572,09573,09574,09575,09576,09577,09661,09662,09663,09671,09672,09673,09674,09675,09676,09677,09678,09679,09761,09762,09763,09764,09771,09772,09773,09774,09775,09776,09777,09778,09779,09780,10041,10042,10043,10044,10045,10046,11001,11002,11003,11004,11005,11006,11007,11008,11009,11010,11011,11012,12051,12052,12053,12054,12060,12061,12062,12063,12064,12065,12066,12067,12068,12069,12070,12071,12072,12073,13003,13004,13071,13072,13073,13074,13075,13076,14511,14521,14522,14523,14524,14612,14625,14626,14627,14628,14713,14729,14730,15001,15002,15003,15081,15082,15083,15084,15085,15086,15087,15088,15089,15090,15091,16051,16052,16053,16054,16055,16056,16061,16062,16063,16064,16065,16066,16067,16068,16069,16070,16071,16072,16073,16074,16075,16076,16077'.split(',');
const landkreiseLookup = new Map(landkreise.map((s,i) => [s,i]));



// ################################################################################
// Hauptprogramm
// ################################################################################

(async () => {
	// lege das temporäre Verzeichnis an
	fs.mkdirSync(folderTmp, {recursive:true});

	let csv = [];

	// hole eine Liste aller RKI-Archiv-Dateien
	for (let file of await getFileList()) {
		let dateIndex = date2index(file.date);
		if (dateIndex < minDatenstand) continue;

		// Berechne Fallzahlen pro Datenstand/Meldetag
		let fallzahlen = await getFallzahlen(file);

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
	let result = [];
	for (let d = 0; d < fallzahlen.length-6; d++) {
		result.push(landkreise.map((l,i) => {
			let s = 0;
			for (let m = 0; m < 7; m++) s += fallzahlen[d+m][i];
			return s;
		}))
	}
	return result;
}

async function getFallzahlen(file) {
	// generiere einen Dateinamen für die temporäre Datei
	let tmpFilename = resolve(folderTmp, file.filename+'.json');

	// wenn die temporäre Datei bereits existiert, dann gebe die Daten daraus zurück
	if (fs.existsSync(tmpFilename)) {
		console.log('   '+file.date+' loading');
		return JSON.parse(fs.readFileSync(tmpFilename));
	}

	console.log('   '+file.date+' parsing');

	let datenstand = date2index(file.date);
	let meldeTagMin = minMeldedatum;
	let meldeTagMax = datenstand-1;

	// Bereite die Arrays für die Ergebnisse vor
	let result = [];
	for (let i = 0; i <= meldeTagMax-meldeTagMin; i++) result.push(Array(landkreise.length).fill(0));

	// lade die RKI-Archiv-Datei runter
	let buffer = await fetchHttps(file.fullname);

	// dekomprimiere die Archiv-Datei und lese sie zeilenweise ein.
	for await (let line of lineXzipReader(buffer)) {
		line = JSON.parse(line);

		// Wenn der Datenstand in der Datei nicht dem Datenstand im Dateinamen entspricht
		// dann ist irgendwas nicht richtig
		if (date2index(line.DatenstandISO) !== datenstand) throw Error();


		let meldeTag = date2index(line.MeldedatumISO);
		// Ist die Meldung zu alt, kann sie ignoriert werden
		if (meldeTag < meldeTagMin) continue;
		// Ist die Meldung vom Datenstand oder älter, dann ist was nicht in Ordnung
		if (meldeTag > meldeTagMax) throw Error();

		// kennen wir die Landkreis-ID?
		if (!landkreiseLookup.has(line.IdLandkreis)) throw Error();
		// Finde den Landkreis und seinen Index
		let landkreis = landkreiseLookup.get(line.IdLandkreis);
		
		// addiere die fälle pro Meldetag und Landkreis auf
		result[meldeTag-meldeTagMin][landkreis] += line.AnzahlFall;
	}

	// speichere die Daten als temporäre Datei
	fs.writeFileSync(tmpFilename, JSON.stringify(result));

	return result;
}

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



// ################################################################################
// weitere Hilfsfunktionen
// ################################################################################

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

function date2index(date) {
	// konvertiere ein ISO-Datum in die Anzahl der Tage seit 1970-01-01
	return Math.round(Date.parse(date)/86400000);
}

function index2date(index) {
	// konvertiere eine Anzahl der Tage seit 1970-01-01 in ein ISO-Datum
	return (new Date((index+0.5)*86400000)).toISOString().slice(0,10);
}
