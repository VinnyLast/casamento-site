import Link from "next/link";

export default function Header() {
  return (
    <header>
      <h1>💍 Bingo Fotográfico</h1>
      <p>Envie suas fotos e compartilhe o momento!</p>
      <nav>
        <Link href="/">Galeria</Link>
        <Link href="/upload">Enviar Foto</Link>
      </nav>
    </header>
  )
}
