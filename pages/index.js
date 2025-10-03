import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  const [photos, setPhotos] = useState([]);

  useEffect(() => {
    const fetchPhotos = async () => {
      const q = query(collection(db, "fotos"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => doc.data());
      setPhotos(list);
    };
    fetchPhotos();
  }, []);

  return (
    <>
      <Header />
      <div className="container">
        <h2>Galeria de Fotos</h2>
        {photos.length === 0 && <p>Nenhuma foto enviada ainda!</p>}
        <div className="gallery">
          {photos.map((photo, index) => (
            <img key={index} src={photo.base64} alt="Foto do casamento" />
          ))}
        </div>
      </div>
      <Footer />
    </>
  )
}
