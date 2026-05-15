import { createClient } from '@supabase/supabase-js'

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

export default async function Home({ searchParams }) {
  const estado = searchParams?.estado || 'SP'
  const busca  = searchParams?.busca  || ''

  let query = supabase
    .from('concursos')
    .select('*')
    .eq('status', 'aberto')
    .order('criado_em', { ascending: false })
    .limit(50)

  if (busca) {
    query = query.ilike('titulo', `%${busca}%`)
  }

  const { data: concursos, error } = await query

  return (
    <main style={{ maxWidth: 900, margin: '0 auto', padding: '2rem' }}>

      {/* Cabeçalho */}
      <div style={{ marginBottom: '2rem' }}>
        <h1 style={{ fontSize: '2rem', color: '#1a1a2e', margin: 0 }}>
          Concursos SP
        </h1>
        <p style={{ color: '#666', marginTop: 4 }}>
          Concursos públicos de São Paulo atualizados automaticamente
        </p>
      </div>

      {/* Barra de busca */}
      <form method="GET" style={{ marginBottom: '1.5rem', display: 'flex', gap: 8 }}>
        <input
          name="busca"
          defaultValue={busca}
          placeholder="Buscar concurso... ex: prefeitura, saúde, TJ"
          style={{
            flex: 1, padding: '10px 14px', borderRadius: 8,
            border: '1px solid #ddd', fontSize: 15, outline: 'none'
          }}
        />
        <button
          type="submit"
          style={{
            padding: '10px 20px', background: '#1a1a2e', color: '#fff',
            border: 'none', borderRadius: 8, fontSize: 15, cursor: 'pointer'
          }}
        >
          Buscar
        </button>
      </form>

      {/* Contador */}
      <p style={{ color: '#888', fontSize: 14, marginBottom: '1rem' }}>
        {error
          ? 'Erro ao carregar concursos.'
          : `${concursos?.length || 0} concursos encontrados`}
      </p>

      {/* Lista de concursos */}
      <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
        {concursos?.map((c) => (
          <div
            key={c.id}
            style={{
              background: '#fff', borderRadius: 10, padding: '1rem 1.25rem',
              border: '1px solid #e8e8e8', boxShadow: '0 1px 3px rgba(0,0,0,0.04)'
            }}
          >
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 8 }}>
              <h2 style={{ fontSize: '1rem', fontWeight: 600, color: '#1a1a2e', margin: 0, flex: 1 }}>
                {c.titulo}
              </h2>
              <span style={{
                background: '#e8f5e9', color: '#2e7d32', fontSize: 12,
                padding: '2px 10px', borderRadius: 20, whiteSpace: 'nowrap', fontWeight: 500
              }}>
                Aberto
              </span>
            </div>

            <div style={{ display: 'flex', gap: 16, marginTop: 8, flexWrap: 'wrap' }}>
              {c.orgao && (
                <span style={{ fontSize: 13, color: '#555' }}>
                  🏛 {c.orgao}
                </span>
              )}
              {c.cidade && (
                <span style={{ fontSize: 13, color: '#555' }}>
                  📍 {c.cidade}
                </span>
              )}
              {c.vagas && (
                <span style={{ fontSize: 13, color: '#555' }}>
                  👥 {c.vagas} vagas
                </span>
              )}
              {c.salario && (
                <span style={{ fontSize: 13, color: '#555' }}>
                  💰 R$ {Number(c.salario).toLocaleString('pt-BR')}
                </span>
              )}
              {c.inscricao_fim && (
                <span style={{ fontSize: 13, color: '#c0392b', fontWeight: 500 }}>
                  ⏰ Inscrições até {new Date(c.inscricao_fim).toLocaleDateString('pt-BR')}
                </span>
              )}
            </div>

            <div style={{ marginTop: 10, display: 'flex', gap: 8 }}>
              {c.link_fonte && (
                <a
                  href={c.link_fonte}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    fontSize: 13, color: '#1a73e8', textDecoration: 'none',
                    background: '#e8f0fe', padding: '4px 12px', borderRadius: 6
                  }}
                >
                  Ver concurso →
                </a>
              )}
              <span style={{ fontSize: 12, color: '#aaa', alignSelf: 'center' }}>
                via {c.fonte}
              </span>
            </div>
          </div>
        ))}
      </div>

      {/* Rodapé */}
      <p style={{ textAlign: 'center', color: '#aaa', fontSize: 13, marginTop: '3rem' }}>
        Atualizado automaticamente 2x por dia · Concursos SP
      </p>
    </main>
  )
}
