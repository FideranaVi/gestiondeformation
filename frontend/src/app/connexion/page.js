
"use client";

import { useState } from "react";
import Link from "next/link";
import styles from "../auth.module.css";

export default function ConnexionPage() {
  const [email, setEmail] = useState("");
  const [motDePasse, setMotDePasse] = useState("");
  const [afficher, setAfficher] = useState(false);
  const [erreur, setErreur] = useState("");
  const [chargement, setChargement] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErreur("");
    setChargement(true);

    try {
      const response = await fetch(
        `${process.env.NEXT_PUBLIC_API_URL}/utilisateur/connexion`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            email,
            mot_de_passe: motDePasse,
          }),
        }
      );

      const data = await response.json();

      if (!response.ok) {
        setErreur(data.message || "Identifiants incorrects.");
        return;
      }

      if (data.token) {
        localStorage.setItem("token", data.token);
      }

      if (data.utilisateur) {
        localStorage.setItem(
          "utilisateur",
          JSON.stringify(data.utilisateur)
        );
      }

      window.location.href = "/dashboard";
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
              Développez vos compétences avec LearningPro.
            </h1>

            <p>
              Apprenez, pratiquez et obtenez vos certifications
              grâce à notre plateforme de formation.
            </p>
          </div>

          <p className={styles.sideFooter}>
            Votre avenir commence ici.
          </p>
        </section>

        <section className={styles.authFormSide}>
          <div className={styles.formContent}>
            <div className={styles.mobileLogo}>
              LEARNING<span>PRO</span>
            </div>

            <span className={styles.welcome}>BON RETOUR !</span>

            <h2>Connexion</h2>

            <p className={styles.subtitle}>
              Connectez-vous pour accéder à votre espace.
            </p>

            <form onSubmit={handleSubmit}>
              <div className={styles.formGroup}>
                <label htmlFor="email">
                  Adresse e-mail
                </label>

                <input
                  id="email"
                  type="email"
                  placeholder="exemple@email.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
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
                    type={afficher ? "text" : "password"}
                    placeholder="Votre mot de passe"
                    value={motDePasse}
                    onChange={(e) => setMotDePasse(e.target.value)}
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

              {erreur && (
                <p className={styles.error}>
                  {erreur}
                </p>
              )}

              <button
                type="submit"
                className={styles.submitButton}
                disabled={chargement}
              >
                {chargement ? "Connexion..." : "Se connecter"}
                {!chargement && <span> →</span>}
              </button>
            </form>

            <p className={styles.switchText}>
              Vous n&apos;avez pas encore de compte ?
              <Link href="/inscription"> S&apos;inscrire</Link>
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
