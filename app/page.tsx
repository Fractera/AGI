// Первая страница AGI. В 228-1 она отдаёт только приветствие; хэш коммита
// появится здесь в 228-2, когда сайт поднимет наш собственный server.js.
export default function Home() {
  return (
    <main style={{ textAlign: 'center', padding: '2rem' }}>
      <h1 style={{ fontSize: 'clamp(2rem, 8vw, 4rem)', margin: 0 }}>hello world</h1>
      <p style={{ opacity: 0.6, marginTop: '1rem' }}>AGI Fractera · локальный сервер</p>
    </main>
  )
}
