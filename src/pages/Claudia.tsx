import { useCallback, useEffect, useState } from "react";
import { SEO } from "@/components/SEO";
import { Button } from "@/components/ui/button";
import { Mic, MicOff, AlertTriangle } from "lucide-react";
import { ClaudiaVisual, CLAUDIA_DOMAINS } from "@/components/claudia/ClaudiaVisual";
import { useClaudiaVoice, type ClaudiaPhase } from "@/hooks/use-claudia-voice";

interface ClaudiaCommand {
  patterns: string[];
  domain: string;
  response: string;
  openPath?: string;
}

const COMMANDS: ClaudiaCommand[] = [
  { patterns: ["blog", "artigo", "conteudo"], domain: "conteudo", response: "Abrindo o blog agora.", openPath: "/blog" },
  { patterns: ["material", "materiais", "ebook"], domain: "ferramentas", response: "Aqui estão os materiais.", openPath: "/materiais" },
  { patterns: ["cliente", "clientes"], domain: "clientes", response: "Mostrando a área de clientes." },
  { patterns: ["consultoria"], domain: "skills", response: "Abrindo a consultoria de IA.", openPath: "/consultoria-ia" },
  { patterns: ["palestra"], domain: "skills", response: "Abrindo as palestras.", openPath: "/palestras-ia" },
  { patterns: ["workshop"], domain: "skills", response: "Abrindo o workshop.", openPath: "/workshop-ia" },
  { patterns: ["livro"], domain: "conteudo", response: "Abrindo o livro.", openPath: "/livro-del" },
  { patterns: ["teste de ia", "teste", "demonstracao"], domain: "ferramentas", response: "Abrindo o teste de maturidade em IA.", openPath: "/teste-ia" },
  { patterns: ["rotina", "agenda"], domain: "rotina", response: "Essa é a rotina de hoje." },
  { patterns: ["memoria", "lembrar"], domain: "memoria", response: "Acessando a memória do sistema." },
];

const STOP_PATTERNS = ["parar", "pausa", "dormir", "obrigado", "tchau"];

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

const PHASE_LABEL: Record<ClaudiaPhase, string> = {
  off: "Em espera",
  "listening-wake": "Aguardando ativação",
  greeting: "Respondendo",
  "listening-command": "Ouvindo comando",
  executing: "Executando",
};

export default function Claudia() {
  const [activeDomain, setActiveDomain] = useState<string | null>(null);

  const handleCommand = useCallback((transcript: string) => {
    const heard = normalize(transcript);

    if (STOP_PATTERNS.some((p) => heard.includes(p))) {
      voice.disarm();
      return "Até logo, Lobo.";
    }

    const match = COMMANDS.find((c) => c.patterns.some((p) => heard.includes(normalize(p))));
    if (!match) {
      setActiveDomain(null);
      return "Não entendi. Pode repetir?";
    }

    setActiveDomain(match.domain);
    window.setTimeout(() => setActiveDomain(null), 6000);
    if (match.openPath) {
      const path = match.openPath;
      // Same-tab navigation, and delayed: window.open() here would be a
      // background browser tab, not a user click, so Chrome's popup blocker
      // silently swallows it — nothing visibly happens. Navigating this tab
      // always works, and the delay lets the highlight + spoken reply land first.
      window.setTimeout(() => window.location.assign(path), 900);
    }
    return match.response;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const voice = useClaudiaVoice({
    wakeWord: "claudia",
    greeting: "Olá Lobo, o que precisa?",
    onCommand: handleCommand,
  });

  useEffect(() => {
    document.documentElement.classList.add("dark");
    return () => document.documentElement.classList.remove("dark");
  }, []);

  const visualState =
    voice.phase === "greeting" ? "speaking" : voice.phase === "executing" ? "executing" : voice.phase === "listening-command" ? "listening" : "idle";

  return (
    <div className="fixed inset-0 overflow-hidden bg-[hsl(165,22%,7%)] text-[hsl(42,35%,92%)]">
      <SEO
        title="Claudia — Painel de comando por voz | Jefferson Lobo"
        description="Painel visual ativado por voz que opera o hub de IA de Jefferson Lobo."
        path="/claudia"
        noindex
      />

      <div className="absolute inset-0">
        <ClaudiaVisual state={visualState} activeDomain={activeDomain} />
      </div>

      <div className="pointer-events-none absolute left-0 right-0 top-0 flex flex-col items-center gap-1 p-6 text-center">
        <span className="font-mono text-xs uppercase tracking-[0.3em] text-[hsl(30,70%,60%)]">Claudia</span>
        <span className="font-mono text-[11px] uppercase tracking-widest text-white/50">{PHASE_LABEL[voice.phase]}</span>
      </div>

      <div className="pointer-events-none absolute bottom-28 left-0 right-0 flex flex-col items-center gap-2 px-6">
        {voice.log.slice(-3).map((entry) => (
          <p
            key={entry.id}
            className={`max-w-xl text-center font-mono text-sm ${
              entry.kind === "said" ? "text-[hsl(30,70%,65%)]" : entry.kind === "heard" ? "text-white/80" : "text-white/40"
            }`}
          >
            {entry.kind === "heard" ? `“${entry.text}”` : entry.text}
          </p>
        ))}
      </div>

      <div className="absolute bottom-8 left-0 right-0 flex flex-col items-center gap-3">
        {voice.error && (
          <p className="flex items-center gap-2 rounded-md bg-red-500/10 px-3 py-1.5 font-mono text-xs text-red-300">
            <AlertTriangle className="h-3.5 w-3.5" />
            {voice.error}
          </p>
        )}
        {!voice.supported ? (
          <p className="font-mono text-xs text-white/50">Ative pelo Chrome ou Edge para usar o microfone.</p>
        ) : (
          <Button
            size="lg"
            variant={voice.armed ? "outline" : "default"}
            className="gap-2 font-mono"
            onClick={() => (voice.armed ? voice.disarm() : voice.arm())}
          >
            {voice.armed ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            {voice.armed ? "Parar Claudia" : "Ativar Claudia"}
          </Button>
        )}
        <p className="font-mono text-[11px] text-white/35">
          Diga “Claudia” para acordar · {CLAUDIA_DOMAINS.length} áreas · {CLAUDIA_DOMAINS.reduce((s, d) => s + d.count, 0)} arquivos
        </p>
      </div>
    </div>
  );
}
