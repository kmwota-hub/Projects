import Link from "next/link";
import { ArrowLeft, MapPin, Send } from "lucide-react";
export default function RequestPage(){
 return <main className="min-h-screen bg-sokoza-bg"><div className="mx-auto max-w-xl px-5 py-8">
  <Link href="/" className="inline-flex items-center gap-2 text-sm font-bold text-slate-600"><ArrowLeft className="h-4 w-4"/>Back to Sokoza</Link>
  <div className="mt-8 rounded-3xl border border-slate-200 bg-white p-6 shadow-sm sm:p-8">
   <p className="text-sm font-bold text-sokoza-blue">YOUR REQUEST</p><h1 className="mt-2 text-3xl font-black">What do you need in Juja?</h1>
   <p className="mt-3 text-sm leading-6 text-slate-600">Describe it naturally. Your raw request is intended for private admin review before anything is published.</p>
   <form className="mt-8 space-y-5">
    <div><label className="text-sm font-bold">What are you looking for?</label><textarea rows={5} placeholder="Example: I need affordable laptop repair near Juja Town." className="mt-2 w-full resize-none rounded-xl border border-slate-300 px-4 py-3 text-sm outline-none focus:border-sokoza-blue"/></div>
    <div><label className="text-sm font-bold">Area</label><div className="relative mt-2"><MapPin className="absolute left-3 top-3.5 h-4 w-4 text-slate-400"/><select className="w-full rounded-xl border border-slate-300 bg-white py-3 pl-10 pr-4 text-sm"><option>Juja Town</option><option>Highpoint</option><option>Gachororo</option><option>Juja Farm</option><option>JKUAT area</option><option>Other Juja area</option></select></div></div>
    <button type="button" className="flex w-full items-center justify-center gap-2 rounded-xl bg-sokoza-blue px-5 py-3.5 text-sm font-bold text-white"><Send className="h-4 w-4"/>Submit request</button>
   </form>
  </div>
 </div></main>
}
