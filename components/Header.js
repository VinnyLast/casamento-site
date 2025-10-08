import Link from "next/link";

export default function Header() {
  return (
    <header>
      <div className="header-container">
        <img
          src="/bingo-fotografico.png"
          alt="Logotipo Bingo Fotográfico"
          className="logo"
        />
        <div>
          <h1>💍 Bingo Fotográfico</h1>
          <p>Envie suas fotos e compartilhe o momento!</p>
        </div>
      </div>
      <nav>
        <Link href="/">Galeria</Link>
        <Link href="/upload">Enviar Foto</Link>
      </nav>
    </header>
  );
}
