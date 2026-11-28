import { NextResponse } from 'next/server';
import ffmpegPath from 'ffmpeg-static';
import { spawn } from 'node:child_process';
import { mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import path from 'node:path';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(request) {
  let dir;
  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!file || typeof file === 'string') {
      return NextResponse.json({ error: 'No video file received.' }, { status: 400 });
    }

    dir = await mkdtemp(path.join(tmpdir(), 'mwotsam-media-'));
    const inputExt = path.extname(file.name || '') || '.video';
    const input = path.join(dir, `input${inputExt}`);
    const output = path.join(dir, 'output.mp4');
    await writeFile(input, Buffer.from(await file.arrayBuffer()));

    await new Promise((resolve, reject) => {
      const args = [
        '-y', '-i', input,
        '-map', '0:v:0', '-map', '0:a:0?',
        '-c:v', 'libx264', '-preset', 'veryfast', '-crf', '23',
        '-pix_fmt', 'yuv420p',
        '-c:a', 'aac', '-b:a', '160k', '-ac', '2',
        '-movflags', '+faststart',
        output
      ];
      const child = spawn(ffmpegPath, args, { windowsHide: true });
      let stderr = '';
      child.stderr.on('data', d => { stderr += d.toString(); if (stderr.length > 12000) stderr = stderr.slice(-12000); });
      child.on('error', reject);
      child.on('close', code => code === 0 ? resolve() : reject(new Error(stderr || `FFmpeg exited with code ${code}`)));
    });

    const converted = await readFile(output);
    return new NextResponse(converted, {
      status: 200,
      headers: {
        'Content-Type': 'video/mp4',
        'Content-Disposition': 'inline; filename="converted.mp4"',
        'Cache-Control': 'no-store'
      }
    });
  } catch (error) {
    console.error('Video conversion failed:', error);
    return NextResponse.json({
      error: 'Video conversion failed. The file may be damaged or may not contain a readable audio/video track.'
    }, { status: 500 });
  } finally {
    if (dir) await rm(dir, { recursive: true, force: true }).catch(() => {});
  }
}
