const fs = require('fs');
var Transform = require('stream').Transform;

var parser = new Transform()
var input = process.argv[2];
var output = process.argv[3];

console.log(`Reading from: ${input}`)
console.log(`Writing to: ${output}`)

var readStream = fs.createReadStream(input)
var writeStream = fs.createWriteStream(output)

const utf8 = new TextEncoder();

var lastTail = Buffer.alloc(0);

parser._transform = function (data, encoding, done){

		const slice = chunkSlice(data, lastTail)
		lastTail = slice.tail;
		var titles = parseChunk(slice.head)
		this.push(titles)
		done()
};

readStream
	.pipe(parser)
	.pipe(writeStream)

var endl = utf8.encode("\n");
function chunkSlice(chunk, tail){
	var indexOfLastNewLine = chunk.lastIndexOf(endl);
	var chunkSize = chunk.byteLength
	var tailSize = tail?.byteLength  || 0;
	var sliceLength = chunkSize - (chunkSize - indexOfLastNewLine) + tailSize;
	var head = Buffer.alloc(sliceLength)
	tail && tail.copy(head)
	chunk.copy(head, tailSize)
	return {
		head: head,
		tail: chunk.slice(indexOfLastNewLine),
	}
}

var target = utf8.encode('"title": "')
var jsonStart = utf8.encode('	{"')
var targetEnd = utf8.encode('",')
function parseChunk(data){
	var titles = [];
	var idx = 0;

	while (idx < data.byteLength){
		var nextJsonStart = data.indexOf(jsonStart, idx)
		var nextTargetIdx = data.indexOf(target, nextJsonStart)

		if (nextTargetIdx < 0){
			break;
		 } else {
			var titleStart = nextTargetIdx + 10;
			var titleEnd = data.indexOf(targetEnd, titleStart)
			var lineEnd = data.indexOf(endl, titleEnd)

			if (titleEnd < 0) {
				break;
			}

			titles.push(data.slice(titleStart, titleEnd))
			titles.push(endl)

			idx = lineEnd;
		 }
	}
	titles = Buffer.concat(titles)
	return titles
}
