$(document).ready(function () {
     function classToggle() {
          this.classList.toggle('active');
     }
     document.querySelector('.activeButton').addEventListener('click', classToggle);
 
});