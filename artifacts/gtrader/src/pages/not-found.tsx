import { Link } from "wouter";
import { Button } from "@/components/ui/button";
import { TrendingUp } from "lucide-react";

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen text-center p-6 login-bg">
      <div className="logo-icon w-16 h-16 mb-6">
        <svg width="32" height="32" viewBox="0 0 24 24" fill="none">
          <polyline points="2,17 7,12 11,15 16,9 22,14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
          <polyline points="16,9 22,9 22,14" stroke="white" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"/>
        </svg>
      </div>
      <h1 className="text-7xl font-black brand-gradient mb-3">404</h1>
      <p className="text-xl font-bold text-foreground mb-2">Página não encontrada</p>
      <p className="text-sm text-muted-foreground mb-8">A página que procura não existe ou foi movida.</p>
      <Link href="/"><Button className="brand-bg border-0 text-white font-bold">Voltar ao Dashboard</Button></Link>
    </div>
  );
}
