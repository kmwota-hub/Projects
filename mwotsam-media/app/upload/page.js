'use client';
import Shell from '../../components/Shell';
import {UploadCloud,FileAudio,FileVideo,CheckCircle2} from 'lucide-react';
import {useRef,useState} from 'react';
import {addMedia,inspectMedia} from '../../lib/media';

async function convertVideo(file){
  const form=new FormData(); form.append('file',file);
  const response=await fetch('/api/transcode',{method:'POST',body:form});
  if(!response.ok){
    let message='Could not convert this video.';
    try{const data=await response.json(); if(data?.error)message=data.error}catch{}
    throw new Error(message);
  }
  const blob=await response.blob();
  const base=(file.name||'video').replace(/\.[^/.]+$/,'');
  return new File([blob],`${base}-web.mp4`,{type:'video/mp4',lastModified:Date.now()});
}

export default function UploadPage(){
  const ref=useRef();
  const [file,setFile]=useState(null),[title,setTitle]=useState(''),[category,setCategory]=useState('General');
  const [done,setDone]=useState(false),[saving,setSaving]=useState(false),[error,setError]=useState(''),[status,setStatus]=useState('');
  function choose(e){const f=e.target.files?.[0];setError('');setStatus('');setFile(f||null);if(f)setTitle(f.name.replace(/\.[^/.]+$/,''));setDone(false)}
  async function save(e){
    e.preventDefault(); if(!file)return; setSaving(true);setError('');setDone(false);
    try{
      const type=file.type.startsWith('video')?'video':'audio';
      let storedFile=file;
      if(type==='video'){
        setStatus('Preparing video sound… Converting video to H.264 + AAC. Keep this page open.');
        storedFile=await convertVideo(file);
      }else setStatus('Checking audio…');
      const check=await inspectMedia(storedFile);
      if(!check.ok)throw new Error(check.message);
      setStatus('Saving to your library…');
      await addMedia({id:crypto.randomUUID(),title:title.trim()||storedFile.name,type,category,duration:check.duration,fileName:storedFile.name,mimeType:storedFile.type,size:storedFile.size,createdAt:Date.now(),file:storedFile});
      setDone(true);setFile(null);setTitle('');setStatus('');if(ref.current)ref.current.value='';
    }catch(err){console.error(err);setError(err?.message||'Could not save this file.');setStatus('')}
    finally{setSaving(false)}
  }
  return <Shell title="Upload"><form className="upload-form" onSubmit={save}>
    <button type="button" className="dropzone" onClick={()=>ref.current?.click()}><UploadCloud size={36}/><strong>Choose from your device</strong><span>Audio or video files</span></button>
    <input ref={ref} hidden type="file" accept="audio/*,video/*" onChange={choose}/>
    {file&&<div className="file-picked">{file.type.startsWith('video')?<FileVideo/>:<FileAudio/>}<div><strong>{file.name}</strong><span>{(file.size/1024/1024).toFixed(2)} MB</span></div></div>}
    <label>Title<input value={title} onChange={e=>setTitle(e.target.value)} placeholder="Media title"/></label>
    <label>Category<select value={category} onChange={e=>setCategory(e.target.value)}><option>General</option><option>Worship</option><option>Praise</option><option>Practice</option><option>Instrumentals</option><option>Church</option></select></label>
    <button className="primary" disabled={!file||saving}>{saving?'Working…':'Save to library'}</button>
    {status&&<div className="success">{status}</div>}
    {done&&<div className="success"><CheckCircle2/> Saved. The video was converted to a browser-safe MP4 with AAC audio.</div>}
    {error&&<div className="player-error">{error}</div>}
    <p className="demo-note"><strong>Phase 2.3:</strong> videos are converted during upload to H.264 video + AAC audio instead of only changing the volume controls. This fixes the common case where the picture plays but the phone video's audio codec is unsupported by the browser.</p>
  </form></Shell>
}
