import type { Config } from "tailwindcss";
const config: Config = {
  content: ["./app/**/*.{js,ts,jsx,tsx,mdx}", "./components/**/*.{js,ts,jsx,tsx,mdx}"],
  theme: { extend: { colors: {
    sokoza: { blue:"#2563EB", navy:"#1E3A8A", green:"#059669", mint:"#10B981", ink:"#0F172A", muted:"#64748B", bg:"#F8FAFC", border:"#E2E8F0" }
  }}},
  plugins: []
};
export default config;
