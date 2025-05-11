import { useState, useEffect } from "react";
import './Login.css';

export default function Game() {
  const API = "/api";
  document.title = 'Guess The Number';
  
  const [name, setName] = useState("");
  const [input, setInput] = useState("");
  const [msg, setMsg] = useState("Bir sayı tahmin et!");
  const [attempts, setAttempts] = useState(0);
  const [board, setBoard] = useState([]);

  useEffect(() => {
    refreshBoard();
  }, []);

  const refreshBoard = () =>
    fetch(`${API}/leaderboard`)
      .then(r => r.json())
      .then(setBoard)
      .catch(err => console.error("Board →", err.message));

  
  const formatDate = (date) => {
    const d = new Date(date);
    return d.toLocaleString('tr-TR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
    });
  };

  
  const handleSubmit = async e => {
    e.preventDefault();
    if (!name.trim()) return alert("Önce adınızı girin!");

    try {
      const res = await fetch(`${API}/guess`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          value: Number(input),
          attempts: attempts + 1
        })
      });

      const data = await res.json();
      setMsg(data.message);
      setAttempts(a => a + 1);
      setInput("");

    
      if (data.message?.startsWith("TEBRİKLER")) {
        await refreshBoard();
        setAttempts(0);
      }
    } catch (err) {
      console.error("Tahmin →", err.message);
      setMsg("Sunucu hatası, tekrar dene!");
    }
  };

  return (
    <div className="game-wrap">
      <h1>TAHMİN EDEBİLECEK MİSİN?</h1>

      <form onSubmit={handleSubmit} className="game-form">
        <input
          type="text"
          placeholder="Adınız"
          value={name}
          onChange={e => setName(e.target.value)}
        />
        <input
          type="number"
          placeholder="Sayı gir"
          value={input}
          onChange={e => setInput(e.target.value)}
          required
        />
        <button type="submit">TAMAM</button>
      </form>

      <p className="message">
        {msg} <small>({attempts} deneme)</small>
      </p>

      <h3>Lider Tablosu</h3>
      <table>
        <thead>
          <tr>
            <th>#</th><th>Oyuncu</th><th>Deneme</th><th>Tarih</th>
          </tr>
        </thead>
        <tbody>
          {board.map((r, i) => (
            <tr key={i}>
              <td>{i + 1}</td>
              <td>{r.player_name}</td>
              <td>{r.attempts}</td>
              <td>{formatDate(r.played_at)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
