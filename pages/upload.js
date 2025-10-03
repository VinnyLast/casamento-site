import { useState } from "react";
import { ref, uploadBytesResumable, getDownloadURL } from "firebase/storage";
import { storage, db } from "../firebase";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";

export default function Upload() {
  const [file, setFile] = useState(null);
  const [progress, setProgress] = useState(0);

  const handleUpload = () => {
    if (!file) return;

    const storageRef = ref(storage, `fotos/${Date.now()}-${file.name}`);
    const uploadTask = uploadBytesResumable(storageRef, file);

    uploadTask.on("state_changed",
      (snapshot) => {
        const prog = Math.round((snapshot.bytesTransferred / snapshot.totalBytes) * 100);
        setProgress(prog);
      },
      (err) => console.error(err),
      async () => {
        const url = await getDownloadURL(uploadTask.snapshot.ref);
        await addDoc(collection(db, "fotos"), {
          url,
          createdAt: serverTimestamp()
        });
        alert("Foto enviada com sucesso!");
        setFile(null);
        setProgress(0);
      }
    );
  };

  return (
    <div style={{ textAlign: "center", padding: "30px" }}>
      <h2>Enviar Foto</h2>
      <input type="file" onChange={(e) => setFile(e.target.files[0])} />
      <br /><br />
      <button onClick={handleUpload}>Enviar</button>
      <p>Progresso: {progress}%</p>
    </div>
  );
}
