import { getPool } from '../config/db.js';
import { v4 as uuid } from 'uuid';
import { toSlug } from '../helpers/slug.js';
import { badRequest, notFoundErr } from '../helpers/httpErrors.js';

export async function listProjets(){
  const pool = getPool();
  const [rows] = await pool.query(
    `SELECT p.*, u.nom_affiche AS auteur
     FROM projet p JOIN utilisateur u ON u.id_utilisateur=p.id_utilisateur
     ORDER BY p.date_creation DESC`
  );
  return rows;
}

export async function createProjet(userId, dto){
  const pool = getPool();
  const id = uuid();
  const slug = toSlug(dto.titre);

  const [dups] = await pool.query(`SELECT 1 FROM projet WHERE slug=:slug`, { slug });
  if (dups.length) throw badRequest('Un projet avec ce titre/slug existe déjà');

  await pool.query(
    `INSERT INTO projet (id_projet,titre,slug,extrait,description,client,date_debut,date_fin,statut,est_mis_en_avant,id_utilisateur)
     VALUES (:id,:titre,:slug,:extrait,:description,:client,:date_debut,:date_fin,:statut,:featured,:uid)`,
    {
      id, titre:dto.titre, slug,
      extrait: dto.extrait ?? null,
      description: dto.description ?? null,
      client: dto.client ?? null,
      date_debut: dto.date_debut ?? null,
      date_fin: dto.date_fin ?? null,
      statut: dto.statut,
      featured: dto.est_mis_en_avant ? 1 : 0,
      uid: userId
    }
  );

  // catégories
  for (const id_categorie of dto.categories ?? []) {
    await pool.query(`INSERT INTO APPARTIENT_A (id_projet,id_categorie) VALUES (:p,:c)`,
      { p:id, c:id_categorie });
  }
  // liens
  for (const l of dto.liens ?? []) {
    const id_lien = uuid();
    await pool.query(
      `INSERT INTO lien_projet (id_lien,libelle,url,type,id_projet) VALUES (:id,:lib,:url,:type,:p)`,
      { id:id_lien, lib:l.libelle, url:l.url, type:l.type, p:id }
    );
  }

  const [created] = await pool.query(`SELECT * FROM projet WHERE id_projet=:id`, { id });
  return created[0];
}
