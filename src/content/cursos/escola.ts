// Dados da escola (vitrine /cursos), que valem para todos os cursos.
export const ESCOLA = {
  garantiaDias: 7,
  /** prazo de acesso aos cursos (termos de uso e perguntas frequentes) */
  prazoAcesso: '12 (doze) meses',
  /** Identificação do vendedor, exigida pelo Decreto 7.962/2013 (comércio
   *  eletrônico): razão social, CNPJ, endereço do cadastro na Receita e
   *  e-mail. O que ficar vazio não aparece na página de termos. Os cursos são
   *  vendidos pela empresa, que emite a nota fiscal (NFS-e) de cada compra. */
  fornecedor: {
    nome: 'Agência de Inteligência Vozes Ltda',
    documento: '68.276.102/0001-78',
    endereco: 'Rua Alberto Folloni, 963, ap. 105, Ahú, Curitiba/PR, CEP 80540-000',
    email: 'lobo@aivozes.com.br',
  },
  whatsapp: 'https://wa.me/5545999864213?text=' + encodeURIComponent('Oi, Jefferson! Vi a página de cursos e tenho uma dúvida.'),
  avisoNovos: 'https://wa.me/5545999864213?text=' + encodeURIComponent('Oi, Jefferson! Quero ser avisado quando sair um curso novo.'),
  /** mostra o card "Novos cursos em breve" no fim do catálogo */
  mostrarEmBreve: true,
};
