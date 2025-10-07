export default function Footer() {
  return (
    <footer className="bg-[#f9ede8] py-8 px-4 text-center text-[#6b5f52]">
      <p className="mb-3">© 2025 Albumify. All rights reserved.</p>
      <div className="flex justify-center flex-wrap gap-6 text-sm">
        <a href="/about" className="hover:text-[#a0522d] transition">
          About Us
        </a>
        <a href="/contact" className="hover:text-[#a0522d] transition">
          Contact
        </a>
        <a href="/privacy" className="hover:text-[#a0522d] transition">
          Privacy
        </a>
        <a href="/terms" className="hover:text-[#a0522d] transition">
          Terms
        </a>
      </div>
    </footer>
  );
}
