'use client';
import {useEffect,useRef,useState} from 'react';
import {X,Music2,AlertTriangle} from 'lucide-react';
import {getMediaFile} from '../lib/media';

function mediaErrorMessage(el,item){
  const code=el?.error?.code;
  if(code===3) return 'This video could not be decoded. It may use a phone codec your browser does not support.';
  if(code===4) return `This ${item.type} format or codec is not supported by this browser.`;
  if(code===2) return 'The media file could not be read correctly.';
  return `This ${item.type} could not be played. Try an MP4 (H.264/AAC) or WebM video.`;
}

export default function MediaPlayer({item,onClose}){
  const [url,setUrl]=useState('');
  const [error,setError]=useState('');
  const [ready,setReady]=useState(false);
  const mediaRef=useRef(null);

  useEffect(()=>{
    let current='';
    setError(''); setReady(false); setUrl('');
    (async()=>{
      try{
        const record=await getMediaFile(item.id);
        if(!record?.file){setError('The media file could not be found on this device.');return;}
        current=URL.createObjectURL(record.file);
        setUrl(current);
      }catch(err){console.error(err);setError('Unable to open this media file.');}
    })();
    return()=>{if(current)URL.revokeObjectURL(current)};
  },[item.id]);

  async function startPlayback(){
    const el=mediaRef.current;
    if(!el)return;
    try{
      el.muted=false;
      el.defaultMuted=false;
      el.volume=1;
      await el.play();
    }catch(err){
      if(err?.name!=='NotAllowedError') setError(mediaErrorMessage(el,item));
    }
  }

  return <div className="player-backdrop" onClick={onClose}>
    <section className="player-sheet" onClick={e=>e.stopPropagation()}>
      <div className="player-head"><div><span className="eyebrow">NOW PLAYING</span><h2>{item.title}</h2><small>{item.category} · {item.mimeType||'media'}</small></div><button className="icon-btn" onClick={onClose} aria-label="Close player"><X/></button></div>
      {error?<><div className="player-error"><AlertTriangle size={18}/><span>{error}</span></div>{item.type==='video'&&<p className="demo-note">For the most reliable browser playback, use MP4 encoded with H.264 video and AAC audio, or WebM.</p>}</>:!url?<div className="player-loading">Opening media…</div>:item.type==='video'?
        <><video ref={mediaRef} className="video-player" src={url} controls playsInline preload="metadata" muted={false} defaultMuted={false} onVolumeChange={e=>{if(e.currentTarget.muted)setError('Video is muted. Tap the speaker control to enable sound.');else setError('')}} onLoadedMetadata={()=>setReady(true)} onCanPlay={()=>setReady(true)} onError={()=>setError(mediaErrorMessage(mediaRef.current,item))}/>{!ready&&<div className="player-loading">Loading video metadata…</div>}<button className="primary player-play" onClick={startPlayback}>Play video</button></>:
        <><div className="audio-art"><Music2 size={54}/></div><audio ref={mediaRef} className="audio-player" src={url} controls preload="metadata" onError={()=>setError(mediaErrorMessage(mediaRef.current,item))}/></>}
    </section>
  </div>
}
