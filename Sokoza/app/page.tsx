import { ArrowRight, CheckCircle2, MessageSquareText, Search, ShieldCheck, TrendingUp } from "lucide-react";

const demands = [
  {title:"Late-night food delivery",people:328,category:"Food",area:"Juja Town"},
  {title:"Affordable laptop repair",people:214,category:"Electronics",area:"Juja"},
  {title:"Reliable house cleaning",people:86,category:"Services",area:"Highpoint"}
];

export default function Home() {
 return <main className="min-h-screen">
  <header className="border-b border-slate-200 bg-white">
   <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-4 lg:px-8">
    <a href="/" className="flex items-center gap-3">
     <span className="grid h-10 w-10 place-items-center rounded-xl bg-sokoza-blue text-lg font-black text-white">S</span>
     <div><div className="text-lg font-extrabold">Sokoza</div><div className="text-[11px] text-slate-500">Juja, Kenya</div></div>
    </a>
    <nav className="hidden items-center gap-6 text-sm font-semibold text-slate-600 md:flex">
     <a href="#discover">Discover</a><a href="#how">How it works</a>
     <a href="/request" className="rounded-xl bg-sokoza-blue px-4 py-2.5 text-white">Tell us what you need</a>
    </nav>
   </div>
  </header>

  <section className="bg-white">
   <div className="mx-auto grid max-w-6xl gap-12 px-5 py-16 lg:grid-cols-[1.15fr_.85fr] lg:items-center lg:px-8 lg:py-24">
    <div>
     <div className="inline-flex items-center gap-2 rounded-full border border-blue-100 bg-blue-50 px-3 py-1.5 text-xs font-bold text-sokoza-navy">
      <span className="h-2 w-2 rounded-full bg-sokoza-green"/>Built for Juja
     </div>
     <h1 className="mt-5 text-4xl font-black tracking-tight sm:text-5xl lg:text-6xl">What do you need in Juja?</h1>
     <p className="mt-5 max-w-2xl text-lg leading-8 text-slate-600">Tell Sokoza what you are looking for. We turn repeated community needs into useful local solutions.</p>
     <a href="/request" className="mt-8 inline-flex items-center gap-2 rounded-xl bg-sokoza-blue px-6 py-3.5 text-sm font-bold text-white shadow-sm">
      Tell us what you need <ArrowRight className="h-4 w-4"/>
     </a>
    </div>
    <div className="rounded-3xl bg-sokoza-navy p-7 text-white shadow-xl">
     <div className="flex items-center gap-2 text-sm font-bold text-blue-100"><TrendingUp className="h-4 w-4"/>Community demand</div>
     <h2 className="mt-3 text-2xl font-extrabold">Juja is asking for these</h2>
     <div className="mt-6 space-y-3">
      {demands.slice(0,2).map(d=><div key={d.title} className="rounded-2xl bg-white/10 p-4 ring-1 ring-white/10">
       <div className="font-bold">{d.title}</div><div className="mt-1 text-xs text-blue-100">{d.people} people need this · {d.area}</div>
      </div>)}
     </div>
    </div>
   </div>
  </section>

  <section id="discover" className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
   <div className="flex items-end justify-between gap-4">
    <div><p className="text-sm font-bold text-sokoza-blue">DISCOVER</p><h2 className="text-3xl font-black">What Juja needs</h2><p className="mt-2 text-slate-600">Only admin-approved demands should appear publicly.</p></div>
    <button className="hidden items-center gap-2 rounded-xl border bg-white px-4 py-2.5 text-sm font-bold sm:flex"><Search className="h-4 w-4"/>Search</button>
   </div>
   <div className="mt-8 grid gap-4 md:grid-cols-3">
    {demands.map(d=><article key={d.title} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
     <div className="text-xs font-bold text-sokoza-blue">{d.category}</div><h3 className="mt-2 text-lg font-extrabold">{d.title}</h3>
     <p className="mt-1 text-sm text-slate-500">{d.area}</p>
     <div className="mt-5 flex items-center justify-between border-t pt-4"><span className="text-sm font-semibold text-slate-600">{d.people} need this</span><button className="rounded-lg bg-sokoza-blue px-3 py-2 text-xs font-bold text-white">I need this</button></div>
    </article>)}
   </div>
  </section>

  <section id="how" className="border-y bg-white">
   <div className="mx-auto max-w-6xl px-5 py-16 lg:px-8">
    <p className="text-sm font-bold text-sokoza-green">HOW IT WORKS</p><h2 className="mt-1 text-3xl font-black">Demand first. Solutions second.</h2>
    <div className="mt-8 grid gap-5 md:grid-cols-3">
     {[[MessageSquareText,"Tell us","Describe what you need in your own words."],[ShieldCheck,"We review","Sokoza admins review and organize useful requests."],[CheckCircle2,"Juja responds","Community voting shows which needs matter most."]].map(([Icon,title,text])=><div key={String(title)} className="rounded-2xl border p-6">
      <Icon className="h-7 w-7 text-sokoza-blue"/><h3 className="mt-4 font-extrabold">{String(title)}</h3><p className="mt-2 text-sm leading-6 text-slate-600">{String(text)}</p>
     </div>)}
    </div>
   </div>
  </section>
  <footer className="bg-sokoza-ink px-5 py-8 text-center text-sm text-slate-400"><strong className="text-white">Sokoza</strong> · Shop Local. Get It Delivered.</footer>
 </main>
}
