export default function SettingsIndex() {
  return (
    <section className="section">
      <div className="container">
        <div className="card surface card-padding">
          <h1>
            Paramètres du site <span className="primary">.</span>
          </h1>
          <p className="muted mt-2">
            Cette section servira à configurer le site, les métadonnées et les variables d’API.
          </p>
          <ul className="muted mt-3" style={{ lineHeight: 1.6 }}>
            <li>• Nom du site, logo et palette de couleurs</li>
            <li>• URL de base de l’API</li>
            <li>• Clés d’intégration externes</li>
            <li>• Gestion du mode maintenance</li>
          </ul>
          <p className="muted mt-4">
            Endpoint à créer côté API : <code>/api/settings</code>
          </p>
        </div>
      </div>
    </section>
  );
}
