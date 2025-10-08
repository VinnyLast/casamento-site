import { useEffect, useState, useRef } from "react";
import { db } from "../firebase";
import {
  collection,
  query,
  orderBy,
  getDocs,
  doc,
  deleteDoc,
  limit,
  startAfter
} from "firebase/firestore";
import Header from "../components/Header";
import Footer from "../components/Footer";

export default function Home() {
  const [photos, setPhotos] = useState([]);
  const [lastDoc, setLastDoc] = useState(null);
  const [loading, setLoading] = useState(false);
  const [modalPhoto, setModalPhoto] = useState(null);
  const [modalComentario, setModalComentario] = useState("");
  const [modalNome, setModalNome] = useState("");
  const [modalBingo, setModalBingo] = useState("");
  const [admin, setAdmin] = useState(false);
  const PHOTOS_PER_PAGE = 50;
  const ADMIN_PASSWORD = "casamento123";
  const containerRef = useRef();

  const bingoItems = [
    "Foto sorrindo",
    "Foto dos noivos",
    "Foto dançando",
    "Foto do seu look",
    "Fim de festa",
    "Saída dos noivos",
    "Foto com drink",
    "Foto da cerimônia",
    "Foto com amigos",
    "Foto do sorteio",
    "Foto brindando",
    "Foto da decoração"
  ];

  // Função para buscar fotos
  const fetchPhotos = async (loadMore = false) => {
    setLoading(true);
    let q;
    if (loadMore && lastDoc) {
      q = query(
        collection(db, "fotos"),
        orderBy("createdAt", "desc"),
        startAfter(lastDoc),
        limit(PHOTOS_PER_PAGE)
      );
    } else {
      q = query(
        collection(db, "fotos"),
        orderBy("createdAt", "desc"),
        limit(PHOTOS_PER_PAGE)
      );
    }

    const snapshot = await getDocs(q);
    const list = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    setPhotos(loadMore ? [...photos, ...list] : list);
    setLastDoc(snapshot.docs[snapshot.docs.length - 1] || null);
    setLoading(false);
  };

  useEffect(() => {
    fetchPhotos();
  }, []);

  useEffect(() => {
    const handleScroll = () => {
      if (
        window.innerHeight + window.scrollY >= document.body.offsetHeight - 200 &&
        !loading &&
        lastDoc
      ) {
        fetchPhotos(true);
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [loading, lastDoc, photos]);

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

  const openModal = (photo, bingoName = "") => {
    setModalPhoto(photo.base64);
    setModalNome(photo.nome);
    setModalComentario(photo.comentario || "");
    setModalBingo(bingoName);
  };

  // Agrupa fotos por convidado
  const groupedPhotos = photos.reduce((acc, photo) => {
    if (!acc[photo.nome]) acc[photo.nome] = [];
    acc[photo.nome].push(photo);
    return acc;
  }, {});

  // Fotos sem categoria
  const loosePhotos = photos.filter(photo => !photo.bingo);

  return (
    <>
      <Header />

      {!admin && (
        <div
          style={{
            position: "fixed",
            top: "10px",
            right: "10px",
            width: "20px",
            height: "20px",
            cursor: "pointer",
            opacity: 0.2,
            zIndex: 1001,
          }}
          onClick={() => {
            const password = prompt("Senha do admin:");
            if(password === ADMIN_PASSWORD) setAdmin(true);
            else alert("Senha incorreta!");
          }}
        ></div>
      )}

      <div className="container" ref={containerRef}>
        <h2>Galeria Bingo de Fotos</h2>
        {photos.length === 0 && <p>Nenhuma foto enviada ainda!</p>}

        {Object.keys(groupedPhotos).map((nome) => {
          const userPhotos = groupedPhotos[nome];

          return (
            <div key={nome} style={{ marginBottom: "40px" }}>
              <h3 style={{ textAlign: "left", marginBottom: "10px" }}>{nome}</h3>

              <div className="bingo-grid">
                {bingoItems.map((item, idx) => {
                  const photo = userPhotos.find(p => p.bingo === item);
                  return (
                    <div
                      key={idx}
                      className="bingo-item"
                      style={{
                        cursor: photo ? "pointer" : "default"
                      }}
                      onClick={() => photo && openModal(photo, item)}
                    >
                      {photo ? (
                        <img src={photo.base64} alt={`Foto de ${nome}`} />
                      ) : (
                        <span>{item}</span>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )
        })}

        {loosePhotos.length > 0 && (
          <>
            <h2>Fotos Livres</h2>
            <div className="gallery">
              {loosePhotos.map(photo => (
                <div key={photo.id}>
                  <img
                    src={photo.base64}
                    alt={`Foto de ${photo.nome}`}
                    onClick={() => openModal(photo)}
                    loading="lazy"
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
          </>
        )}

        {loading && <p>Carregando fotos...</p>}
      </div>

      {modalPhoto && (
        <div
          style={{
            position: "fixed",
            top: 0, left: 0, right: 0, bottom: 0,
            backgroundColor: "rgba(0,0,0,0.8)",
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            alignItems: "center",
            zIndex: 1000,
            color: "#fff",
          }}
          onClick={() => setModalPhoto(null)}
        >
          <img
            src={modalPhoto}
            alt="Foto grande"
            style={{
              maxHeight: "70%",
              maxWidth: "90%",
              borderRadius: "12px",
              boxShadow: "0 8px 20px rgba(0,0,0,0.5)"
            }}
          />
          <p style={{ marginTop: "10px", fontSize: "1.1rem" }}>
            <strong>{modalNome}</strong> {modalBingo && `- ${modalBingo}`}
          </p>
          {modalComentario && <p style={{ fontStyle: "italic" }}>{modalComentario}</p>}
        </div>
      )}

      <Footer />
    </>
  );
}
