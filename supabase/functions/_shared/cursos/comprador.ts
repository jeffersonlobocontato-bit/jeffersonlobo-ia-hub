// Dados do comprador que o Mercado Pago informa no pagamento, para a nota
// fiscal (NFS-e): CPF ou CNPJ e nome. Só dígitos e tamanhos válidos passam;
// o que vier estranho é ignorado (o admin completa no painel).

const so = (v: unknown) => String(v ?? '').replace(/\D/g, '');

// deno-lint-ignore no-explicit-any
export function documentoDoPagador(pg: any): string | null {
  const ids = [pg?.payer?.identification, pg?.card?.cardholder?.identification];
  for (const id of ids) {
    const numero = so(id?.number);
    const tipo = String(id?.type ?? '').toUpperCase();
    if (numero.length === 11 && (tipo === 'CPF' || tipo === '')) return numero;
    if (numero.length === 14 && (tipo === 'CNPJ' || tipo === '')) return numero;
  }
  return null;
}

// deno-lint-ignore no-explicit-any
export function nomeDoPagador(pg: any): string | null {
  const partes = [pg?.payer?.first_name, pg?.payer?.last_name].map((x) => String(x ?? '').trim()).filter(Boolean);
  const nome = partes.join(' ') || String(pg?.card?.cardholder?.name ?? '').trim();
  return nome ? nome.slice(0, 120) : null;
}
