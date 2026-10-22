import { BarChart3, ClipboardList, LayoutDashboard, MessageSquareText, Store, Vote } from "lucide-react";
const stats=[["Requests today","0"],["Pending review","0"],["Published polls","0"],["Votes today","0"]];
export default function Admin(){
 return <main className="min-h-screen bg-sokoza-bg"><div className="mx-auto flex max-w-7xl">
  <aside className="hidden min-h-screen w-64 border-r bg-white p-5 md:block">
   <div className="flex items-center gap-3"><span className="grid h-9 w-9 place-items-center rounded-lg bg-sokoza-blue font-black text-white">S</span><b>Sokoza Admin</b></div>
   <nav className="mt-10 space-y-1 text-sm font-semibold">{[[LayoutDashboard,"Dashboard"],[ClipboardList,"Requests"],[Vote,"Polls"],[Store,"Businesses"],[MessageSquareText,"Messages"],[BarChart3,"Analytics"]].map(([Icon,label],i)=><div key={String(label)} className={`flex items-center gap-3 rounded-xl px-3 py-3 ${i===0?"bg-blue-50 text-sokoza-blue":"text-slate-600"}`}><Icon className="h-4 w-4"/>{String(label)}</div>)}</nav>
  </aside>
  <section className="min-w-0 flex-1 p-5 sm:p-8">
   <p className="text-sm font-bold text-sokoza-blue">ADMIN</p><h1 className="mt-1 text-3xl font-black">Demand overview</h1><p className="mt-2 text-sm text-slate-500">Foundation dashboard for private request moderation.</p>
   <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">{stats.map(([l,v])=><div key={l} className="rounded-2xl border bg-white p-5"><p className="text-sm text-slate-500">{l}</p><p className="mt-2 text-3xl font-black">{v}</p></div>)}</div>
   <div className="mt-6 rounded-2xl border bg-white p-6"><h2 className="font-extrabold">Request moderation</h2><p className="mt-2 text-sm leading-6 text-slate-600">The next milestone wires live requests, approval, rejection, editing, duplicate merging and poll publishing to this interface.</p></div>
  </section>
 </div></main>
}
