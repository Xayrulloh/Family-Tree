import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';
import { E2E_CONTAINER_INFO_PATH } from './global-setup.e2e';

export default async function globalTeardownE2E() {
  if (!existsSync(E2E_CONTAINER_INFO_PATH)) return;

  const { pgId } = JSON.parse(
    readFileSync(E2E_CONTAINER_INFO_PATH, 'utf-8'),
  ) as { pgId: string };

  try {
    execFileSync('docker', ['stop', pgId], { stdio: 'ignore' });
    execFileSync('docker', ['rm', pgId], { stdio: 'ignore' });
  } catch {
    // Ryuk will clean up if docker commands fail
  }

  unlinkSync(E2E_CONTAINER_INFO_PATH);
}
