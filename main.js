document.addEventListener('DOMContentLoaded', function() {
  const form = document.getElementById('contactForm');
  const formMessage = document.getElementById('form-message');

  AOS.init({
  duration: 800,   // trajanje animacije u ms
  once: true       // animiraj samo prvi put kad sekcija uđe u viewport
});
  
  // Inicijalizacija EmailJS sa tvojim Public Key-em
  emailjs.init("kbXGOqL_rc-m4FXI_");

  form.addEventListener('submit', function(e) {
    e.preventDefault();

    const name = document.getElementById('name').value.trim();
    const email = document.getElementById('email').value.trim();
    const message = document.getElementById('message').value.trim();

    // Prosta validacija
    if (!name || !email || !message) {
      formMessage.textContent = "Please fill in all fields!";
      formMessage.style.color = "red";
      return;
    }

    // Regex za email
    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailPattern.test(email)) {
      formMessage.textContent = "Please enter a valid email!";
      formMessage.style.color = "red";
      return;
    }

    // Slanje poruke putem EmailJS
    emailjs.send("service_znptxua", "template_lac7pda", {
        name: name,
        email: email,
        message: message
    })
    .then(function() {
      formMessage.textContent = "Message sent successfully!";
      formMessage.style.color = "green";
      form.reset();
    }, function(error) {
      formMessage.textContent = "An error occurred, please try again!";
      formMessage.style.color = "red";
    });
  });
});

// Hamburger meni logika
document.addEventListener('DOMContentLoaded', function() {
  const hamburger = document.getElementById('hamburger');
  const nav = document.querySelector('nav');
  const links = document.querySelectorAll('nav ul li a');

  hamburger.addEventListener('click', function() {
    nav.classList.toggle('open');
    document.body.classList.toggle('menu-open');
    hamburger.classList.toggle('open');
  });

  // Kada klikneš link iz menija, zatvori meni (na mobilnom)
  links.forEach(link => {
    link.addEventListener('click', function() {
      nav.classList.remove('open');
      document.body.classList.remove('menu-open');
    });
  });

});

// Automatski prikaz godine u footeru
document.addEventListener('DOMContentLoaded', function() {
  document.getElementById('year').textContent = new Date().getFullYear();
});
