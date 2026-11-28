# Mwotsam Media — Phase 2.3

This phase fixes the "video plays but has no sound" problem at the codec level.

## What changed
- Videos are transcoded on upload with FFmpeg.
- Output is MP4 with H.264 video and AAC audio.
- AAC audio is broadly supported by modern browsers.
- The converted file is saved in IndexedDB and played by the existing media player.
- Audio/song uploads continue to work normally.

## Run
```bash
npm install
npm run dev
```
Open http://localhost:3000 and upload the original video again. Old videos already stored by Phase 2.2 are not automatically converted, so delete/re-upload them.

## Important
Video conversion can take time, especially for large videos. Keep the Upload page open until it says the file was saved. Phase 3 will move storage online; a later production phase should move transcoding to a dedicated media service/background worker for large uploads.
