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

		const slice = chunkSlice(lastTail, data)
		lastTail = undefined;
		var [titles, tail] = parseChunk(slice.head)
		if(tail) lastTail = tail;
		this.push(titles)
		done()
};

readStream
	.pipe(parser)
	.pipe(writeStream)

function chunkSlice(tail, chunk){
	if(!tail) return {head:chunk}
	var sliceLength = chunk.byteLength + tail.byteLength;
	var head = Buffer.alloc(sliceLength)
	tail.copy(head)
	chunk.copy(head, tail.byteLength)
	return {
		head: head,
	}
}

function parseChunk(data){
	var titles = [];
	var tail;
	var size = data.byteLength;
	var target = utf8.encode('"title": "')
	var jsonStart = utf8.encode('	{"')
	var idx = 0;

	var lastJsonStart = 0;
	while (idx < size){
		var nextJsonStart = data.indexOf(jsonStart, idx)
		var nextTargetIdx = data.indexOf(target, nextJsonStart)

		if( nextJsonStart < 0){
			tail = data.slice(lastJsonStart)
		}else{
			lastJsonStart = nextJsonStart
		}
		if (nextTargetIdx < 0){
			tail = data.slice(idx)
			break;
		 } else {
			var titleStart = nextTargetIdx + 10;
			var titleEnd = data.indexOf(utf8.encode('",'), titleStart)
			var lineEnd = data.indexOf(utf8.encode("\n"), titleEnd)

			if (titleEnd < 0) {
				tail = data.slice(lastJsonStart)
				break;
			}

			titles.push(...data.slice(titleStart, titleEnd))
			titles.push(utf8.encode('\n'))

			if (lineEnd < 0) break

			idx = lineEnd;
		 }
	}
	titles = Buffer.from(titles)
	return [titles, tail]
}
