import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";

const emptyCandidate = () => ({ name: "", party: "" });
const hasPassedDeadline = (poll) =>
  Boolean(poll.endsAt && new Date(poll.endsAt) <= new Date());

export default function Admin() {
  const [polls, setPolls] = useState([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("election");
  const [endsAt, setEndsAt] = useState("");
  const [candidates, setCandidates] = useState([emptyCandidate(), emptyCandidate()]);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");

  async function load() {
    const data = await api("/polls");
    setPolls(data);
  }

  useEffect(() => {
    load().catch((err) => setError(err.message));
  }, []);

  function updateCandidate(i, field, value) {
    setCandidates((list) =>
      list.map((c, idx) => (idx === i ? { ...c, [field]: value } : c))
    );
  }

  async function createPoll(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    try {
      await api("/polls", {
        method: "POST",
        body: JSON.stringify({
          title,
          description,
          category,
          candidates,
          endsAt: new Date(endsAt).toISOString(),
        }),
      });
      setTitle("");
      setDescription("");
      setEndsAt("");
      setCandidates([emptyCandidate(), emptyCandidate()]);
      setMessage("Poll published.");
      await load();
    } catch (err) {
      setError(err.message);
    }
  }

  async function toggle(poll) {
    await api(`/polls/${poll._id}/status`, {
      method: "PATCH",
      body: JSON.stringify({ isOpen: !poll.isOpen }),
    });
    await load();
  }

  async function remove(poll) {
    if (!window.confirm(`Delete “${poll.title}”?`)) return;
    await api(`/polls/${poll._id}`, { method: "DELETE" });
    await load();
  }

  return (
    <section>
      <p className="kicker">Election officer</p>
      <h1>Open a new ballot</h1>
      <form className="form wide" onSubmit={createPoll}>
        {error && <div className="error">{error}</div>}
        {message && <div className="success">{message}</div>}
        <label>
          Title
          <input required value={title} onChange={(e) => setTitle(e.target.value)} />
        </label>
        <label>
          Description
          <textarea
            rows={3}
            value={description}
            onChange={(e) => setDescription(e.target.value)}
          />
        </label>
        <label>
          Type
          <select value={category} onChange={(e) => setCategory(e.target.value)}>
            <option value="election">Election (candidates)</option>
            <option value="poll">Opinion poll</option>
          </select>
        </label>
        <label>
          Voting deadline
          <input
            type="datetime-local"
            required
            value={endsAt}
            min={new Date(Date.now() - new Date().getTimezoneOffset() * 60000)
              .toISOString()
              .slice(0, 16)}
            onChange={(e) => setEndsAt(e.target.value)}
          />
        </label>
        <div>
          <p>
            <strong>Candidates / options</strong>
          </p>
          {candidates.map((c, i) => (
            <div className="candidate-row" key={i}>
              <input
                placeholder="Name"
                required
                value={c.name}
                onChange={(e) => updateCandidate(i, "name", e.target.value)}
              />
              <input
                placeholder="Party or short label"
                value={c.party}
                onChange={(e) => updateCandidate(i, "party", e.target.value)}
              />
              {candidates.length > 2 && (
                <button
                  className="btn ghost"
                  type="button"
                  onClick={() =>
                    setCandidates((list) => list.filter((_, idx) => idx !== i))
                  }
                >
                  Remove
                </button>
              )}
            </div>
          ))}
          <button
            className="btn ghost"
            type="button"
            onClick={() => setCandidates((list) => [...list, emptyCandidate()])}
          >
            Add option
          </button>
        </div>
        <button className="btn">Publish poll</button>
      </form>

      <h2>Existing polls</h2>
      <div className="grid">
        {polls.map((poll) => (
          <article className="card" key={poll._id}>
            <div className="row">
              <span className="badge">{poll.category}</span>
              <span className={poll.isOpen ? "badge open" : "badge closed"}>
                {poll.isOpen ? "Open" : "Closed"}
              </span>
            </div>
            <h3>{poll.title}</h3>
            {poll.endsAt && (
              <p className="muted">Voting deadline: {new Date(poll.endsAt).toLocaleString()}</p>
            )}
            <p className="muted">{poll.totalVotes} votes</p>
            <div className="actions">
              <Link className="btn secondary" to={`/polls/${poll._id}`}>
                Results
              </Link>
              <button
                className="btn ghost"
                type="button"
                disabled={!poll.isOpen && hasPassedDeadline(poll)}
                onClick={() => toggle(poll)}
              >
                {poll.isOpen ? "Close" : hasPassedDeadline(poll) ? "Deadline passed" : "Reopen"}
              </button>
              <button className="btn ghost" type="button" onClick={() => remove(poll)}>
                Delete
              </button>
            </div>
          </article>
        ))}
      </div>
    </section>
  );
}
