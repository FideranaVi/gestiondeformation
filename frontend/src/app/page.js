
import Link from "next/link";

export default function Home() {
  return (
    <main>
      {/* NAVIGATION */}
      <header className="navbar">
        <Link href="/" className="logo">
          <span className="logo-icon">L</span>
          LearningPro
        </Link>

        <nav>
          <Link href="/">Accueil</Link>
          <Link href="#formations">Formations</Link>
          <Link href="#fonctionnalites">Fonctionnalités</Link>
          <Link href="#apropos">À propos</Link>
        </nav>

        <Link href="/connexion" className="login-btn">
          Se connecter →
        </Link>
      </header>

      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-content">
          <span className="tag">
            ✦ PLATEFORME D&apos;APPRENTISSAGE
          </span>

          <h1>
            Développez vos compétences,
            <span> construisez votre avenir.</span>
          </h1>

          <p>
            Découvrez une nouvelle façon d&apos;apprendre grâce à nos
            formations, modules interactifs et évaluations en ligne.
          </p>

          <div className="hero-actions">
            <Link href="/inscription" className="primary-btn">
              Commencer maintenant →
            </Link>

            <Link href="#fonctionnalites" className="secondary-btn">
              Découvrir la plateforme
            </Link>
          </div>

          <div className="hero-stats">
            <div>
              <strong>100%</strong>
              <small>En ligne</small>
            </div>

            <div>
              <strong>24/7</strong>
              <small>Accessible</small>
            </div>

            <div>
              <strong>Certifié</strong>
              <small>Apprentissage</small>
            </div>
          </div>
        </div>

        <div className="hero-visual">
          <div className="visual-card">
            <div className="visual-top">
              <span>📚</span>
              <span className="status">● Disponible</span>
            </div>

            <h3>Votre espace d&apos;apprentissage</h3>
            <p>Progressez à votre rythme.</p>

            <div className="progress-item">
              <div>
                <span>Développement Web</span>
                <b>85%</b>
              </div>
              <div className="progress">
                <span style={{ width: "85%" }} />
              </div>
            </div>

            <div className="progress-item">
              <div>
                <span>Programmation</span>
                <b>65%</b>
              </div>
              <div className="progress">
                <span style={{ width: "65%" }} />
              </div>
            </div>

            <div className="certificate">
              🏆 Votre prochain certificat vous attend !
            </div>
          </div>

          <div className="floating-icon">🎓</div>
        </div>
      </section>

      {/* FEATURES SECTION */}
      <section className="features" id="fonctionnalites">
        <div className="section-heading">
          <span className="tag">NOS FONCTIONNALITÉS</span>

          <h2>Tout pour réussir votre apprentissage</h2>

          <p>
            Une plateforme complète pour apprendre, pratiquer et progresser.
          </p>
        </div>

        <div className="feature-grid">
          <article className="feature-card">
            <div className="feature-icon">📖</div>
            <h3>Formations</h3>
            <p>
              Accédez à différentes formations adaptées à vos objectifs.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">🧩</div>
            <h3>Modules</h3>
            <p>
              Organisez votre apprentissage en modules structurés.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">✍️</div>
            <h3>Quiz et évaluations</h3>
            <p>
              Testez vos connaissances avec des quiz interactifs
              et obtenez vos résultats.
            </p>
          </article>

          <article className="feature-card">
            <div className="feature-icon">🏆</div>
            <h3>Certifications</h3>
            <p>
              Obtenez des certificats après la validation de vos acquis.
            </p>
          </article>
        </div>
      </section>

      {/* FOOTER */}
      <footer id="apropos">
        <Link href="/" className="logo">
          <span className="logo-icon">L</span>
          LearningPro
        </Link>

        <p>© 2026 LearningPro. Tous droits réservés.</p>
      </footer>
    </main>
  );
}
