'use client';
import {useEffect} from 'react'; import {useRouter} from 'next/navigation';
export default function Home(){const r=useRouter();useEffect(()=>{r.replace(localStorage.getItem('mm_session')?'/dashboard':'/login')},[r]);return <main className="center"><div className="brandmark">M</div><p>Opening Mwotsam Media…</p></main>}
