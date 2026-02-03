/* config central da area do cliente */
window.ELA_CLIENTE_CONFIG = {
  session: {
    storage_key: "ela_client_session",
    ttl_ms: 1000 * 60 * 60 * 24 * 7
  },

  auth: {
    instagram_permitido: "jescri",
    senha: "jescri"
  },

  rotas: {
    login: "/area-do-cliente/",
    home_cliente: "/clientes/jescri/"
  },

  pdf: {
    retrospectiva_jescri_2025: "/clientes/jescri/assets/jescri-retrospectiva-2025.pdf"
  },

  calendario: {
    json_url: "/clientes/jescri/calendario/calendario.json"
  },

  redirects: {
    relatorios: "",
    social_media: "",
    material: ""
  },

  alinhamento_form_url: ""
};
