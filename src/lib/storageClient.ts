import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';

export async function uploadFile(storage: any, path: string, file: File) {
  const r = ref(storage, path);
  await uploadBytes(r, file as any);
  const url = await getDownloadURL(r);
  return url;
}

export default uploadFile;
