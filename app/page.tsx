// Страница AGI. Хэш коммита приходит из нашего server.js через окружение
// процесса — если на экране виден он, значит отвечает именно наш сервер и
// именно эта сборка, а не что-то постороннее, занявшее порт.
export const dynamic = 'force-dynamic'

export default function Home() {
  const commit = process.env.AGI_COMMIT ?? 'unknown'

  return (
    <main>
      <h1>hello world</h1>
      <p className="subtitle">AGI Fractera · локальный сервер</p>
      <p className="commit">
        commit <strong>{commit}</strong>
      </p>
    </main>
  )
}
