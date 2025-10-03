import { useState } from "react";
import { db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import Header from "../components/Header";
import Footer from "../components/Footer";

// Redimensiona imagens grandes
const resizeImage = (file, maxWidth = 1024, maxHeight = 1024) => {
  return new Promise((resolve) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      const img = new Image();
      img.src = e.target.result;
      img.onload = () => {
        let width = img.width;
        let height = img.height;
        if (width > height) {
          if (width > maxWidth) { height *= maxWidth / width; width = maxWidth; }
        } else {
          if (height > maxHeight) { width *= maxHeight / height; height = maxHeight; }
        }
        const canvas = document.createElement("canvas");
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext("2d");
        ctx.drawImage(img, 0, 0, width, height);
        const base64 = canvas.toDataURL("image/jpeg", 0.7);
        resolve(base64);
      };
    };
    reader.readAsDataURL(file);
  });
};

export default function Upload() {
  const [file, setFile] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleUpload = async () => {
    if (!file) return alert("Escolha um arquivo primeiro!");
    setLoading(true);
    try {
      const base64 = await resizeImage(file);
      await addDoc(collection(db, "fotos"), { base64, createdAt: serverTimestamp() });
      alert("Foto enviada com sucesso!");
      setFile(null);
    } catch (err) {
      console.error("Erro ao enviar a foto:", err);
      alert("Erro ao enviar a foto.");
    }
    setLoading(false);
  };

  return (
    <>
      <Header />
      <div className="container">
        <h2>Envie sua Foto</h2>

        <div style={{ display: "flex", justifyContent: "center", gap: "10px", flexWrap: "wrap" }}>
          <label className="button button-blue">
            Tirar Foto
            <input
              type="file"
              accept="image/*"
              capture="environment"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>

          <label className="button button-gray">
            Escolher Foto
            <input
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={(e) => setFile(e.target.files[0])}
            />
          </label>
        </div>

        {file && <p className="file-name">📄 {file.name}</p>}

        <button
          onClick={handleUpload}
          disabled={loading || !file}
          className="button button-green"
        >
          {loading ? "Enviando..." : "Enviar Foto"}
        </button>
      </div>
      <Footer />
    </>
  );
}
