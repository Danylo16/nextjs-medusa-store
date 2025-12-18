import {
  Phone,
  Mail,
  MapPin,
  Facebook,
  Instagram,
  Twitter,
  Linkedin,
} from "lucide-react"

export function Footer() {
  return (
    <footer className="border-t border-[oklch(.93_0_0)] bg-background mt-16 pb-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-12">

        {/* --- ТОП: ВСЕ В ОДИН РЯДОК --- */}
        <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-12">

          {/* BRAND BLOCK */}
          <div className="flex-1 max-w-sm space-y-4">
            <h3 className="text-lg font-semibold text-foreground">Recovery</h3>

            <p className="text-sm text-muted-foreground">
              Empowering recovery with professional-grade rehabilitation
              equipment and expert guidance.
            </p>

            <div className="flex items-center gap-3">
              {[Facebook, Twitter, Instagram, Linkedin].map((Icon, i) => (
                <a
                  key={i}
                  href="#"
                  className="w-9 h-9 rounded-full bg-[#F7DDE2] flex items-center justify-center
                  transition-colors group"
                >
                  <Icon
                    className="w-4 h-4 text-foreground group-hover:text-white transition-colors"
                  />
                </a>
              ))}
            </div>
          </div>

          {/* NAVIGATION BLOCKS — в один чіткий рядок */}
          <div className="flex-1 grid grid-cols-2 md:grid-cols-4 gap-10">

            {/* Products */}
            <nav className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Products</h3>
              <ul className="space-y-2 text-sm">
                {["Кіінезіотерапія", "Аксесуари", "Лави для реабілітації", "Guides"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="/categories"
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </nav>

            {/* Company */}
            <nav className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Company</h3>
              <ul className="space-y-2 text-sm">
                {["About us", "Blog", "Careers", "Contact"].map((item) => (
                  <li key={item}>
                    <a
                      href="#"
                      className="text-foreground hover:text-primary transition-colors"
                    >
                      {item}
                    </a>
                  </li>
                ))}
              </ul>
            </nav>

            {/* Support */}
            <nav className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Support</h3>
              <ul className="space-y-2 text-sm">
                {["Help center", "FAQ", "Returns", "Shipping info"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </nav>

            {/* Legal */}
            <nav className="space-y-3">
              <h3 className="text-sm font-semibold text-foreground">Legal</h3>
              <ul className="space-y-2 text-sm">
                {["Privacy policy", "Terms of service", "Cookie policy", "Accessibility"].map(
                  (item) => (
                    <li key={item}>
                      <a
                        href="#"
                        className="text-foreground hover:text-primary transition-colors"
                      >
                        {item}
                      </a>
                    </li>
                  )
                )}
              </ul>
            </nav>
          </div>
        </div>

        {/* CONTACTS */}
        <div className="mt-14 border-t border-[oklch(.93_0_0)] pt-10 grid gap-6 md:grid-cols-3">

          <div className="flex items-start gap-3">
            <Phone className="w-4 h-4 text-primary mt-1" />
            <div>
              <div className="text-sm font-semibold text-foreground">Phone</div>
              <a
                href="tel:+18001234567"
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                +1 (800) 123-4567
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <Mail className="w-4 h-4 text-primary mt-1" />
            <div>
              <div className="text-sm font-semibold text-foreground">Email</div>
              <a
                href="mailto:support@rehabcare.com"
                className="text-sm text-foreground hover:text-primary transition-colors"
              >
                support@rehabcare.com
              </a>
            </div>
          </div>

          <div className="flex items-start gap-3">
            <MapPin className="w-4 h-4 text-primary mt-1" />
            <div>
              <div className="text-sm font-semibold text-foreground">Address</div>
              <p className="text-sm text-foreground">
                123 Wellness Ave, Health City, HC 12345
              </p>
            </div>
          </div>
        </div>

        {/* BOTTOM BAR */}
        <div className="mt-12 border-t border-[oklch(.93_0_0)] pt-6 flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <p className="text-xs text-muted-foreground">
            © {new Date().getFullYear()} RehabCare. All rights reserved.
          </p>
          <div className="flex gap-4 text-xs">
            <a className="text-foreground hover:text-primary transition-colors" href="#">
              Do Not Sell My Info
            </a>
            <a className="text-foreground hover:text-primary transition-colors" href="#">
              Cookie Settings
            </a>
            <a className="text-foreground hover:text-primary transition-colors" href="#">
              Contact Us
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
