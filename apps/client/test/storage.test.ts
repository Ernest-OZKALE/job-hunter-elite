import { describe, it, expect, vi } from 'vitest';

// mock firebase/storage module
vi.mock('firebase/storage', () => {
  return {
    ref: (s: any, p: string) => ({ path: p }),
    uploadBytes: vi.fn().mockResolvedValue({}),
    getDownloadURL: vi.fn().mockResolvedValue('https://storage.test/download.pdf')
  };
});

import { uploadFile } from '../src/lib/storageClient';

describe('uploadFile', () => {
  it('calls storage APIs and returns a download URL', async () => {
    const fakeStorage = {} as any;
    const url = await uploadFile(fakeStorage, 'users/uid/files/file.pdf', new File(['x'], 'file.pdf'));
    expect(url).toBe('https://storage.test/download.pdf');
  });
});
