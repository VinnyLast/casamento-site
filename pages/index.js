import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, getDocs } from "firebase/firestore";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  const [photos, setPhotos] = useState([]);
  const [modalPhoto, setModalPhoto] = useState(null);

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
            <img
              key={index}
              src={photo.base64}
              alt="Foto do casamento"
              onClick={() => setModalPhoto(photo.base64)}
              style={{ cursor: "pointer" }}
            />
          ))}
        </div>
      </div>

      {/* Modal */}
      {modalPhoto && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
          }}
          onClick={() => setModalPhoto(null)}
        >
          <img
            src={modalPhoto}
            alt="Foto grande"
            style={{
              maxHeight: "90%",
              maxWidth: "90%",
              borderRadius: "12px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.5)"
            }}
          />
        </div>
      )}

      <Footer />
    </>
  )
}
