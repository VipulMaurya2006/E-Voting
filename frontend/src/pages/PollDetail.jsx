import { useEffect, useState } from "react";
import { Link, useParams } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext.jsx";

export default function PollDetail() {
  const { id } = useParams();
  const { user } = useAuth();
  const [poll, setPoll] = useState(null);
  const [choice, setChoice] = useState("");
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  useEffect(() => {
    api(`/polls/${id}`)
      .then((data) => {
        setPoll(data);
        if (data.votedCandidateId) setChoice(data.votedCandidateId);
      })
      .catch((err) => setError(err.message));
  }, [id]);

  async function vote(e) {
    e.preventDefault();
    setError("");
    setMessage("");
    if (!choice) {
      setError("Select a candidate first.");
      return;
    }
    setBusy(true);
    try {
      const data = await api("/votes", {
        method: "POST",
        body: JSON.stringify({ pollId: id, candidateId: choice }),
      });
      setPoll(data.poll);
      setMessage(data.message);
    } catch (err) {
      setError(err.message);
    } finally {
      setBusy(false);
    }
  }

  if (!poll && !error) return <p className="muted">Loading ballot…</p>;
  if (!poll) return <div className="error">{error}</div>;

  const canVote = user?.role === "voter" && poll.isOpen && !poll.votedCandidateId;
  const total = poll.totalVotes || 0;
  const endsAt = poll.endsAt ? new Date(poll.endsAt) : null;

  return (
    <section>
      <Link className="muted" to="/ballot">
        ← All ballots
      </Link>
      <p className="kicker">{poll.category}</p>
      <h1>{poll.title}</h1>
      <p className="lede">{poll.description}</p>
      <p className="muted">
        {total} total vote{total === 1 ? "" : "s"} · {poll.isOpen ? "Voting open" : "Voting closed"}
      </p>
      {endsAt && (
        <p className="muted">Voting deadline: {endsAt.toLocaleString()}</p>
      )}

      {error && <div className="error">{error}</div>}
      {message && <div className="success">{message}</div>}

      <form className="form wide" onSubmit={vote}>
        {poll.candidates.map((c) => {
          const pct = total ? Math.round((c.votes / total) * 100) : 0;
          const selected = choice === c._id;
          return (
            <label key={c._id} className={`choice ${selected ? "selected" : ""}`}>
              {canVote && (
                <input
                  type="radio"
                  name="candidate"
                  value={c._id}
                  checked={selected}
                  onChange={() => setChoice(c._id)}
                />
              )}
              <div style={{ flex: 1 }}>
                <strong>{c.name}</strong>
                <div className="muted">{c.party}</div>
                {(!canVote || poll.votedCandidateId) && (
                  <>
                    <div className="bar">
                      <span style={{ width: `${pct}%` }} />
                    </div>
                    <small>
                      {c.votes} vote{c.votes === 1 ? "" : "s"} ({pct}%)
                      {poll.votedCandidateId === c._id ? " · your vote" : ""}
                    </small>
                  </>
                )}
              </div>
            </label>
          );
        })}
        {canVote && (
          <button className="btn" disabled={busy}>
            {busy ? "Submitting…" : "Submit vote"}
          </button>
        )}
        {user?.role === "admin" && (
          <p className="muted">Officers can watch results but cannot vote.</p>
        )}
      </form>
    </section>
  );
}
