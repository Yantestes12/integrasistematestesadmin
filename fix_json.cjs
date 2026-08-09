const fs = require('fs');

const inputJson = {
  "nodes": [
    {
      "parameters": {
        "rules": {
          "values": [
            {
              "conditions": {
                "options": {
                  "caseSensitive": false,
                  "leftValue": "",
                  "typeValidation": "strict",
                  "version": 1
                },
                "conditions": [
                  {
                    "leftValue": "={{ ($json.body?.instituto || $json.query?.instituto || \"GASCTPNA\").toUpperCase().trim() }}",
                    "rightValue": "GASCTPNA",
                    "operator": {
                      "type": "string",
                      "operation": "equals"
                    }
                  }
                ],
                "combinator": "and"
              },
              "renameOutput": true,
              "outputKey": "GASCTPNA"
            },
            {
              "conditions": {
                "options": {
                  "caseSensitive": false,
                  "leftValue": "",
                  "typeValidation": "strict",
                  "version": 1
                },
                "conditions": [
                  {
                    "leftValue": "={{ ($json.body?.instituto || $json.query?.instituto || \"GASCTPNA\").toUpperCase().trim() }}",
                    "rightValue": "IBRASE",
                    "operator": {
                      "type": "string",
                      "operation": "equals"
                    }
                  }
                ],
                "combinator": "and"
              },
              "renameOutput": true,
              "outputKey": "IBRASE"
            },
            {
              "conditions": {
                "options": {
                  "caseSensitive": false,
                  "leftValue": "",
                  "typeValidation": "strict",
                  "version": 1
                },
                "conditions": [
                  {
                    "leftValue": "={{ ($json.body?.instituto || $json.query?.instituto || \"GASCTPNA\").toUpperCase().trim() }}",
                    "rightValue": "AUNI",
                    "operator": {
                      "type": "string",
                      "operation": "equals"
                    }
                  }
                ],
                "combinator": "and"
              },
              "renameOutput": true,
              "outputKey": "AUNI"
            },
            {
              "conditions": {
                "options": {
                  "caseSensitive": false,
                  "leftValue": "",
                  "typeValidation": "strict",
                  "version": 1
                },
                "conditions": [
                  {
                    "leftValue": "={{ ($json.body?.instituto || $json.query?.instituto || \"GASCTPNA\").toUpperCase().trim() }}",
                    "rightValue": "IVEM",
                    "operator": {
                      "type": "string",
                      "operation": "equals"
                    }
                  }
                ],
                "combinator": "and"
              },
              "renameOutput": true,
              "outputKey": "IVEM"
            }
          ]
        },
        "options": {}
      },
      "id": "70158b48-187c-4c23-aa1f-c2e5dcf19192",
      "name": "Switch Instituto",
      "type": "n8n-nodes-base.switch",
      "typeVersion": 3,
      "position": [
        -6384,
        -4064
      ]
    },
    {
      "parameters": {
        "operation": "delete",
        "tableId": "GASCTPNA_projeto_modalidade_limites",
        "filters": {
          "conditions": [
            {
              "keyName": "projeto_id",
              "condition": "eq",
              "keyValue": "={{ $('Webhook PUT2').first().json.body.id }}"
            }
          ]
        }
      },
      "id": "7495f399-f137-48d9-a963-b66d8e4d9345",
      "name": "Delete GASCTPNA Limits",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        -5840,
        -4416
      ],
      "credentials": {
        "supabaseApi": {
          "id": "9PCPmBxs55B86AyO",
          "name": "IBRASE"
        }
      }
    },
    {
      "parameters": {
        "tableId": "GASCTPNA_projeto_modalidade_limites",
        "dataToSend": "autoMapInputData"
      },
      "id": "dbd21c33-546d-44ba-bdf7-df742c686b8d",
      "name": "Insert GASCTPNA Limits",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        -5344,
        -4416
      ],
      "credentials": {
        "supabaseApi": {
          "id": "9PCPmBxs55B86AyO",
          "name": "IBRASE"
        }
      }
    },
    {
      "parameters": {
        "operation": "delete",
        "tableId": "IBRASE_projeto_modalidade_limites",
        "filters": {
          "conditions": [
            {
              "keyName": "projeto_id",
              "condition": "eq",
              "keyValue": "={{ $('Webhook PUT2').first().json.body.id }}"
            }
          ]
        }
      },
      "id": "c55aa33c-102a-45be-9b35-72c65f45007e",
      "name": "Delete IBRASE Limits",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        -5840,
        -4160
      ],
      "credentials": {
        "supabaseApi": {
          "id": "9PCPmBxs55B86AyO",
          "name": "IBRASE"
        }
      }
    },
    {
      "parameters": {
        "tableId": "IBRASE_projeto_modalidade_limites",
        "dataToSend": "autoMapInputData"
      },
      "id": "8b8eb318-a9ae-4c45-b5ff-28212862305c",
      "name": "Insert IBRASE Limits",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        -5344,
        -4160
      ],
      "credentials": {
        "supabaseApi": {
          "id": "9PCPmBxs55B86AyO",
          "name": "IBRASE"
        }
      }
    },
    {
      "parameters": {
        "operation": "delete",
        "tableId": "AUNI_projeto_modalidade_limites",
        "filters": {
          "conditions": [
            {
              "keyName": "projeto_id",
              "condition": "eq",
              "keyValue": "={{ $('Webhook PUT2').first().json.body.id }}"
            }
          ]
        }
      },
      "id": "fe9f7f8b-1f84-4de6-8c80-094da98df69d",
      "name": "Delete AUNI Limits",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        -5840,
        -3920
      ],
      "credentials": {
        "supabaseApi": {
          "id": "9PCPmBxs55B86AyO",
          "name": "IBRASE"
        }
      }
    },
    {
      "parameters": {
        "tableId": "AUNI_projeto_modalidade_limites",
        "dataToSend": "autoMapInputData"
      },
      "id": "dbee4966-4033-49d1-8965-1d10caccdf1e",
      "name": "Insert AUNI Limits",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        -5344,
        -3920
      ],
      "credentials": {
        "supabaseApi": {
          "id": "9PCPmBxs55B86AyO",
          "name": "IBRASE"
        }
      }
    },
    {
      "parameters": {
        "operation": "delete",
        "tableId": "IVEM_projeto_modalidade_limites",
        "filters": {
          "conditions": [
            {
              "keyName": "projeto_id",
              "condition": "eq",
              "keyValue": "={{ $('Webhook PUT2').first().json.body.id }}"
            }
          ]
        }
      },
      "id": "791021b4-962d-4210-9da8-000fa1d8df25",
      "name": "Delete IVEM Limits",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        -5840,
        -3664
      ],
      "credentials": {
        "supabaseApi": {
          "id": "9PCPmBxs55B86AyO",
          "name": "IBRASE"
        }
      }
    },
    {
      "parameters": {
        "tableId": "IVEM_projeto_modalidade_limites",
        "dataToSend": "autoMapInputData"
      },
      "id": "043f83de-b97e-4d0b-a592-080e38e71bff",
      "name": "Insert IVEM Limits",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        -5344,
        -3664
      ],
      "credentials": {
        "supabaseApi": {
          "id": "9PCPmBxs55B86AyO",
          "name": "IBRASE"
        }
      }
    },
    {
      "parameters": {
        "httpMethod": "PUT",
        "path": "projetos-put",
        "responseMode": "responseNode",
        "options": {}
      },
      "id": "b8f9bfa7-8370-4d25-af4b-00e622a49b02",
      "name": "Webhook PUT2",
      "type": "n8n-nodes-base.webhook",
      "typeVersion": 1,
      "position": [
        -6592,
        -4064
      ],
      "webhookId": "projetos-put"
    },
    {
      "parameters": {
        "operation": "update",
        "tableId": "GASCTPNA_projetos",
        "filters": {
          "conditions": [
            {
              "keyName": "id",
              "condition": "eq",
              "keyValue": "={{ $json.body.id }}"
            }
          ]
        },
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "nome",
              "fieldValue": "={{ $json.body.nome_projeto }}"
            },
            {
              "fieldId": "numero_proposta",
              "fieldValue": "={{ $json.body.numero_proposta }}"
            },
            {
              "fieldId": "termo_fomento",
              "fieldValue": "={{ $json.body.termo_fomento }}"
            },
            {
              "fieldId": "numero_processo_adm",
              "fieldValue": "={{ $json.body.numero_processo_adm }}"
            },
            {
              "fieldId": "numero_transferegov",
              "fieldValue": "={{ $json.body.numero_transferegov }}"
            },
            {
              "fieldId": "aplicabilidade",
              "fieldValue": "={{ $json.body.aplicabilidade }}"
            },
            {
              "fieldId": "descricao",
              "fieldValue": "={{ $json.body.descricao }}"
            },
            {
              "fieldId": "vigencia_inicio",
              "fieldValue": "={{ $json.body.vigencia_inicio || null }}\n"
            },
            {
              "fieldId": "vigencia_fim",
              "fieldValue": "={{ $json.body.vigencia_fim || null }}\n"
            },
            {
              "fieldId": "vigencia_termino",
              "fieldValue": "={{ $json.body.vigencia_termino || null }}\n"
            },
            {
              "fieldId": "idade_min",
              "fieldValue": "={{ $json.body.idade_min }}"
            },
            {
              "fieldId": "idade_max",
              "fieldValue": "={{ $json.body.idade_max }}"
            },
            {
              "fieldId": "limites_cargos",
              "fieldValue": "={{ $json.body.limites_cargos }}"
            },
            {
              "fieldId": "vagas_por_nucleo",
              "fieldValue": "={{ $json.body.vagas_por_nucleo }}"
            },
            {
              "fieldId": "periodos_json",
              "fieldValue": "={{ $json.body.periodos_json }}"
            },
            {
              "fieldId": "ativo",
              "fieldValue": "={{ $json.body.ativo }}"
            },
            {
              "fieldId": "limites_modalidades",
              "fieldValue": "={{ JSON.stringify($json.body.limites_modalidade || $json.body.limites_modalidades || []) }}\n"
            }
          ]
        }
      },
      "id": "fa4a68a1-9f87-478e-b355-f146b04a73a2",
      "name": "Update GASCTPNA1",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        -6096,
        -4416
      ],
      "credentials": {
        "supabaseApi": {
          "id": "9PCPmBxs55B86AyO",
          "name": "IBRASE"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const body = $('Webhook PUT2').first().json.body;\nconst projId = parseInt(body.id);\nconst limites = body.limites_modalidade || [];\nif (!limites || limites.length === 0) return [];\nreturn limites.map(l => ({\n  json: { projeto_id: projId, modalidade_id: l.id, limite: parseInt(l.limite) || 0 }\n}));"
      },
      "id": "c2912ee2-d3bf-4e82-98d8-b792c2c785a9",
      "name": "Map GASCTPNA Limits2",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        -5584,
        -4416
      ]
    },
    {
      "parameters": {
        "respondWith": "allIncomingItems",
        "options": {}
      },
      "id": "15673d99-5fc3-4e2f-b059-5d8344351c99",
      "name": "Respond GASCTPNA2",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [
        -5584,
        -4320
      ]
    },
    {
      "parameters": {
        "operation": "update",
        "tableId": "IBRASE_projetos",
        "filters": {
          "conditions": [
            {
              "keyName": "id",
              "condition": "eq",
              "keyValue": "={{ $json.body.id }}"
            }
          ]
        },
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "nome",
              "fieldValue": "={{ $json.body.nome_projeto }}"
            },
            {
              "fieldId": "numero_proposta",
              "fieldValue": "={{ $json.body.numero_proposta }}"
            },
            {
              "fieldId": "termo_fomento",
              "fieldValue": "={{ $json.body.termo_fomento }}"
            },
            {
              "fieldId": "numero_processo_adm",
              "fieldValue": "={{ $json.body.numero_processo_adm }}"
            },
            {
              "fieldId": "numero_transferegov",
              "fieldValue": "={{ $json.body.numero_transferegov }}"
            },
            {
              "fieldId": "aplicabilidade",
              "fieldValue": "={{ $json.body.aplicabilidade }}"
            },
            {
              "fieldId": "descricao",
              "fieldValue": "={{ $json.body.descricao }}"
            },
            {
              "fieldId": "vigencia_inicio",
              "fieldValue": "={{ $json.body.vigencia_inicio ? $json.body.vigencia_inicio : undefined }}"
            },
            {
              "fieldId": "vigencia_fim",
              "fieldValue": "={{ $json.body.vigencia_fim ? $json.body.vigencia_fim : undefined }}"
            },
            {
              "fieldId": "vigencia_termino",
              "fieldValue": "={{ $json.body.vigencia_termino ? $json.body.vigencia_termino : undefined }}"
            },
            {
              "fieldId": "idade_min",
              "fieldValue": "={{ $json.body.idade_min }}"
            },
            {
              "fieldId": "idade_max",
              "fieldValue": "={{ $json.body.idade_max }}"
            },
            {
              "fieldId": "limites_cargos",
              "fieldValue": "={{ $json.body.limites_cargos }}"
            },
            {
              "fieldId": "vagas_por_nucleo",
              "fieldValue": "={{ $json.body.vagas_por_nucleo }}"
            },
            {
              "fieldId": "periodos_json",
              "fieldValue": "={{ $json.body.periodos_json }}"
            },
            {
              "fieldId": "ativo",
              "fieldValue": "={{ $json.body.ativo }}"
            },
            {
              "fieldId": "limites_modalidades",
              "fieldValue": "={{ JSON.stringify(.body.limites_modalidade || .body.limites_modalidades || []) }}"
            }
          ]
        }
      },
      "id": "48ab75d6-31a9-4977-8e3c-ee9e3cb2eba0",
      "name": "Update IBRASE1",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        -6096,
        -4160
      ],
      "credentials": {
        "supabaseApi": {
          "id": "9PCPmBxs55B86AyO",
          "name": "IBRASE"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const body = $('Webhook PUT2').first().json.body;\nconst projId = parseInt(body.id);\nconst limites = body.limites_modalidade || [];\nif (!limites || limites.length === 0) return [];\nreturn limites.map(l => ({\n  json: { projeto_id: projId, modalidade_id: l.id, limite: parseInt(l.limite) || 0 }\n}));"
      },
      "id": "c6462b30-0580-4a70-98d6-f1606fabe659",
      "name": "Map IBRASE Limits2",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        -5584,
        -4160
      ]
    },
    {
      "parameters": {
        "respondWith": "allIncomingItems",
        "options": {}
      },
      "id": "b338d845-2789-40c8-8d08-e2c129a6a14c",
      "name": "Respond IBRASE2",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [
        -5584,
        -4064
      ]
    },
    {
      "parameters": {
        "operation": "update",
        "tableId": "AUNI_projetos",
        "filters": {
          "conditions": [
            {
              "keyName": "id",
              "condition": "eq",
              "keyValue": "={{ $json.body.id }}"
            }
          ]
        },
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "nome",
              "fieldValue": "={{ $json.body.nome_projeto }}"
            },
            {
              "fieldId": "numero_proposta",
              "fieldValue": "={{ $json.body.numero_proposta }}"
            },
            {
              "fieldId": "termo_fomento",
              "fieldValue": "={{ $json.body.termo_fomento }}"
            },
            {
              "fieldId": "numero_processo_adm",
              "fieldValue": "={{ $json.body.numero_processo_adm }}"
            },
            {
              "fieldId": "numero_transferegov",
              "fieldValue": "={{ $json.body.numero_transferegov }}"
            },
            {
              "fieldId": "aplicabilidade",
              "fieldValue": "={{ $json.body.aplicabilidade }}"
            },
            {
              "fieldId": "descricao",
              "fieldValue": "={{ $json.body.descricao }}"
            },
            {
              "fieldId": "vigencia_inicio",
              "fieldValue": "={{ $json.body.vigencia_inicio ? $json.body.vigencia_inicio : undefined }}"
            },
            {
              "fieldId": "vigencia_fim",
              "fieldValue": "={{ $json.body.vigencia_fim ? $json.body.vigencia_fim : undefined }}"
            },
            {
              "fieldId": "vigencia_termino",
              "fieldValue": "={{ $json.body.vigencia_termino ? $json.body.vigencia_termino : undefined }}"
            },
            {
              "fieldId": "idade_min",
              "fieldValue": "={{ $json.body.idade_min }}"
            },
            {
              "fieldId": "idade_max",
              "fieldValue": "={{ $json.body.idade_max }}"
            },
            {
              "fieldId": "limites_cargos",
              "fieldValue": "={{ $json.body.limites_cargos }}"
            },
            {
              "fieldId": "vagas_por_nucleo",
              "fieldValue": "={{ $json.body.vagas_por_nucleo }}"
            },
            {
              "fieldId": "periodos_json",
              "fieldValue": "={{ $json.body.periodos_json }}"
            },
            {
              "fieldId": "ativo",
              "fieldValue": "={{ $json.body.ativo }}"
            },
            {
              "fieldId": "limites_modalidades",
              "fieldValue": "={{ JSON.stringify(.body.limites_modalidade || .body.limites_modalidades || []) }}"
            }
          ]
        }
      },
      "id": "913011d0-b977-4da9-a127-7ab5346318e1",
      "name": "Update AUNI1",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        -6096,
        -3920
      ],
      "credentials": {
        "supabaseApi": {
          "id": "9PCPmBxs55B86AyO",
          "name": "IBRASE"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const body = $('Webhook PUT2').first().json.body;\nconst projId = parseInt(body.id);\nconst limites = body.limites_modalidade || [];\nif (!limites || limites.length === 0) return [];\nreturn limites.map(l => ({\n  json: { projeto_id: projId, modalidade_id: l.id, limite: parseInt(l.limite) || 0 }\n}));"
      },
      "id": "12d22480-8124-445b-b62b-305a6fc39b1c",
      "name": "Map AUNI Limits2",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        -5584,
        -3920
      ]
    },
    {
      "parameters": {
        "respondWith": "allIncomingItems",
        "options": {}
      },
      "id": "c90c9824-ae33-445f-ba81-ade3575bb9b2",
      "name": "Respond AUNI2",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [
        -5584,
        -3824
      ]
    },
    {
      "parameters": {
        "operation": "update",
        "tableId": "IVEM_projetos",
        "filters": {
          "conditions": [
            {
              "keyName": "id",
              "condition": "eq",
              "keyValue": "={{ $json.body.id }}"
            }
          ]
        },
        "fieldsUi": {
          "fieldValues": [
            {
              "fieldId": "nome",
              "fieldValue": "={{ $json.body.nome_projeto }}"
            },
            {
              "fieldId": "numero_proposta",
              "fieldValue": "={{ $json.body.numero_proposta }}"
            },
            {
              "fieldId": "termo_fomento",
              "fieldValue": "={{ $json.body.termo_fomento }}"
            },
            {
              "fieldId": "numero_processo_adm",
              "fieldValue": "={{ $json.body.numero_processo_adm }}"
            },
            {
              "fieldId": "numero_transferegov",
              "fieldValue": "={{ $json.body.numero_transferegov }}"
            },
            {
              "fieldId": "aplicabilidade",
              "fieldValue": "={{ $json.body.aplicabilidade }}"
            },
            {
              "fieldId": "descricao",
              "fieldValue": "={{ $json.body.descricao }}"
            },
            {
              "fieldId": "vigencia_inicio",
              "fieldValue": "={{ $json.body.vigencia_inicio ? $json.body.vigencia_inicio : undefined }}"
            },
            {
              "fieldId": "vigencia_fim",
              "fieldValue": "={{ $json.body.vigencia_fim ? $json.body.vigencia_fim : undefined }}"
            },
            {
              "fieldId": "vigencia_termino",
              "fieldValue": "={{ $json.body.vigencia_termino ? $json.body.vigencia_termino : undefined }}"
            },
            {
              "fieldId": "idade_min",
              "fieldValue": "={{ $json.body.idade_min }}"
            },
            {
              "fieldId": "idade_max",
              "fieldValue": "={{ $json.body.idade_max }}"
            },
            {
              "fieldId": "limites_cargos",
              "fieldValue": "={{ $json.body.limites_cargos }}"
            },
            {
              "fieldId": "vagas_por_nucleo",
              "fieldValue": "={{ $json.body.vagas_por_nucleo }}"
            },
            {
              "fieldId": "periodos_json",
              "fieldValue": "={{ $json.body.periodos_json }}"
            },
            {
              "fieldId": "ativo",
              "fieldValue": "={{ $json.body.ativo }}"
            },
            {
              "fieldId": "limites_modalidades",
              "fieldValue": "={{ JSON.stringify(.body.limites_modalidade || .body.limites_modalidades || []) }}"
            }
          ]
        }
      },
      "id": "76805736-547f-40a4-8f86-3569ee9a5ef1",
      "name": "Update IVEM1",
      "type": "n8n-nodes-base.supabase",
      "typeVersion": 1,
      "position": [
        -6096,
        -3664
      ],
      "credentials": {
        "supabaseApi": {
          "id": "9PCPmBxs55B86AyO",
          "name": "IBRASE"
        }
      }
    },
    {
      "parameters": {
        "jsCode": "const body = $('Webhook PUT2').first().json.body;\nconst projId = parseInt(body.id);\nconst limites = body.limites_modalidade || [];\nif (!limites || limites.length === 0) return [];\nreturn limites.map(l => ({\n  json: { projeto_id: projId, modalidade_id: l.id, limite: parseInt(l.limite) || 0 }\n}));"
      },
      "id": "c0367e04-3736-4911-a8c1-133c3ac96d29",
      "name": "Map IVEM Limits2",
      "type": "n8n-nodes-base.code",
      "typeVersion": 2,
      "position": [
        -5584,
        -3664
      ]
    },
    {
      "parameters": {
        "respondWith": "allIncomingItems",
        "options": {}
      },
      "id": "7897087c-52d7-48dc-90ea-2b1e6224a934",
      "name": "Respond IVEM2",
      "type": "n8n-nodes-base.respondToWebhook",
      "typeVersion": 1,
      "position": [
        -5584,
        -3568
      ]
    }
  ],
  "connections": {
    "Switch Instituto": {
      "main": [
        [
          {
            "node": "Update GASCTPNA1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Update IBRASE1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Update AUNI1",
            "type": "main",
            "index": 0
          }
        ],
        [
          {
            "node": "Update IVEM1",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Delete GASCTPNA Limits": {
      "main": [
        [
          {
            "node": "Map GASCTPNA Limits2",
            "type": "main",
            "index": 0
          },
          {
            "node": "Respond GASCTPNA2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Delete IBRASE Limits": {
      "main": [
        [
          {
            "node": "Map IBRASE Limits2",
            "type": "main",
            "index": 0
          },
          {
            "node": "Respond IBRASE2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Delete AUNI Limits": {
      "main": [
        [
          {
            "node": "Map AUNI Limits2",
            "type": "main",
            "index": 0
          },
          {
            "node": "Respond AUNI2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Delete IVEM Limits": {
      "main": [
        [
          {
            "node": "Map IVEM Limits2",
            "type": "main",
            "index": 0
          },
          {
            "node": "Respond IVEM2",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Webhook PUT2": {
      "main": [
        [
          {
            "node": "Switch Instituto",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Update GASCTPNA1": {
      "main": [
        [
          {
            "node": "Delete GASCTPNA Limits",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Map GASCTPNA Limits2": {
      "main": [
        [
          {
            "node": "Insert GASCTPNA Limits",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Update IBRASE1": {
      "main": [
        [
          {
            "node": "Delete IBRASE Limits",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Map IBRASE Limits2": {
      "main": [
        [
          {
            "node": "Insert IBRASE Limits",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Update AUNI1": {
      "main": [
        [
          {
            "node": "Delete AUNI Limits",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Map AUNI Limits2": {
      "main": [
        [
          {
            "node": "Insert AUNI Limits",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Update IVEM1": {
      "main": [
        [
          {
            "node": "Delete IVEM Limits",
            "type": "main",
            "index": 0
          }
        ]
      ]
    },
    "Map IVEM Limits2": {
      "main": [
        [
          {
            "node": "Insert IVEM Limits",
            "type": "main",
            "index": 0
          }
        ]
      ]
    }
  },
  "pinData": {},
  "meta": {
    "instanceId": "04b49febf1077a59f1cea62e77926c7134032a8d129079a8658a3019ec7ba664"
  }
};

let content = JSON.stringify(inputJson, null, 2);

content = content.replace(/=\{\{\s*\$json\.body\.([a-zA-Z0-9_]+)\s*\?\s*\$json\.body\.\1\s*:\s*undefined\s*\}\}/g, '={{ $$json.body.$1 || null }}');
content = content.replace(/\{\{\s*JSON\.stringify\(\.body\.limites_modalidade\s*\|\|\s*\.body\.limites_modalidades\s*\|\|\s*\[\]\)\s*\}\}/g, '{{ JSON.stringify($$json.body.limites_modalidade || $$json.body.limites_modalidades || []) }}');

fs.writeFileSync('N8N_PROJETOS_PUT_TODOS_CORRIGIDOS.json', content);
console.log('Done!');
