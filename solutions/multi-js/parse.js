const { workerData, parentPort } = require('worker_threads');

const utf8 = new TextEncoder();
var target = utf8.encode('"title": "')
var jsonStart = utf8.encode('	{"')
var endTitle = utf8.encode('",');
function parseChunk(data){
	var titles = [];
	var idx = 0;

	while (idx < data.byteLength){
		var nextJsonStart = data.indexOf(jsonStart, idx)
		var nextTargetIdx = data.indexOf(target, nextJsonStart)

		if (nextTargetIdx < 0 || nextJsonStart < 0){
			break;
		 } else {
			var titleStart = nextTargetIdx + 10;
			var titleEnd = data.indexOf(endTitle, titleStart)
			var nextLine = data.indexOf(lineEnd, titleEnd)

			if (titleEnd < 0) {
				break;
			}

			titles.push(...data.slice(titleStart, titleEnd))
			titles.push(lineEnd)

			if (nextLine < 0) break

			idx = nextLine;
		 }
	}
	titles = Buffer.from(titles)
	return titles;
}

parentPort.postMessage(parseChunk(workerData))

