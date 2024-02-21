export async function saveToFile(handle: FileSystemFileHandle, data: FileSystemWriteChunkType) {
	const stream = await handle.createWritable();
	await stream.write(data);
	await stream.close();
}

export function saveToFileOld(filename: string, data: Blob) {
	const href = createTempBlobFileUrl(data);

	const link = document.createElement('a');
	link.setAttribute('download', filename);
	link.href = href;

	link.click();
}

let blobFileUrl: string;
function createTempBlobFileUrl(data: Blob) {
	if (blobFileUrl) {
		window.URL.revokeObjectURL(blobFileUrl);
	}

	blobFileUrl = window.URL.createObjectURL(data);
	return blobFileUrl;
}
