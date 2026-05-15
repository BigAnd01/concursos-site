export const metadata = {
  title: 'Concursos SP',
  description: 'Concursos públicos de São Paulo',
}

export default function RootLayout({ children }) {
  return (
    <html lang="pt-BR">
      <body style={{ margin: 0, fontFamily: 'sans-serif', background: '#f5f5f5' }}>
        {children}
      </body>
    </html>
  )
}
