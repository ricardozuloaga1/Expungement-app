export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto w-full border-t border-slate-700 bg-slate-900 text-slate-100" style={{ position: "relative", zIndex: 50 }}>
      <div className="mx-auto flex max-w-5xl flex-col items-center gap-2 px-6 py-8 text-center">
        <p className="text-base font-semibold">© {currentYear} Clean Slater NY. All rights reserved.</p>
        <p className="text-sm">Contact: info@cleanslaterny.com</p>
        <p className="text-xs text-slate-300">
          Clean Slater NY is an independent legal resource and is not affiliated with the New York State government. The information provided is
          for general educational purposes and is not a substitute for individualized legal advice.
        </p>
      </div>
    </footer>
  );
}
