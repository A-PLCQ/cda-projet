export default function MediasIndex() {
  return (
    <section className="section">
      <div className="container">
        <div className="card surface card-padding">
          <h1>
            Médias du serveur <span className="primary">.</span>
          </h1>
          <p className="muted mt-2">
            Cette section permettra de parcourir tous les fichiers uploadés sur le serveur.
          </p>
          <p className="muted mt-2">
            Pour l’instant, seuls les médias liés à un projet sont disponibles via :
          </p>
          <code className="muted">GET /api/media/projets/:id_projet</code>
        </div>
      </div>
    </section>
  );
}
