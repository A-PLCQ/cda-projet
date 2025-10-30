export default function UsersList() {
  return (
    <section className="section">
      <div className="container">
        <div className="card surface card-padding">
          <h1>
            Utilisateurs <span className="primary">.</span>
          </h1>
          <p className="muted mt-2">
            Cette page affichera la liste des comptes ayant accès au back-office.
          </p>
          <p className="muted mt-2">
            Endpoint prévu : <code>GET /api/users</code> (non encore disponible).
          </p>
          <p className="muted mt-4">
            Pour l’instant, seul l’utilisateur connecté est accessible via :
          </p>
          <code className="muted">GET /api/users/me</code>
        </div>
      </div>
    </section>
  );
}
