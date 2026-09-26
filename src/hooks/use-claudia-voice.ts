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
  onCommand: (transcript: string) => string;
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
  const modeRef = useRef<"wake" | "command">("wake");

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

  const startWakeRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || !armedRef.current) return;
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
  }, [wakeWord, greeting, speak]);

  const startCommandRecognition = useCallback(() => {
    const Ctor = getRecognitionCtor();
    if (!Ctor || !armedRef.current) return;
    modeRef.current = "command";
    const recognition = new Ctor();
    recognition.lang = "pt-BR";
    recognition.continuous = false;
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    recognition.onresult = (event) => {
      const transcript = event.results[0]?.[0]?.transcript ?? "";
      pushLog("heard", transcript);
      setPhase("executing");
      const response = onCommand(transcript);
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
      if (armedRef.current) startWakeRecognition();
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
  }, [onCommand, speak, startWakeRecognition, pushLog]);

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
