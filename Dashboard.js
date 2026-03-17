import { useState, useEffect } from "react";
import axios from "axios";
import { Bar } from "react-chartjs-2";
import {
  Chart as ChartJS,
  BarElement,
  CategoryScale,
  LinearScale,
  Tooltip,
  Legend,
} from "chart.js";

ChartJS.register(BarElement, CategoryScale, LinearScale, Tooltip, Legend);

function Dashboard() {
  const [mood, setMood] = useState("");
  const [moods, setMoods] = useState([]);

  useEffect(() => {
    fetchMoods();
  }, []);

  const fetchMoods = async () => {
    try {
      const res = await axios.get("http://127.0.0.1:8000/api/moods/");
      setMoods(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!mood.trim()) return;

    try {
      const res = await axios.post("http://127.0.0.1:8000/api/moods/", { mood });
      setMoods([res.data, ...moods]);
      setMood("");
    } catch (err) {
      console.error(err);
    }
  };

  const deleteMood = (indexToDelete) => {
    const updated = moods.filter((_, i) => i !== indexToDelete);
    setMoods(updated);
  };

  const moodCounts = moods.reduce((acc, m) => {
    const key = m.mood.toLowerCase();
    acc[key] = (acc[key] || 0) + 1;
    return acc;
  }, {});

  const chartData = {
    labels: Object.keys(moodCounts),
    datasets: [
      {
        label: "Mood Count",
        data: Object.values(moodCounts),
        backgroundColor: [
          "#4CAF50",
          "#FF9800",
          "#2196F3",
          "#E91E63",
          "#9C27B0",
          "#F44336",
        ],
      },
    ],
  };

  const getSuggestion = (m) => {
    if (m === "sad") return "🌬️ Breathe in… Breathe out… Everything will be okay.";
    if (m === "angry") return "🧘 Take 5 deep breaths before reacting.";
    if (m === "happy") return "✨ Spread your happiness to someone today!";
    return "🌿 Take care of yourself today.";
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <h1>🌿 MindCare Mood Tracker</h1>
        <form onSubmit={handleSubmit} style={styles.form}>
          <input
            type="text"
            placeholder="Enter mood"
            value={mood}
            onChange={(e) => setMood(e.target.value)}
            style={styles.input}
          />
          <button type="submit" style={styles.addButton}>Add</button>
        </form>

        <ul style={styles.list}>
          {moods.map((m, i) => (
            <li key={m.id} style={styles.listItem}>
              <div>
                <strong>{m.mood}</strong>
                <br />
                <small>{new Date(m.created_at).toLocaleString()}</small>
                <br />
                <span style={styles.suggestion}>{getSuggestion(m.mood)}</span>
              </div>
              <button onClick={() => deleteMood(i)}>❌</button>
            </li>
          ))}
        </ul>

        {moods.length > 0 && (
          <>
            <h3>Mood Chart 📊</h3>
            <Bar data={chartData} />
          </>
        )}
      </div>
    </div>
  );
}

const styles = {
  container: { minHeight: "100vh", display: "flex", justifyContent: "center", alignItems: "center", background: "linear-gradient(to right, #c2ffd8, #465efb)" },
  card: { backgroundColor: "white", padding: "30px", borderRadius: "15px", width: "450px", boxShadow: "0 8px 20px rgba(0,0,0,0.1)" },
  form: { display: "flex", gap: "10px" },
  input: { flex: 1, padding: "8px", borderRadius: "8px", border: "1px solid #ccc" },
  addButton: { padding: "8px 12px", borderRadius: "8px", border: "none", backgroundColor: "#4CAF50", color: "white", cursor: "pointer" },
  list: { listStyle: "none", padding: 0, marginTop: "15px" },
  listItem: { display: "flex", justifyContent: "space-between", marginTop: "5px" },
  suggestion: { fontSize: "12px", color: "#555" },
};

export default Dashboard;