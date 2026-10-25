import { useEffect, useMemo, useState } from "react";

type Game = {
  name: string;
  publisher: string;
  category: string;
  code: string;
  accent: string;
  mark: string;
  popular?: boolean;
  needsServer?: boolean;
};

const games: Game[] = [
  { name: "Mobile Legends", publisher: "Moonton", category: "Mobile", code: "MLBB", accent: "from-sky-400 to-blue-700", mark: "M", popular: true, needsServer: true },
  { name: "Free Fire", publisher: "Garena", category: "Mobile", code: "FREE FIRE", accent: "from-amber-300 to-orange-700", mark: "F", popular: true },
  { name: "Genshin Impact", publisher: "HoYoverse", category: "RPG", code: "GENSHIN", accent: "from-cyan-200 to-indigo-600", mark: "G", needsServer: true },
  { name: "Valorant", publisher: "Riot Games", category: "PC", code: "VALORANT", accent: "from-rose-400 to-red-800", mark: "V", popular: true, needsServer: true },
  { name: "PUBG Mobile", publisher: "Level Infinite", category: "Mobile", code: "PUBG", accent: "from-yellow-300 to-stone-700", mark: "P" },
  { name: "Honkai: Star Rail", publisher: "HoYoverse", category: "RPG", code: "STAR RAIL", accent: "from-violet-300 to-indigo-900", mark: "H", needsServer: true },
  { name: "FC Mobile", publisher: "EA Sports", category: "Sports", code: "FC 25", accent: "from-lime-300 to-emerald-800", mark: "FC" },
  { name: "Call of Duty", publisher: "Activision", category: "PC", code: "CALL OF DUTY", accent: "from-zinc-200 to-zinc-700", mark: "C" },
];

const categories = ["Semua", "Mobile", "PC", "RPG", "Sports"];

function SearchIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="m21 21-4.35-4.35m2.35-5.65a8 8 0 1 1-16 0 8 8 0 0 1 16 0Z" /></svg>;
}

function ArrowIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M5 12h14m-5-5 5 5-5 5" /></svg>;
}

function ShieldIcon() {
  return <svg viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3 4.5 6v5.5c0 4.6 3.2 8.4 7.5 9.5 4.3-1.1 7.5-4.9 7.5-9.5V6L12 3Z" /><path d="m9 12 2 2 4-4" /></svg>;
}

const nominalOptions = [
  { amount: "86 Diamonds", bonus: "", price: "20.000" },
  { amount: "172 Diamonds", bonus: "+ 8 Bonus", price: "39.000" },
  { amount: "257 Diamonds", bonus: "+ 12 Bonus", price: "58.000" },
  { amount: "344 Diamonds", bonus: "+ 16 Bonus", price: "76.000" },
  { amount: "429 Diamonds", bonus: "+ 20 Bonus", price: "95.000" },
  { amount: "706 Diamonds", bonus: "+ 34 Bonus", price: "152.000" },
  { amount: "Weekly Pass", bonus: "7 hari", price: "27.500" },
  { amount: "Twilight Pass", bonus: "Premium", price: "149.000" },
];

function TopupPage({ game, onBack }: { game: Game; onBack: () => void }) {
  const [nominal, setNominal] = useState(1);
  const [payment, setPayment] = useState("QRIS");

  return (
    <main className="topup-page min-h-screen bg-[#0b0d0c] text-[#f3f4ec]">
      <nav className="detail-nav section-shell">
        <button className="back-button" onClick={onBack}>← <span>Kembali</span></button>
        <a className="brand" href="#" onClick={onBack}><span className="brand-mark">N</span><span>NEXA<span className="text-lime-300">.</span></span></a>
        <button className="help-button">Butuh bantuan?</button>
      </nav>

      <header className={`game-banner bg-gradient-to-br ${game.accent}`}>
        <span className="banner-grid" />
        <span className="banner-letter">{game.mark}</span>
        <div className="banner-copy section-shell"><span>Official top up</span><strong>{game.code}</strong></div>
      </header>

      <div className="detail-layout section-shell">
        <aside className="game-profile">
          <div className={`profile-art bg-gradient-to-br ${game.accent}`}><span>{game.mark}</span><small>{game.code}</small></div>
          <div className="profile-title"><span><small>Top up game</small><h1>{game.name}</h1><p>{game.publisher}</p></span><span className="verified">✓</span></div>
          <p className="profile-desc">Top up {game.name} resmi, cepat, dan aman. Item akan langsung dikirim ke akun game setelah pembayaran terverifikasi.</p>
          <div className="profile-benefits"><span><b>⚡</b> Proses instan</span><span><b>✓</b> Pembayaran aman</span><span><b>24</b> Layanan 24/7</span></div>
        </aside>

        <div className="purchase-flow">
          <section className="purchase-card">
            <div className="card-step"><span>01</span><div><h2>Masukkan data akun</h2><p>Pastikan data yang kamu masukkan sudah benar.</p></div></div>
            <div className={game.needsServer ? "account-fields two-fields" : "account-fields"}>
              <label><span>User ID</span><input placeholder="Contoh: 123456789" /></label>
              {game.needsServer && <label><span>Server / Zone ID</span><input placeholder="Contoh: 1234" /></label>}
            </div>
            <p className="input-hint">ID akun dapat ditemukan di halaman profil dalam game.</p>
          </section>

          <section className="purchase-card">
            <div className="card-step"><span>02</span><div><h2>Pilih nominal</h2><p>Harga sudah termasuk biaya layanan.</p></div></div>
            <div className="detail-nominals">
              {nominalOptions.map((item, index) => (
                <button className={nominal === index ? "selected" : ""} onClick={() => setNominal(index)} key={item.amount}>
                  <span className="diamond">◆</span>
                  <span><strong>{item.amount}</strong>{item.bonus && <small>{item.bonus}</small>}</span>
                  <b>Rp{item.price}</b>
                </button>
              ))}
            </div>
          </section>

          <section className="purchase-card">
            <div className="card-step"><span>03</span><div><h2>Pilih pembayaran</h2><p>Semua transaksi terenkripsi dan aman.</p></div></div>
            <div className="payment-list">
              {[
                { name: "QRIS", note: "GoPay, OVO, DANA & lainnya", label: "QR" },
                { name: "DANA", note: "Bayar langsung dari aplikasi", label: "D" },
                { name: "GoPay", note: "Bayar dengan saldo GoPay", label: "GO" },
                { name: "Virtual Account", note: "BCA, BRI, BNI, Mandiri", label: "VA" },
              ].map((item) => (
                <button className={payment === item.name ? "selected" : ""} onClick={() => setPayment(item.name)} key={item.name}>
                  <span className="pay-logo">{item.label}</span><span><strong>{item.name}</strong><small>{item.note}</small></span>
                  <i>{payment === item.name ? "●" : ""}</i>
                </button>
              ))}
            </div>
          </section>

          <section className="order-summary">
            <div><span>Total pembayaran</span><strong>Rp{nominalOptions[nominal].price}</strong></div>
            <button>Bayar sekarang <ArrowIcon /></button>
          </section>
          <p className="terms-note">Dengan melanjutkan, kamu menyetujui syarat dan ketentuan Nexa.</p>
        </div>
      </div>
    </main>
  );
}

const campaignBanners = [
  { tag: "Nexa Payday", title: "Main lebih banyak,\nbayar lebih hemat.", copy: "Cashback hingga Rp25.000 untuk semua game pilihan.", accent: "from-[#253a24] to-[#0e1710]", code: "PAYDAY25" },
  { tag: "Weekend Quest", title: "Bonus diamond\nsetiap akhir pekan.", copy: "Top up minimal Rp50.000 dan dapatkan bonus langsung.", accent: "from-[#283056] to-[#111528]", code: "WEEKEND" },
  { tag: "Member Exclusive", title: "Harga spesial\nuntuk para regular.", copy: "Nikmati harga terbaik untuk judul game favoritmu.", accent: "from-[#533124] to-[#1d120f]", code: "NEXAPLAY" },
];

function CatalogPage({ onChoose, onHome }: { onChoose: (game: Game) => void; onHome: () => void }) {
  const [slide, setSlide] = useState(0);
  const [category, setCategory] = useState("Semua");
  const [query, setQuery] = useState("");

  useEffect(() => {
    const timer = window.setInterval(() => setSlide((current) => (current + 1) % campaignBanners.length), 5000);
    return () => window.clearInterval(timer);
  }, []);

  const visibleGames = useMemo(() => games.filter((game) => {
    const matchesCategory = category === "Semua" || game.category === category;
    const matchesSearch = `${game.name} ${game.publisher}`.toLowerCase().includes(query.toLowerCase());
    return matchesCategory && matchesSearch;
  }), [category, query]);

  const campaign = campaignBanners[slide];

  return (
    <main className="catalog-page min-h-screen bg-[#0b0d0c] text-[#f3f4ec]">
      <nav className="catalog-nav section-shell">
        <a className="brand" href="#" onClick={onHome}><span className="brand-mark">N</span><span>NEXA<span className="text-lime-300">.</span></span></a>
        <div className="desktop-nav"><a className="active-link" href="#games">Game</a><a href="#promo">Promo</a><a href="#how">Cara beli</a></div>
        <button className="history-button"><span className="status-dot" />Cek transaksi</button>
      </nav>

      <section className="catalog-hero section-shell">
        <div className={`ad-slider bg-gradient-to-br ${campaign.accent}`}>
          <span className="ad-grid" />
          <div className="ad-copy">
            <span>{campaign.tag}</span>
            <h1>{campaign.title.split("\n").map((line) => <span key={line}>{line}</span>)}</h1>
            <p>{campaign.copy}</p>
            <button onClick={() => document.getElementById("all-games")?.scrollIntoView({ behavior: "smooth" })}>Lihat game <ArrowIcon /></button>
          </div>
          <div className="ad-code"><small>Gunakan kode</small><strong>{campaign.code}</strong></div>
          <span className="ad-orbit">N</span>
          <div className="slider-controls">
            <button onClick={() => setSlide((slide - 1 + campaignBanners.length) % campaignBanners.length)} aria-label="Slide sebelumnya">←</button>
            <span>{String(slide + 1).padStart(2, "0")} / {String(campaignBanners.length).padStart(2, "0")}</span>
            <button onClick={() => setSlide((slide + 1) % campaignBanners.length)} aria-label="Slide berikutnya">→</button>
          </div>
          <div className="slider-dots">{campaignBanners.map((_, index) => <button aria-label={`Pilih slide ${index + 1}`} className={index === slide ? "active" : ""} onClick={() => setSlide(index)} key={index} />)}</div>
        </div>
      </section>

      <section className="full-catalog section-shell" id="all-games">
        <div className="full-catalog-title">
          <div><span className="kicker">Semua permainan</span><h2>Temukan game favoritmu.</h2><p>Pilih game dan top up langsung dalam beberapa langkah.</p></div>
          <label className="search-box"><SearchIcon /><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Cari judul game..." /></label>
        </div>
        <div className="catalog-toolbar">
          <div className="category-row">{categories.map((item) => <button key={item} onClick={() => setCategory(item)} className={category === item ? "active" : ""}>{item}</button>)}</div>
          <span>{visibleGames.length} game tersedia</span>
        </div>
        <div className="game-grid full-grid">
          {visibleGames.map((game) => (
            <button className="game-card" onClick={() => onChoose(game)} key={game.name}>
              <div className={`game-art bg-gradient-to-br ${game.accent}`}>
                <span className="art-grid" /><span className="game-mark">{game.mark}</span><span className="game-code">{game.code}</span>
                {game.popular && <span className="popular">Populer</span>}
              </div>
              <span className="game-info"><span><strong>{game.name}</strong><small>{game.publisher}</small></span><span className="card-arrow"><ArrowIcon /></span></span>
            </button>
          ))}
        </div>
        {visibleGames.length === 0 && <div className="empty-state">Game belum ditemukan. Coba kata kunci lain.</div>}
      </section>
      <footer className="section-shell">
        <a className="brand" href="#" onClick={onHome}><span className="brand-mark">N</span><span>NEXA<span className="text-lime-300">.</span></span></a>
        <p>Tempat top up game yang cepat, aman, dan masuk akal.</p><span>© 2025 Nexa Digital Indonesia</span>
      </footer>
    </main>
  );
}

export default function App() {
  const [selected, setSelected] = useState<Game | null>(null);
  const [route, setRoute] = useState<"home" | "games">("home");
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    let initialLoad = true;
    const syncFromHash = () => {
      const slug = window.location.hash.replace("#topup/", "");
      if (window.location.hash.startsWith("#topup/")) {
        setSelected(games.find((game) => game.name.toLowerCase().replaceAll(" ", "-").replace(":", "") === slug) || null);
        setRoute("home");
      } else if (window.location.hash === "#games") {
        if (initialLoad) {
          window.history.replaceState(null, "", window.location.pathname);
          setRoute("home");
        } else {
          setSelected(null);
          setRoute("games");
        }
      } else {
        setSelected(null);
        setRoute("home");
      }
      initialLoad = false;
    };
    syncFromHash();
    window.addEventListener("hashchange", syncFromHash);
    return () => window.removeEventListener("hashchange", syncFromHash);
  }, []);

  const popularGames = games.filter((game) => game.popular);

  const chooseGame = (game: Game) => {
    setSelected(game);
    window.location.hash = `topup/${game.name.toLowerCase().replaceAll(" ", "-").replace(":", "")}`;
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (selected) {
    return <TopupPage game={selected} onBack={() => { window.location.hash = ""; setSelected(null); window.scrollTo(0, 0); }} />;
  }

  if (route === "games") {
    return <CatalogPage onChoose={chooseGame} onHome={() => { window.location.hash = ""; setRoute("home"); window.scrollTo(0, 0); }} />;
  }

  return (
    <main className="min-h-screen bg-[#0b0d0c] text-[#f3f4ec] selection:bg-lime-300 selection:text-black">
      <nav className="nav-shell">
        <a className="brand" href="#" aria-label="Nexa home">
          <span className="brand-mark">N</span>
          <span>NEXA<span className="text-lime-300">.</span></span>
        </a>
        <div className="desktop-nav">
          <a href="#games">Game</a><a href="#promo">Promo</a><a href="#how">Cara beli</a>
        </div>
        <div className="nav-actions">
          <button className="history-button"><span className="status-dot" />Cek transaksi</button>
          <button className="menu-button" onClick={() => setMenuOpen(!menuOpen)} aria-label="Toggle menu">
            <span /><span />
          </button>
        </div>
        {menuOpen && <div className="mobile-menu"><a href="#games">Game</a><a href="#promo">Promo</a><a href="#how">Cara beli</a></div>}
      </nav>

      <section className="hero">
        <div className="hero-media" aria-hidden="true" />
        <div className="hero-shade" />
        <div className="hero-content">
          <div className="eyebrow"><span /> Top up instan, main tanpa jeda</div>
          <h1>Lebih cepat.<br />Lebih <em>hemat.</em></h1>
          <p>Top up game favoritmu dalam hitungan detik. Harga jujur, pembayaran aman, dan proses otomatis 24/7.</p>
          <div className="hero-actions">
            <a href="#games" className="primary-button">Top up sekarang <ArrowIcon /></a>
            <div className="trust-note"><ShieldIcon /><span><strong>100% aman</strong>Dipercaya 500K+ gamers</span></div>
          </div>
        </div>
        <div className="hero-stats">
          <div><strong>500K+</strong><span>Transaksi sukses</span></div>
          <div><strong>4.9/5</strong><span>Rating pengguna</span></div>
          <div><strong>24/7</strong><span>Proses otomatis</span></div>
        </div>
      </section>

      <section className="catalog section-shell" id="popular-games">
        <div className="section-heading">
          <div><span className="kicker">Paling banyak dimainkan</span><h2>Game populer minggu ini.</h2></div>
          <a className="more-games" href="#games">Lihat semua game <ArrowIcon /></a>
        </div>
        <div className="game-grid popular-grid">
          {popularGames.map((game) => (
            <button className="game-card" onClick={() => chooseGame(game)} key={game.name}>
              <div className={`game-art bg-gradient-to-br ${game.accent}`}>
                <span className="art-grid" />
                <span className="game-mark">{game.mark}</span>
                <span className="game-code">{game.code}</span>
                {game.popular && <span className="popular">Populer</span>}
              </div>
              <span className="game-info">
                <span><strong>{game.name}</strong><small>{game.publisher}</small></span>
                <span className="card-arrow"><ArrowIcon /></span>
              </span>
            </button>
          ))}
        </div>
      </section>

      <section className="promo section-shell" id="promo">
        <div><span className="promo-label">Weekend drop</span><h2>Diskon sampai 20%</h2><p>Gunakan kode <strong>NEXAWEEKEND</strong> sebelum promo berakhir.</p></div>
        <a href="#games">Ambil promo <ArrowIcon /></a>
      </section>

      <footer className="section-shell">
        <a className="brand" href="#"><span className="brand-mark">N</span><span>NEXA<span className="text-lime-300">.</span></span></a>
        <p>Tempat top up game yang cepat, aman, dan masuk akal.</p>
        <span>© 2025 Nexa Digital Indonesia</span>
      </footer>
    </main>
  );
}
