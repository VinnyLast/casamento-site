import Image from "next/image";
import monograma from "../public/IMG_9300.JPG";

export default function Header() {
  return (
    <header>
      <div className="monograma">
        <Image 
          src={monograma} 
          alt="Monograma João & Ana Paula" 
          width={150} 
          height={150} 
        />
      </div>
      <h1>Casamento João & Ana Paula</h1>
    </header>
  );
}
