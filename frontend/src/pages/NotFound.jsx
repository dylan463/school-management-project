
export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-5 py-10"
      style={{ background: "linear-gradient(135deg, #fdf0f0 0%, #f9f9f9 60%)" }}
    >
      <div className="bg-white rounded-2xl shadow-lg px-20 py-16 flex flex-col items-center text-center max-w-lg w-full">

        {/* 404 */}
        <h1 className="text-9xl font-black leading-none tracking-tighter"
          style={{ color: "#cc0000" }}
        >
          404
        </h1>

        {/* Divider */}
        <div className="w-14 h-0.5 mt-2 mb-5 rounded-full" style={{ background: "#cc0000" }} />

        {/* Title */}
        <h2 className="text-base font-bold uppercase tracking-widest text-gray-900 mb-4">
          Not Found
        </h2>

        {/* Description */}
        <p className="text-sm text-gray-500 leading-relaxed mb-8">
          Désolé, la page que vous recherchez est introuvable ou a été déplacée.
          <br />
        </p>

      </div>

      {/* Footer */}
      <footer className="mt-8 flex flex-col items-center gap-0.5 text-xs tracking-widest uppercase text-gray-400">
        <span>Polytechnique</span>
        <span>Portal</span>
      </footer>
    </div>
  );
}