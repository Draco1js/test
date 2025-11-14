// Modal checkbox functionality
const allPagesCheckbox = document.getElementById('all-pages-checkbox');
const pageCheckboxes = document.querySelectorAll('.page-checkbox');

if (allPagesCheckbox) {
    allPagesCheckbox.addEventListener('change', function() {
        pageCheckboxes.forEach(checkbox => {
            checkbox.checked = this.checked;
        });
    });

    // Update "All pages" when individual pages are changed
    pageCheckboxes.forEach(checkbox => {
        checkbox.addEventListener('change', function() {
            const allChecked = Array.from(pageCheckboxes).every(cb => cb.checked);
            allPagesCheckbox.checked = allChecked;
        });
    });
}
