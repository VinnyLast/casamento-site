// pages/galeria.js
import { useEffect, useState } from "react";
import { db } from "../firebase";
import { collection, query, orderBy, onSnapshot } from "firebase/firestore";

export default function Galeria() {
  const [fotos, setFotos] = useState([]);

  useEffect(() => {
    const q = query(collection(db, "fotos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      setFotos(snapshot.docs.map(doc => doc.data().base64));
    });
    return () => unsubscribe();
  }, []);

  return (
    <div style={{ padding: "20px" }}>
      <h1>Galeria</h1>
      <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
        {fotos.map((src, i) => (
          <img key={i} src={src} alt={`Foto ${i}`} style={{ width: "200px", height: "200px", objectFit: "cover" }} />
        ))}
      </div>
    </div>
  );
}
