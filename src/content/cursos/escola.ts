// Dados da escola (vitrine /cursos), que valem para todos os cursos.
export const ESCOLA = {
  garantiaDias: 7,
  /** prazo de acesso aos cursos (termos de uso e perguntas frequentes) */
  prazoAcesso: '12 (doze) meses',
  /** Identificação do vendedor, exigida pelo Decreto 7.962/2013 (comércio
   *  eletrônico). Preencha documento (CPF ou CNPJ), endereço e e-mail; o que
   *  ficar vazio não aparece na página de termos. */
  fornecedor: {
    nome: 'Jefferson Lobo',
    documento: '',
    endereco: '',
    email: '',
  },
  whatsapp: 'https://wa.me/5545999864213?text=' + encodeURIComponent('Oi, Jefferson! Vi a página de cursos e tenho uma dúvida.'),
  avisoNovos: 'https://wa.me/5545999864213?text=' + encodeURIComponent('Oi, Jefferson! Quero ser avisado quando sair um curso novo.'),
  /** mostra o card "Novos cursos em breve" no fim do catálogo */
  mostrarEmBreve: true,
};
