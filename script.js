// script.js
document.querySelectorAll("a:not(.btn)").forEach(a=>{
  if(!a.dataset.text){
    a.dataset.text=a.textContent.trim();
  }
});

const hamburger=document.getElementById("hamburger");
const mobileMenu=document.getElementById("mobile-menu");
const headerBar=document.getElementById("header-bar");

function setMenuTop(){
  const r=headerBar.getBoundingClientRect();
  mobileMenu.style.top=`${r.bottom}px`;
}

hamburger.addEventListener("click",()=>{
  mobileMenu.classList.toggle("active");
  setMenuTop();
});

window.addEventListener("resize",()=>{
  if(mobileMenu.classList.contains("active")) setMenuTop();
});
