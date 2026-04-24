# 🚀 Exponent: Advanced Stock Portfolio & Analysis

Exponent (StockFolio) is a premium, high-performance SaaS platform built for serious Indian investors. It features a modern, glassmorphic design with real-time tracking, advanced analytics, and interactive 3D visualizations.

![Hero Section Placeholder](https://github.com/suhr25/Exponent/raw/main/stockfolio-app/public/next.svg) 

## ✨ Key Features

- **💎 Premium Design:** Sleek dark-mode interface with glassmorphism, smooth Framer Motion animations, and custom 3D particle fields.
- **📊 Real-time Portfolio Tracking:** Monitor your holdings, P&L, and sector exposure with live updates.
- **🛡️ Advanced Analytics:** In-depth health metrics, sector donut charts, and historical performance analysis.
- **🔍 Stock Screener:** Find and analyze stocks with high-precision tools.
- **🔐 Secure Auth:** Full authentication flow powered by Supabase.
- **📱 Responsive UI:** Fully optimized for all device sizes.

## 🛠️ Tech Stack

- **Frontend:** [Next.js 14+](https://nextjs.org/) (App Router), TypeScript, Tailwind CSS
- **Animations:** [Framer Motion](https://www.framer.com/motion/), [Three.js](https://threejs.org/) (React Three Fiber)
- **Backend/DB:** [Supabase](https://supabase.com/) (PostgreSQL + Auth)
- **State Management:** [Zustand](https://docs.pmnd.rs/zustand/)
- **Charts:** [Recharts](https://recharts.org/)

## 📂 Project Structure

```bash
Exponent/
├── stockfolio-app/       # Main Next.js application
│   ├── src/
│   │   ├── app/          # App Router (Pages & API Routes)
│   │   ├── components/   # UI, Charts, Three.js, & Layouts
│   │   ├── lib/          # Store, Types, Supabase, & Utils
│   │   └── styles/       # Global CSS
│   └── public/           # Static assets
└── .gitignore            # Root git configuration
```

## 🚀 Getting Started

### Prerequisites
- Node.js 18+ 
- npm / pnpm / yarn

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/suhr25/Exponent.git
   cd Exponent/stockfolio-app
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up Environment Variables:**
   Create a `.env.local` file in the `stockfolio-app` directory and add your Supabase credentials:
   ```env
   NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Run the development server:**
   ```bash
   npm run dev
   ```
   Open [http://localhost:3000](http://localhost:3000) to see the result.

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

---
Built with ❤️ by [suhr25](https://github.com/suhr25)
