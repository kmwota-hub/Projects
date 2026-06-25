"use client";
import { useState } from "react";
import { motion } from "framer-motion";
import { BarChart3, Users, Clock, TrendingUp, Eye, Heart, MessageSquare, Activity, ArrowUpRight, ArrowDownRight, Zap, ChevronDown } from "lucide-react";
import Link from "next/link";

const mockStreams = [
  { id: 1, title: "Building StreamForge AI Live", date: "Jun 15, 2026", viewers: 12450, peakViewers: 18200, duration: "3h 24m", engagement: 94, likes: 3200, comments: 890 },
  { id: 2, title: "AI Art Generation Workshop", date: "Jun 12, 2026", viewers: 8900, peakViewers: 11500, duration: "2h 10m", engagement: 87, likes: 2100, comments: 560 },
  { id: 3, title: "Late Night Coding Session", date: "Jun 10, 2026", viewers: 5600, peakViewers: 7800, duration: "4h 05m", engagement: 78, likes: 1400, comments: 340 },
  { id: 4, title: "Product Launch Event", date: "Jun 8, 2026", viewers: 22100, peakViewers: 31000, duration: "1h 45m", engagement: 96, likes: 5800, comments: 1200 },
];

const stats = [
  { label: "Total Views", value: "49.1K", change: "+12.4%", up: true, icon: Eye },
  { label: "Avg. Watch Time", value: "47m", change: "+8.2%", up: true, icon: Clock },
  { label: "Engagement Rate", value: "88.7%", change: "+3.1%", up: true, icon: Heart },
  { label: "New Followers", value: "2,340", change: "-2.1%", up: false, icon: Users },
];

// Simulated viewer chart data (24 data points)
const chartData = [120, 340, 560, 890, 1200, 1800, 2400, 3100, 4200, 5600, 7800, 9200, 11500, 12400, 11800, 10200, 9800, 8600, 7200, 5400, 3800, 2100, 980, 450];
const maxChart = Math.max(...chartData);

export default function AnalyticsPage() {
  const [timeRange, setTimeRange] = useState("7d");

  return (
    <div className="min-h-screen bg-[#0a0a0c] text-white font-sans">
      {/* Nav */}
      <nav className="h-16 bg-white/5 border-b border-white/10 backdrop-blur-md flex items-center justify-between px-6">
        <div className="flex items-center gap-3">
          <Link href="/" className="flex items-center gap-3 hover:opacity-80 transition-opacity">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center">
              <Zap className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">StreamForge AI</span>
          </Link>
          <span className="ml-4 text-white/50">/</span>
          <span className="ml-2 text-white/80 font-medium">Analytics</span>
        </div>
        <Link href="/" className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-700 text-sm font-medium transition-colors">← Back to Studio</Link>
      </nav>

      <div className="max-w-7xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold">Stream Analytics</h1>
            <p className="text-white/50 mt-1">Monitor your performance and audience engagement</p>
          </div>
          <div className="flex gap-2 bg-white/5 p-1 rounded-xl border border-white/10">
            {["24h", "7d", "30d", "90d"].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                  timeRange === range ? "bg-indigo-500 text-white shadow-lg" : "text-white/60 hover:text-white"
                }`}
              >
                {range}
              </button>
            ))}
          </div>
        </div>

        {/* Stat Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
          {stats.map((stat, i) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.1 }}
              className="bg-white/5 border border-white/10 rounded-2xl p-5 hover:bg-white/[0.07] transition-colors"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="p-2 rounded-lg bg-white/5">
                  <stat.icon className="w-5 h-5 text-white/60" />
                </div>
                <span className={`text-xs font-medium flex items-center gap-0.5 ${
                  stat.up ? "text-emerald-400" : "text-red-400"
                }`}>
                  {stat.up ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                  {stat.change}
                </span>
              </div>
              <p className="text-2xl font-bold">{stat.value}</p>
              <p className="text-sm text-white/50 mt-1">{stat.label}</p>
            </motion.div>
          ))}
        </div>

        {/* Chart */}
        <div className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-8">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <BarChart3 className="w-5 h-5 text-indigo-400" />
              Viewer Trends
            </h2>
            <span className="text-sm text-white/50">Last 24 hours</span>
          </div>
          <div className="flex items-end gap-1.5 h-48">
            {chartData.map((value, i) => (
              <motion.div
                key={i}
                initial={{ height: 0 }}
                animate={{ height: `${(value / maxChart) * 100}%` }}
                transition={{ delay: i * 0.03, type: "spring", damping: 15 }}
                className="flex-1 rounded-t-md bg-gradient-to-t from-indigo-600 to-purple-500 hover:from-indigo-500 hover:to-purple-400 transition-colors cursor-pointer relative group"
              >
                <div className="absolute -top-8 left-1/2 -translate-x-1/2 bg-black/80 backdrop-blur-md text-xs px-2 py-1 rounded border border-white/10 opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap">
                  {value.toLocaleString()} viewers
                </div>
              </motion.div>
            ))}
          </div>
          <div className="flex justify-between mt-3 text-xs text-white/30">
            <span>12 AM</span>
            <span>6 AM</span>
            <span>12 PM</span>
            <span>6 PM</span>
            <span>12 AM</span>
          </div>
        </div>

        {/* Recent Streams Table */}
        <div className="bg-white/5 border border-white/10 rounded-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-white/10">
            <h2 className="text-lg font-semibold flex items-center gap-2">
              <Activity className="w-5 h-5 text-purple-400" />
              Recent Streams
            </h2>
          </div>
          <table className="w-full">
            <thead>
              <tr className="text-left text-sm text-white/50 border-b border-white/5">
                <th className="px-6 py-3 font-medium">Stream</th>
                <th className="px-6 py-3 font-medium">Date</th>
                <th className="px-6 py-3 font-medium">Viewers</th>
                <th className="px-6 py-3 font-medium">Peak</th>
                <th className="px-6 py-3 font-medium">Duration</th>
                <th className="px-6 py-3 font-medium">Engagement</th>
              </tr>
            </thead>
            <tbody>
              {mockStreams.map((stream, i) => (
                <motion.tr
                  key={stream.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.4 + i * 0.1 }}
                  className="border-b border-white/5 hover:bg-white/5 transition-colors cursor-pointer"
                >
                  <td className="px-6 py-4">
                    <p className="font-medium">{stream.title}</p>
                  </td>
                  <td className="px-6 py-4 text-white/60 text-sm">{stream.date}</td>
                  <td className="px-6 py-4 font-medium">{stream.viewers.toLocaleString()}</td>
                  <td className="px-6 py-4 text-white/60">{stream.peakViewers.toLocaleString()}</td>
                  <td className="px-6 py-4 text-white/60">{stream.duration}</td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <div className="flex-1 h-2 bg-white/10 rounded-full overflow-hidden max-w-[80px]">
                        <div className="h-full bg-gradient-to-r from-emerald-500 to-emerald-400 rounded-full" style={{ width: `${stream.engagement}%` }} />
                      </div>
                      <span className="text-sm font-medium text-emerald-400">{stream.engagement}%</span>
                    </div>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
