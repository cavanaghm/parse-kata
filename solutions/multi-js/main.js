const fs = require('fs');
var Transform = require('stream').Transform;
const { Worker, IsMainThread } = require('worker_threads');
var parser = new Transform()
var input = process.argv[2];
var output = process.argv[3];
const maxThreads = process.argv[4] || 2;
var workerCount = 1; //Main thread

var readStream = fs.createReadStream(input)
console.log(`Reading from: ${input}`)

var writeStream;
var outputHandle;
var writeStream = fs.createWriteStream(output)
console.log(`Writing to: ${output}`)

const utf8 = new TextEncoder();

var lastTail = Buffer.alloc(0);

parser._transform = function (data, encoding, done){

		const slice = chunkSlice(data, lastTail)
		lastTail = slice.tail;
		if(workerCount < maxThreads){
			const worker = new Worker('./solutions/multi-js/parse.js', {
				workerData: slice.head,
			})
			workerCount++
			worker.once("message", res => {
				var titles = res;
				this.push(titles)
				workerCount--
			})
		}else{
			var titles = parseChunk(slice.head)
			this.push(titles)
		}
		done()
};

readStream
	.pipe(parser)
	.pipe(writeStream)


var lineEnd = utf8.encode("\n");
function chunkSlice(chunk, tail){
	var indexOfLastNewLine = chunk.lastIndexOf(lineEnd);

	var sliceLength = chunk.byteLength + indexOfLastNewLine;
	var head = Buffer.alloc(sliceLength)
	tail && tail.copy(head)
	chunk.copy(head, tail?.byteLength || 0)
	return {
		head: head,
		tail: chunk.slice(indexOfLastNewLine),
	}
}

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
