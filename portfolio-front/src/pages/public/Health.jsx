import { useQuery } from "@tanstack/react-query";
import http from "../../services/http";

export default function Health() {
  const { data, error, isLoading, isFetching } = useQuery({
    queryKey: ["health"],
    queryFn: async () => {
      const res = await http.get("/health");
      return res.data;
    },
  });

  return (
    <section className="section">
      <div className="container">
        <h2>API <span className="primary">/health</span></h2>

        {isLoading && <div className="muted mt-4">Chargement…</div>}

        {error && (
          <div
            style={{
              color: "#ef4444",
              marginTop: "var(--space-4)",
              whiteSpace: "pre-wrap",
            }}
          >
            {String(error?.message || "Erreur")}
          </div>
        )}

        {data && (
          <div className="card surface card-padding mt-6">
            <h4 className="muted mb-3">Réponse API :</h4>
            <pre
              style={{
                background: "var(--color-surface)",
                color: "var(--color-text)",
                border: "1px solid var(--color-border)",
                borderRadius: "var(--radius)",
                padding: "var(--space-4)",
                overflowX: "auto",
              }}
            >
              {JSON.stringify(data, null, 2)}
            </pre>
          </div>
        )}

        {isFetching && !isLoading && (
          <div className="muted mt-4">Rafraîchissement…</div>
        )}
      </div>
    </section>
  );
}
