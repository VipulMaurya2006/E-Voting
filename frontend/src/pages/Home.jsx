import { Link } from "react-router-dom";
import { useAuth } from "../AuthContext.jsx";

export default function Home() {
  const { user } = useAuth();

  return (
    <section className="hero">
      <div>
        <p className="kicker">College e-voting & polling</p>
        <h1>Cast one honest vote. See the campus result take shape.</h1>
        <p className="lede">
          Students register with a college email and student ID, then vote once per
          election or opinion poll. Election officers open and close ballots from a
          simple admin desk.
        </p>
        <div className="actions">
          {user ? (
            <Link className="btn" to="/ballot">
              Go to ballots
            </Link>
          ) : (
            <>
              <Link className="btn" to="/register">
                Create student account
              </Link>
              <Link className="btn secondary" to="/login">
                Log in
              </Link>
            </>
          )}
        </div>
      </div>
      <aside className="panel stats">
        <div className="stat">
          <strong>One vote</strong>
          <span className="muted">Each student can vote only once per poll.</span>
        </div>
        <div className="stat">
          <strong>Live tally</strong>
          <span className="muted">Bars update after you submit your ballot.</span>
        </div>
        <div className="stat">
          <strong>Officer tools</strong>
          <span className="muted">Create elections, close voting, or remove a poll.</span>
        </div>
      </aside>
    </section>
  );
}
