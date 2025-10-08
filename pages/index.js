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
  startAfter,
  writeBatch
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

  // Buscar fotos
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

  const handleDeletePhoto = async (id) => {
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

  const handleDeleteGroup = async (nome) => {
    if (!confirm(`Deseja apagar todas as fotos de ${nome}?`)) return;
    try {
      const batch = writeBatch(db);
      photos.filter(p => p.nome === nome).forEach(p => {
        const photoRef = doc(db, "fotos", p.id);
        batch.delete(photoRef);
      });
      await batch.commit();
      setPhotos(photos.filter(p => p.nome !== nome));
      alert(`Grupo ${nome} apagado!`);
    } catch (err) {
      console.error(err);
      alert("Erro ao apagar o grupo.");
    }
  };

  const openModal = (photo, bingoName) => {
    setModalPhoto(photo.base64);
    setModalNome(photo.nome);
    setModalComentario(photo.comentario || "");
    setModalBingo(photo.categoria || bingoName || "Foto avulsa");
  };

  // Agrupa fotos por nome (somente quem enviou fotos)
  const groupedPhotos = photos.reduce((acc, photo) => {
    if (!acc[photo.nome]) acc[photo.nome] = [];
    acc[photo.nome].push(photo);
    return acc;
  }, {});

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
          if (userPhotos.length === 0) return null; // não exibe grupo sem foto

          return (
            <div key={nome} style={{ marginBottom: "40px" }}>
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center" }}>
                <h3>{nome}</h3>
                {admin && (
                  <button
                    style={{
                      backgroundColor: "#ff4444",
                      color: "#fff",
                      border: "none",
                      borderRadius: "6px",
                      padding: "4px 8px",
                      cursor: "pointer",
                      fontSize: "0.8rem",
                    }}
                    onClick={() => handleDeleteGroup(nome)}
                  >
                    Apagar Grupo
                  </button>
                )}
              </div>

              <div className="bingo-grid">
                {bingoItems.map((item, idx) => {
                  const photo = userPhotos.find(p => p.categoria === item);
                  return (
                    <div
                      key={idx}
                      className="bingo-item"
                      onClick={() => photo && openModal(photo, item)}
                    >
                      {!photo && item}
                      {photo && <img src={photo.base64} alt={`Foto ${item}`} />}
                      {admin && photo && (
                        <button
                          style={{
                            position: "absolute",
                            top: "4px",
                            right: "4px",
                            backgroundColor: "#ff4444",
                            color: "#fff",
                            border: "none",
                            borderRadius: "6px",
                            padding: "2px 6px",
                            cursor: "pointer",
                            fontSize: "0.7rem",
                          }}
                          onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }}
                        >
                          Apagar
                        </button>
                      )}
                    </div>
                  )
                })}

                {/* Fotos avulsas */}
                {userPhotos.filter(p => !p.categoria).map((photo) => (
                  <div
                    key={photo.id}
                    className="bingo-item"
                    onClick={() => openModal(photo, "")}
                  >
                    <img src={photo.base64} alt="Foto avulsa" />
                    {admin && (
                      <button
                        style={{
                          position: "absolute",
                          top: "4px",
                          right: "4px",
                          backgroundColor: "#ff4444",
                          color: "#fff",
                          border: "none",
                          borderRadius: "6px",
                          padding: "2px 6px",
                          cursor: "pointer",
                          fontSize: "0.7rem",
                        }}
                        onClick={(e) => { e.stopPropagation(); handleDeletePhoto(photo.id); }}
                      >
                        Apagar
                      </button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )
        })}

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
