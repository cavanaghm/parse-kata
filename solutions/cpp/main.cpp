#include <fstream>
#include <cstdio>

using namespace std;

int findIndex(char arr[], int n, char target[], int matchLength, int start)
{
	int matched = 0;
	for (int i = start; i < n; i++)
	{
		if(arr[i] == target[matched]){
			matched++;
			if (matched == matchLength)
			{
				return i + 1;
			}
		}else{
			matched = 0;
		}
	}
	return -1;
}

int streamOutput(char arr[], int start, int end, FILE* output)
{
	int size = end - start;
	char buf[size];
	for(int i = start; i < end; i++)
	{
		buf[i - start] = arr[i];
	}
	fwrite(buf, size, 1, output);
	fwrite("\n", 1, 1, output);
	return 0;
}

int main()
{
	FILE* input;
	FILE* output;
	char buffer[1024 * 1024];
	input = fopen("input.txt", "r");
	output = fopen("cpp.txt", "a");
	char nextJson[3] = "	{";
	char nextTarget[11] = "\"title\": \"";
	char endTarget[2] = "\"";
	int idx = 0;
	while(!feof(input))
	{
		int bufSize = sizeof(buffer);
		fread(buffer, bufSize, 1, input);
		while(idx < bufSize)
		{
			int jsonStart = findIndex(buffer, bufSize, nextJson, 2, idx);
			int titleStart = findIndex(buffer, bufSize, nextTarget, 10, jsonStart);
			int titleEnd = findIndex(buffer, bufSize, endTarget, 1, titleStart) - 1;

			if(jsonStart < 0)
			{
				idx = bufSize;
				break;
			}
			if(titleEnd < 0)
			{
				idx = bufSize;
				break;
			}
			streamOutput(buffer, titleStart, titleEnd, output);

			idx = titleEnd;
		}
	}

	return 0;
}
