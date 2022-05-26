#include <fstream>
#include <iostream>

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

//int streamOutput(char arr[], int start, int end, FILE* output)
//{
//	int size = end - start;
//	char buf[size];
//	for(int i = start; i < end; i++)
//	{
//		buf[i - start] = arr[i];
//	}
//	fwrite(buf, 1, size, output);
//	fwrite("\n", 1, 1, output);
//	return 0;
//}

int main()
{
	ifstream input;
	ofstream output;
	char buffer[1024 * 1024];
	input.open("input.txt");
	output.open("cpp.txt");
	char nextJson[3] = "	{";
	char nextTarget[11] = "\"title\": \"";
	char endTarget[2] = "\"";
	int idx = 0;
	int lines = 0;
	int newReads = 0;
	while(!input.eof())
	{
		idx = 0;
		int bufSize = sizeof(buffer);
		input.read(buffer, sizeof(buffer));
		newReads++;
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
			lines++;
		//	streamOutput(buffer, titleStart, titleEnd, output);

			idx = titleEnd;
		}
	}
	cout << newReads << endl;
	cout << lines;
	return 0;
}
