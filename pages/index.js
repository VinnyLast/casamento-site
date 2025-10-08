import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, getDocs, doc, deleteDoc } from "firebase/firestore";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  const [photos, setPhotos] = useState([]);
  const [modalPhoto, setModalPhoto] = useState(null);
  const [admin, setAdmin] = useState(false);

  const ADMIN_PASSWORD = "casamento123"; // coloque sua senha aqui

  useEffect(() => {
    const fetchPhotos = async () => {
      const q = query(collection(db, "fotos"), orderBy("createdAt", "desc"));
      const snapshot = await getDocs(q);
      const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      setPhotos(list);
    };
    fetchPhotos();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Deseja realmente apagar esta foto?")) return;
    try {
      const photoRef = doc(db, "fotos", id);
      await deleteDoc(photoRef);
      setPhotos(photos.filter(photo => photo.id !== id));
      alert("Foto apagada!");
    } catch (err) {
      console.error(err);
      alert("Erro ao apagar a foto.");
    }
  };

  return (
    <>
      <Header />

      {/* Clique secreto para admin */}
      {!admin && (
        <div
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            width: "20px",
            height: "20px",
            cursor: "pointer",
            opacity: 0.2, // quase invisível
            zIndex: 1001,
          }}
          onClick={() => {
            const password = prompt("Senha do admin:");
            if(password === ADMIN_PASSWORD) setAdmin(true);
            else alert("Senha incorreta!");
          }}
        ></div>
      )}

      <div className="container">
        <h2>Galeria de Fotos</h2>
        {photos.length === 0 && <p>Nenhuma foto enviada ainda!</p>}

        <div className="gallery">
          {photos.map((photo) => (
            <div key={photo.id} style={{ position: "relative" }}>
              <img
                src={photo.base64}
                alt="Foto do casamento"
                onClick={() => setModalPhoto(photo.base64)}
                style={{ cursor: "pointer" }}
              />
              {admin && (
                <button
                  style={{
                    position: "absolute",
                    top: "5px",
                    right: "5px",
                    backgroundColor: "#ff4444",
                    color: "#fff",
                    border: "none",
                    borderRadius: "6px",
                    padding: "4px 8px",
                    cursor: "pointer",
                    fontSize: "0.8rem",
                  }}
                  onClick={() => handleDelete(photo.id)}
                >
                  Apagar
                </button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Modal para mostrar foto grande */}
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
  );
}
