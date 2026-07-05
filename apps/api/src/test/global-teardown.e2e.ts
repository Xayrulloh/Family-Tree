import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync, unlinkSync } from 'node:fs';

export default async function globalTeardownE2E() {
  const containerInfoPath = process.env.E2E_CONTAINER_INFO_FILE;

  if (!containerInfoPath || !existsSync(containerInfoPath)) return;

  const { pgId } = JSON.parse(readFileSync(containerInfoPath, 'utf-8')) as {
    pgId: string;
  };

  try {
    execFileSync('docker', ['stop', pgId], { stdio: 'ignore' });
    execFileSync('docker', ['rm', pgId], { stdio: 'ignore' });
  } catch {
    // Ryuk will clean up if docker commands fail
  }

  unlinkSync(containerInfoPath);
}
