/* configuração de clientes (um por linha) */
/*
  estrutura pensada para escalar:
  - adicione um novo item em ELA_CLIENTS
  - crie (ou reuse) a pasta /cliente-<id>/
  - a macro de login redireciona automaticamente
*/

window.ELA_CLIENTS = [
  {
    id: 'jescri',
    label: 'jescri',
    instagram: '@jescri',
    password: 'jescri',
    redirect: '/cliente-jescri/'
  }
];
