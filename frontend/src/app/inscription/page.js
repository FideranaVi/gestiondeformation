
"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../auth.module.css";

export default function InscriptionPage() {
  const [form, setForm] = useState({
    nom: "",
    prenom: "",
    email: "",
    mot_de_passe: "",
    confirmation: "",
  });

  const [afficher, setAfficher] = useState(false);
  const [erreur, setErreur] = useState("");
  const [succes, setSucces] = useState("");
  const [chargement, setChargement] = useState(false);

  const handleChange = (e) => {
    setForm({
      ...form,
      [e.target.name]: e.target.value,
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    setErreur("");
    setSucces("");

    if (form.mot_de_passe !== form.confirmation) {
      setErreur("Les mots de passe ne correspondent pas.");
      return;
    }

    if (form.mot_de_passe.length < 8) {
      setErreur("Le mot de passe doit contenir au moins 8 caractères.");
      return;
    }

    setChargement(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/utilisateur/inscription`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            nom: form.nom,
            prenom: form.prenom,
            email: form.email,
            mot_de_passe: form.mot_de_passe,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErreur(data.message || "Échec de l'inscription.");
        return;
      }

      setSucces("Votre compte a été créé avec succès !");

      setForm({
        nom: "",
        prenom: "",
        email: "",
        mot_de_passe: "",
        confirmation: "",
      });
    } catch (error) {
      setErreur("Impossible de contacter le serveur.");
    } finally {
      setChargement(false);
    }
  };

  return (
    <main className={styles.authPage}>
      <div className={styles.authContainer}>
        <section className={styles.authSide}>
          <div className={styles.logo}>
            LEARNING<span>PRO</span>
          </div>

          <div className={styles.sideContent}>
            <div className={styles.sideIcon}>✦</div>

            <h1>
              Construisez votre avenir avec nous.
            </h1>

            <p>
              Rejoignez LearningPro et profitez de formations,
              de modules pratiques et d&apos;évaluations
              pour progresser.
            </p>
          </div>

          <p className={styles.sideFooter}>
            Apprenez aujourd&apos;hui, réussissez demain.
          </p>
        </section>

        <section className={styles.authFormSide}>
          <div className={styles.formContent}>
            <div className={styles.mobileLogo}>
              LEARNING<span>PRO</span>
            </div>

            <span className={styles.welcome}>
              REJOIGNEZ-NOUS
            </span>

            <h2>Créer un compte</h2>

            <p className={styles.subtitle}>
              Inscrivez-vous pour commencer votre apprentissage.
            </p>

            <form onSubmit={handleSubmit}>
              <div className={styles.nameGrid}>
                <div className={styles.formGroup}>
                  <label htmlFor="nom">Nom</label>

                  <input
                    id="nom"
                    name="nom"
                    type="text"
                    placeholder="Votre nom"
                    value={form.nom}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className={styles.formGroup}>
                  <label htmlFor="prenom">Prénom</label>

                  <input
                    id="prenom"
                    name="prenom"
                    type="text"
                    placeholder="Votre prénom"
                    value={form.prenom}
                    onChange={handleChange}
                    required
                  />
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="email">
                  Adresse e-mail
                </label>

                <input
                  id="email"
                  name="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={form.email}
                  onChange={handleChange}
                  required
                />
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="password">
                  Mot de passe
                </label>

                <div className={styles.passwordBox}>
                  <input
                    id="password"
                    name="mot_de_passe"
                    type={afficher ? "text" : "password"}
                    placeholder="8 caractères minimum"
                    value={form.mot_de_passe}
                    onChange={handleChange}
                    minLength={8}
                    required
                  />

                  <button
                    type="button"
                    onClick={() => setAfficher(!afficher)}
                    className={styles.showPassword}
                  >
                    {afficher ? "Masquer" : "Afficher"}
                  </button>
                </div>
              </div>

              <div className={styles.formGroup}>
                <label htmlFor="confirmation">
                  Confirmer le mot de passe
                </label>

                <input
                  id="confirmation"
                  name="confirmation"
                  type={afficher ? "text" : "password"}
                  placeholder="Confirmez votre mot de passe"
                  value={form.confirmation}
                  onChange={handleChange}
                  required
                />
              </div>

              {erreur && (
                <p className={styles.error}>
                  {erreur}
                </p>
              )}

              {succes && (
                <p className={styles.success}>
                  {succes}
                </p>
              )}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={chargement}
              >
                {chargement ? "Inscription..." : "Créer mon compte"}
                {!chargement && <span> →</span>}
              </button>
            </form>

            <p className={styles.switchText}>
              Vous avez déjà un compte ?
              <Link href="/connexion"> Se connecter</Link>
            </p>

            <Link href="/" className={styles.backHome}>
              ← Retour à l&apos;accueil
            </Link>
          </div>
        </section>
      </div>
    </main>
  );
}
