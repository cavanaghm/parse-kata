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
var targetEnd = utf8.encode('",')

function findIndex(data, target, start){
	return data.indexOf(target, start)
}


function concat(titles){
	return Buffer.concat(titles)
}

function parseChunk(data){
	var titles = [];
	var idx = 0;
	var chunkSize = data.byteLength

	while (idx < chunkSize){
		var nextTargetIdx = findIndex(data, target, idx)

		if (nextTargetIdx < 0) break;

		var titleStart = nextTargetIdx + 10;
		var titleEnd = findIndex(data, targetEnd, titleStart)
		var lineEnd = findIndex(data, endl, titleEnd)

		if (titleEnd < 0) break;


		titles.push(data.slice(titleStart, titleEnd))
		titles.push(endl)

		if(lineEnd + 50 > chunkSize) break
		idx = lineEnd;
	}
	titles = concat(titles);
	return titles
}
