import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { CONTAINER_INFO_PATH } from './global-setup';

export default async function globalTeardown() {
  if (!existsSync(CONTAINER_INFO_PATH)) return;

  const { id } = JSON.parse(readFileSync(CONTAINER_INFO_PATH, 'utf-8')) as {
    id: string;
  };

  try {
    execFileSync('docker', ['stop', id], { stdio: 'ignore' });
    execFileSync('docker', ['rm', id], { stdio: 'ignore' });
  } catch {
    // Ryuk will clean up if docker commands fail
  }

  unlinkSync(CONTAINER_INFO_PATH);
}
