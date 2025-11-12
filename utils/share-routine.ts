import * as FileSystem from 'expo-file-system';

let _openSheet: ((id: number) => void) | null = null;

export const setShareSheetOpener = (opener: (id: number) => void) => {
  _openSheet = opener;
};

export const shareRoutine = (routineId: number) => {
  _openSheet?.(routineId);
};

// helper used by the sheet, creates a local file:// URI
export const shareViaFile = async (compactString: string): Promise<string> => {
  const fileName = `routine_${Date.now()}.txt`;
  const fileUri = `${FileSystem.cacheDirectory}${fileName}`;

  await FileSystem.writeAsStringAsync(fileUri, compactString, {
    encoding: FileSystem.EncodingType.UTF8,
  });

  // file://…
  return fileUri;
};
