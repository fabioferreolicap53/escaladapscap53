import PocketBase from 'pocketbase';

// URL do PocketBase a partir do .env (fallback para localhost em desenvolvimento)
const PB_URL = import.meta.env.VITE_POCKETBASE_URL || 'http://localhost:8090';

// Prefixo do projeto configurado no .env
const PROJECT_PREFIX = import.meta.env.VITE_PROJECT_PREFIX || 'escaladapscap53';

// Instância única do cliente do PocketBase
// Ajuste para garantir que a URL termine em /api/ se estiver usando um subdiretório ou proxy
const normalizedUrl = PB_URL.endsWith('/') ? PB_URL : `${PB_URL}/`;
export const pb = new PocketBase(normalizedUrl);

// Habilita auto-cancelamento de requisições duplicadas pendentes para economizar recursos e conexões
pb.autoCancellation(true);

/**
 * Função utilitária para obter o nome da coleção com o prefixo correto.
 * Isso garante que todas as consultas respeitem a estrutura "{{NOME_PROJETO}}_{NOME_COLECAO}"
 * e organiza melhor os dados no backend para o servidor de baixo recurso.
 *
 * @param collectionName Nome base da coleção (ex: 'users', 'posts')
 * @returns Nome completo da coleção (ex: 'escaladapscap53_users')
 */
export const getCollectionName = (collectionName: string): string => {
  return `${PROJECT_PREFIX}_${collectionName}`;
};

/**
 * DIRETRIZES DE USO (Baseadas nas restrições da VM Oracle Cloud - 1GB RAM/1 vCPU):
 *
 * 1. OTIMIZAÇÃO DE QUERIES: 
 *    - Sempre utilize paginação (ex: pb.collection(name).getList(1, 20)).
 *    - Especifique os campos desejados usando o parâmetro `fields` para trafegar menos dados:
 *      ex: pb.collection(name).getList(1, 20, { fields: 'id,title,created' })
 *
 * 2. CACHE NO FRONTEND:
 *    - Evite fazer requisições constantes para dados que mudam pouco.
 *    - Armazene dados globais/configurações em Contextos React ou use bibliotecas de 
 *      cache (como React Query / SWR) configuradas com tempo alto de staleTime.
 *
 * 3. PROCESSAMENTO:
 *    - Não dependa de hooks/eventos pesados no servidor PocketBase (ex: processamento de 
 *      imagens ou relatórios pesados onCreate). 
 *    - O processamento deve ser offloaded (transferido) para o frontend sempre que possível.
 */
