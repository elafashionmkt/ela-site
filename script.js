const topbar = document.getElementById("topbar");

window.addEventListener("scroll", () => {
  if (window.scrollY > 20) {
    topbar.classList.add("is-scrolled");
  } else {
    topbar.classList.remove("is-scrolled");
  }
});
