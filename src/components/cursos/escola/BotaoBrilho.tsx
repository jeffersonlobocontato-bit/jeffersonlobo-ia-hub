import { Link } from 'react-router-dom';
import { ArrowRight, Play } from 'lucide-react';

type Props = { to: string; children: React.ReactNode; onClick?: () => void };

// Botão em pílula com uma faixa de luz girando na borda.
const BotaoBrilho = ({ to, children, onClick }: Props) => (
  <Link to={to} className="e-brilho" onClick={onClick}>
    <span className="e-brilho__giro" aria-hidden />
    <span className="e-brilho__fundo" aria-hidden />
    <span className="e-brilho__linha">
      <span className="e-brilho__icone" aria-hidden>
        <Play size={13} fill="currentColor" />
      </span>
      {children}
      <span className="e-brilho__seta" aria-hidden>
        <ArrowRight size={14} />
      </span>
    </span>
  </Link>
);

export default BotaoBrilho;
