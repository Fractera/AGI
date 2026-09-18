// Страница AGI. Хэш коммита приходит из нашего server.js через окружение
// процесса — если на экране виден он, значит отвечает именно наш сервер и
// именно эта сборка, а не что-то постороннее, занявшее порт.
export const dynamic = 'force-dynamic'

export default function Home() {
  const commit = process.env.AGI_COMMIT ?? 'unknown'

  return (
    <main style={{ textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', margin: 0 }}>hello world</h1>
      <p style={{ opacity: 0.6, marginTop: '1rem' }}>AGI Fractera · локальный сервер</p>
      <p
        style={{
          marginTop: '2rem',
          fontFamily: 'ui-monospace, SFMono-Regular, Menlo, Consolas, monospace',
          fontSize: '0.9rem',
          opacity: 0.55,
        }}
      >
        commit <strong style={{ opacity: 1 }}>{commit}</strong>
      </p>
    </main>
  )
}
