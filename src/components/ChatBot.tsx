import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { MessageCircle, Send, X, Loader2 } from 'lucide-react';
import ReactMarkdown from 'react-markdown';

interface Message {
  role: 'user' | 'assistant';
  content: string;
}

const ChatBot = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [leadCaptured, setLeadCaptured] = useState(false);
  const [leadData, setLeadData] = useState<{
    nome?: string;
    apelido?: string;
    whatsapp?: string;
  }>({});
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const sendMessage = async () => {
    if (!input.trim() || isLoading) return;

    const userMessage: Message = { role: 'user', content: input };
    const updatedMessages = [...messages, userMessage];
    setMessages(updatedMessages);
    setInput('');
    setIsLoading(true);

    // Detectar nome, apelido e WhatsApp na primeira mensagem do usuário
    let currentLeadData = { ...leadData };
    let shouldSaveLead = false;

    if (!leadCaptured && updatedMessages.filter(m => m.role === 'user').length <= 3) {
      const userText = input.toLowerCase();
      
      // Tentar extrair WhatsApp (padrões comuns)
      const phoneMatch = input.match(/\(?\d{2}\)?\s*9?\d{4}[-\s]?\d{4}/);
      if (phoneMatch && !currentLeadData.whatsapp) {
        currentLeadData.whatsapp = phoneMatch[0].replace(/\D/g, '');
      }

      // Se ainda não tem nome completo, assumir que primeira mensagem relevante é o nome
      if (!currentLeadData.nome && updatedMessages.filter(m => m.role === 'user').length === 2) {
        currentLeadData.nome = input.trim();
      }

      // Se tem nome mas não tem apelido, próxima mensagem pode ser apelido
      if (currentLeadData.nome && !currentLeadData.apelido && updatedMessages.filter(m => m.role === 'user').length === 3) {
        currentLeadData.apelido = input.trim();
      }

      // Se tem todos os dados, marcar como capturado
      if (currentLeadData.nome && currentLeadData.whatsapp) {
        setLeadCaptured(true);
        setLeadData(currentLeadData);
        shouldSaveLead = true;
      }
    }

    // Extrair possíveis interesses da conversa
    const interesses: string[] = [];
    const keywords = [
      'método del', 'del', 'consultoria', 'treinamento', 'curso', 'ia', 
      'inteligência artificial', 'agente', 'automação', 'livro', 'teste',
      'maturidade', 'implementação', 'empresa', 'estratégia', 'governança'
    ];
    
    const textLower = input.toLowerCase();
    keywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        interesses.push(keyword);
      }
    });

    try {
      const CHAT_URL = `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/chat-uivo-lobo`;
      
      const requestBody: any = { messages: updatedMessages };
      
      // Se deve salvar o lead, incluir leadData
      if (shouldSaveLead) {
        requestBody.leadData = {
          ...currentLeadData,
          mensagens: updatedMessages.map(m => ({ role: m.role, content: m.content })),
          interesses,
        };
      } else if (leadCaptured && interesses.length > 0) {
        // Se já tem lead, apenas atualizar interesses
        requestBody.leadData = {
          ...leadData,
          mensagens: [{ role: userMessage.role, content: userMessage.content }],
          interesses,
        };
      }
      
      const response = await fetch(CHAT_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY}`,
        },
        body: JSON.stringify(requestBody),
      });

      if (!response.ok || !response.body) {
        throw new Error('Erro ao processar resposta');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();
      let assistantContent = '';
      let textBuffer = '';
      let streamDone = false;

      // Adiciona mensagem do assistente vazia
      setMessages(prev => [...prev, { role: 'assistant', content: '' }]);

      while (!streamDone) {
        const { done, value } = await reader.read();
        if (done) break;
        
        textBuffer += decoder.decode(value, { stream: true });

        let newlineIndex: number;
        while ((newlineIndex = textBuffer.indexOf('\n')) !== -1) {
          let line = textBuffer.slice(0, newlineIndex);
          textBuffer = textBuffer.slice(newlineIndex + 1);

          if (line.endsWith('\r')) line = line.slice(0, -1);
          if (line.startsWith(':') || line.trim() === '') continue;
          if (!line.startsWith('data: ')) continue;

          const jsonStr = line.slice(6).trim();
          if (jsonStr === '[DONE]') {
            streamDone = true;
            break;
          }

          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantContent;
                return newMessages;
              });
            }
          } catch {
            textBuffer = line + '\n' + textBuffer;
            break;
          }
        }
      }

      // Flush final
      if (textBuffer.trim()) {
        for (let raw of textBuffer.split('\n')) {
          if (!raw || raw.startsWith(':') || !raw.startsWith('data: ')) continue;
          const jsonStr = raw.slice(6).trim();
          if (jsonStr === '[DONE]') continue;
          try {
            const parsed = JSON.parse(jsonStr);
            const content = parsed.choices?.[0]?.delta?.content;
            if (content) {
              assistantContent += content;
              setMessages(prev => {
                const newMessages = [...prev];
                newMessages[newMessages.length - 1].content = assistantContent;
                return newMessages;
              });
            }
          } catch {}
        }
      }

    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: 'Desculpe, ocorreu um erro. Tente novamente.'
      }]);
    } finally {
      setIsLoading(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      sendMessage();
    }
  };

  if (!isOpen) {
    return (
      <Button
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 h-14 w-14 rounded-full shadow-lg bg-gradient-to-r from-primary via-secondary to-primary animate-pulse-glow hover:scale-110 transition-transform z-50"
        size="icon"
      >
        <MessageCircle className="h-6 w-6" />
      </Button>
    );
  }

  return (
    <div className="fixed bottom-6 right-6 w-96 h-[600px] bg-card border border-border rounded-lg shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between p-4 border-b border-border bg-gradient-to-r from-primary/10 to-secondary/10">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-full bg-gradient-to-r from-primary to-secondary flex items-center justify-center">
            <MessageCircle className="h-5 w-5 text-primary-foreground" />
          </div>
          <div>
            <h3 className="font-semibold text-sm">Uivo do Lobo</h3>
            <p className="text-xs text-muted-foreground">Assistente IA</p>
          </div>
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setIsOpen(false)}
          className="h-8 w-8"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-muted-foreground text-sm py-8">
            Olá! Sou o Uivo do Lobo 🐺<br />
            Como posso te ajudar hoje?
          </div>
        )}
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-lg p-3 ${
                message.role === 'user'
                  ? 'bg-primary text-primary-foreground'
                  : 'bg-muted text-foreground'
              }`}
            >
              {message.role === 'user' ? (
                <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              ) : (
                <div className="text-sm prose prose-sm max-w-none dark:prose-invert">
                  <ReactMarkdown>{message.content}</ReactMarkdown>
                </div>
              )}
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-muted rounded-lg p-3">
              <Loader2 className="h-4 w-4 animate-spin" />
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      <div className="p-4 border-t border-border">
        <div className="flex gap-2">
          <Input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Digite sua mensagem..."
            disabled={isLoading}
            className="flex-1"
          />
          <Button
            onClick={sendMessage}
            disabled={isLoading || !input.trim()}
            size="icon"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
};

export default ChatBot;
