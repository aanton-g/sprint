document.addEventListener('DOMContentLoaded', function() {
 
  const navItems = document.querySelectorAll('.nav-item');

  navItems.forEach(function(item){
    const inner = item.querySelector('.nav-item-inner');
    const dropdownItems = item.querySelectorAll('.nav-dropdown-item');

    inner.addEventListener('click', function() {
      item.classList.toggle('is-active');
    });

    dropdownItems.forEach(function(item) {
      const dropdownInner = item.querySelector('span');
      
      dropdownInner.addEventListener('click', function() {
        item.classList.toggle('is-active');
      });
      
    });
  });
});
