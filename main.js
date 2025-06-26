document.addEventListener('DOMContentLoaded', () => {
  // === AOS animacije ===
  if (window.AOS) {
    AOS.init({
      duration: 800,
      once: true
    });
  }

  // === EmailJS forma ===
  const form = document.getElementById('contactForm');
  const formMessage = document.getElementById('form-message');
  if (window.emailjs && form) {
    emailjs.init("kbXGOqL_rc-m4FXI_");

    form.addEventListener('submit', e => {
      e.preventDefault();

      const name = form.name.value.trim();
      const email = form.email.value.trim();
      const message = form.message.value.trim();

      // Prosta validacija
      if (!name || !email || !message) {
        showFormMessage("Please fill in all fields!", "red");
        return;
      }

      // Regex za email
      const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
      if (!emailPattern.test(email)) {
        showFormMessage("Please enter a valid email!", "red");
        return;
      }

      // Slanje poruke
      emailjs.send("service_znptxua", "template_lac7pda", { name, email, message })
        .then(() => {
          showFormMessage("Message sent successfully!", "green");
          form.reset();
        })
        .catch(() => {
          showFormMessage("An error occurred, please try again!", "red");
        });
    });

    function showFormMessage(msg, color) {
      formMessage.textContent = msg;
      formMessage.style.color = color;
    }
  }

  // === Hamburger meni logika ===
  const hamburger = document.getElementById('hamburger');
  const nav = document.querySelector('nav');
  if (hamburger && nav) {
    hamburger.addEventListener('click', () => {
      nav.classList.toggle('open');
      document.body.classList.toggle('menu-open');
      hamburger.classList.toggle('open');
    });

    // Zatvaranje menija na klik linka (mobilni)
    nav.querySelectorAll('ul li a').forEach(link => {
      link.addEventListener('click', () => {
        nav.classList.remove('open');
        document.body.classList.remove('menu-open');
        hamburger.classList.remove('open');
      });
    });
  }

  // === Dinamička godina u footeru ===
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  // === Scroll to top dugme (ako koristiš JS umesto HTML onClick) ===
  const scrollToTopBtn = document.getElementById('scrollToTop');
  if (scrollToTopBtn) {
    scrollToTopBtn.addEventListener('click', () => {
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }
});
