import { NextResponse } from 'next/server';
import { execSync } from 'child_process';
import { existsSync, unlinkSync } from 'fs';
import { join } from 'path';

const ARCHIVE_PATH = '/tmp/noveluxe-export.tar.gz';

export async function GET() {
  try {
    // Generate fresh archive
    if (existsSync(ARCHIVE_PATH)) unlinkSync(ARCHIVE_PATH);
    execSync(
      `cd /home/z/my-project && tar czf ${ARCHIVE_PATH} --exclude='node_modules' --exclude='.next' --exclude='.git' --exclude='tool-results' --exclude='*.log' --exclude='db/*.db-journal' --exclude='examples' --exclude='mini-services' --exclude='dev.log' --exclude='skills' .`,
      { stdio: 'pipe' }
    );

    const { readFile } = await import('fs/promises');
    const buffer = await readFile(ARCHIVE_PATH);

    return new NextResponse(buffer, {
      headers: {
        'Content-Type': 'application/gzip',
        'Content-Disposition': 'attachment; filename="noveluxe-project.tar.gz"',
        'Content-Length': buffer.length.toString(),
      },
    });
  } catch (err) {
    console.error('Download error:', err);
    return NextResponse.json({ error: 'Download failed' }, { status: 500 });
  }
}
