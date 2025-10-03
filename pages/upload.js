// pages/upload.js
import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = () => {
    if (!file) return alert("Escolha um arquivo primeiro!");
    
    setLoading(true);
    const reader = new FileReader();
    reader.onload = async () => {
      const base64 = reader.result; // converte em Base64
      try {
        await addDoc(collection(db, "fotos"), {
          base64,
          createdAt: serverTimestamp()
        });
        alert("Foto enviada com sucesso!");
        setFile(null);
      } catch (err) {
        console.error(err);
        alert("Erro ao enviar a foto.");
      }
      setLoading(false);
    };
    reader.readAsDataURL(file);
  };

  return (
    <div style={{ padding: "20px" }}>
      <h1>Upload de Foto</h1>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files[0])}
      />
      <button onClick={handleUpload} disabled={loading}>
        {loading ? "Enviando..." : "Enviar"}
      </button>
    </div>
  );
}
