import { useEffect, useState } from "react";
import { collection, onSnapshot, orderBy, query } from "firebase/firestore";
import { db } from "../firebase";

export default function Galeria() {
  const [fotos, setFotos] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "fotos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFotos(snapshot.docs.map(doc => doc.data()));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ textAlign: "center", padding: "20px" }}>
      <h2>Galeria de Fotos</h2>
      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: "10px" }}>
        {fotos.map((foto, i) => (
          <img key={i} src={foto.url} alt="foto" style={{ width: "100%", borderRadius: "8px" }} />
        ))}
      </div>
    </div>
  );
}
