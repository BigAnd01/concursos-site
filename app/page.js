export const revalidate = 0

import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

const POR_PAGINA = 20

export default async function Home({ searchParams }) {
  const busca   = searchParams?.busca  || ''
  const pagina  = parseInt(searchParams?.pagina || '1')
  const ordem   = searchParams?.ordem  || 'recentes'
  const offset  = (pagina - 1) * POR_PAGINA

  // Monta a query base
  let query = supabase
    .from('concursos')
    .select('*', { count: 'exact' })
    .eq('status', 'aberto')

  if (busca) {
    query = query.ilike('titulo', `%${busca}%`)
  }

  // Ordenação
  if (ordem === 'recentes') {
    query = query.order('criado_em', { ascending: false })
  } else if (ordem === 'prazo') {
    query = query.not('inscricao_fim', 'is', null).order('inscricao_fim', { ascending: true })
  } else if (ordem === 'vagas') {
    query = query.not('vagas', 'is', null).order('vagas', { ascending: false })
  }

  query = query.range(offset, offset + POR_PAGINA - 1)

  const { data: concursos, count, error } = await query

  const total_paginas = Math.ceil((count || 0) / POR_PAGINA)

  // Monta URL com parâmetros
  function urlPagina(p) {
    const params = new URLSearchParams()
    if (busca)  params.set('busca', busca)
    if (ordem)  params.set('ordem', ordem)
    params.set('pagina', p)
    return `/?${params.toString()}`
  }

  function urlOrdem(o) {
    const params = new URLSearchParams()
    if (busca) params.set('busca', busca)
    params.set('ordem', o)
    params.set('pagina', '1')
    return `/?${params.toString()}`
  }

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem 1rem' }}>

      {/* Cabeçalho */}
      <div style={{ marginBottom: '1.5rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', margin: '0 0 4px' }}>
          Concursos SP
        </h1>
        <p style={{ color: '#666', margin: 0, fontSize: 15 }}>
          Concursos públicos de São Paulo atualizados automaticamente
        </p>
      </div>

      {/* Busca */}
      <form method="GET" style={{ display: 'flex', gap: 8, marginBottom: '1rem' }}>
        <input
          name="busca"
          defaultValue={busca}
          placeholder="Buscar... ex: prefeitura, saúde, professor, TJ"
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 8,
            border: '1px solid #ddd', fontSize: 15,
          }}
        />
        {ordem && <input type="hidden" name="ordem" value={ordem} />}
        <input type="hidden" name="pagina" value="1" />
        <button type="submit" style={{
          padding: '10px 20px', background: '#1a1a2e', color: '#fff',
          border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer',
        }}>
          Buscar
        </button>
        {busca && (
          <a href="/" style={{
            padding: '10px 16px', borderRadius: 8, border: '1px solid #ddd',
            fontSize: 14, color: '#666', textDecoration: 'none', display: 'flex',
            alignItems: 'center',
          }}>
            Limpar
          </a>
        )}
      </form>

      {/* Ordenação + total */}
      <div style={{
        display: 'flex', justifyContent: 'space-between', alignItems: 'center',
        marginBottom: '1rem', flexWrap: 'wrap', gap: 8,
      }}>
        <span style={{ fontSize: 14, color: '#888' }}>
          {error ? 'Erro ao carregar.' : (
            <>
              <strong style={{ color: '#333' }}>{count || 0}</strong> concursos encontrados
              {busca && <> para "<strong>{busca}</strong>"</>}
              {' · '}página <strong>{pagina}</strong> de <strong>{total_paginas || 1}</strong>
            </>
          )}
        </span>

        <div style={{ display: 'flex', gap: 6 }}>
          {[
            { valor: 'recentes', label: 'Mais recentes' },
            { valor: 'prazo',    label: 'Prazo de inscrição' },
            { valor: 'vagas',    label: 'Mais vagas' },
          ].map(op => (
            <a
              key={op.valor}
              href={urlOrdem(op.valor)}
              style={{
                padding: '5px 12px', borderRadius: 20, fontSize: 13,
                textDecoration: 'none',
                background: ordem === op.valor ? '#1a1a2e' : '#f0f0f0',
                color:      ordem === op.valor ? '#fff'    : '#555',
                fontWeight: ordem === op.valor ? 600       : 400,
              }}
            >
              {op.label}
            </a>
          ))}
        </div>
      </div>

      {/* Lista de concursos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {concursos?.length === 0 && (
          <p style={{ color: '#888', textAlign: 'center', padding: '3rem 0' }}>
            Nenhum concurso encontrado.
          </p>
        )}
        {concursos?.map((c) => (
          <div key={c.id} style={{
            background: '#fff', borderRadius: 10, padding: '1rem 1.25rem',
            border: '1px solid #e8e8e8',
          }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', gap: 8 }}>
              <h2 style={{ fontSize: '0.95rem', fontWeight: 600, color: '#1a1a2e', margin: 0, flex: 1 }}>
                {c.titulo}
              </h2>
              <span style={{
                background: '#e8f5e9', color: '#2e7d32', fontSize: 12,
                padding: '2px 10px', borderRadius: 20, whiteSpace: 'nowrap',
                fontWeight: 500, height: 'fit-content',
              }}>
                Aberto
              </span>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 8, flexWrap: 'wrap' }}>
              {c.orgao && <span style={{ fontSize: 13, color: '#555' }}>🏛 {c.orgao}</span>}
              {c.cidade && <span style={{ fontSize: 13, color: '#555' }}>📍 {c.cidade}</span>}
              {c.vagas && <span style={{ fontSize: 13, color: '#555' }}>👥 {c.vagas} vagas</span>}
              {c.salario && (
                <span style={{ fontSize: 13, color: '#555' }}>
                  💰 R$ {Number(c.salario).toLocaleString('pt-BR')}
                </span>
              )}
              {c.inscricao_fim && (
                <span style={{ fontSize: 13, color: '#c0392b', fontWeight: 500 }}>
                  ⏰ Inscrições até {new Date(c.inscricao_fim + 'T12:00:00').toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>

            <div style={{ marginTop: 10, display: 'flex', gap: 8, alignItems: 'center' }}>
              {c.link_fonte && (
                <a href={c.link_fonte} target="_blank" rel="noopener noreferrer" style={{
                  fontSize: 13, color: '#1a73e8', textDecoration: 'none',
                  background: '#e8f0fe', padding: '4px 12px', borderRadius: 6,
                }}>
                  Ver concurso →
                </a>
              )}
              <span style={{ fontSize: 12, color: '#bbb' }}>via {c.fonte}</span>
            </div>
          </div>
        ))}
      </div>

      {/* Paginação */}
      {total_paginas > 1 && (
        <div style={{
          display: 'flex', justifyContent: 'center', gap: 6,
          marginTop: '2rem', flexWrap: 'wrap',
        }}>
          {pagina > 1 && (
            <a href={urlPagina(pagina - 1)} style={btnPage(false)}>← Anterior</a>
          )}

          {Array.from({ length: total_paginas }, (_, i) => i + 1)
            .filter(p => p === 1 || p === total_paginas || Math.abs(p - pagina) <= 2)
            .reduce((acc, p, idx, arr) => {
              if (idx > 0 && p - arr[idx - 1] > 1) acc.push('...')
              acc.push(p)
              return acc
            }, [])
            .map((p, i) =>
              p === '...'
                ? <span key={`dots-${i}`} style={{ padding: '6px 4px', color: '#aaa' }}>...</span>
                : <a key={p} href={urlPagina(p)} style={btnPage(p === pagina)}>{p}</a>
            )
          }

          {pagina < total_paginas && (
            <a href={urlPagina(pagina + 1)} style={btnPage(false)}>Próxima →</a>
          )}
        </div>
      )}

      <p style={{ textAlign: 'center', color: '#ccc', fontSize: 12, marginTop: '2rem' }}>
        Atualizado automaticamente 2x por dia · Concursos SP
      </p>
    </main>
  )
}

function btnPage(ativo) {
  return {
    padding: '6px 14px', borderRadius: 8, fontSize: 14, textDecoration: 'none',
    background: ativo ? '#1a1a2e' : '#f0f0f0',
    color:      ativo ? '#fff'    : '#555',
    fontWeight: ativo ? 600       : 400,
    border:     ativo ? 'none'    : '1px solid #ddd',
  }
}
