import { useCallback, useEffect, useRef, useState } from "react";

export type ClaudiaPhase = "off" | "listening-wake" | "greeting" | "listening-command" | "executing";

export interface ClaudiaLogEntry {
  id: number;
  kind: "heard" | "said" | "info";
  text: string;
}

interface UseClaudiaVoiceOptions {
  wakeWord?: string;
  greeting?: string;
  onCommand: (transcript: string) => string | Promise<string>;
}

const normalize = (s: string) =>
  s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[̀-ͯ]/g, "")
    .trim();

function getRecognitionCtor(): SpeechRecognitionStatic | null {
  if (typeof window === "undefined") return null;
  return window.SpeechRecognition ?? window.webkitSpeechRecognition ?? null;
}

function pickPtVoice(): SpeechSynthesisVoice | null {
  const voices = window.speechSynthesis?.getVoices() ?? [];
  return (
    voices.find((v) => v.lang?.toLowerCase().startsWith("pt-br")) ??
    voices.find((v) => v.lang?.toLowerCase().startsWith("pt")) ??
    null
  );
}

let logId = 0;

export function useClaudiaVoice({ wakeWord = "claudia", greeting = "Olá Lobo, o que precisa?", onCommand }: UseClaudiaVoiceOptions) {
  const [armed, setArmed] = useState(false);
  const [phase, setPhase] = useState<ClaudiaPhase>("off");
  const [log, setLog] = useState<ClaudiaLogEntry[]>([]);
  const [error, setError] = useState<string | null>(null);

  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const armedRef = useRef(false);
  const modeRef = useRef<"wake" | "command" | "executing">("wake");

  const supported = typeof window !== "undefined" && !!getRecognitionCtor() && "speechSynthesis" in window;

  const pushLog = useCallback((kind: ClaudiaLogEntry["kind"], text: string) => {
    logId += 1;
    setLog((prev) => [...prev.slice(-6), { id: logId, kind, text }]);
  }, []);

  const speak = useCallback((text: string, onDone?: () => void) => {
    pushLog("said", text);
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "pt-BR";
    const voice = pickPtVoice();
    if (voice) utterance.voice = voice;
    utterance.rate = 1;
    utterance.onend = () => onDone?.();
    utterance.onerror = () => onDone?.();
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  }, [pushLog]);

  // Chrome só permite UMA sessão de SpeechRecognition ativa por vez. Antes de criar
  // uma nova, soltamos a anterior sem deixar os handlers dela reiniciarem nada.
  const releaseRecognition = useCallback(() => {
    const prev = recognitionRef.current;
    if (!prev) return;
    prev.onresult = null;
    prev.onerror = null;
    prev.onend = null;
    try {
      prev.abort();
    } catch {
      // ignore
    }
    recognitionRef.current = null;
  }, []);

  const startWakeRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || !armedRef.current) return;
    releaseRecognition();
    modeRef.current = "wake";
    const recognition = new Ctor();
    recognition.lang = "pt-BR";
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      let transcript = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        transcript += event.results[i][0].transcript;
      }
      if (normalize(transcript).includes(normalize(wakeWord))) {
        recognition.onend = null;
        recognition.stop();
        setPhase("greeting");
        speak(greeting, () => {
          if (!armedRef.current) return;
          startCommandRecognition();
        });
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Permissão de microfone negada. Libere o microfone e ative novamente.");
        armedRef.current = false;
        setArmed(false);
        setPhase("off");
      }
      // "no-speech" and "aborted" are recovered by onend below.
    };

    recognition.onend = () => {
      if (armedRef.current && modeRef.current === "wake") {
        startWakeRecognition();
      }
    };

    recognitionRef.current = recognition;
    setPhase("listening-wake");
    try {
      recognition.start();
    } catch {
      // start() can throw if called while already running; safe to ignore.
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [wakeWord, greeting, speak, releaseRecognition]);

  // ATENÇÃO ao alterar este fluxo: só UM caminho pode reiniciar a escuta.
  // - Com resultado: onresult muda o modo para "executing" (o onend passa a ser no-op)
  //   e a retomada da escuta do wake word acontece UMA vez, no fim da fala da resposta.
  // - Sem resultado (silêncio/erro): onerror não reinicia; quem reinicia é o onend.
  // Dois caminhos reiniciando = duas instâncias de SpeechRecognition = erro no Chrome.
  const startCommandRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || !armedRef.current) return;
    releaseRecognition();
    modeRef.current = "command";
    const recognition = new Ctor();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = async (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      modeRef.current = "executing";
      pushLog("heard", transcript);
      setPhase("executing");
      let response: string;
      try {
        response = await onCommand(transcript);
      } catch {
        response = "Tive um problema para executar esse comando.";
      }
      // Fala mesmo se o comando desarmou (ex.: "tchau"); o callback só reinicia se ainda armado.
      speak(response, () => {
        if (!armedRef.current) return;
        startWakeRecognition();
      });
    };

    recognition.onerror = (event) => {
      if (event.error === "not-allowed" || event.error === "service-not-allowed") {
        setError("Permissão de microfone negada. Libere o microfone e ative novamente.");
        armedRef.current = false;
        setArmed(false);
        setPhase("off");
        return;
      }
      // Outros erros ("no-speech", "aborted"): o onend logo abaixo faz a retomada.
    };

    recognition.onend = () => {
      if (armedRef.current && modeRef.current === "command" && recognitionRef.current === recognition) {
        // No result captured (silence timeout) — go back to listening for the wake word.
        startWakeRecognition();
      }
    };

    recognitionRef.current = recognition;
    setPhase("listening-command");
    try {
      recognition.start();
    } catch {
      // ignore
    }
  }, [onCommand, speak, startWakeRecognition, pushLog, releaseRecognition]);

  const arm = useCallback(() => {
    if (!supported) {
      setError("Reconhecimento de voz não é suportado neste navegador. Use Chrome ou Edge.");
      return;
    }
    setError(null);
    armedRef.current = true;
    setArmed(true);
    pushLog("info", `Claudia ativada. Diga "${wakeWord}" para começar.`);
    startWakeRecognition();
  }, [supported, startWakeRecognition, pushLog, wakeWord]);

  const disarm = useCallback(() => {
    armedRef.current = false;
    setArmed(false);
    setPhase("off");
    recognitionRef.current?.stop();
    pushLog("info", "Claudia em espera.");
  }, [pushLog]);

  useEffect(() => {
    return () => {
      armedRef.current = false;
      recognitionRef.current?.stop();
      window.speechSynthesis?.cancel();
    };
  }, []);

  return { supported, armed, phase, log, error, arm, disarm };
}
