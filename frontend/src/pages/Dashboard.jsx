import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { api } from "../api";
import { useAuth } from "../AuthContext.jsx";

export default function Dashboard() {
  const { user } = useAuth();
  const [polls, setPolls] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    api("/polls")
      .then(setPolls)
      .catch((err) => setError(err.message));
  }, []);

  return (
    <section>
      <p className="kicker">Hello, {user?.name}</p>
      <h1>Open ballots & campus polls</h1>
      {error && <div className="error">{error}</div>}
      {polls.length === 0 && !error && (
        <p className="muted">No polls yet. An election officer can create one from the officer desk.</p>
      )}
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
            <p className="muted">{poll.description || "No extra details."}</p>
            {poll.endsAt && (
              <p className="muted">Voting deadline: {new Date(poll.endsAt).toLocaleString()}</p>
            )}
            <p className="muted">
              {poll.totalVotes} vote{poll.totalVotes === 1 ? "" : "s"}
              {poll.votedCandidateId ? " · You have voted" : ""}
            </p>
            <Link className="btn" to={`/polls/${poll._id}`}>
              {poll.votedCandidateId || !poll.isOpen ? "View results" : "Cast vote"}
            </Link>
          </article>
        ))}
      </div>
    </section>
  );
}
