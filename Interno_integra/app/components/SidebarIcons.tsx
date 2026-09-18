import React from 'react';

/**
 * Ícone do Administrativo com folheamento suave e contextual ("às vezes" e no hover).
 * Mantém 100% da identidade do BookOpen do Lucide, adicionando uma folha física que vira da direita para a esquerda.
 */
export function AdminBookIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <span className={`anim-book-wrapper ${className} select-none pointer-events-none`}>
      {/* Livro base aberto */}
      <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="w-full h-full shrink-0"
      >
        <path d="M12 5v16" />
        <path d="M20.001 19A2 2 0 0 0 22 17V5a2 2 0 0 0-1.999-2L16 3.002A5 5 0 0 0 12 5a5 5 0 0 0-4-2H4a2 2 0 0 0-2 2v12a2 2 0 0 0 1.999 2H8a5 5 0 0 1 4 2 5 5 0 0 1 4-2z" />
      </svg>

      {/* Folha que passa da direita para a esquerda em 3D */}
      <span className="anim-book-page" aria-hidden="true">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="12 0 12 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
          className="w-full h-full overflow-visible"
        >
          <path d="M12 5a5 5 0 0 1 4-2h4a2 2 0 0 1 2 2v12a2 2 0 0 1-1.999 2H16a5 5 0 0 0-4 2z" />
        </svg>
      </span>
    </span>
  );
}

/**
 * Ícone do Marketing com gota de tinta física pingando ("às vezes" e no hover).
 * Mantém 100% da identidade do PaintBucket do Lucide, animando o desprendimento e queda realista da gota.
 */
export function MarketingPaintIcon({ className = "w-5 h-5" }: { className?: string }) {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className={`${className} overflow-visible select-none pointer-events-none shrink-0`}
    >
      {/* Alça do balde */}
      <path d="M11 7 6 2" />
      {/* Nível da tinta */}
      <path d="M18.992 12H2.041" />
      {/* Corpo do balde inclinado */}
      <path d="m8.5 4.5 2.148-2.148a1.205 1.205 0 0 1 1.704 0l7.296 7.296a1.205 1.205 0 0 1 0 1.704l-7.592 7.592a3.615 3.615 0 0 1-5.112 0l-3.888-3.888a3.615 3.615 0 0 1 0-5.112L5.67 7.33" />
      {/* Gota que se desprende e pinga para baixo */}
      <path
        className="anim-paint-droplet"
        d="M21.145 18.38A3.34 3.34 0 0 1 20 16.5a3.3 3.3 0 0 1-1.145 1.88c-.575.46-.855 1.02-.855 1.595A2 2 0 0 0 20 22a2 2 0 0 0 2-2.025c0-.58-.285-1.13-.855-1.595"
      />
    </svg>
  );
}
